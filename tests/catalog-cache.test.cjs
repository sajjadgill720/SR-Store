/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');

test('public catalog excludes drafts and private file locations without modifying authoritative books',async()=>{
  const books=[{id:'published',isPublished:true,currentEdition:{assets:[{storageKey:'private/book.pdf'}]}},{id:'draft',isPublished:false,currentEdition:{assets:[]}}];
  const events=[],exports={};
  const cache={cacheLife:value=>events.push(value),cacheTag:value=>events.push(value),revalidateTag:(...args)=>events.push(args)};
  const db={getBooks:async()=>books,getBundles:async()=>[{id:'set',books}]};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/catalog-cache.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:id=>id==='next/cache'?cache:{db}});
  const result=await exports.getPublicCatalog();
  assert.equal(result.books.length,1);
  assert.equal(result.bundles[0].books.length,1);
  assert.equal(JSON.stringify(result).includes('storageKey'),false);
  assert.equal(books[0].currentEdition.assets[0].storageKey,'private/book.pdf');
  assert.equal(events[0].revalidate,604800);
  exports.invalidatePublicCatalog();
  assert.equal(events.at(-1)[0],exports.CATALOG_TAG);
  assert.equal(events.at(-1)[1].expire,0);
});
