import CachedCatalog from '@/components/books/CachedCatalog';
import { getSeoCatalog } from '@/lib/catalog-cache';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Knovera — Ebooks & Digital Goods','Discover ebooks and useful digital goods. Read free samples, save your favorites, and build your digital library.','/');
export default async function Page() { return <CachedCatalog view="home" initial={await getSeoCatalog()}/>; }
