import { Suspense } from 'react';
import CachedCatalog from '@/components/books/CachedCatalog';
export const metadata = {title:'Books — Knovera'};
export default function Page() { return <Suspense fallback={<div className="storefront">Opening the collection…</div>}><CachedCatalog view="books"/></Suspense>; }
