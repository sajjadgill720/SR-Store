import { notFound } from 'next/navigation';
import CachedCatalog from '@/components/books/CachedCatalog';
import { getSeoCatalog } from '@/lib/catalog-cache';
import { pageMetadata } from '@/lib/seo';
type Props = {params:Promise<{slug:string}>};
export async function generateStaticParams() { return (await getSeoCatalog()).books.map(item=>({slug:item.slug})); }
export async function generateMetadata({params}:Props) {
  const {slug} = await params;
  const item = (await getSeoCatalog()).books.find(item=>item.slug===slug);
  if (!item) notFound();
  return pageMetadata('Read a sample: '+item.title,item.shortDescription,`/samples/${item.slug}`,item.coverImage);
}
export default async function Page({params}:Props) {
  const {slug} = await params;
  const initial = await getSeoCatalog();
  const item = initial.books.find(item=>item.slug===slug);
  if (!item) notFound();
  return <><CachedCatalog view="sample" slug={slug} initial={initial}/></>;
}
