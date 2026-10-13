import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { db } from '../../../lib/db/store';
import BundleDetail from './BundleDetail';
async function Content({params}:{params:Promise<{slug:string}>}) {
  await connection();
  const {slug}=await params;
  const bundle=(await db.getBundles()).find(bundle=>bundle.slug===slug);
  if(!bundle) notFound();
  return <BundleDetail bundle={bundle}/>;
}
export default function Page(props:{params:Promise<{slug:string}>}) { return <Suspense fallback={<div className="storefront">Opening the reading set…</div>}><Content {...props}/></Suspense>; }
