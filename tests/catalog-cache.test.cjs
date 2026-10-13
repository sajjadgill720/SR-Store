/* eslint-disable @typescript-eslint/no-require-imports -- Node test runner. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');

test('public catalog excludes drafts and private file locations without modifying authoritative books',async()=>{
  const books=[{id:'published',isPublished:true,currentEdition:{assets:[{storageKey:'private/book.pdf'}]}},{id:'draft',isPublished:false,currentEdition:{assets:[]}}];
  const events=[],exports={};
  const cache={cacheLife:value=>events.push(value),cacheTag:value=>events.push(value),revalidateTag:(...args)=>events.push(args)};
  const db={getBooks:async()=>books,getBundles:async()=>[{id:'set',books}]};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/catalog-cache.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:id=>id==='next/cache'?cache:id==='./catalog-version'?{catalogVersion:async()=>'1'}:{db}});
  const result=await exports.getPublicCatalog();
  assert.equal(result.books.length,1);
  assert.equal(result.bundles[0].books.length,1);
  assert.equal(JSON.stringify(result).includes('storageKey'),false);
  assert.equal(books[0].currentEdition.assets[0].storageKey,'private/book.pdf');
  assert.equal(events[0].revalidate,86400);
  exports.invalidatePublicCatalog();
  assert.equal(events.at(-1)[0],exports.CATALOG_TAG);
  assert.equal(events.at(-1)[1].expire,0);
});

test('public API validators reuse snapshot; only successful authorized writes invalidate',async()=>{
  const {NextRequest,NextResponse}=require('next/server');let invalidations=0,admin=true,exists=true;
  const exports={},dependencies={
    'next/server':{NextResponse},'node:crypto':require('node:crypto'),
    '@/lib/catalog-cache':{getPublicCatalog:async()=>({books:[{id:'book',isPublished:true}]}),invalidatePublicCatalog:()=>invalidations++},
    '../../../lib/db/store':{db:{deleteBook:async()=>exists}},
    '@/lib/auth/server':{requireAdmin:async()=>{if(!admin)throw new Error('denied');}},
    '@/lib/auth/http':{sameOrigin:()=>{},authFailure:()=>NextResponse.json({error:'denied'},{status:403})},
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('app/api/books/route.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports,URL,require:id=>dependencies[id]});
  const first=await exports.GET(new NextRequest('http://localhost/api/books'));
  assert.match(first.headers.get('cache-control'),/public/);
  const second=await exports.GET(new NextRequest('http://localhost/api/books',{headers:{'if-none-match':first.headers.get('etag')}}));
  assert.equal(second.status,304);
  const request=()=>new NextRequest('http://localhost/api/books?id=book',{method:'DELETE'});
  await exports.DELETE(request());assert.equal(invalidations,1);
  exists=false;await exports.DELETE(request());assert.equal(invalidations,1);
  admin=false;assert.equal((await exports.DELETE(request())).status,403);assert.equal(invalidations,1);
});
