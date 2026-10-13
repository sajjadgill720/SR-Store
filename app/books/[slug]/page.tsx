import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import BookDetail from '../../../components/books/BookDetail';
import { getPublicCatalog } from '@/lib/catalog-cache';
async function Content({ params }: {
    params: Promise<{
        slug: string;
    }>;
}) {
    const { slug } = await params;
    
    const book = (await getPublicCatalog()).books.find(book => book.slug === slug);
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
