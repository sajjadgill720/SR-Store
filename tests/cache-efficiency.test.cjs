/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner. */
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
const {setup}=require('./helpers/postgres.cjs');
const output={};
vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/cache/memory.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:output,URLSearchParams,DOMException});
const {MemoryCache,resourceKey}=output;

test('account scope clears retained private entries and notifies views even while inactive',async()=>{
  const state={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/cache/browser.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:state,require:()=>({MemoryCache})});
  let changes=0;state.subscribeAccountScope(()=>changes++);
  state.changeAccount('alice');const first=state.accountScope();
  await state.browserReads.read('library|'+first,async()=>'Alice books',30_000);
  state.changeAccount('alice');assert.equal(changes,1,'Token refresh must not clear unchanged account');
  state.changeAccount(null);assert.equal(state.browserReads.entries.size,0);
  state.changeAccount('bob');assert.notEqual(state.accountScope(),first);assert.equal(changes,3);
});

test('community invalidation matches normalized parameters and preserves unrelated discussions',async()=>{
  const cache=new MemoryCache(),exports={};let reads=0;
  const dependencies={react:{},'../store/community':{},'./types':{emptyActivity:()=>({joined:[],saved:[],completed:[],notes:{}})},'./realtime':{},
    '../cache/browser':{browserReads:cache,subscribeAccountScope:()=>()=>{}},
    '../cache/private':{privateRead:(key,ttl,load)=>cache.read(resourceKey(key)+'|alice:1',load,ttl)}};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/community/client.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,URLSearchParams,require:id=>dependencies[id],fetch:async()=>({ok:true,json:async()=>({version:++reads})})});
  await exports.api('replies?discussion=a');await exports.api('replies?discussion=b');assert.equal(reads,2);
  exports.invalidateCommunity('replies?discussion=a');
  await exports.api('replies?discussion=a');await exports.api('replies?discussion=b');assert.equal(reads,3);
});

test('deduplicates concurrent reads, reuses fresh data, expires freshness separately from retention',async()=>{
  let time=0,calls=0;const cache=new MemoryCache(3,100,()=>time);
  const load=async()=>++calls;
  await Promise.all(Array.from({length:10},()=>cache.read('library:user-a',load,30)));
  assert.equal(calls,1);
  time=20;await cache.read('library:user-a',load,30);assert.equal(calls,1);
  time=31;await cache.read('library:user-a',load,30);assert.equal(calls,2);
  assert.equal(resourceKey('replies?b=2&a=hello%20world'),resourceKey('replies?a=hello+world&b=2'));
  for(const key of ['a','b','c','d'])await cache.read(key,load,30);
  assert.equal(cache.entries.size,3);
  time=200;await cache.read('new',load,30);assert.equal(cache.entries.size,1);
});

test('invalidated reads cannot resurrect old data; account changes reject pending reads',async()=>{
  const cache=new MemoryCache();let resolve,calls=0;
  const load=()=>++calls===1?new Promise(done=>{resolve=done}):Promise.resolve('new');
  const pending=cache.read('entity:a',load,1000);await Promise.resolve();
  cache.invalidate('entity:');resolve('old');
  assert.equal(await pending,'new');assert.equal(await cache.read('entity:a',load,1000),'new');
  let finish;const old=cache.read('library:a',()=>new Promise(done=>{finish=done}),1000);await Promise.resolve();
  cache.clear();finish('private-a');await assert.rejects(old,{name:'AbortError'});
  assert.equal(await cache.read('library:b',async()=>'private-b',1000),'private-b');
});

test('batched library has constant query count and checkout ignores stale displayed prices',async()=>{
  const {engine,adapter,load}=await setup();
  try {
    await adapter.transaction((await import('../scripts/database.mjs')).seed);
    const db=load('lib/db/store.ts').db,fulfill=load('lib/payments/adapter.ts').fulfillSimulatorOrder;
    const books=await db.getBooks();
    const user={id:'aaaaaaaa-1111-4111-8111-111111111111',email:'cache-test@example.invalid',email_confirmed_at:'2026-10-14'};
    await adapter.query('INSERT INTO auth.users VALUES($1,$2,now())',[user.id,user.email]);
    for(let i=0;i<3;i++)await fulfill({customerEmail:user.email,items:books.slice(0,2).map(b=>({bookId:b.id,quantity:1})),providerOrderId:'measure-'+i});
    let calls=0;const original=adapter.query;adapter.query=(...args)=>{calls++;return original(...args)};
    const result=await load('lib/downloads/account.ts').accountLibrary(user);
    assert.equal(calls,4);assert.equal(result.length,2);
    fs.mkdirSync('artifacts/performance',{recursive:true});
    fs.writeFileSync('artifacts/performance/after.json',JSON.stringify({fixture:'3 orders, 2 books each, same verified account',libraryQueries:calls,books:result.length,concurrentReads:{consumers:10,httpLoaderCalls:1}},null,2));
    await adapter.query("UPDATE knovera.books SET data=jsonb_set(data,'{price}','12345') WHERE id=$1",[books[0].id]);
    const order=await fulfill({customerEmail:user.email,items:[{bookId:books[0].id,quantity:1,price:1}],providerOrderId:'fresh-price'});
    assert.equal(order.totalAmount,12345);
    await db.deleteBook(books[0].id);
    await assert.rejects(()=>fulfill({customerEmail:user.email,items:[{bookId:books[0].id,quantity:1}],providerOrderId:'unpublished'}),/unavailable/);
  } finally {await engine.close();}
});
