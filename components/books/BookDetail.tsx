'use client';
import Link from 'next/link';
import { useBrowserSearch } from '@/lib/use-browser-search';
import { Bookmark, BookOpen, ArrowLeft, ShoppingBag, LifeBuoy } from 'lucide-react';
import type { Book } from '../../lib/types';
import { formatsLabel, money } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
import BookCover from './BookCover';
export default function BookDetail({ book }: {
    book: Book;
}) {
    const { addToCart, toggleWishlist, isWishlisted, storageError } = useCart();
    const params = useBrowserSearch();
    const from = params.get('from') || '/books';
    const back = /^\/books(?:\?|$)/.test(from) ? from : '/books';
    const samplePath = `/samples/${book.slug}?from=${encodeURIComponent(back)}`;
    const available = book.isInStock && book.isPublished && book.rightsStatus === 'wide';
    const saved = isWishlisted(book.id);
    return <div className="storefront">
    <Link className="studio-back" href={back}>
    <ArrowLeft size={16} aria-hidden="true"/>Back to books</Link>
    <section className="studio-product">
    <div className="studio-product-cover">
    <BookCover src={book.coverImage} title={book.title} priority size="feature"/>{book.sampleExcerpt.trim() && <Link className="studio-text-link" href={samplePath}>
        <BookOpen size={17} aria-hidden="true"/>Open the sample</Link>}</div>
      <div className="studio-product-info">
    <span className="studio-kicker">{book.category} · {book.productType === 'printable' ? 'DIGITAL PRINTABLE' : 'DIGITAL EDITION'}</span>
    <h1>{book.title}</h1>{book.subtitle && <p className="studio-subtitle">{book.subtitle}</p>}<p className="studio-byline">By {book.author}</p>
    
        <div className="studio-purchase-panel">
    <div className="studio-purchase-price">
    <strong>{money(book.price)} <small>USD</small>
    </strong>
    <span>{formatsLabel(book.formats)}</span>
    </div>
    <p className="studio-caption">Digital files · No physical book or shipping</p>
          <button disabled={!available} className="studio-button" onClick={() => addToCart(book, formatsLabel(book.formats))}>
    <ShoppingBag size={18} aria-hidden="true"/>{available ? book.productType === 'printable' ? 'Add printable to cart' : 'Add ebook to cart' : 'Currently unavailable'}</button>
          {book.sampleExcerpt.trim() && <Link className="studio-button outline" href={samplePath}>
        <BookOpen size={17} aria-hidden="true"/>Read a sample</Link>}
          <p className="studio-caption">Checkout opens here on Knovera. This site currently offers test purchases; no payment is collected.</p>
          {storageError && <p className="studio-error" role="alert">{storageError}</p>}
          <div className="studio-purchase-links">
    <button className="studio-text-link" aria-pressed={saved} onClick={() => toggleWishlist(book.id)}>
    <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true"/>{saved ? 'Saved on this device' : 'Save for later'}</button>
    <Link className="studio-text-link" href="/contact">
    <LifeBuoy size={16}/>Need help?</Link>
    </div>
        </div>
      </div>
    </section>
    <section className="studio-book-content">
    <div>
    <span className="studio-kicker">A CLOSER LOOK</span>
    <h2>Inside this book</h2>
    <p>{book.shortDescription}</p>
    <p>{book.fullDescription}</p>
    <h3>Who it is for</h3>
    <p>{book.targetAudience}</p>
    <h3>Included with this edition</h3>
    <ul>{book.whatsIncluded.map(item => <li key={item}>{item}</li>)}</ul>
    </div>
      <aside>
    <h2>Contents</h2>
    <ol className="studio-contents">{book.tableOfContents.map(item => <li key={item}>{item.replace(/^\d+\.\s*/, '')}</li>)}</ol>
    <details className="studio-edition-details">
    <summary>Edition & file details</summary>
    <dl>{book.pageCount && <>
        <dt>Length</dt>
        <dd>{book.pageCount} pages</dd>
        </>}<dt>Edition</dt>
    <dd>{book.currentEdition.version}</dd>
    <dt>Released</dt>
    <dd>{book.currentEdition.releaseDate}</dd>
    <dt>Formats</dt>
    <dd>{formatsLabel(book.formats)}</dd>
    </dl>
    <p>{book.currentEdition.releaseNotes}</p>
    </details>
    <Link href="/help" className="studio-text-link">Reading on your device</Link>
    <Link href="/legal/refunds" className="studio-text-link">Delivery & purchase policies</Link>
    </aside>
    </section>
  </div>;
}
