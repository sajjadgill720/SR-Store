/* eslint-disable @typescript-eslint/no-require-imports -- Native Node test runner. */
const { test, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'knovera-email-'));
process.env.EMAIL_DB_PATH = path.join(directory, 'test.sqlite');
process.env.EMAIL_MODE = 'preview';
process.env.NODE_ENV = 'test';
process.env.EMAIL_SITE_URL = 'https://books.example.com';
process.env.EMAIL_POSTAL_ADDRESS = 'Test address';
const { DatabaseSync } = require('node:sqlite');
let sqlite;
const originalFetch = global.fetch;
after(async () => {
  global.fetch = originalFetch;
  if (sqlite) sqlite.close();
  (await import('../lib/email/service.mjs')).close();
  for (const suffix of ['', '-wal', '-shm']) fs.rmSync(path.join(directory, `test.sqlite${suffix}`), { force: true });
  fs.rmdirSync(directory);
});

test('email flows: validation, consent, previews, retries and duplicate suppression', async () => {
  const mail = await import('../lib/email/service.mjs');
  assert.equal(mail.emailAddress(' Reader@Example.com '), 'reader@example.com');
  assert.throws(() => mail.emailAddress('a@b.com\r\nBcc: x@y.com'));
  assert.ok(!mail.template('<script>', '<img src=x>').html.includes('<script>'));
  const pending = mail.subscribe('reader@example.com', ['new-releases']);
  const confirmation = mail.preview(pending);
  assert.ok(confirmation);
  assert.equal(mail.subscribe('reader@example.com', []), null);
  assert.equal(mail.campaign({id:'before-confirmation',subject:'News',body:'Hello'}),0);
  const token = confirmation.text.match(/token=([a-f0-9]{64})/)[1];
  assert.equal(mail.confirm('bad'),null);
  assert.equal(mail.confirm(token).email,'reader@example.com');
  assert.equal(mail.campaign({id:'confirmed',subject:'News',body:'Hello',topic:'new-releases'}),1);
  mail.campaign({id:'confirmed',subject:'News',body:'Hello',topic:'new-releases'});
  assert.equal(mail.outbox().filter(row=>row.id.startsWith('campaign-confirmed-')).length,1);
  assert.throws(()=>mail.campaign({id:'confirmed',subject:'Changed',body:'Different'}));
  const campaignRow=mail.outbox().find(row=>row.id.startsWith('campaign-confirmed-'));
  const unsubscribeToken=mail.preview(campaignRow.id).text.match(/token=([a-f0-9]{64})/)[1];
  assert.equal(mail.unsubscribe(unsubscribeToken),true);
  assert.equal(mail.confirm(token),null);
  assert.equal(mail.campaign({id:'after-unsubscribe',subject:'News',body:'Hello'}),0);
  assert.equal(mail.recovery('missing@example.com',[]),null);

  process.env.EMAIL_MODE='resend';
  process.env.RESEND_API_KEY='test-key-never-sent';
  process.env.EMAIL_FROM='Test <test@example.com>';
  let calls=0;
  global.fetch=async (_url,options)=>{calls++;assert.ok(options.headers['Idempotency-Key']);return {ok:true,json:async()=>({id:'provider-1'})};};
  const sim={id:'test-order',provider:'development_simulator',customerEmail:'reader@example.com',currency:'USD',totalAmount:1999,orderNumber:'TEST-1',publicToken:'private-token',items:[{title:'Test book'}]};
  const receiptId=mail.receipt(sim);
  assert.equal(await mail.deliver(receiptId),'preview');
  assert.equal(calls,0);
  const liveId=mail.receipt({...sim,id:'live-order',provider:'lemon_squeezy'});
  await Promise.all([mail.deliver(liveId),mail.deliver(liveId)]);
  assert.equal(calls,1);
  assert.equal(await mail.deliver(liveId),'accepted');
  assert.equal(calls,1);

  const failedId=mail.queue('retry-case','reader@example.com','Test',mail.template('Test','Body'));
  global.fetch=async()=>{calls++;return {ok:false,status:429};};
  assert.equal(await mail.deliver(failedId),'queued');
  const before=calls;
  await mail.deliver(failedId);
  assert.equal(calls,before);
  sqlite=new DatabaseSync(process.env.EMAIL_DB_PATH);
  sqlite.prepare('UPDATE mail SET next_attempt=0 WHERE id=?').run(failedId);
  global.fetch=async()=>({ok:true,json:async()=>({id:'retry-success'})});
  assert.equal(await mail.deliver(failedId),'accepted');

  // Consent is checked again if unsubscribe happens after campaign queuing.
  sqlite.prepare("UPDATE contacts SET status='subscribed' WHERE email=?").run('reader@example.com');
  mail.campaign({id:'cancel-before-send',subject:'News',body:'Hello'});
  mail.unsubscribe(unsubscribeToken);
  const cancelId=mail.outbox().find(row=>row.id.startsWith('campaign-cancel-before-send')).id;
  assert.equal(await mail.deliver(cancelId),'cancelled');
  sqlite.prepare('UPDATE contacts SET expires=0,status=? WHERE email=?').run('pending','reader@example.com');
  assert.equal(mail.confirm(token),null);
  process.env.NODE_ENV='production'; process.env.EMAIL_MODE='preview';
  assert.throws(()=>mail.subscribe('new@example.com',[]),/not configured/);
});
