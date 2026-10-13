import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import BookDetail from '../../../components/books/BookDetail';
import { db } from '../../../lib/db/store';
async function Content({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { slug } = await params;
    await connection();
    const book = await db.getBookBySlug(slug);
    if (!book || !book.isPublished)
        notFound();
    return <BookDetail book={book}/>;
}
export default function Page({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening book details…</div>}>
    <Content params={params}/>
    </Suspense>;
}
