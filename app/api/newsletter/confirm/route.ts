import { NextRequest, NextResponse } from 'next/server';
import { confirm } from '@/lib/email/service.mjs';
import { db } from '@/lib/db/store';
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const contact = confirm(String(form.get('token') || ''));
  if (contact) db.addSubscriber({ id: `sub_${crypto.randomUUID()}`, email: contact.email, topics: contact.topics, consentTimestamp: new Date(contact.consent).toISOString(), status: 'subscribed' });
  return NextResponse.redirect(new URL(`/newsletter/confirm?done=${contact ? '1' : 'error'}`, request.url), 303);
}
