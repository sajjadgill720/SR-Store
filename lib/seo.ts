import type { Metadata } from 'next';
import type { Book } from './types';

export function siteOrigin() {
  const url = new URL(process.env.SITE_URL || process.env.EMAIL_SITE_URL || 'http://127.0.0.1:3000');
  if (!['http:','https:'].includes(url.protocol) || url.username || url.password) throw new Error('Invalid SITE_URL');
  return url.origin;
}
export function publicSite() {
  return !['localhost','127.0.0.1','[::1]'].includes(new URL(siteOrigin()).hostname);
}
export function pageMetadata(title:string,description:string,path:string,image?:string):Metadata {
  return {
    title,description,alternates:{canonical:path},
    openGraph:{title,description,url:path,type:'website',siteName:'Knovera',...(image?{images:[{url:image,alt:title}]}:{})},
    twitter:{card:image?'summary_large_image':'summary',title,description,...(image?{images:[image]}:{})},
  };
}
export function bookSchema(book:Book) {
  const url = `${siteOrigin()}/books/${book.slug}`;
  return {
    '@context':'https://schema.org','@type':['Book','Product'],'@id':url+'#book',url,
    name:book.title,description:book.shortDescription,image:book.coverImage,
    author:{'@type':'Person',name:book.author},bookFormat:'https://schema.org/EBook',
    ...(book.isbn?{isbn:book.isbn}:{}),...(book.pageCount?{numberOfPages:book.pageCount}:{}),
    offers:{'@type':'Offer',url,price:(book.price/100).toFixed(2),priceCurrency:'USD',
      availability:book.isInStock && book.rightsStatus === 'wide'?'https://schema.org/InStock':'https://schema.org/OutOfStock',
      seller:{'@type':'Organization',name:'Knovera'}},
  };
}
// Prevent catalog text from terminating the JSON-LD script element.
export function jsonLd(value:unknown) { return JSON.stringify(value).replace(/</g,'\\u003c'); }
