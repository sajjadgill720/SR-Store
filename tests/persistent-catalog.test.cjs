const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {setup}=require('./helpers/postgres.cjs');
function factory() {
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/cache/catalog.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,fetch});
  return exports.createCatalogCache;
}
test('persistent catalog loads once, survives reload, and only downloads a changed revision',async()=>{
  let saved=null,version='1',full=0,checks=0,offline=false;
  const storage={getItem:()=>saved,setItem:(_,value)=>{saved=value;}};
  const request=async url=>{
    if(offline)throw new Error('offline');
    if(url.endsWith('/version')){checks++;return {ok:true,json:async()=>({version})};}
    full++;return {ok:true,json:async()=>({version,books:[],bundles:[]})};
  };
  const create=factory(),first=create(()=>storage,request);
  await Promise.all(Array.from({length:10},()=>first.refresh()));
  assert.equal(full,1);
  const reload=create(()=>storage,request);reload.hydrate();
  assert.equal(reload.getSnapshot().data.version,'1');
  await reload.refresh();assert.equal(full,1);assert.equal(checks,1);
  version='2';await reload.refresh();assert.equal(full,2);
  offline=true;await reload.refresh();assert.equal(reload.getSnapshot().data.version,'2');
  assert.match(reload.getSnapshot().error,/saved books/);
});
test('corrupt or unavailable storage recovers using memory',async()=>{
  const cache=factory()(()=>({getItem:()=>'{bad',setItem:()=>{throw new Error('quota');}}),async()=>({ok:true,json:async()=>({version:'1',books:[],bundles:[]})}));
  await cache.refresh();assert.equal(cache.getSnapshot().data.version,'1');assert.equal(cache.getSnapshot().error,null);
});
test('server-rendered snapshot seeds storage without a second catalog download and never downgrades a newer cache',async()=>{
  let saved=null,full=0;
  const cache=factory()(()=>({getItem:()=>saved,setItem:(_,value)=>{saved=value;}}),async url=>{
    if(!url.endsWith('/version'))full++;
    return {ok:true,json:async()=>({version:'2'})};
  });
  cache.seed({version:'2',books:[],bundles:[]});
  await cache.refresh();
  assert.equal(full,0);assert.equal(JSON.parse(saved).version,'2');
  cache.seed({version:'1',books:[],bundles:[]});
  assert.equal(cache.getSnapshot().data.version,'2');
});
test('catalog triggers advance revisions transactionally and deny browser database access',async()=>{
  const {engine,adapter}=await setup();
  try {
    const version=async()=>(await adapter.query('SELECT version FROM knovera.catalog_revision')).rows[0].version;
    const before=await version();
    await adapter.query("INSERT INTO knovera.books VALUES('revision-test',$1)",[{slug:'revision-test',title:'Test',isPublished:true}]);
    assert.equal(Number(await version()),Number(before)+1);
    const current=await version();
    await assert.rejects(adapter.transaction(async client=>{await client.query("DELETE FROM knovera.books WHERE id='revision-test'");throw new Error('rollback');}));
    assert.equal(await version(),current);
    await adapter.query('SET ROLE authenticated');
    await assert.rejects(adapter.query('SELECT * FROM knovera.catalog_revision'),/permission denied/);
  } finally {await engine.close();}
});
