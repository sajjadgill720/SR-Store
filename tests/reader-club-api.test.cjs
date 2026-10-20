/* eslint-disable @typescript-eslint/no-require-imports -- Native Node test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { NextRequest } = require('next/server');

test('Reader Club API remembers signup, confirms ownership, deduplicates and throttles', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'knovera-club-api-'));
  process.env.EMAIL_DB_PATH = path.join(directory, 'mail.sqlite');
  process.env.EMAIL_MODE = 'preview'; process.env.NODE_ENV = 'test';
  process.env.EMAIL_SITE_URL = 'https://store.example';
  process.env.RATE_LIMIT_SECRET = 'isolated-test-secret';
  const mail = await import('../lib/email/service.mjs');
  const { engine, load } = await require('./helpers/postgres.cjs').setup();
  const guard = load('lib/http-guard.ts');
  const modules = new Map();
  function compiled(file) {
    if (modules.has(file)) return modules.get(file);
    const exports = {};
    const customRequire = id => {
      if (id === '@/lib/email/service.mjs' || id === './service.mjs') return mail;
      if (id === '@/lib/http-guard') return guard;
      if (id === '@/lib/auth/server') return { currentUser: async () => null };
      if (id === '@/lib/email/club-cookie') return compiled('lib/email/club-cookie.ts');
      return require(id);
    };
    vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports, require: customRequire, process, URL, URLSearchParams, Response, console });
    modules.set(file, exports); return exports;
  }
  const signup = compiled('app/api/newsletter/subscribe/route.ts').POST;
  const status = compiled('app/api/newsletter/status/route.ts').GET;
  const confirm = compiled('app/api/newsletter/confirm/route.ts').POST;
  const cookie = response => response.headers.get('set-cookie').split(';')[0];
  const statusRequest = value => new NextRequest('https://store.example/api/newsletter/status', { headers: { Cookie: value } });
  const signupRequest = () => new NextRequest('https://store.example/api/newsletter/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: ' Reader@Example.com ', topics: ['new-releases'] }) });
  try {
    const first = await signup(signupRequest()); assert.equal(first.status, 200);
    assert.match(first.headers.get('set-cookie'), /HttpOnly/i);
    assert.doesNotMatch(first.headers.get('set-cookie'), /reader@example/i);
    const pending = await status(statusRequest(cookie(first)));
    assert.equal((await pending.json()).status, 'pending');
    assert.equal((await signup(signupRequest())).status, 200);
    const confirmation = mail.outbox().filter(row => row.id.startsWith('confirmation-'));
    assert.equal(confirmation.length, 1);
    const token = mail.preview(confirmation[0].id).text.match(/token=([a-f0-9]{64})/)[1];
    const confirmed = await confirm(new NextRequest('https://store.example/api/newsletter/confirm', { method: 'POST', body: new URLSearchParams({ token }) }));
    assert.equal(confirmed.status, 303);
    assert.equal(confirmed.headers.get('Location'), '/newsletter/confirm?done=1', 'Stay on the browser host so its membership cookie is retained');
    assert.equal((await (await status(statusRequest(cookie(confirmed)))).json()).status, 'subscribed');
    assert.equal((await signup(signupRequest())).status, 200);
    const limited = await signup(signupRequest()); assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('Retry-After')) > 0);
    assert.equal(mail.contacts().length, 1);
  } finally {
    mail.close(); await engine.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
