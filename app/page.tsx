import { Suspense } from 'react';
import Marketplace from '../components/home/Marketplace';
import { getPublicCatalog } from '@/lib/catalog-cache';
async function HomeContent() {
  
  const books = (await getPublicCatalog()).books.filter(book => book.productType !== 'bundle');
  return <Marketplace books={books} />;
}
export default function Page() { return <Suspense fallback={<div className="market-home market-loading" role="status">Finding your next great read…</div>}><HomeContent /></Suspense>; }
