import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import SampleReader from '../../../components/books/SampleReader';
import { db } from '../../../lib/db/store';
import { getBookBySlug } from '../../../lib/data/books';
async function Content({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) { const { slug } = await params; await connection(); const book = db.getBookBySlug(slug) || getBookBySlug(slug); if (!book || !book.isPublished)
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
