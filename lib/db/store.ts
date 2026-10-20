import { randomUUID } from 'node:crypto';
import { query, transaction } from './postgres.mjs';
import type { Book, BundleOffer, Order, Entitlement, SupportTicket, Review } from '../types';

type DocumentRow<T> = { id: string; data: Omit<T, 'id'> };
const document = <T>(row: DocumentRow<T>): T => ({ id: row.id, ...row.data }) as T;
const withoutId = <T extends { id: string }>(value: T) => { const { id, ...data } = value; if (!id) throw new Error('Record ID required'); return data; };
async function books(where = '', values: unknown[] = []) { return (await query<DocumentRow<Book>>(`SELECT id,data FROM knovera.books ${where}`, values)).rows.map(document<Book>); }
async function orders(where = '', values: unknown[] = []) { return (await query<DocumentRow<Order>>(`SELECT id,data FROM knovera.orders ${where}`, values)).rows.map(document<Order>); }

export const db = {
  getBooks: () => books("ORDER BY data->>'title', id"),
  async getBookBySlug(slug: string) { return (await books("WHERE data->>'slug'=$1", [slug]))[0]; },
  async getBookById(id: string) { return (await books('WHERE id=$1', [id]))[0]; },
  getBooksByIds: (ids: string[]) => books('WHERE id=ANY($1::text[])', [[...new Set(ids)]]),
  async getEntitlementsForOrders(ids: string[]) {
    return (await query<Entitlement>('SELECT id,"bookId","orderId",status,"customerEmail","grantedAt" FROM knovera.entitlements WHERE "orderId"=ANY($1::text[]) AND status=$2',[ids,'active'])).rows;
  },
  async addBook(book: Book) {
    await transaction(async client => {
      await client.query('INSERT INTO knovera.books VALUES($1,$2)', [book.id, withoutId(book)]);
      await client.query('INSERT INTO knovera.audit_logs VALUES($1,$2,$3,$4)', [randomUUID(), 'BOOK_ADDED', `Added ${book.title}`, new Date().toISOString()]);
    }); return book;
  },
  async deleteBook(id: string) {
    // Archive to preserve purchases and foreign keys. No static fallback can resurrect it.
    return transaction(async client => {
      const result = await client.query("UPDATE knovera.books SET data=data || '{\"isPublished\":false,\"isInStock\":false}'::jsonb WHERE id=$1 RETURNING id", [id]);
      if (!result.rowCount) return false;
      await client.query('INSERT INTO knovera.audit_logs VALUES($1,$2,$3,$4)', [randomUUID(), 'BOOK_ARCHIVED', `Archived ${id}`, new Date().toISOString()]);
      return true;
    });
  },
  async getBundles(): Promise<BundleOffer[]> {
    const result = await query<DocumentRow<BundleOffer>>('SELECT id,data FROM knovera.bundles');
    const members = await query<{bundle_id: string; id: string; data: Omit<Book,'id'>}>("SELECT bb.bundle_id,b.id,b.data FROM knovera.bundle_books bb JOIN knovera.books b ON b.id=bb.book_id WHERE (b.data->>'isPublished')::boolean ORDER BY bb.position");
    return result.rows.map(row => ({...document<BundleOffer>(row), books: members.rows.filter(member => member.bundle_id===row.id).map(document<Book>)})).filter(bundle => bundle.books.length>0);
  },
  async upsertBundle(bundle: Omit<BundleOffer, 'books'> & { bookIds: string[] }) {
    return transaction(async client => {
      const { id, bookIds, ...data } = bundle;
      await client.query(
        'INSERT INTO knovera.bundles (id, data) VALUES ($1, $2) ON CONFLICT (id) DO UPDATE SET data = $2',
        [id, data]
      );
      await client.query('DELETE FROM knovera.bundle_books WHERE bundle_id = $1', [id]);
      for (const [index, bookId] of (bookIds || []).entries()) {
        await client.query(
          'INSERT INTO knovera.bundle_books (bundle_id, book_id, position) VALUES ($1, $2, $3)',
          [id, bookId, index]
        );
      }
      await client.query(
        'INSERT INTO knovera.audit_logs VALUES ($1, $2, $3, $4)',
        [randomUUID(), 'BUNDLE_SAVED', `Saved bundle ${data.title}`, new Date().toISOString()]
      );
      return true;
    });
  },
  async deleteBundle(id: string) {
    return transaction(async client => {
      await client.query('DELETE FROM knovera.bundle_books WHERE bundle_id = $1', [id]);
      const res = await client.query('DELETE FROM knovera.bundles WHERE id = $1 RETURNING id', [id]);
      if (!res.rowCount) return false;
      await client.query(
        'INSERT INTO knovera.audit_logs VALUES ($1, $2, $3, $4)',
        [randomUUID(), 'BUNDLE_DELETED', `Deleted bundle ${id}`, new Date().toISOString()]
      );
      return true;
    });
  },
  getOrders: () => orders("ORDER BY data->>'createdAt' DESC,id"),
  async getOrderByToken(token: string) { return (await orders("WHERE data->>'publicToken'=$1", [token]))[0]; },
  getOrdersByEmail: (email: string) => orders("WHERE lower(data->>'customerEmail')=$1 ORDER BY data->>'createdAt' DESC", [email.trim().toLowerCase()]),
  async fulfillOrder(order: Order, entitlements: Entitlement[]) {
    return transaction(async client => {
      const inserted = await client.query('INSERT INTO knovera.orders VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id', [order.id, withoutId(order)]);
      if (!inserted.rowCount) {
        const existing = await client.query<DocumentRow<Order>>("SELECT id,data FROM knovera.orders WHERE id=$1 OR (data->>'provider'=$2 AND data->>'providerOrderId'=$3)", [order.id,order.provider,order.providerOrderId]);
        if (!existing.rows[0]) throw new Error('Order conflict');
        return document<Order>(existing.rows[0]);
      }
      for (const ent of entitlements) await client.query('INSERT INTO knovera.entitlements(id,"customerEmail","bookId","orderId",status,"grantedAt") VALUES($1,$2,$3,$4,$5,$6)',[ent.id,ent.customerEmail.toLowerCase().trim(),ent.bookId,order.id,ent.status,ent.grantedAt]);
      await client.query('INSERT INTO knovera.audit_logs VALUES($1,$2,$3,$4)',[randomUUID(),'ORDER_FULFILLED',`Created order ${order.orderNumber}`,new Date().toISOString()]);
      return order;
    });
  },
  async refundOrder(id: string) {
    return transaction(async client => {
      const changed=await client.query("UPDATE knovera.orders SET data=jsonb_set(data,'{paymentStatus}','\"refunded\"') WHERE id=$1 RETURNING id",[id]);
      if (!changed.rowCount) return false;
      await client.query('UPDATE knovera.entitlements SET status=$1,"revokedAt"=$2 WHERE "orderId"=$3',['revoked',new Date().toISOString(),id]);
      await client.query('INSERT INTO knovera.audit_logs VALUES($1,$2,$3,$4)',[randomUUID(),'ORDER_REFUNDED',`Refunded ${id}; purchase access revoked`,new Date().toISOString()]);
      return true;
    });
  },
  async getEntitlements(email: string) { return (await query<Entitlement>('SELECT * FROM knovera.entitlements WHERE "customerEmail"=$1 AND status=$2',[email.trim().toLowerCase(),'active'])).rows; },
  async hasEntitlement(email: string, bookId: string) { return (await query('SELECT id FROM knovera.entitlements WHERE "customerEmail"=$1 AND "bookId"=$2 AND status=$3 LIMIT 1',[email.trim().toLowerCase(),bookId,'active'])).rows.length>0; },
  async getOrderEntitlements(orderId: string) { return (await query<Entitlement>('SELECT * FROM knovera.entitlements WHERE "orderId"=$1 AND status=$2', [orderId, 'active'])).rows; },
  async addTicket(ticket: SupportTicket) { await query('INSERT INTO knovera.support_tickets VALUES($1,$2)',[ticket.id,withoutId(ticket)]); },
  async getTickets() { return (await query<DocumentRow<SupportTicket>>("SELECT * FROM knovera.support_tickets ORDER BY data->>'createdAt' DESC")).rows.map(document<SupportTicket>); },
  async updateTicketStatus(id: string, status: string, adminNotes?: string) { await query('UPDATE knovera.support_tickets SET data=data || $2::jsonb WHERE id=$1',[id,JSON.stringify({status,...(adminNotes!==undefined?{adminNotes}:{})})]); },
  async getReviews(bookId?: string) { return (await query<DocumentRow<Review>>('SELECT * FROM knovera.reviews WHERE ($1::text IS NULL OR data->>\'bookId\'=$1)',[bookId || null])).rows.map(document<Review>); },
  async updateReviewApproval(id: string, isApproved: boolean) { await query("UPDATE knovera.reviews SET data=jsonb_set(data,'{isApproved}',$2::jsonb) WHERE id=$1",[id,JSON.stringify(isApproved)]); },
  async addAuditLog(action: string, details: string) { await query('INSERT INTO knovera.audit_logs VALUES($1,$2,$3,$4)',[randomUUID(),action,details,new Date().toISOString()]); },
  async get() {
    const [books,bundles,orders,entitlements,supportTickets,reviews,auditLogs]=await Promise.all([this.getBooks(),this.getBundles(),this.getOrders(),query<Entitlement>('SELECT * FROM knovera.entitlements'),this.getTickets(),this.getReviews(),query('SELECT * FROM knovera.audit_logs ORDER BY timestamp DESC LIMIT 100')]);
    return { books,bundles,orders,entitlements:entitlements.rows,supportTickets,reviews,auditLogs:auditLogs.rows };
  },
};
