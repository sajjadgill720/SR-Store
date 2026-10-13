import { Suspense } from 'react';
import Catalog from '../../components/books/Catalog';
import { getPublicCatalog } from '@/lib/catalog-cache';
export const metadata = { title: 'Books — Knovera' };
async function Content() {
    const { books, bundles } = await getPublicCatalog();
    return <Catalog books={books} bundles={bundles}/>;
}
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening the collection…</div>}>
    <Content />
    </Suspense>;
}
