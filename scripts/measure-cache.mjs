// Run after `next build`: node --env-file=.env scripts/measure-cache.mjs
// Starts an isolated production server, performs only public GETs, and stops it.
import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
const port = 3101;
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)], {env:{...process.env,KNOVERA_QUERY_METRICS:'1'},stdio:['ignore','pipe','pipe'],windowsHide:true});
let queries=0, lines='';
server.stdout.on('data',chunk=>{
  lines+=chunk.toString();let end;
  while((end=lines.indexOf('\n'))!==-1){const line=lines.slice(0,end);lines=lines.slice(end+1);if(line.includes('"event":"knovera-query"'))queries++;}
});
server.stderr.on('data',()=>{}); // Do not persist potentially sensitive framework diagnostics.
const result=[];
try {
  await new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(new Error('Production server startup timed out')),30_000);
    server.stdout.on('data',chunk=>{if(chunk.toString().includes('Ready')){clearTimeout(timeout);resolve();}});
    server.once('exit',()=>{clearTimeout(timeout);reject(new Error('Production server exited before ready'));});
  });
  let etag;
  for(const [scenario,path] of [['initial storefront','/'],['open catalog','/books'],['catalog API cold','/api/books'],['catalog API revisit','/api/books'],['conditional catalog API','/api/books'],['book detail','/books/the-focused-mind'],['back to catalog','/books'],['revisit detail','/books/the-focused-mind']]) {
    const before=queries,started=performance.now();
    const response=await fetch(`http://127.0.0.1:${port}${path}`,{headers:scenario.startsWith('conditional')?{'If-None-Match':etag}: {}});
    const body=await response.text();
    // Drain stdout containing completed query telemetry.
    await new Promise(resolve=>setTimeout(resolve,50));
    if(path==='/api/books'&&response.status===200) etag=response.headers.get('etag');
    result.push({scenario,httpRequests:1,status:response.status,dbCalls:queries-before,bytes:Buffer.byteLength(body),ms:Math.round(performance.now()-started)});
  }
  await mkdir('artifacts/performance',{recursive:true});
  await writeFile('artifacts/performance/production-http.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
} finally {server.kill();}
