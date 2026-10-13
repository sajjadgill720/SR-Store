import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { db } from './db/store';
import type { Book } from './types';
import { catalogVersion } from './catalog-version';

export const CATALOG_TAG = 'public-catalog';

// File locations stay on the server; downloads resolve them after checking access.
function publicBook(book: Book): Book {
  return { ...book, currentEdition: { ...book.currentEdition, assets: [] } };
}

async function snapshot(version: string) {
  'use cache';
  cacheLife({ stale: 300, revalidate: 86400, expire: 604800 });
  cacheTag(CATALOG_TAG);
  const [books, bundles] = await Promise.all([db.getBooks(), db.getBundles()]);
  // Do not cache a mixture of revisions if an administrator edited during these reads.
  if (await catalogVersion() !== version) throw new Error('Catalog changed during read');
  return {
    version,
    books: books.filter(book => book.isPublished).map(publicBook),
    bundles: bundles.map(bundle => ({ ...bundle, books: bundle.books.filter(book => book.isPublished).map(publicBook) })),
  };
}

export async function getPublicCatalog() {
  for (let attempt = 0; attempt < 3; attempt++) {
    const version = await catalogVersion();
    try { return await snapshot(version); }
    catch (error) { if (attempt === 2 || await catalogVersion() === version) throw error; }
  }
  throw new Error('Catalog is busy; please retry');
}

// Route handlers call this only after a successful, authorized catalog mutation.
export function invalidatePublicCatalog() {
  revalidateTag(CATALOG_TAG, { expire: 0 });
}
