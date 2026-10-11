const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');

function load(file, storage = new Map()) {
  let blocked = false;
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(source, { exports, require, localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => { if (blocked) throw new Error('Storage blocked'); storage.set(key, value); } } });
  return { exports, storage, block: () => { blocked = true; } };
}
test('all guided discussions resolve to real circles with unique paths', () => {
  const { exports: data } = load('lib/data/community.ts');
  assert.equal(new Set(data.CIRCLES.map(item => item.slug)).size, data.CIRCLES.length);
  assert.equal(new Set(data.DISCUSSIONS.map(item => item.slug)).size, data.DISCUSSIONS.length);
  for (const item of data.DISCUSSIONS) { assert.ok(data.getCircle(item.circle)); assert.ok(item.body.length); }
  assert.equal(data.getCircle('missing'), undefined);
  assert.equal(data.getDiscussion('missing'), undefined);
});
test('circle membership and bookmarks toggle persistently without duplicates', () => {
  const { exports: store, storage } = load('lib/store/community.ts');
  assert.equal(store.toggleActivity('joined', 'the-focus-room'), true);
  assert.equal(store.toggleActivity('saved', 'protecting-your-first-hour'), true);
  let saved = JSON.parse(storage.get('knovera_community_v1'));
  assert.deepEqual(saved.joined, ['the-focus-room']);
  assert.deepEqual(saved.saved, ['protecting-your-first-hour']);
  store.toggleActivity('joined', 'the-focus-room');
  saved = JSON.parse(storage.get('knovera_community_v1'));
  assert.deepEqual(saved.joined, []);
});
test('corrupt storage recovers and failed writes preserve saved state', () => {
  const storage = new Map([['knovera_community_v1', '{bad json']]);
  const loaded = load('lib/store/community.ts', storage);
  assert.equal(loaded.exports.toggleActivity('saved', 'example'), true);
  const before = storage.get('knovera_community_v1');
  loaded.block();
  assert.equal(loaded.exports.toggleActivity('saved', 'second'), false);
  assert.equal(storage.get('knovera_community_v1'), before);
});
test('private journal persists independently of other reading activity', () => {
  const { exports: store, storage } = load('lib/store/community.ts');
  store.toggleActivity('completed', 'the-focus-room:0');
  store.updateActivity(previous => ({ ...previous, notes: { ...previous.notes, reflection: 'Read a little each day.' } }));
  const saved = JSON.parse(storage.get('knovera_community_v1'));
  assert.equal(saved.notes.reflection, 'Read a little each day.');
  assert.deepEqual(saved.completed, ['the-focus-room:0']);
});
