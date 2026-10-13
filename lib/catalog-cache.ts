import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { db } from './db/store';
import type { Book } from './types';

export const CATALOG_TAG = 'public-catalog';

// File locations stay on the server; downloads resolve them after checking access.
function publicBook(book: Book): Book {
  return { ...book, currentEdition: { ...book.currentEdition, assets: [] } };
}

export async function getPublicCatalog() {
  'use cache';
  cacheLife({ stale: 300, revalidate: 604800, expire: 2592000 });
  cacheTag(CATALOG_TAG);
  const [books, bundles] = await Promise.all([db.getBooks(), db.getBundles()]);
  return {
    books: books.filter(book => book.isPublished).map(publicBook),
    bundles: bundles.map(bundle => ({ ...bundle, books: bundle.books.filter(book => book.isPublished).map(publicBook) })),
  };
}

// Route handlers call this only after a successful, authorized catalog mutation.
export function invalidatePublicCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}
