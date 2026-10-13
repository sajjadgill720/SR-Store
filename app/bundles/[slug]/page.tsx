import { notFound } from 'next/navigation';
import CachedCatalog from '@/components/books/CachedCatalog';
import { getSeoCatalog } from '@/lib/catalog-cache';
import { pageMetadata } from '@/lib/seo';
type Props = {params:Promise<{slug:string}>};
export async function generateStaticParams() { return (await getSeoCatalog()).bundles.map(item=>({slug:item.slug})); }
export async function generateMetadata({params}:Props) {
  const {slug} = await params;
  const item = (await getSeoCatalog()).bundles.find(item=>item.slug===slug);
  if (!item) notFound();
  return pageMetadata(item.title+' — Knovera',item.description,`/bundles/${item.slug}`,item.coverImage);
}
export default async function Page({params}:Props) {
  const {slug} = await params;
  const initial = await getSeoCatalog();
  const item = initial.bundles.find(item=>item.slug===slug);
  if (!item) notFound();
  return <><CachedCatalog view="bundle" slug={slug} initial={initial}/></>;
}
