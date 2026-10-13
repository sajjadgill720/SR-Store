/* eslint-disable @typescript-eslint/no-require-imports -- Test harness. */
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('typescript');
const {PGlite}=require('@electric-sql/pglite');
async function setup() {
  const engine=new PGlite();
  // Local stand-in for Supabase-managed Realtime objects, never run in production.
  await engine.exec(`CREATE ROLE anon; CREATE ROLE authenticated;
    CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,email_confirmed_at timestamptz);
    CREATE SCHEMA realtime;
    CREATE TABLE realtime.messages(payload jsonb,event text,topic text,private boolean,extension text DEFAULT 'broadcast');
    ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
    GRANT USAGE ON SCHEMA realtime TO anon,authenticated;
    GRANT SELECT,INSERT ON realtime.messages TO anon,authenticated;
    CREATE FUNCTION realtime.topic() RETURNS text LANGUAGE sql AS $$ SELECT current_setting('realtime.topic',true) $$;
    CREATE FUNCTION realtime.send(payload jsonb,event text,topic text,private boolean) RETURNS void LANGUAGE sql AS $$
      INSERT INTO realtime.messages(payload,event,topic,private) VALUES($1,$2,$3,$4) $$;`);
  const executor=target=>({query:async(sql,values=[])=>{
    const result=values.length?await target.query(sql,values):(await target.exec(sql)).at(-1);
    return {...result,rows:result?.rows || [],rowCount:result?.affectedRows ?? result?.rows?.length ?? 0};
  }});
  const adapter={...executor(engine),transaction:work=>engine.transaction(tx=>work(executor(tx)))};
  const {migrate}=await import('../../scripts/database.mjs');
  await adapter.transaction(migrate);
  const cache=new Map();
  function load(file) {
    const filename=path.resolve(__dirname,'../..',file);
    if(cache.has(filename)) return cache.get(filename).exports;
    const mod=new Module(filename,module); mod.paths=Module._nodeModulePaths(path.dirname(filename));
    const original=mod.require.bind(mod);
    mod.require=id=>id.endsWith('/postgres.mjs')?adapter:id.startsWith('.')?load(path.relative(path.resolve(__dirname,'../..'),path.resolve(path.dirname(filename),id+'.ts'))):original(id);
    cache.set(filename,mod);
    mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);
    return mod.exports;
  }
  return {engine,adapter,load};
}
module.exports={setup};
