import { Suspense } from 'react';
import CachedCatalog from '@/components/books/CachedCatalog';
async function Content({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; return <CachedCatalog view="book" slug={slug}/>; }
export default function Page(props:{params:Promise<{slug:string}>}) { return <Suspense fallback={<div className="storefront">Opening the collection…</div>}><Content {...props}/></Suspense>; }
