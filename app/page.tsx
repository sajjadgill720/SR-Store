import { Suspense } from 'react';
import CachedCatalog from '@/components/books/CachedCatalog';
export default function Page() { return <Suspense fallback={<div className="storefront">Opening the collection…</div>}><CachedCatalog view="home"/></Suspense>; }
