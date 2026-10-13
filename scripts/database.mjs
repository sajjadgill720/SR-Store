import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { transaction, close } from '../lib/db/postgres.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const digest=value=>createHash('sha256').update(value).digest('hex');
const stripId=({id,...data})=>[id,data];

export async function migrate(client) {
  await client.query('SELECT pg_advisory_xact_lock(730130001)');
  await client.query('CREATE SCHEMA IF NOT EXISTS knovera');
  await client.query('CREATE TABLE IF NOT EXISTS knovera.schema_migrations(name text PRIMARY KEY,checksum text NOT NULL)');
  await client.query('REVOKE ALL ON SCHEMA knovera FROM PUBLIC');
  const directory=path.join(root,'supabase/migrations');
  for(const name of readdirSync(directory).filter(name=>name.endsWith('.sql')).sort()) {
    const sql=readFileSync(path.join(directory,name),'utf8');
    const previous=(await client.query('SELECT checksum FROM knovera.schema_migrations WHERE name=$1',[name])).rows[0];
    if(previous) { if(previous.checksum!==digest(sql)) throw new Error(`Migration changed after application: ${name}`); continue; }
    await client.query(sql);
    await client.query('INSERT INTO knovera.schema_migrations VALUES($1,$2)',[name,digest(sql)]);
  }
}
export async function seed(client) {
  const data=JSON.parse(readFileSync(path.join(root,'supabase/seed/catalog.json'),'utf8'));
  for(const book of data.books) await client.query('INSERT INTO knovera.books VALUES($1,$2) ON CONFLICT DO NOTHING',stripId(book));
  for(const {bookIds,...bundle} of data.bundles) {
    const added=await client.query('INSERT INTO knovera.bundles VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id',stripId(bundle));
    if(added.rows.length) for(const [index,id] of bookIds.entries()) await client.query('INSERT INTO knovera.bundle_books VALUES($1,$2,$3)',[bundle.id,id,index]);
  }
}
export async function importLegacy(client, directory) {
  // Explicit one-time cutover. Never overwrite live rows or read these files at runtime.
  if(!existsSync(path.join(directory,'db.json')) && !existsSync(path.join(directory,'community.sqlite'))) throw new Error('No legacy database files found in the supplied directory');
  const occupied=(await client.query('SELECT (SELECT count(*) FROM knovera.books)+(SELECT count(*) FROM knovera.orders)+(SELECT count(*) FROM knovera.members) AS count')).rows[0];
  if(Number(occupied.count)) throw new Error('Import requires an empty target. Do not seed first. Nothing was imported.');
  const filename=path.join(directory,'db.json');
  const data=existsSync(filename)?JSON.parse(readFileSync(filename,'utf8')):{};
  for(const [key,table] of [['books','books'],['orders','orders'],['supportTickets','support_tickets'],['reviews','reviews']]) for(const item of data[key] || []) await client.query(`INSERT INTO knovera.${table} VALUES($1,$2)`,stripId(item));
  for(const row of data.entitlements || []) await client.query('INSERT INTO knovera.entitlements VALUES($1,$2,$3,$4,$5,$6,$7)',[row.id,row.customerEmail.toLowerCase().trim(),row.bookId,row.orderId,row.status,row.grantedAt,row.revokedAt || null]);
  for(const row of data.auditLogs || []) await client.query('INSERT INTO knovera.audit_logs VALUES($1,$2,$3,$4)',[row.id,row.action,row.details,row.timestamp]);
  const sqliteFile=path.join(directory,'community.sqlite');
  if(existsSync(sqliteFile)) {
    const {DatabaseSync}=await import('node:sqlite');
    const local=new DatabaseSync(sqliteFile,{readOnly:true});
    try {
      const fields={members:['id','username','name','password'],activity:['member','value','revision'],threads:['id','circle','title','body','member','createdAt','hidden'],replies:['id','discussion','parentId','body','member','createdAt','hidden'],reports:['id','target','kind','member','reason','createdAt','resolved']};
      for(const [table,columns] of Object.entries(fields)) for(const row of local.prepare(`SELECT * FROM ${table}`).all()) {
        const values=columns.map(column=>['hidden','resolved'].includes(column)?!!row[column]:column==='value'?JSON.parse(row[column]):row[column]);
        await client.query(`INSERT INTO knovera.${table}(${columns.map(column=>`"${column}"`).join(',')}) VALUES(${columns.map((_,index)=>`$${index+1}`).join(',')})`,values);
      }
    } finally {local.close();}
  }
  // Expiring local sessions/download tokens are intentionally not migrated; readers sign in again.
  // Newsletter consent has its own authoritative email database and is not copied.
}
async function main() {
  const command=process.argv[2];
  if(!['migrate','seed','import-legacy','check','cleanup'].includes(command)) throw new Error('Usage: node --env-file=.env.local scripts/database.mjs migrate | seed | import-legacy <backup-directory> | check | cleanup');
  await transaction(async client=>{
    if(command==='migrate') await migrate(client);
    else if(command==='seed') await seed(client);
    else if(command==='import-legacy') { if(!process.argv[3]) throw new Error('Supply the local backup directory'); await importLegacy(client,path.resolve(process.argv[3])); }
    else if(command==='check') { const result=await client.query('SELECT (SELECT count(*) FROM knovera.books) AS books,(SELECT count(*) FROM knovera.orders) AS orders,(SELECT count(*) FROM knovera.threads) AS posts,(SELECT count(*) FROM knovera.replies) AS replies'); console.table(result.rows); }
    else for(const [table,field] of [['sessions','expires'],['limits','expires']]) await client.query(`DELETE FROM knovera.${table} WHERE ${field}<$1`,[Date.now()]);
  });
  console.log(`Database ${command} completed.`);
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) main().catch(error=>{console.error(error.code?`Database operation failed (${error.code}). Verify configuration and migration state.`:error.message);process.exitCode=1;}).finally(close);
