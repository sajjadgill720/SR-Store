import { NextRequest, NextResponse } from 'next/server';
import { serverAuth, AuthError } from '@/lib/auth/server';
import { authDestination } from '@/lib/auth/navigation';
import { sameOrigin, authFailure, privateHeaders } from '@/lib/auth/http';

export async function POST(req: NextRequest) {
  try {
    sameOrigin(req);
    const body = await req.json();
    if (!['signup','recovery','invite','email_change'].includes(body.type) || typeof body.token_hash !== 'string' || body.token_hash.length>512)
      throw new AuthError('Invalid confirmation link.',400);
    const { error } = await (await serverAuth()).auth.verifyOtp({ token_hash:body.token_hash,type:body.type });
    if (error) throw new AuthError('This link is invalid or expired. Please request a new one.',400);
    return NextResponse.json({ next:body.type==='recovery'||body.type==='invite'?'/account/update-password':authDestination(body.next) }, {headers:privateHeaders});
  } catch (error) { return authFailure(error); }
}
