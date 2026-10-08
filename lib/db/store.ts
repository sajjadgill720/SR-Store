import fs from 'fs';
import path from 'path';
import { Order, Entitlement, SupportTicket, NewsletterSubscriber, Review, Book } from '../types';
import { BOOKS_DATA, REVIEWS_DATA } from '../data/books';

export interface DownloadTokenRecord {
  token: string;
  customerEmail: string;
  bookId: string;
  format: string;
  fileName: string;
  expiresAt: number; // epoch ms
  used: boolean;
}

export interface StoreDbSchema {
  books: Book[];
  orders: Order[];
  entitlements: Entitlement[];
  downloadTokens: DownloadTokenRecord[];
  subscribers: NewsletterSubscriber[];
  supportTickets: SupportTicket[];
  reviews: Review[];
  auditLogs: { id: string; action: string; details: string; timestamp: string }[];
}

const DB_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DB_DIR, 'db.json');

function ensureDbFile(): StoreDbSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    // Initial seeded database
    const initialDb: StoreDbSchema = {
      books: [...BOOKS_DATA],
      orders: [
        {
          id: 'ord_demo_101',
          orderNumber: 'SR-2026-8910',
          publicToken: 'demo-sample-order-token-12345',
          customerEmail: 'reader@example.com',
          customerName: 'Demo Reader',
          currency: 'USD',
          totalAmount: 1999,
          discountAmount: 0,
          paymentStatus: 'paid',
          provider: 'development_simulator',
          providerOrderId: 'sim_pay_891024',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          receiptUrl: '/orders/demo-sample-order-token-12345',
          items: [
            {
              id: 'item_1',
              bookId: 'book-deep-work',
              title: 'The Focused Mind: Deep Work in a Distracted World',
              editionVersion: 'Edition 2.1',
              price: 1999,
              formats: ['epub', 'pdf']
            }
          ]
        }
      ],
      entitlements: [
        {
          id: 'ent_demo_1',
          customerEmail: 'reader@example.com',
          bookId: 'book-deep-work',
          orderId: 'ord_demo_101',
          status: 'active',
          grantedAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ],
      downloadTokens: [],
      subscribers: [
        {
          id: 'sub_1',
          email: 'reader@example.com',
          topics: ['deep-work', 'new-releases'],
          consentTimestamp: new Date().toISOString(),
          status: 'subscribed'
        }
      ],
      supportTickets: [
        {
          id: 'tick_1',
          ticketNumber: 'TKT-1001',
          customerEmail: 'reader@example.com',
          subject: 'Question on Send-to-Kindle instructions',
          category: 'device_setup',
          message: 'Can I send the EPUB to my Paperwhite via the Amazon webpage or do I need the email address?',
          status: 'resolved',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          adminNotes: 'Directed reader to /help/kindle guide with Send to Kindle web link.'
        }
      ],
      reviews: [...REVIEWS_DATA],
      auditLogs: [
        {
          id: 'log_1',
          action: 'STORE_INITIALIZED',
          details: 'Initialized database with default test order and entitlements.',
          timestamp: new Date().toISOString()
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf8');
    return initialDb;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed: StoreDbSchema = JSON.parse(raw);
    if (!parsed.books || parsed.books.length === 0) {
      parsed.books = [...BOOKS_DATA];
      saveDb(parsed);
    }
    return parsed;
  } catch (e) {
    console.error('Failed reading db.json, returning empty', e);
    return {
      books: [...BOOKS_DATA],
      orders: [],
      entitlements: [],
      downloadTokens: [],
      subscribers: [],
      supportTickets: [],
      reviews: [...REVIEWS_DATA],
      auditLogs: []
    };
  }
}

function saveDb(data: StoreDbSchema) {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed writing db.json', err);
  }
}

export const db = {
  get(): StoreDbSchema {
    return ensureDbFile();
  },

  // Books Catalog
  getBooks(): Book[] {
    return this.get().books || [];
  },

  getBookBySlug(slug: string): Book | undefined {
    return this.getBooks().find((b) => b.slug === slug);
  },

  getBookById(id: string): Book | undefined {
    return this.getBooks().find((b) => b.id === id);
  },

  addBook(book: Book): Book {
    const current = this.get();
    if (!current.books) current.books = [];
    current.books.unshift(book);
    current.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'BOOK_ADDED',
      details: `Added new title "${book.title}" (${book.id})`,
      timestamp: new Date().toISOString()
    });
    saveDb(current);
    return book;
  },

  deleteBook(id: string): boolean {
    const current = this.get();
    if (!current.books) return false;
    const target = current.books.find((b) => b.id === id);
    if (!target) return false;
    current.books = current.books.filter((b) => b.id !== id);
    current.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'BOOK_DELETED',
      details: `Deleted title "${target.title}" (${id})`,
      timestamp: new Date().toISOString()
    });
    saveDb(current);
    return true;
  },

  // Orders
  getOrders(): Order[] {
    return this.get().orders;
  },

  getOrderByToken(token: string): Order | undefined {
    return this.get().orders.find((o) => o.publicToken === token);
  },

  getOrdersByEmail(email: string): Order[] {
    const norm = email.toLowerCase().trim();
    return this.get().orders.filter((o) => o.customerEmail.toLowerCase().trim() === norm);
  },

  saveOrder(order: Order) {
    const current = this.get();
    const idx = current.orders.findIndex((o) => o.id === order.id);
    if (idx >= 0) {
      current.orders[idx] = order;
    } else {
      current.orders.unshift(order);
    }
    saveDb(current);
  },

  // Entitlements
  getEntitlements(customerEmail: string): Entitlement[] {
    const norm = customerEmail.toLowerCase().trim();
    return this.get().entitlements.filter(
      (e) => e.customerEmail.toLowerCase().trim() === norm && e.status === 'active'
    );
  },

  hasEntitlement(customerEmail: string, bookId: string): boolean {
    const norm = customerEmail.toLowerCase().trim();
    return this.get().entitlements.some(
      (e) => e.customerEmail.toLowerCase().trim() === norm && e.bookId === bookId && e.status === 'active'
    );
  },

  grantEntitlement(entitlement: Entitlement) {
    const current = this.get();
    // Invariant: duplicate check
    const existing = current.entitlements.find(
      (e) =>
        e.customerEmail.toLowerCase().trim() === entitlement.customerEmail.toLowerCase().trim() &&
        e.bookId === entitlement.bookId &&
        e.status === 'active'
    );
    if (!existing) {
      current.entitlements.push(entitlement);
      saveDb(current);
    }
  },

  revokeEntitlement(orderId: string) {
    const current = this.get();
    current.entitlements.forEach((e) => {
      if (e.orderId === orderId) {
        e.status = 'revoked';
        e.revokedAt = new Date().toISOString();
      }
    });
    saveDb(current);
  },

  // Download tokens (short lived, e.g. 5 minutes)
  createDownloadToken(tokenRecord: DownloadTokenRecord) {
    const current = this.get();
    // purge expired
    const now = Date.now();
    current.downloadTokens = current.downloadTokens.filter((t) => t.expiresAt > now);
    current.downloadTokens.push(tokenRecord);
    saveDb(current);
  },

  getDownloadToken(token: string): DownloadTokenRecord | undefined {
    const current = this.get();
    const found = current.downloadTokens.find((t) => t.token === token);
    if (found && found.expiresAt > Date.now()) {
      return found;
    }
    return undefined;
  },

  // Newsletter Subscribers
  addSubscriber(sub: NewsletterSubscriber) {
    const current = this.get();
    const norm = sub.email.toLowerCase().trim();
    const existing = current.subscribers.find((s) => s.email.toLowerCase().trim() === norm);
    if (existing) {
      existing.topics = Array.from(new Set([...existing.topics, ...sub.topics]));
      existing.status = 'subscribed';
    } else {
      current.subscribers.push(sub);
    }
    saveDb(current);
  },

  getSubscribers(): NewsletterSubscriber[] {
    return this.get().subscribers;
  },

  // Support tickets
  addTicket(ticket: SupportTicket) {
    const current = this.get();
    current.supportTickets.unshift(ticket);
    saveDb(current);
  },

  getTickets(): SupportTicket[] {
    return this.get().supportTickets;
  },

  updateTicketStatus(id: string, status: 'open' | 'in_progress' | 'resolved', adminNotes?: string) {
    const current = this.get();
    const ticket = current.supportTickets.find((t) => t.id === id);
    if (ticket) {
      ticket.status = status;
      if (adminNotes !== undefined) ticket.adminNotes = adminNotes;
      saveDb(current);
    }
  },

  // Reviews
  addReview(review: Review) {
    const current = this.get();
    current.reviews.unshift(review);
    saveDb(current);
  },

  getReviews(bookId?: string): Review[] {
    const all = this.get().reviews;
    if (bookId) return all.filter((r) => r.bookId === bookId);
    return all;
  },

  updateReviewApproval(id: string, isApproved: boolean) {
    const current = this.get();
    const rev = current.reviews.find((r) => r.id === id);
    if (rev) {
      rev.isApproved = isApproved;
      saveDb(current);
    }
  },

  // Audit Log
  addAuditLog(action: string, details: string) {
    const current = this.get();
    current.auditLogs.unshift({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      action,
      details,
      timestamp: new Date().toISOString()
    });
    saveDb(current);
  }
};
