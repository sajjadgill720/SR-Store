import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    let email = '';
    let topics: string[] = [];

    // Support both JSON body and Form POST
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await req.json();
      email = body.email;
      topics = body.topics || ['general'];
    } else {
      const formData = await req.formData();
      email = formData.get('email') as string;
      topics = ['general'];
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();

    db.addSubscriber({
      id: 'sub_' + Date.now(),
      email: normEmail,
      topics,
      consentTimestamp: new Date().toISOString(),
      status: 'subscribed'
    });

    db.addAuditLog('NEWSLETTER_SUBSCRIBED', `Subscriber ${normEmail} joined Reader Club`);

    if (!contentType.includes('application/json')) {
      // Redirect back with success indicator
      return NextResponse.redirect(new URL('/reader-club?status=success', req.url));
    }

    return NextResponse.json({ success: true, email: normEmail });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
