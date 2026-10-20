/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup}=require('./helpers/postgres.cjs');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
function compiled(file,require,extra={}) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require,process,URL,...extra});return exports;
}
test('verified accounts claim only their own purchases; ownership survives email changes and cannot be reassigned',async()=>{
  const {engine,adapter,load}=await setup();
  try {
    await adapter.transaction((await import('../scripts/database.mjs')).seed);
    const {db}=load('lib/db/store.ts'),auth=load('lib/auth/store.ts'),downloads=load('lib/downloads/account.ts');
    const {fulfillSimulatorOrder}=load('lib/payments/adapter.ts');
    const alice={id:'11111111-1111-4111-8111-111111111111',email:'alice@example.com',email_confirmed_at:'2026-10-14',user_metadata:{name:'Alice',role:'admin'}};
    const bob={...alice,id:'22222222-2222-4222-8222-222222222222',email:'bob@example.com',user_metadata:{name:'Bob'}};
    await adapter.query('INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,now()),($3,$4,now())',[alice.id,alice.email,bob.id,bob.email]);
    const books=await db.getBooks();
    const order=await fulfillSimulatorOrder({customerEmail:alice.email,items:[{bookId:books[0].id,quantity:1}],providerOrderId:'auth-test'});
    assert.equal((await auth.accountOrders({...alice,email_confirmed_at:null})).length,0);
    assert.equal((await auth.accountOrders(bob)).length,0);
    assert.equal((await auth.accountOrders(alice)).length,1);
    assert.equal((await auth.accountOrders({...alice,email:'new@example.com'})).length,1);
    assert.equal((await auth.accountOrders({...bob,email:alice.email})).length,0,'Matching email cannot steal already bound orders');
    assert.equal((await downloads.accountLibrary(alice)).length,1);
    assert.ok(await downloads.accountDownload(alice,books[0].id,books[0].formats[0]));
    await assert.rejects(()=>downloads.accountDownload(bob,books[0].id,books[0].formats[0]),e=>e.status===403);
    await db.refundOrder(order.id);
    assert.equal((await downloads.accountLibrary(alice)).length,0);
    await assert.rejects(()=>downloads.accountDownload(alice,books[0].id,books[0].formats[0]),e=>e.status===403);
    assert.equal(await auth.accountRole(alice.id),'reader');
    await auth.memberForUser(alice);
    assert.equal(await auth.accountRole(alice.id),'reader','Editable user metadata does not grant admin');
    await adapter.query('INSERT INTO knovera.account_roles VALUES($1,$2)',[alice.id,'admin']);
    assert.equal(await auth.accountRole(alice.id),'admin');
    await adapter.query('DELETE FROM knovera.account_roles WHERE user_id=$1',[alice.id]);
    assert.equal(await auth.accountRole(alice.id),'reader','Role changes take effect immediately');
    await adapter.query('SET ROLE authenticated');
    await assert.rejects(()=>adapter.query('SELECT * FROM knovera.account_roles'),e=>e.code==='42501');
    await assert.rejects(()=>adapter.query('SELECT * FROM knovera.order_owners'),e=>e.code==='42501');
    await adapter.query('RESET ROLE');
    await adapter.query('DELETE FROM auth.users WHERE id=$1',[alice.id]);
    assert.equal((await adapter.query('SELECT user_id FROM knovera.order_owners WHERE order_id=$1',[order.id])).rows[0].user_id,null);
  } finally {await engine.close();}
});

test('server identity is verified with Supabase; missing/unconfirmed/forged users and non-admin roles fail closed',async()=>{
  let user=null,error=null,role='reader',checks=0;
  const environment={NEXT_PUBLIC_SUPABASE_URL:'https://example.com',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public'};
  const server=compiled('lib/auth/server.ts',id=>{
    if(id==='@supabase/ssr') return {createServerClient:()=>({auth:{getUser:async()=>{checks++;return {data:{user},error};},getSession:()=>{throw new Error('Must never authorize from unverified session');}}})};
    if(id==='next/headers') return {cookies:async()=>({getAll:()=>[],set:()=>{}})};
    if(id==='./store') return {accountRole:async()=>role};
    throw new Error(id);
  },{process:{env:environment}});
  assert.equal(await server.currentUser(),null);
  await assert.rejects(()=>server.requireAdmin(),e=>e.status===401);
  user={id:'alice',email:'alice@example.com',email_confirmed_at:null};
  assert.equal(await server.currentUser(),null);
  user.email_confirmed_at='today';
  await assert.rejects(()=>server.requireAdmin(),e=>e.status===403);
  role='moderator';await assert.rejects(()=>server.requireAdmin(),e=>e.status===403);
  role='admin';assert.equal((await server.requireAdmin()).id,'alice');
  error={status:401};assert.equal(await server.currentUser(),null);
  error={status:503};await assert.rejects(()=>server.currentUser(),e=>e.status===503);
  assert.ok(checks>=7);
  delete environment.NEXT_PUBLIC_SUPABASE_URL;await assert.rejects(()=>server.currentUser(),e=>e.status===503);
});

test('Auth redirect destinations reject external and malformed paths',()=>{
  const {authDestination}=compiled('lib/auth/navigation.ts',require);
  for(const value of ['https://evil.example','//evil.example','/\\evil.example','/admin?next=https://evil.example',null]) assert.equal(authDestination(value),'/account/library');
  for(const value of ['/admin','/community','/account/update-password']) assert.equal(authDestination(value),value);
});

test('email verification validates type and same-origin before consuming a token',async()=>{
  const {NextRequest,NextResponse}=require('next/server');let calls=0;
  class AuthError extends Error {constructor(message,status=401){super(message);this.status=status;}}
  const server={AuthError,serverAuth:async()=>({auth:{verifyOtp:async()=>{calls++;return {error:null};}}})};
  const http=compiled('lib/auth/http.ts',id=>id==='next/server'?{NextResponse}:server);
  const nav=compiled('lib/auth/navigation.ts',require);
  const guard={rateLimit:async()=>{},limitedBody:req=>req.text(),RequestError:class extends Error {},requestFailure:()=>NextResponse.json({error:'Limited'},{status:429})};
  const route=compiled('app/api/auth/confirm/route.ts',id=>({'next/server':{NextResponse},'@/lib/auth/server':server,'@/lib/auth/http':http,'@/lib/auth/navigation':nav,'@/lib/http-guard':guard}[id]));
  const request=(data,origin='http://localhost')=>new NextRequest('http://localhost/api/auth/confirm',{method:'POST',headers:{host:'localhost',origin,'Content-Type':'application/json'},body:JSON.stringify(data)});
  assert.equal((await route.POST(request({type:'recovery',token_hash:'secret'},'https://evil.example'))).status,403);
  assert.equal((await route.POST(request({type:'admin',token_hash:'secret'}))).status,400);assert.equal(calls,0);
  const recovery=await route.POST(request({type:'recovery',token_hash:'secret',next:'https://evil.example'}));
  assert.equal((await recovery.json()).next,'/account/update-password');assert.equal(calls,1);
});
