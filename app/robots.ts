import type { MetadataRoute } from 'next';
import { siteOrigin, publicSite } from '@/lib/seo';
export default function robots():MetadataRoute.Robots {
  if (!publicSite()) return {rules:{userAgent:'*',disallow:'/'}};
  return {rules:{userAgent:'*',allow:'/',disallow:['/api/','/admin','/account/','/auth/','/orders/','/checkout','/cart','/access']},sitemap:siteOrigin()+'/sitemap.xml'};
}
