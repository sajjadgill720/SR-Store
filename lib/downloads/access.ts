import { db } from '../db/store';
import type { BookFormat } from '../types';

export const PURCHASE_COOKIE = 'knovera_purchase';
export class AccessError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

// Receipt/recovery links are bearer credentials. Email alone never proves ownership.
export async function purchaseAccess(token: unknown) {
  if (typeof token !== 'string' || !token || token.length > 512)
    throw new AccessError('Open your private purchase link to access your books.', 401);
  const order = await db.getOrderByToken(token);
  if (!order || order.paymentStatus !== 'paid')
    throw new AccessError('This purchase does not have active download access.', 403);
  if (process.env.NODE_ENV === 'production' && order.provider === 'development_simulator')
    throw new AccessError('Test orders cannot download published files in production.', 403);
  return { order, entitlements: await db.getOrderEntitlements(order.id) };
}

export async function downloadAsset(token: unknown, bookId: unknown, format: unknown) {
  if (typeof bookId !== 'string' || !bookId || bookId.length > 200 || !['pdf', 'epub', 'printable_pdf'].includes(String(format)))
    throw new AccessError('A book ID and supported format are required.', 400);
  const { order, entitlements } = await purchaseAccess(token);
  if (!entitlements.some(item => item.bookId === bookId) || !order.items.some(item => item.bookId === bookId && item.formats.includes(format as BookFormat)))
    throw new AccessError('This purchase does not include that book and format.', 403);
  const book = await db.getBookById(bookId);
  const asset = book?.currentEdition.assets.find(item => item.format === format);
  if (!asset?.storageKey || !asset.fileName) throw new AccessError('This edition is not available for download yet.', 404);
  return asset;
}
