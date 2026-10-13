import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { serverAuth, AuthError } from '@/lib/auth/server';
import { sameOrigin, authFailure, privateHeaders } from '@/lib/auth/http';
import { PURCHASE_COOKIE } from '@/lib/downloads/access';

export async function POST(req: NextRequest) {
  try {
    sameOrigin(req);
    const { error } = await (await serverAuth()).auth.signOut({ scope: 'local' });
    if (error) throw new AuthError('Could not sign out. Please try again.', 503);
    const jar = await cookies();
    jar.set(PURCHASE_COOKIE,'',{path:'/api',maxAge:0,httpOnly:true,sameSite:'strict',secure:process.env.NODE_ENV==='production'});
    jar.set('knovera_member','',{path:'/',maxAge:0});
    return NextResponse.json({ success:true }, { headers:privateHeaders });
  } catch (error) { return authFailure(error); }
}
