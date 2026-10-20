'use client';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bookmark, BookOpen, Check, Download } from 'lucide-react';
import type { Book } from '../../lib/types';
import { formatsLabel, money, authorLabel } from '../../lib/catalog';
import { useBrowserSearch } from '@/lib/use-browser-search';
import { useCart } from '../../lib/store/cart';
import BookCover from './BookCover';

export default function BookDetail({ book }: { book: Book }) {
  const { addToCart, toggleWishlist, isWishlisted, storageError, items } = useCart();
  const from = useBrowserSearch().get('from') || '/books';
  const back = /^\/books(?:\?|$)/.test(from) ? from : '/books';
  const sample = `/samples/${book.slug}?from=${encodeURIComponent(back)}`;
  const available = book.isPublished && book.isInStock && book.rightsStatus === 'wide';
  const saved = isWishlisted(book.id);
  const inCart = items.some(item=>item.bookId===book.id);
  return <div className="storefront store-product">
    <Link className="studio-back" href={back}><ArrowLeft size={16}/> Back to ebooks</Link>
    <article className="store-product-hero" aria-labelledby="product-title">
      <div className="store-product-art"><BookCover src={book.coverImage} title={book.title} size="detail" priority/>{book.sampleExcerpt.trim() && <Link className="studio-button outline" href={sample}><BookOpen size={18}/> Read a free sample</Link>}</div>
      <div className="store-product-info"><span className="studio-kicker">{book.category} · {book.productType==='printable'?'PRINTABLE':'EBOOK'}</span><h1 id="product-title">{book.title}</h1>{book.subtitle && <p className="store-product-subtitle">{book.subtitle}</p>}<p className="store-product-author">By {authorLabel(book.author)}</p><p className="store-product-description">{book.shortDescription}</p>
        <div className="store-product-facts"><span><Download size={16}/>{formatsLabel(book.formats)}</span>{book.pageCount && <span>{book.pageCount} pages</span>}<span>Digital download</span></div>
        <div className="store-product-purchase"><p className="store-product-price">{money(book.price)} <small>USD</small></p><p className="store-product-tax">Pay once · Applicable taxes shown at checkout</p>
          {inCart?<Link className="store-primary-action" href="/cart">View in cart <ArrowRight size={18}/></Link>:<button className="store-primary-action" type="button" disabled={!available} onClick={()=>addToCart(book)}>{available?'Add to cart':'Currently unavailable'}<ArrowRight size={18}/></button>}
          <button className="store-product-save" type="button" aria-pressed={saved} onClick={()=>toggleWishlist(book.id)}><Bookmark size={17} fill={saved?'currentColor':'none'}/>{saved?'Saved for later':'Save for later'}</button>
          {storageError && <p role="alert" className="studio-error">{storageError}</p>}
          <p className="store-product-delivery">Your downloads become available after payment confirmation. <Link href="/legal/refunds">Delivery &amp; refunds</Link></p>
        </div>
      </div>
    </article>
    <div className="store-product-details"><div><section className="store-product-section"><h2>About this ebook</h2><p>{book.fullDescription || book.shortDescription}</p></section><section className="store-product-section"><h2>What’s included</h2><ul className="store-product-included">{book.whatsIncluded.map((item,index)=><li key={index}><Check size={17} aria-hidden="true"/><span>{item}</span></li>)}</ul></section>{book.targetAudience && <section className="store-product-section"><h2>Who it’s for</h2><p>{book.targetAudience}</p></section>}</div>
      <aside className="store-product-contents"><h2>Inside the ebook</h2><ol>{book.tableOfContents.map((chapter,index)=><li key={index}>{chapter.replace(/^\d+\.\s*/,'')}</li>)}</ol><details><summary>Edition details</summary><dl><dt>Edition</dt><dd>{book.currentEdition.version}</dd><dt>Formats</dt><dd>{formatsLabel(book.formats)}</dd>{book.isbn && <><dt>ISBN</dt><dd>{book.isbn}</dd></>}</dl></details></aside>
    </div>
    <section className="store-product-section store-product-faq"><h2>A little help before you buy.</h2><details><summary>Which devices can I use?</summary><p>Choose a compatible reader for the {formatsLabel(book.formats)} files included in this product. For setup instructions, visit our <Link href="/help">reading guides</Link> or <Link href="/help/kindle">Kindle guide</Link>.</p></details><details><summary>Where do I find my downloads?</summary><p>After payment is confirmed, open your order link or <Link href="/account/library">your library</Link>. For a previous purchase, use <Link href="/access">order recovery</Link>.</p></details><details><summary>Can I get help with an order?</summary><p><Link href="/contact">Contact support</Link> with your order reference. Please read the <Link href="/legal/refunds">delivery and refund policy</Link> before buying.</p></details></section>
    {(book.slug==='the-focused-mind'||book.slug==='atomic-architectures') && <section className="store-product-related"><div><span className="studio-kicker">KEEP EXPLORING</span><h2>Build on the idea.</h2><p>Explore complementary ebooks in our curated reading set.</p></div><Link className="studio-button outline" href="/bundles/the-complete-mastery-bundle">Explore the reading set <ArrowRight size={17}/></Link></section>}
  </div>;
}
