import { NextRequest, NextResponse } from 'next/server';
import { unsubscribe } from '@/lib/email/service.mjs';
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  // RFC 8058 one-click requests use POST; GET requests never unsubscribe.
  if (token) { unsubscribe(token); return new NextResponse(null, { status: 204 }); }
  const form = await request.formData();
  const ok = unsubscribe(String(form.get('token') || ''));
  return NextResponse.redirect(new URL(`/newsletter/unsubscribe?done=${ok ? '1' : 'error'}`, request.url), 303);
}
