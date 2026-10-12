import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { getCircle, getDiscussion } from '../data/community';
import { emptyActivity, type Activity, type Member } from './types';

export class CommunityError extends Error { constructor(message: string, public status = 400) { super(message); } }
let database: DatabaseSync | undefined;
export function communityDb() {
  if (database) return database;
  const file = process.env.COMMUNITY_DB_PATH || path.join(process.cwd(), '.data', 'community.sqlite');
  mkdirSync(path.dirname(file), { recursive: true });
  database = new DatabaseSync(file);
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; PRAGMA foreign_keys=ON;
    CREATE TABLE IF NOT EXISTS members(id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, member TEXT NOT NULL REFERENCES members(id), expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS activity(member TEXT PRIMARY KEY REFERENCES members(id), value TEXT NOT NULL, revision INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS threads(id TEXT PRIMARY KEY, circle TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, member TEXT NOT NULL REFERENCES members(id), createdAt TEXT NOT NULL, hidden INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS replies(id TEXT PRIMARY KEY, discussion TEXT NOT NULL, parentId TEXT REFERENCES replies(id), body TEXT NOT NULL, member TEXT NOT NULL REFERENCES members(id), createdAt TEXT NOT NULL, hidden INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS reports(id TEXT PRIMARY KEY, target TEXT NOT NULL, kind TEXT NOT NULL, member TEXT NOT NULL REFERENCES members(id), reason TEXT NOT NULL, createdAt TEXT NOT NULL, resolved INTEGER NOT NULL DEFAULT 0, UNIQUE(target,kind,member));
    CREATE TABLE IF NOT EXISTS limits(key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE INDEX IF NOT EXISTS replies_discussion ON replies(discussion,createdAt);
    CREATE INDEX IF NOT EXISTS threads_circle ON threads(circle,createdAt);`);
  return database;
}
export function text(value: unknown, min: number, max: number, label: string) {
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max) throw new CommunityError(`${label} must be ${min}–${max} characters.`);
  return value.trim();
}
export function limit(key: string, max: number, windowMs: number) {
  const db = communityDb();
  const now = Date.now();
  db.prepare('DELETE FROM limits WHERE expires < ?').run(now);
  db.prepare('INSERT INTO limits VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1').run(key, now + windowMs);
  const row = db.prepare('SELECT count FROM limits WHERE key=?').get(key)!;
  if (Number(row.count) > max) throw new CommunityError('Too many attempts. Please try again later.', 429);
}
function publicMember(row: Record<string, unknown>): Member {
  const moderators = (process.env.COMMUNITY_MODERATOR_IDS || '').split(',').map(v => v.trim());
  return { id: String(row.id), username: String(row.username), name: String(row.name), moderator: moderators.includes(String(row.id)) };
}
const digest = (token: string) => createHash('sha256').update(token).digest('hex');
export function sessionMember(token?: string) {
  if (!token) return null;
  const row = communityDb().prepare('SELECT m.* FROM sessions s JOIN members m ON s.member=m.id WHERE s.token=? AND s.expires>?').get(digest(token), Date.now());
  return row ? publicMember(row) : null;
}
export function authenticate(mode: string, usernameInput: unknown, passwordInput: unknown, nameInput: unknown) {
  const username = text(usernameInput, 3, 32, 'Username').toLowerCase();
  if (!/^[a-z0-9_-]+$/.test(username)) throw new CommunityError('Use letters, numbers, underscores, or hyphens for your username.');
  const password = text(passwordInput, 10, 128, 'Password');
  const db = communityDb();
  limit(`login:${username}`, 20, 15 * 60_000);
  let row = db.prepare('SELECT * FROM members WHERE username=?').get(username);
  if (mode === 'register') {
    if (row) throw new CommunityError('This username is already taken.', 409);
    const name = text(nameInput, 2, 60, 'Display name');
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    const id = randomUUID();
    db.prepare('INSERT INTO members VALUES (?,?,?,?)').run(id, username, name, `${salt}:${hash}`);
    row = { id, username, name };
  } else if (mode === 'login') {
    const [salt, hash] = String(row?.password || 'dummy:' + '0'.repeat(128)).split(':');
    if (!timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex')) || !row) throw new CommunityError('Username or password is incorrect.', 401);
  } else throw new CommunityError('Unknown account action.');
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires < ?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(digest(token), row!.id as string, Date.now() + 30 * 86400_000);
  return { member: publicMember(row!), token };
}
export function logout(token?: string) { if (token) communityDb().prepare('DELETE FROM sessions WHERE token=?').run(digest(token)); }
export function getActivity(member: string) {
  const row = communityDb().prepare('SELECT * FROM activity WHERE member=?').get(member);
  return { activity: row ? JSON.parse(String(row.value)) as Activity : emptyActivity(), revision: Number(row?.revision || 0) };
}
export function discussionExists(id: string) { return !!getDiscussion(id) || !!communityDb().prepare('SELECT id FROM threads WHERE id=? AND hidden=0').get(id); }
export function threadById(id: string, moderator = false) {
  const row = communityDb().prepare('SELECT t.id,t.circle,t.title,t.body,t.member AS authorId,m.name AS author,t.createdAt,t.hidden FROM threads t JOIN members m ON m.id=t.member WHERE t.id=? AND (?=1 OR t.hidden=0)').get(id, moderator ? 1 : 0);
  return row ? { ...row, hidden: !!row.hidden } : null;
}
export function changeActivity(member: string, input: Record<string, unknown>) {
  const db = communityDb();
  db.exec('BEGIN IMMEDIATE');
  try {
    const current = getActivity(member);
    if (input.revision !== current.revision) throw new CommunityError('Your reading space changed elsewhere. Refresh and try again.', 409);
    const field = input.field;
    const id = text(input.id, 1, 120, 'Reading item');
    if (field === 'joined') { if (!getCircle(id)) throw new CommunityError('Circle not found.', 404); }
    else if (field === 'saved' || field === 'notes') { if (!discussionExists(id)) throw new CommunityError('Discussion not found.', 404); }
    else if (field === 'completed') {
      const [circle, index] = id.split(':');
      if (!getCircle(circle)?.prompts[Number(index)] || !/^\d+$/.test(index)) throw new CommunityError('Practice not found.', 404);
    } else throw new CommunityError('Invalid activity field.');
    if (field === 'notes') {
      if ('previousValue' in input && (current.activity.notes[id] ?? null) !== input.previousValue) throw new CommunityError('This reflection changed on another device. Keep your draft, then load the saved reflection before editing again.', 409);
      if (input.value === null) delete current.activity.notes[id];
      else current.activity.notes[id] = text(input.value, 0, 2000, 'Reflection');
    } else {
      if (typeof input.value !== 'boolean') throw new CommunityError('Invalid selection.');
      current.activity[field] = current.activity[field].filter(item => item !== id);
      if (input.value) current.activity[field].push(id);
    }
    const revision = current.revision + 1;
    db.prepare('INSERT INTO activity VALUES (?,?,?) ON CONFLICT(member) DO UPDATE SET value=excluded.value,revision=excluded.revision').run(member, JSON.stringify(current.activity), revision);
    db.exec('COMMIT');
    return { activity: current.activity, revision };
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function threads(circle?: string, moderator = false) {
  return communityDb().prepare(`SELECT t.id,t.circle,t.title,t.body,t.member AS authorId,m.name AS author,t.createdAt,t.hidden FROM threads t JOIN members m ON m.id=t.member WHERE (? IS NULL OR t.circle=?) AND (?=1 OR t.hidden=0) ORDER BY t.createdAt DESC LIMIT 100`).all(circle || null, circle || null, moderator ? 1 : 0).map(row => ({ ...row, hidden: !!row.hidden }));
}
export function replies(discussion: string, moderator = false) {
  return communityDb().prepare('SELECT r.id,r.discussion,r.parentId,r.body,r.member AS authorId,m.name AS author,r.createdAt,r.hidden FROM replies r JOIN members m ON m.id=r.member WHERE discussion=? ORDER BY createdAt LIMIT 300').all(discussion).map(row => ({ ...row, body: row.hidden && !moderator ? '[Reply removed]' : row.body, hidden: !!row.hidden }));
}
export function createThread(member: Member, input: Record<string, unknown>) {
  const circle = text(input.circle, 1, 80, 'Circle');
  if (!getCircle(circle)) throw new CommunityError('Circle not found.', 404);
  const title = text(input.title, 5, 160, 'Title');
  const body = text(input.body, 1, 5000, 'Discussion');
  limit(`post:${member.id}`, 10, 60_000);
  const id = `member-${randomUUID()}`;
  communityDb().prepare('INSERT INTO threads(id,circle,title,body,member,createdAt) VALUES (?,?,?,?,?,?)').run(id, circle, title, body, member.id, new Date().toISOString());
  return { id };
}
export function createReply(member: Member, input: Record<string, unknown>) {
  const discussion = text(input.discussion, 1, 120, 'Discussion');
  if (!discussionExists(discussion)) throw new CommunityError('Discussion not found.', 404);
  const body = text(input.body, 1, 2000, 'Reply');
  const parent = input.parentId ? text(input.parentId, 1, 80, 'Parent reply') : null;
  if (parent && !communityDb().prepare('SELECT id FROM replies WHERE id=? AND discussion=? AND hidden=0').get(parent, discussion)) throw new CommunityError('Parent reply not found.', 404);
  if (parent) {
    let ancestor: string | null = parent;
    let depth = 0;
    while (ancestor) {
      depth++;
      if (depth > 8) throw new CommunityError('This reply chain is full. Start a new reply in this conversation.');
      const row = communityDb().prepare('SELECT parentId FROM replies WHERE id=?').get(ancestor);
      ancestor = row?.parentId ? String(row.parentId) : null;
    }
  }
  if (Number(communityDb().prepare('SELECT COUNT(*) AS count FROM replies WHERE discussion=?').get(discussion)?.count) >= 300) throw new CommunityError('This conversation has reached its reply limit. Start a new conversation.');
  limit(`post:${member.id}`, 10, 60_000);
  communityDb().prepare('INSERT INTO replies(id,discussion,parentId,body,member,createdAt) VALUES (?,?,?,?,?,?)').run(randomUUID(), discussion, parent, body, member.id, new Date().toISOString());
}
export function moderate(member: Member, input: Record<string, unknown>) {
  const kind = input.kind;
  if (kind !== 'thread' && kind !== 'reply') throw new CommunityError('Invalid content type.');
  const table = kind === 'thread' ? 'threads' : 'replies';
  const id = text(input.id, 1, 120, 'Content');
  const db = communityDb();
  const row = db.prepare(`SELECT member FROM ${table} WHERE id=?`).get(id);
  if (!row) throw new CommunityError('Content not found.', 404);
  if (input.action === 'report') {
    const reason = text(input.reason, 5, 500, 'Report reason');
    limit(`report:${member.id}`, 10, 60_000);
    db.prepare('INSERT INTO reports(id,target,kind,member,reason,createdAt) VALUES (?,?,?,?,?,?) ON CONFLICT(target,kind,member) DO UPDATE SET reason=excluded.reason,createdAt=excluded.createdAt,resolved=0').run(randomUUID(), id, kind, member.id, reason, new Date().toISOString());
    return;
  }
  if (input.action === 'dismiss') {
    if (!member.moderator) throw new CommunityError('Moderator access required.', 403);
    db.prepare('UPDATE reports SET resolved=1 WHERE target=? AND kind=?').run(id, kind);
    return;
  }
  if (!member.moderator && (row.member !== member.id || input.action !== 'hide')) throw new CommunityError('You cannot change this content.', 403);
  if (input.action !== 'hide' && input.action !== 'restore') throw new CommunityError('Invalid moderation action.');
  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`UPDATE ${table} SET hidden=? WHERE id=?`).run(input.action === 'hide' ? 1 : 0, id);
    db.prepare('UPDATE reports SET resolved=1 WHERE target=? AND kind=?').run(id, kind);
    db.exec('COMMIT');
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
