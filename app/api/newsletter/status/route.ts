import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth/server';
import { clubSessionStatus, contactStatus } from '@/lib/email/service.mjs';
import { CLUB_COOKIE } from '@/lib/email/club-cookie';
import { rateLimit, requestFailure } from '@/lib/http-guard';

export async function GET(req: NextRequest) {
  try {
    await rateLimit(req, 'newsletter-status', 120);
    let status = clubSessionStatus(req.cookies.get(CLUB_COOKIE)?.value);
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && req.cookies.getAll().some(cookie => cookie.name.startsWith('sb-'))) {
      const user = await currentUser();
      if (user?.email) {
        const membership = contactStatus(user.email.toLowerCase());
        status = membership === 'subscribed' ? 'subscribed' : membership === 'pending' ? 'pending' : 'none';
      }
    }
    return NextResponse.json({ status }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) { return requestFailure(error); }
}
