import { NextRequest, NextResponse } from 'next/server';
import { fulfillSimulatorOrder } from '@/lib/payments/adapter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customerEmail, customerName, items } = body;

    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    const providerOrderId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const order = fulfillSimulatorOrder({
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName ? customerName.trim() : undefined,
      items,
      providerOrderId
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      publicToken: order.publicToken,
      receiptUrl: order.receiptUrl
    });
  } catch (error: any) {
    console.error('Simulator checkout error:', error);
    return NextResponse.json({ error: error.message || 'Checkout failed' }, { status: 500 });
  }
}
