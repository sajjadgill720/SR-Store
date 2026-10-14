import { limitedBody, requestFailure } from '@/lib/http-guard';
import { verifyLemonSignature, processLemonEvent } from '@/lib/payments/lemon';
import { receipt } from '@/lib/email/service.mjs';
export async function POST(req:Request) {
  try {
    const raw=await limitedBody(req,256000);
    verifyLemonSignature(raw,req.headers.get('x-signature'));
    const order=await processLemonEvent(JSON.parse(raw));
    if(order?.paymentStatus==='paid')receipt(order);
    return Response.json({received:true});
  }catch(error){return requestFailure(error);}
}
