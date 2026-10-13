import { NextRequest, NextResponse } from 'next/server';
import { serverAuth } from '@/lib/auth/server';
import { authDestination } from '@/lib/auth/navigation';
import { privateHeaders } from '@/lib/auth/http';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (code) {
    try {
      const { error } = await (await serverAuth()).auth.exchangeCodeForSession(code);
      if (!error) return NextResponse.redirect(new URL(authDestination(req.nextUrl.searchParams.get('next')),req.url), { headers:privateHeaders });
    } catch { /* Expired or mismatched-browser link goes to a recoverable error page. */ }
  }
  return NextResponse.redirect(new URL('/account/login?error=link',req.url), { headers:privateHeaders });
}
