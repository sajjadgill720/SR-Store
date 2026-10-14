import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { db } from '../db/store';
import { query, transaction } from '../db/postgres.mjs';
import { RequestError } from '../http-guard';
import type { Order, OrderItem } from '../types';

export const checkoutInput=z.object({customerEmail:z.string().trim().email().max(254),customerName:z.string().trim().max(120).optional(),items:z.array(z.object({bookId:z.string().min(1).max(100),quantity:z.number().int().min(1).max(20)})).min(1).max(20)});
type Intent={items:OrderItem[];subtotal:number;email:string;name?:string;test:boolean;store:string;variant:string;publicToken:string;orderId:string;providerOrderId?:string};
function config() {
  const key=process.env.LEMON_SQUEEZY_API_KEY,store=process.env.LEMON_SQUEEZY_STORE_ID,variant=process.env.LEMON_SQUEEZY_VARIANT_ID;
  const origin=new URL(process.env.SITE_URL || 'http://127.0.0.1:3000');
  const test=process.env.LEMON_SQUEEZY_TEST_MODE !== 'false';
  if(!['http:','https:'].includes(origin.protocol) || origin.username || origin.password)throw new RequestError('Invalid store URL.',503);
  if(!key || !store || !variant || !/^\d+$/.test(store) || !/^\d+$/.test(variant) || !process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)throw new RequestError('Checkout is not configured yet.',503);
  if(process.env.NODE_ENV==='production' && (test || origin.protocol!=='https:'))throw new RequestError('Live checkout is not enabled.',503);
  return {key,store,variant,test,origin:origin.origin};
}
async function api(path:string,body?:unknown) {
  const key=process.env.LEMON_SQUEEZY_API_KEY;
  if(!key)throw new Error('Payment API is not configured');
  const response=await fetch('https://api.lemonsqueezy.com/v1/'+path,{method:body?'POST':'GET',cache:'no-store',signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${key}`,Accept:'application/vnd.api+json','Content-Type':'application/vnd.api+json'},...(body?{body:JSON.stringify(body)}:{})});
  if(!response.ok)throw new Error('Payment provider request failed');
  return response.json();
}
export const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export async function createLemonCheckout(input:z.infer<typeof checkoutInput>) {
  const cfg=config();
  const ids=input.items.map(item=>item.bookId);
  if(new Set(ids).size!==ids.length)throw new RequestError('Duplicate cart items.');
  const books=await db.getBooksByIds(ids);
  const items:OrderItem[]=input.items.map(item=>{
    const book=books.find(b=>b.id===item.bookId);
    if(!book || !book.isPublished || !book.isInStock || book.rightsStatus!=='wide' || !Number.isSafeInteger(book.price) || book.price<=0)throw new RequestError('A book is no longer available. Refresh your cart.',409);
    return {id:randomUUID(),bookId:book.id,title:book.title,price:book.price,quantity:item.quantity,formats:book.formats,editionVersion:book.currentEdition.version};
  });
  const subtotal=items.reduce((n,item)=>n+item.price*(item.quantity||1),0);
  if(!Number.isSafeInteger(subtotal) || subtotal>10000000)throw new RequestError('Cart total is not supported.');
  // Refuse payment for missing files, even if a draft catalog entry was published.
  const keys=books.flatMap(book=>book.formats.map(format=>book.currentEdition.assets.find(asset=>asset.format===format)?.storageKey));
  if(!keys.length || keys.some(key=>!key))throw new RequestError('A book is not ready for download yet.',409);
  const bucket=process.env.SUPABASE_EBOOK_BUCKET || 'ebooks';
  const available=await query<{name:string}>('SELECT o.name FROM storage.objects o JOIN storage.buckets b ON b.id=o.bucket_id WHERE b.id=$1 AND b.public=false AND o.name=ANY($2::text[])',[bucket,keys]);
  const found=new Set(available.rows.map(row=>row.name));
  if(keys.some(key=>!found.has(key!)))throw new RequestError('A book is not ready for download yet.',409);
  const price=(await api('prices?filter[variant_id]='+cfg.variant+'&page[size]=1')).data?.[0]?.attributes;
  if(String(price?.variant_id)!==cfg.variant || price?.category!=='one_time' || price?.scheme!=='standard')throw new RequestError('Checkout requires a one-time product.',503);
  const id=randomUUID(),token=randomBytes(32).toString('hex');
  const intent:Intent={items,subtotal,email:input.customerEmail.toLowerCase(),name:input.customerName,test:cfg.test,store:cfg.store,variant:cfg.variant,publicToken:token,orderId:randomUUID()};
  await query('INSERT INTO knovera.checkout_intents(id,token_hash,data) VALUES($1,$2,$3)',[id,tokenHash(token),intent]);
  const returnUrl=cfg.origin+'/checkout/return?checkout='+token;
  // One fixed, non-subscription USD variant represents the server-priced cart.
  const result=await api('checkouts',{data:{type:'checkouts',attributes:{custom_price:subtotal,test_mode:cfg.test,expires_at:new Date(Date.now()+30*60000).toISOString(),product_options:{name:'Knovera digital books',description:items.map(i=>`${i.title} × ${i.quantity}`).join(' · '),enabled_variants:[Number(cfg.variant)],redirect_url:returnUrl,receipt_link_url:returnUrl,receipt_button_text:'Access your books'},checkout_options:{discount:false},checkout_data:{email:intent.email,name:intent.name,custom:{intent_id:id},variant_quantities:[{variant_id:Number(cfg.variant),quantity:1}]},preview:true},relationships:{store:{data:{type:'stores',id:cfg.store}},variant:{data:{type:'variants',id:cfg.variant}}}}});
  const attrs=result.data?.attributes;
  const url=new URL(attrs?.url || 'https://invalid.invalid');
  if(url.protocol!=='https:' || !url.hostname.endsWith('.lemonsqueezy.com') || String(attrs.store_id)!==cfg.store || String(attrs.variant_id)!==cfg.variant || attrs.test_mode!==cfg.test || attrs.preview?.currency!=='USD' || attrs.preview?.subtotal!==subtotal)throw new Error('Unexpected checkout configuration');
  return {checkoutUrl:url.href};
}
export function verifyLemonSignature(raw:string,signature:string|null) {
  const secret=process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if(!secret)throw new RequestError('Webhook is not configured.',503);
  if(!signature || !/^[a-f0-9]{64}$/i.test(signature))throw new RequestError('Invalid signature.',401);
  const expected=createHmac('sha256',secret).update(raw).digest();
  if(!timingSafeEqual(expected,Buffer.from(signature,'hex')))throw new RequestError('Invalid signature.',401);
}
const eventSchema=z.object({meta:z.object({event_name:z.string(),custom_data:z.object({intent_id:z.string().uuid()}).optional()}),data:z.object({type:z.literal('orders'),id:z.string().regex(/^\d+$/)})});
export async function processLemonEvent(payload:unknown):Promise<Order|null> {
  const parsed=eventSchema.safeParse(payload);
  if(!parsed.success)throw new RequestError('Invalid order event.');
  const event=parsed.data;
  if(!['order_created','order_refunded'].includes(event.meta.event_name))return null;
  const providerId=event.data.id;
  // Read current provider state: late/replayed paid events must not undo a refund.
  const remote=(await api('orders/'+providerId)).data;
  if(remote?.type!=='orders' || String(remote.id)!==providerId)throw new Error('Unexpected provider order');
  const a=remote.attributes;
  return transaction(async client=>{
    const result=event.meta.custom_data?.intent_id
      ?await client.query('SELECT id,data FROM knovera.checkout_intents WHERE id=$1 FOR UPDATE',[event.meta.custom_data.intent_id])
      :await client.query("SELECT id,data FROM knovera.checkout_intents WHERE data->>'providerOrderId'=$1 FOR UPDATE",[providerId]);
    if(!result.rows[0])return null; // Other products in the same store are not ours.
    const intent=result.rows[0].data as Intent;
    if(intent.providerOrderId && intent.providerOrderId!==providerId)throw new RequestError('Checkout already fulfilled.',409);
    if(String(a.store_id)!==intent.store || a.test_mode!==intent.test || (process.env.NODE_ENV==='production'&&a.test_mode) || a.currency!=='USD' || a.subtotal!==intent.subtotal || a.discount_total!==0 || String(a.first_order_item?.variant_id)!==intent.variant || (a.first_order_item?.quantity!==undefined && a.first_order_item.quantity!==1) || !Number.isSafeInteger(a.total) || a.total<0 || typeof a.user_email!=='string' || !z.email().safeParse(a.user_email).success)throw new RequestError('Order does not match checkout.',422);
    if(!['paid','refunded','partial_refund'].includes(a.status))return null;
    const refunded=a.status!=='paid' || a.refunded===true || a.refunded_amount>0;
    const existing=await client.query('SELECT data FROM knovera.orders WHERE id=$1',[intent.orderId]);
    const previous=existing.rows[0]?.data as Omit<Order,'id'>|undefined;
    // Refunds are terminal. Partial refunds revoke this cart's access conservatively.
    const status=refunded || previous?.paymentStatus==='refunded'?'refunded':'paid';
    const order:Order={id:intent.orderId,orderNumber:'LS-'+providerId,publicToken:intent.publicToken,customerEmail:a.user_email.trim().toLowerCase(),customerName:a.user_name||intent.name||'Reader',currency:'USD',totalAmount:a.total,discountAmount:0,paymentStatus:status,provider:intent.test?'development_simulator':'lemon_squeezy',providerOrderId:providerId,items:intent.items,createdAt:previous?.createdAt||new Date().toISOString(),receiptUrl:'/orders/'+intent.publicToken};
    const {id,...data}=order;
    await client.query('INSERT INTO knovera.orders(id,data) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET data=EXCLUDED.data',[id,data]);
    for(const item of order.items)await client.query('INSERT INTO knovera.entitlements(id,"customerEmail","bookId","orderId",status,"grantedAt") VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT("orderId","bookId") DO UPDATE SET status=EXCLUDED.status',[randomUUID(),order.customerEmail,item.bookId,id,status==='paid'?'active':'revoked',order.createdAt]);
    await client.query("UPDATE knovera.checkout_intents SET data=jsonb_set(data,'{providerOrderId}',$2::jsonb) WHERE id=$1",[result.rows[0].id,JSON.stringify(providerId)]);
    if(!previous || previous.paymentStatus!==status)await client.query('INSERT INTO knovera.audit_logs VALUES($1,$2,$3,$4)',[randomUUID(),status==='paid'?'ORDER_FULFILLED':'ORDER_REFUNDED','Lemon Squeezy order '+providerId,new Date().toISOString()]);
    return order;
  });
}
export async function checkoutStatus(token:string) {
  if(!/^[a-f0-9]{64}$/.test(token))throw new RequestError('Invalid checkout reference.');
  const row=(await query<{data:Intent}>('SELECT data FROM knovera.checkout_intents WHERE token_hash=$1',[tokenHash(token)])).rows[0];
  if(!row)throw new RequestError('Checkout not found.',404);
  const order=(await query<{data:Order}>('SELECT data FROM knovera.orders WHERE id=$1',[row.data.orderId])).rows[0]?.data;
  return order?{status:order.paymentStatus,publicToken:order.publicToken}:{status:'pending'};
}
