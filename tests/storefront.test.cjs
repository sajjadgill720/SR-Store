/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS harness for Node's built-in test runner. */
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
  vm.runInNewContext(source, { exports, require, URL, Intl, localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key,value) => { if (blocked) throw new Error('Storage unavailable'); storage.set(key,value); } } });
  return { api: exports, storage, block: () => { blocked = true; } };
}
test('payment states never offer downloads for pending, failed, or refunded orders', () => {
  const { api } = load('lib/catalog.ts');
  assert.equal(api.orderPresentation('paid').accessible, true);
  for (const status of ['pending','failed','refunded']) assert.equal(api.orderPresentation(status).accessible, false);
});
test('sample pagination preserves exactly the approved excerpt paragraphs', () => {
  const { api } = load('lib/catalog.ts');
  const excerpt = 'Chapter One\n\n' + Array.from({length:6},(_,index) => `Paragraph ${index}. ` + 'A thought to consider. '.repeat(12)).join('\n\n');
  const sections = api.sampleSections(excerpt);
  assert.ok(sections.length > 1);
  assert.equal(sections.join('\n\n'), excerpt.trim());
  assert.equal(api.sampleSections('   ').length, 0);
});
test('discovery searches topic and description without exposing unpublished titles', () => {
  const { api } = load('lib/catalog.ts');
  const books = [{id:'one',isPublished:true,title:'Attention',author:'Author',category:'Productivity',shortDescription:'Build calmer habits'}, {id:'two',isPublished:false,title:'Draft',category:'Productivity'}, {id:'three',isPublished:true,title:'Family',category:'Children & Family'}];
  assert.equal(api.discoverBooks(books,'habits','All').length, 1);
  assert.equal(api.discoverBooks(books,'Productivity','All').length, 1);
  assert.equal(api.discoverBooks(books,'','All',['three'])[0].id, 'three');
});
test('image sizing preserves unknown assets and requests uncropped known images', () => {
  const { api } = load('lib/catalog.ts');
  assert.equal(api.coverSource('/cover.png',320), '/cover.png');
  assert.equal(api.coverSource('https://example.com/cover.jpg',320), 'https://example.com/cover.jpg');
  const url = new URL(api.coverSource('https://images.unsplash.com/photo-example?fit=crop&w=800',320));
  assert.equal(url.searchParams.get('w'),'320');
  assert.equal(url.searchParams.get('fit'),'max');
});
test('shopping reads persisted cart before mutations and does not overwrite it with empty hydration state', () => {
  const cart = [{bookId:'one',title:'Book',slug:'book',author:'Author',coverImage:'/cover.png',price:1999,formatSelected:'PDF',quantity:2}];
  const storage = new Map([['sr_store_cart',JSON.stringify(cart)]]);
  const { api } = load('lib/store/shopping.ts',storage);
  const next = api.updateShopping(previous => ({...previous,wishlist:['one']}));
  assert.equal(next.items.length,1);
  assert.equal(next.items[0].quantity,2);
  assert.deepEqual(JSON.parse(storage.get('sr_store_cart')),cart);
});
test('invalid cart records are rejected and storage failure keeps activity usable without claiming persistence', () => {
  const { api, block } = load('lib/store/shopping.ts',new Map([['sr_store_cart','broken json']]));
  assert.equal(api.validateCart([{quantity:-1,price:0}]).length,0);
  block();
  const next = api.updateShopping(previous => ({...previous,wishlist:['one']}));
  assert.equal(next.wishlist[0],'one');
  assert.ok(next.storageError);
});
