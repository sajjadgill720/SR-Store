import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import SampleReader from '../../../components/books/SampleReader';
import { getPublicCatalog } from '@/lib/catalog-cache';
async function Content({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params;  const book = (await getPublicCatalog()).books.find(book => book.slug === slug); if (!book || !book.isPublished)
    notFound(); return <SampleReader book={book}/>; }
export default function Page({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening the sample…</div>}>
    <Content params={params}/>
    </Suspense>;
}
