import { NextRequest } from 'next/server';
import { sameOrigin, authFailure } from '@/lib/auth/http';
import { checkoutInput, createLemonCheckout, checkoutStatus } from '@/lib/payments/lemon';
import { limitedBody, rateLimit, requestFailure, RequestError } from '@/lib/http-guard';
export async function POST(req:NextRequest) {
  try {sameOrigin(req);}catch(error){return authFailure(error);}
  try {
    await rateLimit(req,'checkout',10);
    const input=checkoutInput.safeParse(JSON.parse(await limitedBody(req)));
    if(!input.success)throw new RequestError('Enter valid customer details and cart items.');
    await rateLimit(req,'checkout-email',5,60000,input.data.customerEmail);
    return Response.json(await createLemonCheckout(input.data),{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return requestFailure(error);}
}
export async function GET(req:NextRequest) {
  try {
    const token=req.nextUrl.searchParams.get('token')||'';
    await rateLimit(req,'checkout-status',60,60000,token);
    return Response.json(await checkoutStatus(token),{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return requestFailure(error);}
}
