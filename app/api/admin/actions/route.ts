import { advanceCatalogVersion } from '@/lib/catalog-version';
import { invalidatePublicCatalog } from '@/lib/catalog-cache';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/store';
import { contacts } from '@/lib/email/service.mjs';
import { requireAdmin } from '@/lib/auth/server';
import { sameOrigin, authFailure, privateHeaders } from '@/lib/auth/http';

export async function GET() {
  try { await requireAdmin(); } catch (error) { return authFailure(error); }
  const storeData = await db.get();
  const subscribers = contacts();

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
      subscriberCount: subscribers.filter(subscriber => subscriber.status === 'subscribed').length
    },
    orders: storeData.orders,
    books: storeData.books || [],
    bundles: storeData.bundles || [],
    entitlements: storeData.entitlements,
    tickets: storeData.supportTickets,
    reviews: storeData.reviews,
    subscribers,
    auditLogs: storeData.auditLogs.slice(0, 20)
  }, { headers:privateHeaders });
}

export async function POST(req: NextRequest) {
  try { sameOrigin(req); await requireAdmin(); } catch (error) { return authFailure(error); }
  try {
    const { action, payload } = await req.json();

    if (action === 'REFRESH_CATALOG') {
      await advanceCatalogVersion();
      invalidatePublicCatalog();
      return NextResponse.json({ success: true });
    }

    if (action === 'SAVE_BUNDLE') {
      const { bundle } = payload;
      await db.upsertBundle(bundle);
      await advanceCatalogVersion();
      invalidatePublicCatalog();
      return NextResponse.json({ success: true });
    }

    if (action === 'DELETE_BUNDLE') {
      const { bundleId } = payload;
      const success = await db.deleteBundle(bundleId);
      if (!success) {
        return NextResponse.json({ error: 'Bundle not found' }, { status: 404 });
      }
      await advanceCatalogVersion();
      invalidatePublicCatalog();
      return NextResponse.json({ success: true });
    }

    if (action === 'DELETE_BOOK') {
      const { bookId } = payload;
      const success = await db.deleteBook(bookId);
      if (!success) {
        return NextResponse.json({ error: 'Book not found' }, { status: 404 });
      }
      invalidatePublicCatalog();
      return NextResponse.json({ success: true });
    }

    if (action === 'REFUND_ORDER') {
      const { orderId } = payload;
      const order=(await db.getOrders()).find(order=>order.id===orderId);
      if(order?.provider==='lemon_squeezy') return NextResponse.json({error:'Issue the refund in your Lemon Squeezy dashboard. Its verified webhook will update this order and revoke access.'},{status:409});
      if (await db.refundOrder(orderId)) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (action === 'RESOLVE_TICKET') {
      const { ticketId, notes } = payload;
      await db.updateTicketStatus(ticketId, 'resolved', notes || 'Resolved by store administrator.');
      return NextResponse.json({ success: true });
    }

    if (action === 'TOGGLE_REVIEW_APPROVAL') {
      const { reviewId, isApproved } = payload;
      await db.updateReviewApproval(reviewId, isApproved);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
