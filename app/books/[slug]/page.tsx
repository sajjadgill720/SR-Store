import { notFound } from 'next/navigation';
import CachedCatalog from '@/components/books/CachedCatalog';
import { getSeoCatalog } from '@/lib/catalog-cache';
import { pageMetadata, bookSchema, jsonLd } from '@/lib/seo';
type Props = {params:Promise<{slug:string}>};
export async function generateStaticParams() { return (await getSeoCatalog()).books.map(item=>({slug:item.slug})); }
export async function generateMetadata({params}:Props) {
  const {slug} = await params;
  const item = (await getSeoCatalog()).books.find(item=>item.slug===slug);
  if (!item) notFound();
  return pageMetadata(item.title+' — Knovera',item.shortDescription,`/books/${item.slug}`,item.coverImage);
}
export default async function Page({params}:Props) {
  const {slug} = await params;
  const initial = await getSeoCatalog();
  const item = initial.books.find(item=>item.slug===slug);
  if (!item) notFound();
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{__html:jsonLd(bookSchema(item))}}/><CachedCatalog view="book" slug={slug} initial={initial}/></>;
}
