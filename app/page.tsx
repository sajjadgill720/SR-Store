import CachedCatalog from '@/components/books/CachedCatalog';
import { getSeoCatalog } from '@/lib/catalog-cache';
import { pageMetadata } from '@/lib/seo';
export const metadata = pageMetadata('Knovera — Books, Ideas & Community','Discover digital books, read samples, and find your next great read.','/');
export default async function Page() { return <CachedCatalog view="home" initial={await getSeoCatalog()}/>; }
