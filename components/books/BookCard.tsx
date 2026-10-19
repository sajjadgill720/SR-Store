'use client';
import Link from 'next/link';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import type { Book } from '../../lib/types';
import { useCart } from '../../lib/store/cart';
import { money } from '../../lib/catalog';
import BookCover from './BookCover';
export default function BookCard({ book, returnTo, priority = false }: {
    book: Book;
    returnTo?: string;
    priority?: boolean;
}) {
    const { toggleWishlist, isWishlisted } = useCart();
    const saved = isWishlisted(book.id);
    const detail = `/books/${book.slug}${returnTo ? '?from=' + encodeURIComponent(returnTo) : ''}`;
    return <article className="edition-card">
    <div className="edition-card-art">
    <Link href={detail} aria-label={`View ${book.title}`}>
    <BookCover src={book.coverImage} title={book.title} priority={priority}/>
    </Link>
      <button className="edition-save" aria-label={`${saved ? 'Remove' : 'Save'} ${book.title}${saved ? ' from saved books' : ' for later'}`} aria-pressed={saved} onClick={() => toggleWishlist(book.id)}>
    <Bookmark size={17} aria-hidden="true" fill={saved ? 'currentColor' : 'none'}/>
    </button>
    {book.badge && <span className="knovera-card-edition-chip">{book.badge}</span>}
    </div>
    <div className="edition-card-copy">
    <span className="studio-kicker">{book.category}</span>
    <Link href={detail}>
    <h3>{book.title}</h3>
    </Link>
    <p>{book.shortDescription}</p>
      <div className="edition-card-price">
    <span>{money(book.price)} <small>USD</small>
    </span>
    <span>{book.productType === 'printable' ? 'Digital printable' : 'Digital edition'}</span>
    </div>
      <Link className="studio-button outline" href={detail}>View book <ArrowUpRight size={16} aria-hidden="true"/>
    </Link>
      {book.sampleExcerpt.trim() && <Link className="studio-text-link" href={`/samples/${book.slug}${returnTo ? '?from=' + encodeURIComponent(returnTo) : ''}`}>Read a sample</Link>}
    </div>
  </article>;
}
