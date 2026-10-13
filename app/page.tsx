import { Suspense } from 'react';
import { connection } from 'next/server';
import Marketplace from '../components/home/Marketplace';
import { db } from '../lib/db/store';
async function HomeContent() {
  await connection();
  const books = (await db.getBooks()).filter(book => book.isPublished && book.productType !== 'bundle');
  return <Marketplace books={books} />;
}
export default function Page() { return <Suspense fallback={<div className="market-home market-loading" role="status">Finding your next great read…</div>}><HomeContent /></Suspense>; }
