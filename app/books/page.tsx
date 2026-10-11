import { Suspense } from 'react';
import { connection } from 'next/server';
import Catalog from '../../components/books/Catalog';
import { db } from '../../lib/db/store';
import { BUNDLES_DATA } from '../../lib/data/books';
export const metadata = { title: 'Books — Knovera' };
async function Content() { await connection(); return <Catalog books={db.getBooks().filter(book => book.isPublished)} bundles={BUNDLES_DATA}/>; }
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening the collection…</div>}>
    <Content />
    </Suspense>;
}
