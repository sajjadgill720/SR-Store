/* eslint-disable @typescript-eslint/no-require-imports -- Node test harness. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createHmac}=require('node:crypto');
const {setup}=require('./helpers/postgres.cjs');

test('Lemon checkout, signature, verified fulfillment, replay and refunds',async()=>{
  const {engine,adapter,load}=await setup();
  const originalFetch=global.fetch;
  const names=['LEMON_SQUEEZY_API_KEY','LEMON_SQUEEZY_STORE_ID','LEMON_SQUEEZY_VARIANT_ID','LEMON_SQUEEZY_WEBHOOK_SECRET','LEMON_SQUEEZY_TEST_MODE','NODE_ENV'];
  const saved=Object.fromEntries(names.map(n=>[n,process.env[n]]));
  Object.assign(process.env,{LEMON_SQUEEZY_API_KEY:'test-key',LEMON_SQUEEZY_STORE_ID:'1',LEMON_SQUEEZY_VARIANT_ID:'2',LEMON_SQUEEZY_WEBHOOK_SECRET:'test-secret',LEMON_SQUEEZY_TEST_MODE:'true',NODE_ENV:'test'});
  try {
    const {seed}=await import('../scripts/database.mjs');await adapter.transaction(seed);
    await engine.exec('CREATE SCHEMA storage; CREATE TABLE storage.buckets(id text,public boolean); CREATE TABLE storage.objects(bucket_id text,name text); INSERT INTO storage.buckets VALUES(\'ebooks\',false);');
    const {db}=load('lib/db/store.ts');const books=await db.getBooks();const book=books[0];
    const lemon=load('lib/payments/lemon.ts');
    const input={customerEmail:'reader@example.com',items:[{bookId:book.id,quantity:2}]};
    await assert.rejects(()=>lemon.createLemonCheckout(input),e=>e.status===409,'Missing files block payment');
    for(const a of book.currentEdition.assets)await adapter.query('INSERT INTO storage.objects VALUES($1,$2)',['ebooks',a.storageKey]);
    let intentId,returnToken,remote,category='one_time';
    global.fetch=async(url,options)=>{
      if(url.includes('/prices?'))return Response.json({data:[{attributes:{variant_id:2,category,scheme:'standard'}}]});
      if(url.includes('/orders/'))return Response.json({data:remote});
      const body=JSON.parse(options.body),a=body.data.attributes;
      assert.equal(a.custom_price,book.price*2);assert.equal(a.checkout_options.discount,false);
      intentId=a.checkout_data.custom.intent_id;returnToken=new URL(a.product_options.redirect_url).searchParams.get('checkout');
      return Response.json({data:{attributes:{url:'https://store.lemonsqueezy.com/checkout/test',store_id:1,variant_id:2,test_mode:true,preview:{currency:'USD',subtotal:book.price*2}}}});
    };
    category='subscription';await assert.rejects(()=>lemon.createLemonCheckout(input),e=>e.status===503);category='one_time';
    const checkout=await lemon.createLemonCheckout(input);assert.match(checkout.checkoutUrl,/lemonsqueezy/);
    assert.equal((await lemon.checkoutStatus(returnToken)).status,'pending');
    assert.equal((await db.getOrders()).length,0,'Redirect alone grants no access');
    const payload={meta:{event_name:'order_created',custom_data:{intent_id:intentId}},data:{type:'orders',id:'123'}};
    const raw=JSON.stringify(payload),signature=createHmac('sha256','test-secret').update(raw).digest('hex');
    lemon.verifyLemonSignature(raw,signature);
    assert.throws(()=>lemon.verifyLemonSignature(raw+' ',signature),e=>e.status===401);
    assert.throws(()=>lemon.verifyLemonSignature(raw,null),e=>e.status===401);
    remote={type:'orders',id:'123',attributes:{store_id:1,test_mode:true,currency:'USD',subtotal:book.price*2,discount_total:0,total:book.price*2+100,user_email:'reader@example.com',first_order_item:{variant_id:2},status:'paid'}};
    for(const [key,value] of [['subtotal',1],['store_id',3],['currency','PKR'],['test_mode',false],['discount_total',100]]) {
      const old=remote.attributes[key];remote.attributes[key]=value;
      await assert.rejects(()=>lemon.processLemonEvent(payload),e=>e.status===422);remote.attributes[key]=old;
    }
    assert.equal((await db.getOrders()).length,0);
    const order=await lemon.processLemonEvent(payload);await lemon.processLemonEvent(payload);
    assert.equal((await db.getOrders()).length,1);assert.equal((await db.getEntitlements('reader@example.com')).length,1);
    assert.equal(order.provider,'development_simulator','Test purchases cannot unlock production downloads');
    assert.equal((await lemon.checkoutStatus(returnToken)).publicToken,returnToken);
    remote.attributes.status='partial_refund';remote.attributes.refunded_amount=100;
    await lemon.processLemonEvent({meta:{event_name:'order_refunded'},data:payload.data});
    assert.equal(await db.hasEntitlement('reader@example.com',book.id),false);
    remote.attributes.status='paid';remote.attributes.refunded_amount=0;await lemon.processLemonEvent(payload);
    assert.equal((await db.getOrderByToken(returnToken)).paymentStatus,'refunded','Late paid event never restores refunded access');
    process.env.NODE_ENV='production';await assert.rejects(()=>lemon.createLemonCheckout(input),e=>e.status===503);
    await assert.rejects(()=>lemon.processLemonEvent(payload),e=>e.status===422);
  }finally{global.fetch=originalFetch;for(const name of names){if(saved[name]===undefined)delete process.env[name];else process.env[name]=saved[name];}await engine.close();}
});

test('Shared request limits are atomic, expire, and return Retry-After; bodies are bounded',async()=>{
  const {engine,adapter,load}=await setup();
  try {
    const {consumeLimit,limitedBody,requestFailure}=load('lib/http-guard.ts');
    const results=await Promise.allSettled(Array.from({length:12},()=>consumeLimit('test',3,60000)));
    assert.equal(results.filter(r=>r.status==='fulfilled').length,3);
    const error=results.find(r=>r.status==='rejected').reason;
    const response=requestFailure(error);assert.equal(response.status,429);assert.ok(Number(response.headers.get('Retry-After'))>0);
    await adapter.query('UPDATE knovera.limits SET expires=0 WHERE key=$1',['test']);await consumeLimit('test',3,60000);
    assert.equal(await limitedBody(new Request('https://test',{method:'POST',body:'hello'}),5),'hello');
    await assert.rejects(()=>limitedBody(new Request('https://test',{method:'POST',body:'abcdef'}),5),e=>e.status===413);
  }finally{await engine.close();}
});
