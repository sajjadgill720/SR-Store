import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';

export async function GET() {
  const storeData = db.get();

  const totalRevenue = storeData.orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const activeEntitlementsCount = storeData.entitlements.filter((e) => e.status === 'active').length;
  const openTicketsCount = storeData.supportTickets.filter((t) => t.status === 'open').length;

  return NextResponse.json({
    kpis: {
      totalRevenue,
      totalOrders: storeData.orders.length,
      activeEntitlementsCount,
      openTicketsCount,
      subscriberCount: storeData.subscribers.length
    },
    orders: storeData.orders,
    books: storeData.books || [],
    entitlements: storeData.entitlements,
    tickets: storeData.supportTickets,
    reviews: storeData.reviews,
    subscribers: storeData.subscribers,
    auditLogs: storeData.auditLogs.slice(0, 20)
  });
}

export async function POST(req: NextRequest) {
  try {
    const { action, payload } = await req.json();

    if (action === 'DELETE_BOOK') {
      const { bookId } = payload;
      const success = db.deleteBook(bookId);
      if (!success) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'REFUND_ORDER') {
      const { orderId } = payload;
      const orders = db.getOrders();
      const ord = orders.find((o) => o.id === orderId);
      if (ord) {
        ord.paymentStatus = 'refunded';
        db.saveOrder(ord);
        db.revokeEntitlement(orderId);
        db.addAuditLog('ORDER_REFUNDED', `Order ${ord.orderNumber} refunded; entitlements revoked.`);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'RESOLVE_TICKET') {
      const { ticketId, notes } = payload;
      db.updateTicketStatus(ticketId, 'resolved', notes || 'Resolved by store administrator.');
      return NextResponse.json({ success: true });
    }

    if (action === 'TOGGLE_REVIEW_APPROVAL') {
      const { reviewId, isApproved } = payload;
      db.updateReviewApproval(reviewId, isApproved);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
