'use client';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { createCatalogCache, type CatalogSnapshot } from '@/lib/cache/catalog';
import Marketplace from '../home/Marketplace';
import Catalog from './Catalog';
import BookDetail from './BookDetail';
import SampleReader from './SampleReader';
import BundleDetail from '@/app/bundles/[slug]/BundleDetail';

const catalog = createCatalogCache(() => window.localStorage);
export default function CachedCatalog({view,slug,initial}:{view:'home'|'books'|'book'|'sample'|'bundle';slug?:string;initial:CatalogSnapshot}) {
  const serverState = useMemo(() => ({data:initial,error:null}),[initial]);
  const current = useSyncExternalStore(catalog.subscribe,catalog.getSnapshot,() => serverState);
  const data = !current.data || BigInt(initial.version) > BigInt(current.data.version) ? initial : current.data;
  const error = current.error;
  useEffect(() => {
    catalog.seed(initial);
    void catalog.refresh();
    const check = () => { if (document.visibilityState === 'visible') void catalog.refresh(); };
    const timer = window.setInterval(check,60000);
    window.addEventListener('focus',check);
    window.addEventListener('online',check);
    document.addEventListener('visibilitychange',check);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus',check);
      window.removeEventListener('online',check);
      document.removeEventListener('visibilitychange',check);
    };
  },[initial]);
  if (!data) return <div className="storefront studio-skeleton" role="status">{error || 'Opening the collection…'}{error && <button className="studio-button outline" onClick={() => void catalog.refresh()}>Try again</button>}</div>;
  const book = data.books.find(b => b.slug === slug);
  const bundle = data.bundles.find(b => b.slug === slug);
  return <>{error && <p className="storefront" role="status">{error}</p>}{
    view === 'home' ? <Marketplace books={data.books.filter(b => b.productType !== 'bundle')} bundles={data.bundles}/> :
    view === 'books' ? <Catalog books={data.books} bundles={data.bundles}/> :
    view === 'bundle' && bundle ? <BundleDetail bundle={bundle}/> :
    view === 'sample' && book ? <SampleReader book={book}/> :
    view === 'book' && book ? <BookDetail book={book}/> :
    <div className="storefront"><h1>This title is unavailable.</h1><Link href="/books">Browse books</Link></div>
  }</>;
}
