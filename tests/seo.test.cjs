const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
test('SEO uses canonical domain, honest prices and safe JSON-LD',()=>{
  const exports={};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync('lib/seo.ts','utf8'),{compilerOptions:{module:1,target:7}}).outputText,{exports,URL,process:{env:{SITE_URL:'https://books.example'}}});
  assert.equal(exports.pageMetadata('A','B','/books/a').alternates.canonical,'/books/a');
  const product=exports.bookSchema({slug:'a',title:'A</script>',author:'Author',price:1850,isInStock:true,rightsStatus:'wide'});
  assert.equal(product.offers.price,'18.50');
  assert.equal(product.url,'https://books.example/books/a');
  assert.equal(product.aggregateRating,undefined);
  assert.equal(exports.jsonLd(product).includes('</script>'),false);
});
