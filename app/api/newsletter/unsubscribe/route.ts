import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe } from '@/lib/email/service.mjs';
import { CLUB_COOKIE } from '@/lib/email/club-cookie';
import { limitedBody, rateLimit, requestFailure } from '@/lib/http-guard';
export async function POST(request: NextRequest) {
  try {
  await rateLimit(request, 'newsletter-unsubscribe', 30);
  const token = request.nextUrl.searchParams.get('token');
  // RFC 8058 one-click requests use POST; GET requests never unsubscribe.
  if (token) { unsubscribe(token); return new NextResponse(null, { status: 204 }); }
  const form = new URLSearchParams(await limitedBody(request, 2000));
  const ok = unsubscribe(String(form.get('token') || ''));
  const response = new NextResponse(null, { status: 303, headers: { Location: `/newsletter/unsubscribe?done=${ok ? '1' : 'error'}` } });
  if (ok) response.cookies.delete(CLUB_COOKIE);
  return response;
  } catch (error) { return requestFailure(error); }
}
