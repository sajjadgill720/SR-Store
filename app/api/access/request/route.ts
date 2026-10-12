import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { emailAddress, recovery } from '@/lib/email/service.mjs';
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    if (raw.length > 2000) return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    const email = emailAddress(JSON.parse(raw).email);
    // The worker sends asynchronously so provider timing cannot reveal a matching account.
    recovery(email, db.getOrdersByEmail(email).filter(order => order.paymentStatus === 'paid'));
    return NextResponse.json({ success: true, message: 'If a purchase matches this address, we will email its order links. Please check your inbox and spam folder.' }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const invalid = error instanceof SyntaxError || (error instanceof Error && error.message === 'Valid email required');
    return NextResponse.json({ error: invalid ? 'Enter a valid email address.' : 'Email recovery is unavailable. Please try again later or contact support.' }, { status: invalid ? 400 : 503 });
  }
}
