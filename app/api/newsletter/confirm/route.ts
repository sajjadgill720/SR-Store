import { NextRequest, NextResponse } from 'next/server';
import { confirm } from '@/lib/email/service.mjs';
import { rememberReaderClub } from '@/lib/email/club-cookie';
import { limitedBody, rateLimit, requestFailure } from '@/lib/http-guard';
export async function POST(request: NextRequest) {
  try {
  await rateLimit(request, 'newsletter-confirm', 20);
  const form = new URLSearchParams(await limitedBody(request, 2000));
  const contact = confirm(String(form.get('token') || ''));
  const response = new NextResponse(null, { status: 303, headers: { Location: `/newsletter/confirm?done=${contact ? '1' : 'error'}` } });
  return contact ? rememberReaderClub(response, contact.email, true) : response;
  } catch (error) { return requestFailure(error); }
}
