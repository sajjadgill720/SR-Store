import { Order, OrderItem, Entitlement } from '../types';
import { db } from '../db/store';
import { getBookById } from '../data/books';

export interface ApprovedCheckoutInput {
  offerId: string;
  items: { bookId: string; format?: string; quantity: number }[];
  customerEmail: string;
  customerName?: string;
  currency: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResult {
  checkoutId: string;
  checkoutUrl: string;
  mode: 'simulator' | 'live';
  totalMinorUnits: number;
}

export interface VerifiedProviderEvent {
  isValid: boolean;
  eventName: string;
  orderId: string;
  customerEmail: string;
  totalMinorUnits: number;
}

export interface PaymentProvider {
  createCheckout(input: ApprovedCheckoutInput): Promise<CheckoutResult>;
  verifyWebhook(rawBody: Uint8Array, headers: Headers): Promise<VerifiedProviderEvent>;
  requestRefund(orderId: string): Promise<boolean>;
}

// Development Checkout Simulator (Section 10 & 25 Requirement)
export class DevelopmentSimulatorProvider implements PaymentProvider {
  async createCheckout(input: ApprovedCheckoutInput): Promise<CheckoutResult> {
    // Calculate verified server-side total
    let total = 0;
    for (const item of input.items) {
      const book = getBookById(item.bookId);
      if (!book) throw new Error(`Book not found: ${item.bookId}`);
      total += book.price * item.quantity;
    }

    const checkoutId = 'sim_chk_' + Math.random().toString(36).substring(2, 10);
    // Return simulator redirect URL
    const params = new URLSearchParams({
      chk: checkoutId,
      email: input.customerEmail,
      name: input.customerName || '',
      items: JSON.stringify(input.items),
      total: total.toString()
    });

    return {
      checkoutId,
      checkoutUrl: `/checkout/simulator?${params.toString()}`,
      mode: 'simulator',
      totalMinorUnits: total
    };
  }

  async verifyWebhook(rawBody: Uint8Array, headers: Headers): Promise<VerifiedProviderEvent> {
    const text = new TextDecoder().decode(rawBody);
    const data = JSON.parse(text);
    return {
      isValid: true,
      eventName: data.event_name || 'order_created',
      orderId: data.order_id,
      customerEmail: data.customer_email,
      totalMinorUnits: data.total
    };
  }

  async requestRefund(orderId: string): Promise<boolean> {
    db.revokeEntitlement(orderId);
    db.addAuditLog('SIMULATOR_REFUND', `Revoked entitlements for order ${orderId}`);
    return true;
  }
}

// Helper to complete checkout and fulfill order atomically
export function fulfillSimulatorOrder(params: {
  customerEmail: string;
  customerName?: string;
  items: { bookId: string; quantity: number }[];
  providerOrderId: string;
}): Order {
  const publicToken = 'tok_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const orderNumber = 'SR-' + (1000 + Math.floor(Math.random() * 9000));
  const orderId = 'ord_' + Math.random().toString(36).substring(2, 10);

  let totalAmount = 0;
  const orderItems: OrderItem[] = [];

  for (const item of params.items) {
    const book = getBookById(item.bookId);
    if (!book) continue;
    const itemTotal = book.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      id: 'item_' + Math.random().toString(36).substring(2, 8),
      bookId: book.id,
      title: book.title,
      editionVersion: book.currentEdition.version,
      price: book.price,
      formats: book.formats
    });
  }

  const order: Order = {
    id: orderId,
    orderNumber,
    publicToken,
    customerEmail: params.customerEmail,
    customerName: params.customerName || 'Direct Reader',
    currency: 'USD',
    totalAmount,
    discountAmount: 0,
    paymentStatus: 'paid',
    provider: 'development_simulator',
    providerOrderId: params.providerOrderId,
    items: orderItems,
    createdAt: new Date().toISOString(),
    receiptUrl: `/orders/${publicToken}`
  };

  // Invariant: Save order
  db.saveOrder(order);

  // Invariant: Grant entitlements atomically for each book purchased
  for (const item of orderItems) {
    const entitlement: Entitlement = {
      id: 'ent_' + Math.random().toString(36).substring(2, 10),
      customerEmail: params.customerEmail,
      bookId: item.bookId,
      orderId: order.id,
      status: 'active',
      grantedAt: new Date().toISOString()
    };
    db.grantEntitlement(entitlement);
  }

  db.addAuditLog('ORDER_FULFILLED', `Created order ${orderNumber} for ${params.customerEmail} with ${orderItems.length} items`);

  return order;
}

export const activePaymentProvider = new DevelopmentSimulatorProvider();
