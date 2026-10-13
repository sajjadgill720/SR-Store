import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getPublicCatalog } from '@/lib/catalog-cache';
import BundleDetail from './BundleDetail';
async function Content({params}:{params:Promise<{slug:string}>}) {
  
  const {slug}=await params;
  const bundle=(await getPublicCatalog()).bundles.find(bundle=>bundle.slug===slug);
  if(!bundle) notFound();
  return <BundleDetail bundle={bundle}/>;
}
export default function Page(props:{params:Promise<{slug:string}>}) { return <Suspense fallback={<div className="storefront">Opening the reading set…</div>}><Content {...props}/></Suspense>; }
