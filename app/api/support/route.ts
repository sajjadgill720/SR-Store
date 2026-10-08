import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const { customerEmail, subject, category, orderReference, message } = await req.json();

    if (!customerEmail || !message) {
      return NextResponse.json({ error: 'Email and message are required' }, { status: 400 });
    }

    const ticketNumber = 'TKT-' + (1000 + Math.floor(Math.random() * 9000));
    const ticketId = 'tick_' + Date.now();

    db.addTicket({
      id: ticketId,
      ticketNumber,
      customerEmail: customerEmail.trim().toLowerCase(),
      subject: subject || 'Customer Inquiry',
      category: category || 'general',
      orderReference: orderReference ? orderReference.trim() : undefined,
      message: message.trim(),
      status: 'open',
      createdAt: new Date().toISOString()
    });

    db.addAuditLog('SUPPORT_TICKET_CREATED', `Ticket ${ticketNumber} opened by ${customerEmail}`);

    return NextResponse.json({
      success: true,
      ticketNumber
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
