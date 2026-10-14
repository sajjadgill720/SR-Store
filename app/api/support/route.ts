import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { db } from '@/lib/db/store';
import { sameOrigin, authFailure } from '@/lib/auth/http';
import { limitedBody, rateLimit, RequestError, requestFailure } from '@/lib/http-guard';
const schema=z.object({customerEmail:z.string().trim().email().max(254),subject:z.string().trim().min(1).max(160),category:z.enum(['general','download_help','device_setup','payment_inquiry']).optional(),orderReference:z.string().trim().max(100).optional(),message:z.string().trim().min(10).max(5000)});
export async function POST(req:NextRequest) {
  try{sameOrigin(req);}catch(error){return authFailure(error);}
  try {
    await rateLimit(req,'support',5,3600000);
    const input=schema.safeParse(JSON.parse(await limitedBody(req,24000)));
    if(!input.success)throw new RequestError('Enter a valid email, subject and message (10–5000 characters).');
    const data=input.data;
    await rateLimit(req,'support-email',5,3600000,data.customerEmail);
    const id=randomUUID(),ticketNumber='TKT-'+id.toUpperCase();
    await db.addTicket({...data,id,ticketNumber,customerEmail:data.customerEmail.toLowerCase(),category:data.category||'general',status:'open',createdAt:new Date().toISOString()});
    return Response.json({success:true,ticketNumber},{headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return requestFailure(error);}
}
