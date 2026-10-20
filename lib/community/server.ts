import { randomUUID } from 'node:crypto';
import { query, transaction } from '../db/postgres.mjs';
import { getCircle, getDiscussion } from '../data/community';
import { emptyActivity, type Activity, type Member } from './types';
import { consumeLimit } from '../http-guard';

export class CommunityError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function text(value: unknown, min: number, max: number, label: string) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new CommunityError(`${label} must be ${min}–${max} characters.`);
  return value.trim();
}
export async function limit(key: string, max: number, windowMs: number) {
  await consumeLimit(`community:${key}`, max, windowMs);
}
export async function getActivity(member:string) {
  const row=(await query<{value:Activity;revision:number}>('SELECT value,revision FROM knovera.activity WHERE member=$1',[member])).rows[0];
  return {activity:row?.value || emptyActivity(),revision:row?.revision || 0};
}
export async function discussionExists(id:string) { return !!getDiscussion(id) || (await query('SELECT id FROM knovera.threads WHERE id=$1 AND NOT hidden',[id])).rows.length>0; }
const threadSelect='SELECT t.id,t.circle,t.title,t.body,t.member AS "authorId",m.name AS author,t."createdAt",t.hidden FROM knovera.threads t JOIN knovera.members m ON m.id=t.member';
export async function threadById(id:string,moderator=false) { return (await query(`${threadSelect} WHERE t.id=$1 AND ($2 OR NOT t.hidden)`,[id,moderator])).rows[0] || null; }
export async function threads(circle?:string,moderator=false) { return (await query(`${threadSelect} WHERE ($1::text IS NULL OR t.circle=$1) AND ($2 OR NOT t.hidden) ORDER BY t."createdAt" DESC,t.id LIMIT 100`,[circle || null,moderator])).rows; }
export async function replies(discussion:string,moderator=false) {
  return (await query('SELECT r.id,r.discussion,r."parentId",CASE WHEN r.hidden AND NOT $2 THEN \'[Reply removed]\' ELSE r.body END AS body,r.member AS "authorId",m.name AS author,r."createdAt",r.hidden FROM knovera.replies r JOIN knovera.members m ON m.id=r.member WHERE discussion=$1 ORDER BY r."createdAt",r.id LIMIT 300',[discussion,moderator])).rows;
}
export async function changeActivity(member:string,input:Record<string,unknown>) {
  const field=input.field;
  const id=text(input.id,1,120,'Reading item');
  if (field==='joined') { if(!getCircle(id)) throw new CommunityError('Circle not found.',404); }
  else if(field==='saved' || field==='notes') { if(!await discussionExists(id)) throw new CommunityError('Discussion not found.',404); }
  else if(field==='completed') {
    const [circle,index]=id.split(':');
    if(!getCircle(circle)?.prompts[Number(index)] || !/^\d+$/.test(index)) throw new CommunityError('Practice not found.',404);
  } else throw new CommunityError('Invalid activity field.');
  return transaction(async client=>{
    await client.query('INSERT INTO knovera.activity VALUES($1,$2,0) ON CONFLICT DO NOTHING',[member,emptyActivity()]);
    const row=(await client.query<{value:Activity;revision:number}>('SELECT value,revision FROM knovera.activity WHERE member=$1 FOR UPDATE',[member])).rows[0];
    if(input.revision!==row.revision) throw new CommunityError('Your reading space changed elsewhere. Refresh and try again.',409);
    if(field==='notes') {
      if('previousValue' in input && (row.value.notes[id] ?? null)!==input.previousValue) throw new CommunityError('This reflection changed on another device. Keep your draft and load the saved reflection.',409);
      if(input.value===null) delete row.value.notes[id]; else row.value.notes[id]=text(input.value,0,2000,'Reflection');
    } else {
      if(typeof input.value!=='boolean') throw new CommunityError('Invalid selection.');
      row.value[field]=row.value[field].filter(item=>item!==id);
      if(input.value) row.value[field].push(id);
    }
    const revision=row.revision+1;
    await client.query('UPDATE knovera.activity SET value=$2,revision=$3 WHERE member=$1',[member,row.value,revision]);
    return {activity:row.value,revision};
  });
}
export async function createThread(member:Member,input:Record<string,unknown>) {
  const circle=text(input.circle,1,80,'Circle');
  if(!getCircle(circle)) throw new CommunityError('Circle not found.',404);
  const title=text(input.title,5,160,'Title'); const body=text(input.body,1,5000,'Discussion');
  await limit(`post:${member.id}`,10,60000);
  const id=`member-${randomUUID()}`;
  await query('INSERT INTO knovera.threads(id,circle,title,body,member,"createdAt") VALUES($1,$2,$3,$4,$5,$6)',[id,circle,title,body,member.id,new Date().toISOString()]);
  return {id};
}
export async function createReply(member:Member,input:Record<string,unknown>) {
  const discussion=text(input.discussion,1,120,'Discussion');
  const body=text(input.body,1,2000,'Reply');
  const parent=input.parentId?text(input.parentId,1,80,'Parent reply'):null;
  await limit(`post:${member.id}`,10,60000);
  await transaction(async client=>{
    // Serializes the per-discussion count and parent checks, including guided discussions.
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))',[discussion]);
    if(!getDiscussion(discussion) && !(await client.query('SELECT id FROM knovera.threads WHERE id=$1 AND NOT hidden FOR SHARE',[discussion])).rows.length) throw new CommunityError('Discussion not found.',404);
    let ancestor=parent; let depth=0;
    while(ancestor) {
      if(++depth>8) throw new CommunityError('This reply chain is full. Start a new reply in this conversation.');
      const row=(await client.query<{parentId:string|null;hidden:boolean}>('SELECT "parentId",hidden FROM knovera.replies WHERE id=$1 AND discussion=$2 FOR SHARE',[ancestor,discussion])).rows[0];
      if(!row || (ancestor===parent && row.hidden)) throw new CommunityError('Parent reply not found.',404);
      ancestor=row.parentId;
    }
    if(Number((await client.query('SELECT count(*) AS count FROM knovera.replies WHERE discussion=$1',[discussion])).rows[0].count)>=300) throw new CommunityError('This conversation has reached its reply limit. Start a new conversation.');
    await client.query('INSERT INTO knovera.replies(id,discussion,"parentId",body,member,"createdAt") VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),discussion,parent,body,member.id,new Date().toISOString()]);
  });
}
export async function moderate(member:Member,input:Record<string,unknown>) {
  const kind=input.kind;
  if(kind!=='thread' && kind!=='reply') throw new CommunityError('Invalid content type.');
  const table=kind==='thread'?'threads':'replies';
  const id=text(input.id,1,120,'Content');
  if(input.action==='report') await limit(`report:${member.id}`,10,60000);
  return transaction(async client=>{
    const row=(await client.query(`SELECT member FROM knovera.${table} WHERE id=$1 FOR UPDATE`,[id])).rows[0];
    if(!row) throw new CommunityError('Content not found.',404);
    if(input.action==='report') {
      const reason=text(input.reason,5,500,'Report reason');
      await client.query('INSERT INTO knovera.reports(id,target,kind,member,reason,"createdAt") VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(target,kind,member) DO UPDATE SET reason=excluded.reason,"createdAt"=excluded."createdAt",resolved=false',[randomUUID(),id,kind,member.id,reason,new Date().toISOString()]); return;
    }
    if(input.action==='dismiss') { if(!member.moderator) throw new CommunityError('Moderator access required.',403); }
    else {
      if(!member.moderator && (row.member!==member.id || input.action!=='hide')) throw new CommunityError('You cannot change this content.',403);
      if(input.action!=='hide' && input.action!=='restore') throw new CommunityError('Invalid moderation action.');
      await client.query(`UPDATE knovera.${table} SET hidden=$2 WHERE id=$1`,[id,input.action==='hide']);
    }
    await client.query('UPDATE knovera.reports SET resolved=true WHERE target=$1 AND kind=$2',[id,kind]);
  });
}
export async function reports() { return (await query(`SELECT p.id,p.target,p.kind,p.reason,p."createdAt",COALESCE(r.body,t.body) AS content,COALESCE(r.discussion,t.id) AS discussion FROM knovera.reports p LEFT JOIN knovera.replies r ON p.kind='reply' AND r.id=p.target LEFT JOIN knovera.threads t ON p.kind='thread' AND t.id=p.target WHERE NOT p.resolved ORDER BY p."createdAt"`)).rows; }
