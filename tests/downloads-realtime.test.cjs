/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup}=require('./helpers/postgres.cjs');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');

test('downloads require the exact paid order, purchased format and active entitlement',async()=>{
  const {engine,adapter,load}=await setup();
  const previous=process.env.NODE_ENV;
  try {
    process.env.NODE_ENV='development';
    await adapter.transaction((await import('../scripts/database.mjs')).seed);
    const {db}=load('lib/db/store.ts');
    const {fulfillSimulatorOrder}=load('lib/payments/adapter.ts');
    const {downloadAsset,purchaseAccess}=load('lib/downloads/access.ts');
    const [book,other]=await db.getBooks();
    const input={customerEmail:'reader@example.com',items:[{bookId:book.id,quantity:1}],providerOrderId:'one'};
    const order=await fulfillSimulatorOrder(input);
    const format=order.items[0].formats[0];
    assert.equal((await downloadAsset(order.publicToken,book.id,format)).format,format);
    await assert.rejects(()=>downloadAsset(undefined,book.id,format),error=>error.status===401);
    await assert.rejects(()=>downloadAsset(input.customerEmail,book.id,format),error=>error.status===403);
    await assert.rejects(()=>downloadAsset(order.publicToken,other.id,format),error=>error.status===403);
    await assert.rejects(()=>downloadAsset(order.publicToken,book.id,'exe'),error=>error.status===400);
    for(const status of ['pending','failed','refunded']) {
      await adapter.query("UPDATE knovera.orders SET data=jsonb_set(data,'{paymentStatus}',$2::jsonb) WHERE id=$1",[order.id,JSON.stringify(status)]);
      await assert.rejects(()=>downloadAsset(order.publicToken,book.id,format),error=>error.status===403);
    }
    await adapter.query(`UPDATE knovera.orders SET data=jsonb_set(data,'{paymentStatus}','"paid"') WHERE id=$1`,[order.id]);
    await fulfillSimulatorOrder({...input,providerOrderId:'two'});
    await db.refundOrder(order.id);
    await assert.rejects(()=>downloadAsset(order.publicToken,book.id,format),error=>error.status===403);
    const second=(await db.getOrders()).find(item=>item.id!==order.id);
    await adapter.query('UPDATE knovera.entitlements SET status=$1 WHERE "orderId"=$2',['revoked',second.id]);
    await assert.rejects(()=>downloadAsset(second.publicToken,book.id,format),error=>error.status===403);
    process.env.NODE_ENV='production';
    await assert.rejects(()=>purchaseAccess(second.publicToken),error=>error.status===403);
  } finally {if(previous===undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV=previous; await engine.close();}
});

function compiled(file,context) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,...context});
  return exports;
}
test('Storage signs the configured private object for five minutes, refuses public/missing objects',async()=>{
  let publicBucket=false,missing=false,calls=0;
  const storage={getBucket:async()=>({data:{public:publicBucket}}),from:bucket=>{
    assert.equal(bucket,'ebooks');
    return {createSignedUrl:async(key,ttl,options)=>{calls++;assert.equal(key,'secure/books/test.pdf');assert.equal(ttl,300);assert.equal(options.download,'reading.pdf');return missing?{error:new Error('missing')}:{data:{signedUrl:'https://example.com/signed'}};}};
  }};
  const env={NEXT_PUBLIC_SUPABASE_URL:'https://example.com',SUPABASE_SECRET_KEY:'server-only'};
  const {signDownload}=compiled('lib/downloads/storage.ts',{process:{env},require:()=>({createClient:()=>({storage})})});
  const asset={storageKey:'secure/books/test.pdf',fileName:'reading.pdf',fileSize:'1 MB'};
  assert.equal((await signDownload(asset)).downloadUrl,'https://example.com/signed');
  publicBucket=true;await assert.rejects(()=>signDownload(asset),/Private/);assert.equal(calls,1);
  publicBucket=false;missing=true;await assert.rejects(()=>signDownload(asset),/unavailable/);
  delete env.SUPABASE_SECRET_KEY;await assert.rejects(()=>signDownload(asset),/not configured/);
});

test('community broadcasts empty invalidations; receive policy denies other topic joins and publishing',async()=>{
  const {engine,adapter}=await setup();
  try {
    await adapter.query("INSERT INTO knovera.members VALUES('reader','reader','Reader','secret-hash')");
    await adapter.query(`INSERT INTO knovera.threads VALUES('thread','circle','Private draft title','Body','reader','today',false)`);
    await adapter.query(`INSERT INTO knovera.replies VALUES('reply','thread',NULL,'Reply text','reader','today',false)`);
    await adapter.query(`INSERT INTO knovera.activity VALUES('reader','{"notes":{"thread":"private journal"}}',1)`);
    await adapter.query(`INSERT INTO knovera.reports VALUES('report','thread','thread','reader','confidential reason','today',false)`);
    const events=(await adapter.query('SELECT * FROM realtime.messages')).rows;
    assert.equal(events.length,4);
    assert.ok(events.every(row=>JSON.stringify(row.payload)==='{}' && row.event==='changed' && row.topic==='knovera:community' && row.private));
    await assert.rejects(()=>adapter.transaction(async client=>{await client.query("UPDATE knovera.threads SET hidden=true WHERE id='thread'");throw new Error('rollback');}),/rollback/);
    assert.equal((await adapter.query('SELECT * FROM realtime.messages')).rows.length,4);
    await adapter.query("INSERT INTO realtime.messages VALUES('{}','changed','another-topic',true,'broadcast')");
    await adapter.query("SELECT set_config('realtime.topic','knovera:community',false)");
    await adapter.query('SET ROLE anon');
    // Supabase authorizes joins with the topic context, rather than exposing this table as a Data API.
    assert.ok((await adapter.query('SELECT * FROM realtime.messages')).rows.length);
    await assert.rejects(()=>adapter.query("INSERT INTO realtime.messages VALUES('{}','changed','knovera:community',true,'broadcast')"),error=>error.code==='42501');
    await adapter.query("SELECT set_config('realtime.topic','another-topic',false)");
    assert.equal((await adapter.query('SELECT * FROM realtime.messages')).rows.length,0);
    await adapter.query('RESET ROLE');
    assert.equal((await adapter.query("SELECT to_regclass('knovera.download_tokens') AS old")).rows[0].old,null);
  } finally {await engine.close();}
});

test('Realtime shares one subscription, debounces events, falls back, reconnects and cleans up',()=>{
  let status,event,removed=0,subscriptions=0,refreshes=0;
  let interval;let scheduled;
  const handlers=new Map();
  const channel={on:(_type,filter,fn)=>{assert.equal(filter.event,'changed');event=fn;return channel;},subscribe:fn=>{subscriptions++;status=fn;return channel;}};
  const {subscribeCommunityChanges}=compiled('lib/community/realtime.ts',{
    process:{env:{NEXT_PUBLIC_SUPABASE_URL:'https://example.com',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'public'}},
    require:()=>({browserAuth:()=>({channel:(topic,options)=>{assert.equal(topic,'knovera:community');assert.equal(options.config.private,true);return channel;},removeChannel:()=>{removed++;}})}),
    document:{visibilityState:'visible',addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener:name=>handlers.delete(name)},
    window:{addEventListener:(name,fn)=>handlers.set(name,fn),removeEventListener:name=>handlers.delete(name)},
    setInterval:fn=>{interval=fn;return 1;},clearInterval:()=>{interval=null;},
    setTimeout:fn=>{scheduled=fn;return 1;},clearTimeout:()=>{scheduled=null;},
  });
  const flush=()=>{const fn=scheduled;scheduled=null;fn?.();};
  const a=subscribeCommunityChanges(()=>refreshes++),b=subscribeCommunityChanges(()=>refreshes++);
  assert.equal(subscriptions,1);status('SUBSCRIBED');flush();assert.equal(refreshes,0);
  event();event();flush();assert.equal(refreshes,2);
  interval();flush();assert.equal(refreshes,2);
  status('CHANNEL_ERROR');for(let i=0;i<6;i++) interval();flush();assert.equal(refreshes,4);
  status('SUBSCRIBED');flush();assert.equal(refreshes,6);
  a();assert.equal(removed,0);b();assert.equal(removed,1);assert.equal(interval,null);assert.equal(handlers.size,0);
});

test('HTTP routes reject email-only downloads, cookie-free library and production admin/simulator bypasses',async()=>{
  const {NextRequest,NextResponse}=require('next/server');
  const {engine,adapter,load}=await setup();
  let signed=0;
  const previous=process.env.NODE_ENV;
  const previousRateSecret=process.env.RATE_LIMIT_SECRET;
  process.env.RATE_LIMIT_SECRET='http-route-tests';
  try {
    process.env.NODE_ENV='development';
    await adapter.transaction((await import('../scripts/database.mjs')).seed);
    const {db}=load('lib/db/store.ts');
    const access=load('lib/downloads/access.ts');
    class AuthError extends Error {constructor(message,status=401){super(message);this.status=status;}}
    const auth={AuthError,currentUser:async()=>null,requireAdmin:async()=>{throw new AuthError('Sign in required.');}};
    const http=compiled('lib/auth/http.ts',{URL,require:id=>id==='next/server'?{NextResponse}:auth});
    const dependencies={
      'next/server':{NextResponse},
      '@/lib/db/store':{db},
      '@/lib/catalog-version':{advanceCatalogVersion:async()=>{}},
      '@/lib/downloads/access':access,
      '@/lib/auth/server':auth,
      '@/lib/auth/http':http,
      '@/lib/http-guard':load('lib/http-guard.ts'),
      '@/lib/downloads/account':load('lib/downloads/account.ts'),
      '@/lib/downloads/storage':{signDownload:async()=>{signed++;return {downloadUrl:'https://example.com/signed'};}},
      '@/lib/payments/adapter':load('lib/payments/adapter.ts'),
      '@/lib/email/service.mjs':{contacts:()=>[],receipt:()=>{}},
      '../../../lib/db/store':{db},
      '@/lib/catalog-cache':{getPublicCatalog:async()=>({books:await db.getBooks()}),invalidatePublicCatalog:()=>{}},
    };
    const route=file=>compiled(file,{process,URL,console,require:id=>{if(id==='node:crypto') return require(id);if(dependencies[id]) return dependencies[id];throw new Error(`Unexpected runtime dependency ${id}`);}});
    const downloads=route('app/api/downloads/route.ts');
    const library=route('app/api/me/library/route.ts');
    const lookup=route('app/api/orders/lookup/route.ts');
    const book=(await db.getBooks())[0];
    const order=await dependencies['@/lib/payments/adapter'].fulfillSimulatorOrder({customerEmail:'reader@example.com',items:[{bookId:book.id,quantity:1}],providerOrderId:'http'});
    const input={email:order.customerEmail,bookId:book.id,format:book.formats[0]};
    const request=(data,headers={})=>new NextRequest('http://localhost/api/downloads',{method:'POST',headers:{'Content-Type':'application/json',host:'localhost',origin:'http://localhost',...headers},body:JSON.stringify(data)});
    assert.equal((await downloads.POST(request(input))).status,401);
    assert.equal(signed,0);
    assert.equal((await library.GET(new NextRequest('http://localhost/api/me/library?email=reader@example.com'))).status,401);
    assert.equal((await downloads.POST(request({...input,orderToken:order.publicToken},{origin:'https://other.example'}))).status,403);
    const receipt=await lookup.GET(new NextRequest('http://localhost/api/orders/lookup?token='+order.publicToken));
    const cookie=receipt.cookies.get(access.PURCHASE_COOKIE);
    assert.equal(cookie.value,order.publicToken);assert.equal(cookie.httpOnly,true);assert.equal(cookie.maxAge,3600);
    const cookieHeader=access.PURCHASE_COOKIE+'='+cookie.value;
    assert.equal((await downloads.POST(request({bookId:book.id,format:book.formats[0]},{cookie:cookieHeader}))).status,200);
    assert.equal(signed,1);
    assert.equal((await library.GET(new NextRequest('http://localhost/api/me/library',{headers:{cookie:cookieHeader}}))).status,200);
    await db.refundOrder(order.id);
    assert.equal((await downloads.POST(request(input,{cookie:cookieHeader}))).status,403);assert.equal(signed,1);
    process.env.NODE_ENV='production';
    const admin=route('app/api/admin/actions/route.ts');
    assert.equal((await admin.GET()).status,401);
    assert.equal((await admin.POST(request({}))).status,401);
    assert.equal((await route('app/api/checkouts/simulate/route.ts').POST(request({}))).status,403);
    const books=route('app/api/books/route.ts');
    assert.equal((await books.POST(request({}))).status,401);
    assert.equal((await books.DELETE(request({}))).status,401);
    assert.equal((await route('app/api/downloads/[token]/route.ts').GET()).status,410);
  } finally {if(previous===undefined) delete process.env.NODE_ENV;else process.env.NODE_ENV=previous;if(previousRateSecret===undefined)delete process.env.RATE_LIMIT_SECRET;else process.env.RATE_LIMIT_SECRET=previousRateSecret;await engine.close();}
});
