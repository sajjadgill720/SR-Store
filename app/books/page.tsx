import CachedCatalog from '@/components/books/CachedCatalog';
import { getSeoCatalog } from '@/lib/catalog-cache';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Books — Knovera','Browse ebooks and digital reading sets by topic, author, and format. Read a sample before choosing your next book.','/books');
export default async function Page() { return <CachedCatalog view="books" initial={await getSeoCatalog()}/>; }
