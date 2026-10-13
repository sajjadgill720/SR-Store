'use client';
import Link from 'next/link';

import type { BundleOffer } from '../../../lib/types';
import BookCard from '../../../components/books/BookCard';
import { useCart } from '../../../lib/store/cart';
import { money } from '../../../lib/catalog';
export default function BundleDetail({ bundle }: { bundle: BundleOffer }) {
    const { addToCart } = useCart();

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
