/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {setup}=require('./helpers/postgres.cjs');

test('Postgres catalog, atomic fulfillment, repeat purchase refunds, migration and RLS',async()=>{
  const {engine,adapter,load}=await setup();
  try {
    const {seed,migrate}=await import('../scripts/database.mjs');
    await adapter.transaction(migrate); // Checksum-led migrations can be rerun.
    await adapter.transaction(seed);
    await adapter.transaction(seed);
    const {db}=load('lib/db/store.ts');
    const {fulfillSimulatorOrder}=load('lib/payments/adapter.ts');
    const books=await db.getBooks();
    assert.equal(books.length,4);
    assert.equal((await db.getBundles())[0].books.length,2);
    const purchase={customerEmail:'reader@example.com',items:[{bookId:books[0].id,quantity:2}],providerOrderId:'provider-1'};
    const first=await fulfillSimulatorOrder(purchase);
    assert.equal(first.totalAmount,books[0].price*2);
    const repeated=await fulfillSimulatorOrder(purchase);
    assert.equal(first.id,repeated.id);
    assert.equal((await db.getOrders()).length,1);
    assert.equal((await db.getEntitlements(purchase.customerEmail)).length,1);
    await assert.rejects(()=>db.fulfillOrder({...first,id:'failed-order',publicToken:'failed-token',providerOrderId:'failed-event'},[{id:'failed-ent',customerEmail:purchase.customerEmail,bookId:'missing-book',orderId:'failed-order',status:'active',grantedAt:new Date().toISOString()}]),error=>error.code==='23503');
    assert.equal((await db.getOrders()).length,1,'Failed entitlement rolls back order');
    await fulfillSimulatorOrder({...purchase,providerOrderId:'provider-2'});
    await db.refundOrder(first.id);
    assert.equal((await db.getOrderByToken(first.publicToken)).paymentStatus,'refunded');
    assert.equal(await db.hasEntitlement(purchase.customerEmail,books[0].id),true,'Another paid order still grants access');
    const second=(await db.getOrders()).find(order=>order.id!==first.id);
    await db.refundOrder(second.id);
    assert.equal(await db.hasEntitlement(purchase.customerEmail,books[0].id),false);
    await db.deleteBook(books[0].id);
    assert.equal((await db.getBookById(books[0].id)).isPublished,false);
    assert.ok((await db.getOrderByToken(first.publicToken)).items.length,'Archiving preserves purchase snapshots');
    await adapter.transaction(seed);
    assert.equal((await db.getBookById(books[0].id)).isPublished,false,'Seed never re-publishes archived books');
    await assert.rejects(()=>fulfillSimulatorOrder({...purchase,providerOrderId:'archived-purchase'}),/unavailable/);
    const tables=await adapter.query("SELECT relname,relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='knovera' AND c.relkind='r' AND c.relname<>'schema_migrations'");
    assert.ok(tables.rows.every(row=>row.relrowsecurity));
    await adapter.query('CREATE ROLE browser_test');
    await adapter.query('SET ROLE browser_test');
    await assert.rejects(()=>adapter.query('SELECT * FROM knovera.members'),error=>error.code==='42501');
    await adapter.query('RESET ROLE');
  } finally {await engine.close();}
});

test('missing Supabase configuration fails without creating local fallback data',async()=>{
  const {pool}=await import('../lib/db/postgres.mjs');
  const previous=process.env.SUPABASE_DB_URL; delete process.env.SUPABASE_DB_URL;
  try {assert.throws(()=>pool(),/not configured/);}
  finally {if(previous) process.env.SUPABASE_DB_URL=previous;}
});

test('one-time local import preserves data and rejects a second import',async()=>{
  const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
  const {DatabaseSync}=require('node:sqlite');
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'knovera-import-'));
  const filename=path.join(directory,'community.sqlite');
  const local=new DatabaseSync(filename);
  local.exec(`CREATE TABLE members(id,username,name,password); CREATE TABLE activity(member,value,revision);
    CREATE TABLE threads(id,circle,title,body,member,createdAt,hidden); CREATE TABLE replies(id,discussion,parentId,body,member,createdAt,hidden);
    CREATE TABLE reports(id,target,kind,member,reason,createdAt,resolved);
    INSERT INTO members VALUES('member-one','test-reader','Reader','salt:existing-hash');
    INSERT INTO threads VALUES('thread-one','the-focus-room','A legacy post','Keep this body','member-one','2026-10-13',0);
    INSERT INTO replies VALUES('reply-one','thread-one',NULL,'Keep this reply','member-one','2026-10-13',0);`);
  local.close();
  const book=require('../supabase/seed/catalog.json').books[0];
  fs.writeFileSync(path.join(directory,'db.json'),JSON.stringify({books:[book],orders:[],entitlements:[]}));
  const {engine,adapter,load}=await setup();
  try {
    const {importLegacy}=await import('../scripts/database.mjs');
    await adapter.transaction(client=>importLegacy(client,directory));
    assert.equal((await load('lib/db/store.ts').db.getBooks()).length,1);
    const server=load('lib/community/server.ts');
    assert.equal((await server.threadById('thread-one')).body,'Keep this body');
    assert.equal((await server.replies('thread-one'))[0].body,'Keep this reply');
    assert.equal((await adapter.query('SELECT password FROM knovera.members')).rows[0].password,'salt:existing-hash');
    await assert.rejects(()=>adapter.transaction(client=>importLegacy(client,directory)),/empty target/);
    assert.ok(fs.existsSync(filename));
  } finally {
    await engine.close();
    for(const file of ['db.json','community.sqlite','community.sqlite-wal','community.sqlite-shm']) fs.rmSync(path.join(directory,file),{force:true});
    fs.rmdirSync(directory);
  }
});
