import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normEmail = email.toLowerCase().trim();
    const orders = db.getOrdersByEmail(normEmail);

    db.addAuditLog('ACCESS_RECOVERY_REQUESTED', `Access restoration requested for ${normEmail}`);

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        publicToken: o.publicToken,
        totalAmount: o.totalAmount,
        createdAt: o.createdAt,
        items: o.items
      }))
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
