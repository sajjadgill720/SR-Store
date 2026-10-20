/* eslint-disable @typescript-eslint/no-require-imports -- Native Node test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { setup } = require('./helpers/postgres.cjs');

test('rate limits are atomic, expire, isolate identities, and return Retry-After', async () => {
  const { engine, adapter, load } = await setup();
  const guard = load('lib/http-guard.ts');
  const secret = process.env.RATE_LIMIT_SECRET;
  process.env.RATE_LIMIT_SECRET = 'isolated-test-secret';
  try {
    const request = new Request('https://store.example/api/test');
    const results = await Promise.allSettled(Array.from({ length: 8 }, () => guard.rateLimit(request, 'test', 3, 60000, 'reader-a')));
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 3);
    const failure = results.find(result => result.status === 'rejected').reason;
    assert.equal(failure.status, 429);
    const response = guard.requestFailure(failure);
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get('Retry-After')) > 0);
    await guard.rateLimit(request, 'test', 3, 60000, 'reader-b');
    await adapter.query('UPDATE knovera.limits SET expires=0');
    await guard.rateLimit(request, 'test', 3, 60000, 'reader-a');
    const tooLarge = new Request('https://store.example', { method: 'POST', body: 'x'.repeat(200) });
    await assert.rejects(() => guard.limitedBody(tooLarge, 100), error => error.status === 413);
  } finally {
    if (secret === undefined) delete process.env.RATE_LIMIT_SECRET; else process.env.RATE_LIMIT_SECRET = secret;
    await engine.close();
  }
});
