'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { getBundleBySlug } from '../../../lib/data/books';
import BookCard from '../../../components/books/BookCard';
import { useCart } from '../../../lib/store/cart';
import { money } from '../../../lib/catalog';
function Content() {
    const slug = useParams<{
        slug: string;
    }>().slug;
    const bundle = getBundleBySlug(slug);
    const { addToCart } = useCart();
    if (!bundle)
        notFound();
    const total = bundle.books.reduce((sum, book) => sum + book.price, 0);
    return <div className="storefront">
    <Link className="studio-back" href="/books?category=Bundles">Back to reading sets</Link>
    <div className="studio-page-heading">
    <span className="studio-kicker">A PAIR OF RELATED READS</span>
    <h1>{bundle.title}</h1>
    <p>{bundle.description}</p>
    </div>
    <div className="studio-notice">
    <p>These editions are added individually to your cart. Total: {money(total)} USD.</p>
    <button className="studio-button" disabled={bundle.books.some(book => !book.isInStock || book.rightsStatus !== 'wide')} onClick={() => bundle.books.forEach(book => addToCart(book))}>Add both books · {money(total)}</button>
    </div>
    <div className="edition-grid">{bundle.books.map(book => <BookCard book={book} key={book.id}/>)}</div>
    </div>;
}
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening the reading set…</div>}>
    <Content />
    </Suspense>;
}
