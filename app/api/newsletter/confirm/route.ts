import { NextRequest, NextResponse } from 'next/server';
import { confirm } from '@/lib/email/service.mjs';
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const contact = confirm(String(form.get('token') || ''));
  return NextResponse.redirect(new URL(`/newsletter/confirm?done=${contact ? '1' : 'error'}`, request.url), 303);
}
