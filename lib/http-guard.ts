import { createHmac } from 'node:crypto';
import { query } from './db/postgres.mjs';
export class RequestError extends Error {
  constructor(message:string,public status=400,public retryAfter?:number) {super(message);}
}
export async function limitedBody(req:Request,max=16000) {
  const reader=req.body?.getReader();
  if(!reader) throw new RequestError('Request body required.');
  const chunks:Uint8Array[]=[];let size=0;
  try { while(true) {const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new RequestError('Request too large.',413);}chunks.push(value);} }
  finally {reader.releaseLock();}
  return Buffer.concat(chunks).toString('utf8');
}
export async function consumeLimit(key:string,max:number,windowMs:number) {
  const now=Date.now();
  const {rows}=await query<{count:number;expires:string}>('INSERT INTO knovera.limits VALUES($1,1,$2) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN knovera.limits.expires<=$3 THEN 1 ELSE LEAST(knovera.limits.count+1,$4+1) END,expires=CASE WHEN knovera.limits.expires<=$3 THEN excluded.expires ELSE knovera.limits.expires END RETURNING count,expires',[key,now+windowMs,now,max]);
  if(rows[0].count>max) throw new RequestError('Too many requests. Please try again later.',429,Math.max(1,Math.ceil((Number(rows[0].expires)-now)/1000)));
}
export async function rateLimit(req:Request,scope:string,max:number,windowMs=60000,identity?:string) {
  // Never trust arbitrary forwarding headers. Configure only a header your edge
  // overwrites, and block direct origin access before enabling it.
  await consumeLimit(`http:${scope}:global`,Math.max(max*50,300),windowMs);
  const secret=process.env.RATE_LIMIT_SECRET || process.env.SUPABASE_SECRET_KEY;
  const header=process.env.RATE_LIMIT_IP_HEADER;
  const ip=header?req.headers.get(header)?.trim():undefined;
  for(const value of [ip&&`ip:${ip}`,identity&&`identity:${identity.toLowerCase()}`]) {
    if(!value)continue;
    if(!secret)throw new Error('Rate limiting is not configured');
    const digest=createHmac('sha256',secret).update(value).digest('hex');
    await consumeLimit(`http:${scope}:${digest}`,max,windowMs);
  }
}
export function requestFailure(error:unknown) {
  const known=error instanceof RequestError;
  return Response.json({error:known?error.message:error instanceof SyntaxError?'Invalid JSON.':'Service temporarily unavailable. Please try again.'},{status:known?error.status:error instanceof SyntaxError?400:503,headers:{'Cache-Control':'private, no-store',...(known&&error.retryAfter?{'Retry-After':String(error.retryAfter)}:{})}});
}
