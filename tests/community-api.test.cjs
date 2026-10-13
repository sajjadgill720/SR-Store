const { test } = require('node:test');
const assert = require('node:assert/strict');
const origin = process.env.COMMUNITY_TEST_URL;
test('community HTTP contract across independent member sessions', { skip: !origin || process.env.COMMUNITY_TEST_DISPOSABLE !== '1' || !process.env.SUPABASE_DB_URL }, async () => {
  const suffix = Date.now().toString(36);
  const clients = [{}, {}, {}];
  async function request(client, route, input, options = {}) {
    const response = await fetch(`${origin}/api/community/${route}`, {
      method: input === undefined ? 'GET' : 'POST',
      headers: { ...(input === undefined ? {} : { 'Content-Type': 'application/json', Origin: origin }), ...(client.cookie ? { Cookie: client.cookie } : {}), ...options.headers },
      body: input === undefined ? undefined : JSON.stringify(input),
    });
    const cookie = response.headers.get('set-cookie');
    if (cookie) client.cookie = cookie.split(';')[0];
    return { status: response.status, value: await response.json(), response };
  }
  const [a, b, anotherDevice] = clients;
  const username = `dev-a-${suffix}`;
  const password = 'Development-test-2468';
  const registered = await request(a, 'session', { action: 'register', username, password, name: 'Development Reader A' });
  assert.equal(registered.status, 200);
  assert.match(registered.response.headers.get('set-cookie'), /HttpOnly/i);
  const second = await request(b, 'session', { action: 'register', username: `dev-b-${suffix}`, password, name: 'Development Reader B' });
  assert.equal(second.status, 200);
  assert.equal((await request(anotherDevice, 'session', { action: 'login', username, password })).status, 200);
  assert.equal((await request({}, 'activity', { field: 'joined', id: 'the-focus-room', value: true, revision: 0 })).status, 401);
  assert.equal((await request(a, 'activity', { field: 'joined', id: 'the-focus-room', value: true, revision: 0 }, { headers: { Origin: 'https://untrusted.example' } })).status, 403);
  let revision = 0;
  for (const operation of [
    { field: 'joined', id: 'the-focus-room', value: true },
    { field: 'saved', id: 'protecting-your-first-hour', value: true },
    { field: 'completed', id: 'the-focus-room:0', value: true },
    { field: 'notes', id: 'protecting-your-first-hour', value: 'PRIVATE development reflection' },
  ]) {
    const result = await request(a, 'activity', { ...operation, revision });
    assert.equal(result.status, 200); revision = result.value.revision;
  }
  const synced = await request(anotherDevice, 'session');
  assert.equal(synced.value.activity.notes['protecting-your-first-hour'], 'PRIVATE development reflection');
  assert.deepEqual(synced.value.activity.joined, ['the-focus-room']);
  assert.deepEqual(synced.value.activity.saved, ['protecting-your-first-hour']);
  assert.deepEqual(synced.value.activity.completed, ['the-focus-room:0']);
  assert.deepEqual((await request(b, 'session')).value.activity.notes, {});
  assert.equal((await request(anotherDevice, 'activity', { field: 'notes', id: 'protecting-your-first-hour', value: 'Stale overwrite', revision: 0 })).status, 409);
  assert.equal((await request(a, 'session')).value.activity.notes['protecting-your-first-hour'], 'PRIVATE development reflection');
  const changedElsewhere = await request(anotherDevice, 'activity', { field: 'notes', id: 'protecting-your-first-hour', value: 'Updated on a second device', revision, previousValue: 'PRIVATE development reflection' });
  assert.equal(changedElsewhere.status, 200);
  assert.equal((await request(a, 'activity', { field: 'notes', id: 'protecting-your-first-hour', value: 'Old open draft', revision: changedElsewhere.value.revision, previousValue: 'PRIVATE development reflection' })).status, 409);
  assert.equal((await request(a, 'session')).value.activity.notes['protecting-your-first-hour'], 'Updated on a second device');
  const created = await request(a, 'threads', { circle: 'the-focus-room', title: `Development sync test ${suffix}`, body: 'Test conversation for shared replies. This is development test data.' });
  assert.equal(created.status, 201);
  const id = created.value.id;
  assert.equal((await request({}, `thread?id=${id}`)).value.thread.authorId, registered.value.member.id);
  assert.equal((await request(b, 'replies', { discussion: id, body: 'Development test reply from a second member.' })).status, 201);
  const reply = (await request(a, `replies?discussion=${id}`)).value.replies[0];
  assert.equal(reply.authorId, second.value.member.id);
  assert.equal((await request(a, 'replies', { discussion: id, parentId: reply.id, body: 'Development nested reply.' })).status, 201);
  const publicReplies = (await request({}, `replies?discussion=${id}`)).value.replies;
  assert.equal(publicReplies.length, 2);
  assert.equal(publicReplies[1].parentId, reply.id);
  assert.equal(JSON.stringify(publicReplies).includes('PRIVATE'), false);
  assert.equal((await request(a, 'moderation', { kind: 'reply', id: reply.id, action: 'hide' })).status, 403);
  assert.equal((await request(a, 'moderation', { kind: 'reply', id: reply.id, action: 'report', reason: 'Development moderation test.' })).status, 200);
  assert.equal((await request(a, 'reports')).status, 404);
  assert.equal((await request(b, 'moderation', { kind: 'reply', id: reply.id, action: 'hide' })).status, 200);
  assert.equal((await request(a, `replies?discussion=${id}`)).value.replies[0].body, '[Reply removed]');
  const cookieBeforeLogout = a.cookie;
  assert.equal((await request(a, 'session', { action: 'logout' })).status, 200);
  assert.equal((await request({cookie: cookieBeforeLogout}, 'session')).value.member, null);
  assert.equal((await request(anotherDevice, 'session')).value.member.id, registered.value.member.id, 'Logout revokes only the current device session');
  // Run only against a disposable Postgres project used by the test server.
  const {transaction,close}=await import('../lib/db/postgres.mjs');
  try {await transaction(async db=>{
    const ids=[registered.value.member.id,second.value.member.id];
    await db.query('DELETE FROM knovera.reports WHERE member=ANY($1::text[])',[ids]);
    await db.query('DELETE FROM knovera.replies WHERE discussion=$1',[id]);
    await db.query('DELETE FROM knovera.threads WHERE id=$1',[id]);
    for(const table of ['sessions','activity']) await db.query('DELETE FROM knovera.'+table+' WHERE member=ANY($1::text[])',[ids]);
    await db.query('DELETE FROM knovera.members WHERE id=ANY($1::text[])',[ids]);
  });} finally {await close();}
});
