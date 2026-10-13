import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { PURCHASE_COOKIE } from '@/lib/downloads/access';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  }

  const order = await db.getOrderByToken(token);
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  const response = NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      provider: order.provider,
      createdAt: order.createdAt,
      items: order.items
    }
  }, { headers: { 'Cache-Control': 'private, no-store' } });
  if (order.paymentStatus === 'paid' && !(process.env.NODE_ENV === 'production' && order.provider === 'development_simulator')) {
    response.cookies.set(PURCHASE_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/api', maxAge: 3600 });
  }
  return response;
}
