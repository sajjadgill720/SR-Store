'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  Download,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Bookmark,
  Mail,
} from 'lucide-react';
import BookCover from '../books/BookCover';
import BundleShowcase from './BundleShowcase';
import { money, formatsLabel, authorLabel } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
import type { Book, BundleOffer } from '../../lib/types';

export default function Marketplace({ books, bundles = [] }: { books: Book[]; bundles?: BundleOffer[] }) {
  const { toggleWishlist, isWishlisted } = useCart();

  const [selectedBundleId, setSelectedBundleId] = useState<string | null>(null);
  const featured = books.find(book => book.featured) || books[0];
  const second = books.find(book => book.id !== featured?.id) || featured;
  const sample = books.find(book => book.sampleExcerpt.trim());
  const currentBundle = bundles.find(b => b.id === selectedBundleId) || bundles[0];

  return (
    <div className="knovera-home">
      {/* 1. HERO SECTION MATCHING REFERENCE DESIGN */}
      <section className="hero-pic-section" aria-labelledby="hero-pic-heading">
        <div className="hero-pic-container">
          <div className="hero-pic-grid">
            {/* Left: Headline, Description & CTAs */}
            <div className="hero-pic-left">
              <span className="hero-pic-kicker">YOUR DIGITAL BOOKSHELF</span>

              <h1 id="hero-pic-heading" className="hero-pic-headline">
                Read it tonight.<br />
                <span className="hero-pic-headline-italic">Keep it for good.</span>
              </h1>

              <p className="hero-pic-lead">
                A digital store for curious minds. Discover ebooks to learn from, ideas to live with, and useful resources for your everyday. Start with a free sample.
              </p>

              <div className="hero-pic-actions">
                <Link href="/books" className="hero-pic-cta-primary">
                  <span>Explore ebooks</span>
                  <span className="hero-pic-cta-arrow" aria-hidden="true">→</span>
                </Link>

                {sample && <Link href={`/samples/${sample.slug}`} className="hero-pic-sample-link">
                  Read a free sample
                </Link>}
              </div>

              {/* Formats specification line with dashed rule */}
              <div className="hero-pic-formats" aria-label="Available formats">
                <span className="hero-pic-formats-lead">Available as</span>
                <span className="hero-pic-formats-dash" aria-hidden="true" />
                <span className="hero-pic-formats-tags">Kindle · EPUB · PDF</span>
              </div>
              <Link href="/reader-club" className="hero-reader-club">
                <span className="hero-reader-club-icon"><Mail size={18} aria-hidden="true" /></span>
                <span><strong>Join the Reader Club</strong><small>Free reading news · Choose your topics</small></span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>

            {/* Right: 3D Fanned 3-Book Stack & Instant Delivery Stamp */}
            <div className="hero-pic-right">
              <div className="hero-pic-fan-wrap" role="region" aria-label="Featured publications">
                {/* Book 1: Back Left (Sand/oatmeal cover) */}
                <Link
                  href={featured ? `/books/${featured.slug}` : "/books"}
                  className="hero-pic-book hero-pic-book-sand"
                  aria-label={featured?.title || "Browse ebooks"}
                >
                  <div className="hero-pic-book-texture" />
                  <div className="hero-pic-book-content">
                    <span className="hero-pic-book-press">KNOVERA</span>
                    <div className="hero-pic-book-sand-title-wrap">
                      <span className="hero-pic-book-sand-title">{featured?.title.split(':')[0] || 'Discover'}</span>
                      <span className="hero-pic-book-sand-title">Your next read</span>
                    </div>
                    <div className="hero-pic-book-sand-rule" />
                  </div>
                </Link>

                {/* Book 2: Back Right (Umber cover) */}
                <Link
                  href="/books"
                  className="hero-pic-book hero-pic-book-umber"
                  aria-label="Browse the ebook collection"
                >
                  <div className="hero-pic-book-texture" />
                  <div className="hero-pic-book-content">
                    <span className="hero-pic-book-press">KNOVERA</span>
                  </div>
                </Link>

                {/* Book 3: Front Center (Dark charcoal buckram with amber ribbon) */}
                <Link
                  href={second ? `/books/${second.slug}` : "/books"}
                  className="hero-pic-book hero-pic-book-front"
                  aria-label={second?.title || "Explore ebooks"}
                >
                  <div className="hero-pic-book-texture" />
                  {/* Amber Notched Ribbon Bookmark */}
                  <div className="hero-pic-ribbon" aria-hidden="true" />

                  <div className="hero-pic-book-content hero-pic-front-content">
                    <div className="hero-pic-front-header">
                      <span className="hero-pic-front-press">KNOVERA</span>
                    </div>

                    <div className="hero-pic-front-title-block">
                      <h2 className="hero-pic-front-title">
                        {second?.title.split(':')[0] || 'A world of ideas'}
                      </h2>
                      <div className="hero-pic-front-rule" />
                    </div>

                    <div className="hero-pic-front-footer">
                      <span className="hero-pic-front-author">{second ? authorLabel(second.author) : "DIGITAL EDITION"}</span>
                    </div>
                  </div>
                </Link>

                {/* Circular Postmark Stamp overlapping bottom-left corner of front book */}
                <div className="hero-pic-stamp" aria-hidden="true">
                  <svg viewBox="0 0 160 160" className="hero-pic-stamp-svg">
                    <defs>
                      <path
                        id="hero-stamp-path-circle"
                        d="M 80, 80 m -56, 0 a 56,56 0 1,1 112,0 a 56,56 0 1,1 -112,0"
                      />
                    </defs>
                    <circle cx="80" cy="80" r="70" fill="none" stroke="currentColor" strokeWidth="1.4" strokeDasharray="4 2.5" opacity="0.85" />
                    <circle cx="80" cy="80" r="64" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.65" />
                    <circle cx="80" cy="80" r="45" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
                    <text fill="currentColor" className="hero-pic-stamp-curved-text">
                      <textPath href="#hero-stamp-path-circle" startOffset="50%" textAnchor="middle">
                        • YOUR NEXT READ • YOUR DIGITAL SHELF •
                      </textPath>
                    </text>
                    <text x="80" y="75" textAnchor="middle" fill="currentColor" className="hero-pic-stamp-title">
                      Digital
                    </text>
                    <text x="80" y="93" textAnchor="middle" fill="currentColor" className="hero-pic-stamp-sub">
                      editions
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-pic-bottom-rule" aria-hidden="true" />
      </section>

      {/* 2. THE COMPLETE COLLECTION */}
      <section id="collection" className="knovera-collection-section" aria-labelledby="collection-heading">
        <div className="knovera-container">
          <div className="knovera-section-header">
            <div>
              <span className="studio-kicker">EXPLORE THE COLLECTION</span>
              <h2 id="collection-heading" className="knovera-section-title">
                More stories. New perspectives.
              </h2>
            </div>
            <p className="knovera-section-sub">
              Browse at your own pace. Find a subject that draws you in, explore an edition,
              and see where your curiosity takes you.
            </p>
          </div>

          <div className="knovera-books-grid">
            {books.map((book, index) => {
              const saved = isWishlisted(book.id);
              const editionNum = String(index + 1).padStart(2, '0');
              return (
                <article key={book.id} className="knovera-book-card">
                  <div className="knovera-card-cover-container">
                    <Link
                      href={`/books/${book.slug}`}
                      className="knovera-card-cover-link"
                      aria-label={`View ${book.title}`}
                    >
                      <BookCover
                        src={book.coverImage}
                        title={book.title}
                        priority={index < 2}
                        size="card"
                      />
                    </Link>
                    <button
                      type="button"
                      className="knovera-wishlist-btn"
                      aria-label={saved ? `Remove ${book.title} from saved books` : `Save ${book.title} for later`}
                      aria-pressed={saved}
                      onClick={() => toggleWishlist(book.id)}
                    >
                      <Bookmark
                        size={17}
                        fill={saved ? 'currentColor' : 'none'}
                        aria-hidden="true"
                      />
                    </button>
                    <span className="knovera-card-edition-chip">EDITION {editionNum}</span>
                    {book.badge && <span className="knovera-card-badge">{book.badge}</span>}
                  </div>

                  <div className="knovera-card-body">
                    <div className="knovera-card-category-row">
                      <span className="knovera-card-category">{book.category}</span>
                      <span className="knovera-card-pages">
                        {book.pageCount ? `${book.pageCount} pages` : 'Digital Edition'}
                      </span>
                    </div>

                    <h3 className="knovera-card-title">
                      <Link href={`/books/${book.slug}`} aria-label={book.title}>
                        <span className="store-book-title-full">{book.title}</span>
                        <span className="store-book-title-short">{book.title.split(':')[0]}</span>
                      </Link>
                    </h3>

                    <p className="knovera-card-desc">{book.shortDescription}</p>

                    <div className="knovera-card-footer">
                      <div className="knovera-card-pricing">
                        <span className="knovera-card-price">{money(book.price)}</span>
                        <span className="knovera-card-formats">{formatsLabel(book.formats)}</span>
                      </div>

                      <div className="knovera-card-actions">
                        <Link href={`/books/${book.slug}`} className="studio-button outline knovera-btn-sm">
                          View details
                        </Link>
                        {book.sampleExcerpt.trim() && (
                          <Link
                            href={`/samples/${book.slug}`}
                            className="knovera-sample-link"
                            aria-label={`Read a free sample of ${book.title}`}
                          >
                            <BookOpen size={14} aria-hidden="true" />
                            Sample
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Dual Edition Box Set / Dynamic Bundle Showcase */}
          {currentBundle && currentBundle.books.length > 0 && (() => {
            const standaloneSum = currentBundle.books.reduce((sum, b) => sum + b.price, 0);

            return (
              <div className="boxset-section" id="box-sets" aria-labelledby="boxset-heading">
                {bundles.length > 1 && (
                  <div className="boxset-tabs" role="group" aria-label="Available Box Sets">
                    {bundles.map(b => (
                      <button
                        key={b.id}
                        type="button"
                        aria-pressed={b.id === currentBundle.id}
                        className={`boxset-tab-btn ${b.id === currentBundle.id ? 'is-active' : ''}`}
                        onClick={() => setSelectedBundleId(b.id)}
                      >
                        <span className="boxset-tab-title">{b.title}</span>
                        <span className="boxset-tab-save">{b.books.length} ebooks</span>
                      </button>
                    ))}
                  </div>
                )}

                <div className="boxset-grid">
                  {/* Left Column: Title, Prose, Contents List, Pricing, CTA */}
                  <div className="boxset-left">
                    <span className="store-set-kicker">A CURATED DIGITAL READING SET</span>
                    <h3 id="boxset-heading" className="boxset-title">
                      <span className="boxset-desktop-title">{currentBundle.title === 'The Complete Mastery & Productivity Bundle' ? <>The Complete<br/>Mastery &amp; <em>Productivity</em><br/>Bundle</> : currentBundle.title}</span>
                      <span className="boxset-mobile-title">{currentBundle.title.replace(/^The Complete /, '').replace(/ Bundle$/, '')}</span>
                    </h3>

                    <p className="boxset-desc">Bring related ideas together. Explore {currentBundle.books.length} complementary ebooks in one reading set, with a sample and format details for every title.</p>
                    {/* Contents Index Table with Roman numerals and dot leaders */}
                    <ol className="boxset-contents-list" aria-label="Included editions and materials">
                      {currentBundle.books.map((b, idx) => (
                        <li key={b.id} className="boxset-contents-item">
                          <span className="boxset-contents-roman">{['i.', 'ii.', 'iii.', 'iv.', 'v.'][idx] || `${idx + 1}.`}</span>
                          <Link href={`/books/${b.slug}`} className="boxset-contents-name">{b.title.split(':')[0]}</Link>
                          <span className="boxset-contents-dots" aria-hidden="true" />
                          <span className="boxset-contents-tag">EBOOK</span>
                        </li>
                      ))}
                    </ol>

                    <div className="boxset-pricing-row"><div className="boxset-price-main"><span className="boxset-price-amount">{money(standaloneSum)}</span><span className="boxset-price-currency">USD</span></div></div>
                    <p className="store-set-note">Combined price · ebooks are added individually to your cart.</p>
                    {/* CTAs */}
                    <div className="boxset-actions-row">
                      <Link
                        href={`/bundles/${currentBundle.slug}`}
                        className="boxset-cta-btn"
                      >
                        <span>Explore the Box Set</span>
                        <span className="boxset-cta-arrow" aria-hidden="true">→</span>
                      </Link>
                      <span className="boxset-delivery-note">
                        Digital editions · See included formats
                      </span>
                    </div>
                  </div>

                  <BundleShowcase key={currentBundle.id} bundle={currentBundle}/>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      <section className="store-feature-section knovera-container" aria-labelledby="store-features-heading">
        <span className="studio-kicker">MAKE YOURSELF AT HOME</span><h2 id="store-features-heading">More than your next download.</h2>
        <div className="store-feature-grid">
          {[{href:'/books?saved=1',title:'Your saved finds',mobileTitle:'Saved books',text:'Keep a shortlist of ebooks you want to come back to.',icon:Bookmark},{href:'/account/library',title:'Your personal library',mobileTitle:'My library',text:'Find your purchases and access available downloads.',icon:BookOpen},{href:'/community',title:'A place to share ideas',mobileTitle:'Reader community',text:'Explore reading circles, conversations, and your private journal.',icon:RefreshCw},{href:'/free-resources',title:'Explore free resources',mobileTitle:'Free resources',text:'Discover companion resources and preview what’s available.',icon:Download}].map(({href,title,mobileTitle,text,icon:Icon})=><Link key={href} href={href} className="store-feature-card"><Icon size={22} aria-hidden="true"/><h3><span className="store-desktop-copy">{title}</span><span className="store-mobile-copy">{mobileTitle}</span></h3><p>{text}</p><span>Explore <ArrowRight size={16}/></span></Link>)}
        </div>
      </section>

      {/* 4. THE KNOVERA READING EXPERIENCE / TRUST DETAILS */}
      <section className="knovera-pillars-section" aria-labelledby="pillars-heading">
        <div className="knovera-container">
          <div className="knovera-section-header text-center">
            <span className="studio-kicker">READER REASSURANCE</span>
            <h2 id="pillars-heading" className="knovera-section-title">
              Designed for your preferred way of reading.
            </h2>
            <p className="knovera-section-sub mx-auto">
              Clear formats, universal compatibility, and transparent delivery terms.
            </p>
          </div>

          <div className="knovera-pillars-grid">
            <div className="knovera-pillar-card">
              <div className="knovera-pillar-icon" aria-hidden="true">
                <Download size={22} />
              </div>
              <h3 className="knovera-pillar-title">Know what’s included</h3>
              <p className="knovera-pillar-desc">
                <span className="store-desktop-copy">Each product lists its included file formats. Check the details and read a sample before adding it to your cart.</span><span className="store-mobile-copy">Check formats and samples before you buy.</span>
              </p>
              <Link href="/help" className="studio-text-link"><span className="store-desktop-copy">Reading &amp; download help →</span><span className="store-mobile-copy">Reading help →</span></Link>
            </div>

            <div className="knovera-pillar-card">
              <div className="knovera-pillar-icon" aria-hidden="true">
                <Smartphone size={22} />
              </div>
              <h3 className="knovera-pillar-title">Device Compatibility</h3>
              <p className="knovera-pillar-desc">
                <span className="store-desktop-copy">Choose the format that suits your reading device. Our reading guides walk you through getting started.</span><span className="store-mobile-copy">Read on your phone, tablet, or ereader.</span>
              </p>
            </div>

            <div className="knovera-pillar-card">
              <div className="knovera-pillar-icon" aria-hidden="true">
                <RefreshCw size={22} />
              </div>
              <h3 className="knovera-pillar-title">Your purchase library</h3>
              <p className="knovera-pillar-desc">
                <span className="store-desktop-copy">Sign in to see your purchases and available downloads. Have an older order? Use purchase recovery to find it.</span><span className="store-mobile-copy">Your purchases and downloads, in one place.</span>
              </p>
            </div>

            <div className="knovera-pillar-card">
              <div className="knovera-pillar-icon" aria-hidden="true">
                <ShieldCheck size={22} />
              </div>
              <h3 className="knovera-pillar-title">Here to help</h3>
              <p className="knovera-pillar-desc">
                <span className="store-desktop-copy">Need help with a download or your order? Visit our support page for assistance and
                review our published refund policy before purchasing.</span><span className="store-mobile-copy">Help with orders, downloads, and refunds.</span>
              </p><Link href="/contact" className="studio-text-link">Contact support →</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
