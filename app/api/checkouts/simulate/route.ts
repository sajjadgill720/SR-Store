import { NextRequest, NextResponse } from 'next/server';
import { fulfillSimulatorOrder } from '@/lib/payments/adapter';
import { receipt } from '@/lib/email/service.mjs';
import { limitedBody, rateLimit, RequestError, requestFailure } from '@/lib/http-guard';

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Test checkout is disabled in production.' }, { status: 403 });
  try {
    await rateLimit(req, 'simulator-checkout', 10);
    const body = JSON.parse(await limitedBody(req, 16000));
    const { customerEmail, customerName, items } = body;

    if (!customerEmail || !customerEmail.includes('@')) {
      return NextResponse.json({ error: 'Valid customer email is required' }, { status: 400 });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    await rateLimit(req, 'simulator-email', 5, 60000, customerEmail.trim().toLowerCase());
    const providerOrderId = 'sim_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

    const order = await fulfillSimulatorOrder({
      customerEmail: customerEmail.trim().toLowerCase(),
      customerName: customerName ? customerName.trim() : undefined,
      items,
      providerOrderId
    });

    // Simulator receipts remain local previews, even with live mail configured.
    try { receipt(order); } catch { console.error('Could not queue simulator receipt'); }
    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      publicToken: order.publicToken,
      receiptUrl: order.receiptUrl
    });
  } catch (error) {
    if (error instanceof RequestError || error instanceof SyntaxError) return requestFailure(error);
    console.error('Simulator checkout error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Checkout failed' }, { status: 500 });
  }
}
