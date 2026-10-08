export type BookFormat = 'pdf' | 'epub' | 'printable_pdf';

export type BookProductType = 'ebook' | 'printable' | 'bundle';

export type RightsStatus = 'wide' | 'kdp_select' | 'unknown';

export interface BookAsset {
  id: string;
  format: BookFormat;
  fileName: string;
  fileSize: string;
  storageKey: string;
  mimeType: string;
  checksum: string;
}

export interface BookEdition {
  id: string;
  version: string;
  releaseDate: string;
  releaseNotes: string;
  assets: BookAsset[];
}

export interface Book {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  author: string;
  penName?: string;
  category: 'Nonfiction' | 'Productivity' | 'Personal Growth' | 'Children & Family' | 'Bundles';
  productType: BookProductType;
  coverImage: string;
  accentColor: string;
  price: number; // in cents, e.g. 1999 = $19.99
  originalPrice?: number;
  badge?: string; // e.g. 'Bestseller', 'New Release', 'Staff Pick'
  conditionLabel: string; // BetterWorldBooks style: 'Digital Master • PDF + EPUB'
  formats: BookFormat[];
  pageCount?: number;
  isbn?: string;
  shortDescription: string;
  fullDescription: string;
  targetAudience: string;
  whatsIncluded: string[];
  tableOfContents: string[];
  sampleExcerpt: string;
  rightsStatus: RightsStatus;
  currentEdition: BookEdition;
  rating: number;
  reviewCount: number;
  isPublished: boolean;
  isInStock: boolean;
  featured?: boolean;
}

export interface BundleOffer {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  coverImage: string;
  books: Book[];
  price: number; // discounted bundle price in cents
  originalPrice: number; // standalone sum in cents
  savingsPercentage: number;
  description: string;
  badge: string;
}

export interface CartItem {
  bookId: string;
  title: string;
  slug: string;
  author: string;
  coverImage: string;
  price: number;
  formatSelected: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  bookId: string;
  title: string;
  editionVersion: string;
  price: number;
  formats: BookFormat[];
}

export interface Order {
  id: string;
  orderNumber: string;
  publicToken: string;
  customerEmail: string;
  customerName?: string;
  currency: string;
  totalAmount: number; // minor units (cents)
  discountAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded';
  provider: 'lemon_squeezy' | 'development_simulator';
  providerOrderId?: string;
  items: OrderItem[];
  createdAt: string;
  receiptUrl?: string;
}

export interface Entitlement {
  id: string;
  customerEmail: string;
  bookId: string;
  orderId: string;
  status: 'active' | 'revoked';
  grantedAt: string;
  revokedAt?: string;
}

export interface Review {
  id: string;
  bookId: string;
  authorName: string;
  location?: string;
  rating: number; // 1 to 5
  reviewText: string;
  createdAt: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  customerEmail: string;
  subject: string;
  category: 'download_help' | 'device_setup' | 'payment_inquiry' | 'general';
  orderReference?: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  adminNotes?: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  topics: string[];
  consentTimestamp: string;
  status: 'subscribed' | 'unsubscribed';
}
