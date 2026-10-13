import type { MetadataRoute } from 'next';
import { getSeoCatalog } from '@/lib/catalog-cache';
import { siteOrigin, publicSite } from '@/lib/seo';
export default async function sitemap():Promise<MetadataRoute.Sitemap> {
  if (!publicSite()) return [];
  const {books,bundles} = await getSeoCatalog();
  const paths = ['/','/books','/about','/community','/help',...books.map(b=>`/books/${b.slug}`),...bundles.map(b=>`/bundles/${b.slug}`)];
  return paths.map(path=>({url:siteOrigin()+path}));
}
