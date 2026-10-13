import { Suspense } from 'react';
import { connection } from 'next/server';
import Catalog from '../../components/books/Catalog';
import { db } from '../../lib/db/store';
export const metadata = { title: 'Books — Knovera' };
async function Content() { await connection(); const [books,bundles]=await Promise.all([db.getBooks(),db.getBundles()]); return <Catalog books={books.filter(book => book.isPublished)} bundles={bundles}/>; }
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening the collection…</div>}>
    <Content />
    </Suspense>;
}
