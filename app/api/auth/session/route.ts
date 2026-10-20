import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth/server';
import { accountRole } from '@/lib/auth/store';
import { authFailure, privateHeaders } from '@/lib/auth/http';
import { rateLimit, RequestError, requestFailure } from '@/lib/http-guard';

export async function GET(req: NextRequest) {
  try {
    await rateLimit(req, 'auth-session', 120);
    const user = await currentUser();
    return NextResponse.json({ user: user ? { id:user.id,email:user.email,role:await accountRole(user.id) } : null }, { headers: privateHeaders });
  } catch (error) { return error instanceof RequestError ? requestFailure(error) : authFailure(error); }
}
