'use client';
import { useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { createCatalogCache } from '@/lib/cache/catalog';
import Marketplace from '../home/Marketplace';
import Catalog from './Catalog';
import BookDetail from './BookDetail';
import SampleReader from './SampleReader';
import BundleDetail from '@/app/bundles/[slug]/BundleDetail';

const catalog = createCatalogCache(() => window.localStorage);
const serverState = {data:null,error:null};
export default function CachedCatalog({view,slug}:{view:'home'|'books'|'book'|'sample'|'bundle';slug?:string}) {
  const {data,error} = useSyncExternalStore(catalog.subscribe,catalog.getSnapshot,() => serverState);
  useEffect(() => {
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
  },[]);
  if (!data) return <div className="storefront studio-skeleton" role="status">{error || 'Opening the collection…'}{error && <button className="studio-button outline" onClick={() => void catalog.refresh()}>Try again</button>}</div>;
  const book = data.books.find(b => b.slug === slug);
  const bundle = data.bundles.find(b => b.slug === slug);
  return <>{error && <p className="storefront" role="status">{error}</p>}{
    view === 'home' ? <Marketplace books={data.books.filter(b => b.productType !== 'bundle')}/> :
    view === 'books' ? <Catalog books={data.books} bundles={data.bundles}/> :
    view === 'bundle' && bundle ? <BundleDetail bundle={bundle}/> :
    view === 'sample' && book ? <SampleReader book={book}/> :
    view === 'book' && book ? <BookDetail book={book}/> :
    <div className="storefront"><h1>This title is unavailable.</h1><Link href="/books">Browse books</Link></div>
  }</>;
}
