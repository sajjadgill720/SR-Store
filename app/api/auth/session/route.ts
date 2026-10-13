import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth/server';
import { accountRole } from '@/lib/auth/store';
import { authFailure, privateHeaders } from '@/lib/auth/http';

export async function GET() {
  try {
    const user = await currentUser();
    return NextResponse.json({ user: user ? { id:user.id,email:user.email,role:await accountRole(user.id) } : null }, { headers: privateHeaders });
  } catch (error) { return authFailure(error); }
}
