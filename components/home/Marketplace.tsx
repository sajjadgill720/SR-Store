'use client';

import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  Download,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Sparkles,
  Layers,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import BookCover from '../books/BookCover';
import { money, formatsLabel } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
import type { Book } from '../../lib/types';

export default function Marketplace({ books }: { books: Book[] }) {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();

  // Find the featured flagship book (The Focused Mind or first featured)
  const featured = books.find(book => book.slug === 'the-focused-mind') || books.find(book => book.featured) || books[0];
  const otherBooks = books.filter(book => book.id !== featured?.id);

  return (
    <div className="knovera-home">
      {/* 1. HERO SHOWCASE: Distinctive, editorial, no oversized empty hero */}
      <section className="knovera-hero" aria-labelledby="hero-heading">
        <div className="knovera-hero-container">
          <div className="knovera-hero-grid">
            {/* Left: Author & Imprint Framing */}
            <div className="knovera-hero-content">
              <div className="knovera-kicker-badge">
                <span className="knovera-kicker-dot" aria-hidden="true" />
                <span>INDEPENDENT DIGITAL EDITIONS · S.R. REHMAN</span>
              </div>

              <h1 id="hero-heading" className="knovera-hero-title">
                Books for high cognitive leverage, deliberate systems, and unbroken depth.
              </h1>

              <p className="knovera-hero-lead">
                An intimate collection of carefully researched, independently published ebooks by author
                and engineer S.R. Rehman. Designed to be referenced for years.
              </p>

              {/* Quick Trust Highlights right under lead for immediate confidence */}
              <div className="knovera-hero-specs" aria-label="Format specifications">
                <div className="knovera-spec-item">
                  <Download size={15} aria-hidden="true" />
                  <span>DRM-Free EPUB &amp; Typeset PDF</span>
                </div>
                <div className="knovera-spec-item">
                  <Smartphone size={15} aria-hidden="true" />
                  <span>Kindle &amp; Apple Books Ready</span>
                </div>
                <div className="knovera-spec-item">
                  <ShieldCheck size={15} aria-hidden="true" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>

              <div className="knovera-hero-actions">
                <a href="#featured-book" className="studio-button">
                  Explore Featured Book <ArrowRight size={16} aria-hidden="true" />
                </a>
                <a href="#collection" className="studio-button outline">
                  Browse All 4 Titles
                </a>
              </div>
            </div>

            {/* Right: Featured Book Spotlight with visible price and zero fold delay */}
            {featured && (
              <div id="featured-book" className="knovera-featured-box">
                <div className="knovera-featured-card">
                  <div className="knovera-featured-tag">
                    <Sparkles size={13} aria-hidden="true" />
                    <span>FEATURED EDITION</span>
                  </div>

                  <div className="knovera-featured-layout">
                    <div className="knovera-featured-cover-wrap">
                      <Link
                        href={`/books/${featured.slug}`}
                        aria-label={`View details for ${featured.title}`}
                        className="knovera-cover-link"
                      >
                        <BookCover
                          src={featured.coverImage}
                          title={featured.title}
                          priority={true}
                          size="feature"
                        />
                      </Link>
                    </div>

                    <div className="knovera-featured-details">
                      <span className="knovera-genre-tag">{featured.category}</span>
                      <h2 className="knovera-featured-title">
                        <Link href={`/books/${featured.slug}`}>{featured.title}</Link>
                      </h2>
                      {featured.subtitle && (
                        <p className="knovera-featured-subtitle">{featured.subtitle}</p>
                      )}

                      <p className="knovera-featured-desc">{featured.shortDescription}</p>

                      <div className="knovera-featured-meta">
                        <div className="knovera-price-group">
                          <span className="knovera-price-main">
                            {money(featured.price)}
                            <small> USD</small>
                          </span>
                          {featured.originalPrice && (
                            <span className="knovera-price-original">
                              {money(featured.originalPrice)}
                            </span>
                          )}
                        </div>
                        <span className="knovera-format-badge">
                          {formatsLabel(featured.formats)} · {featured.pageCount || 284} pages
                        </span>
                      </div>

                      <div className="knovera-featured-buttons">
                        <Link
                          href={`/books/${featured.slug}`}
                          className="studio-button knovera-action-main"
                        >
                          View Edition &amp; Contents
                        </Link>
                        {featured.sampleExcerpt.trim() && (
                          <Link
                            href={`/samples/${featured.slug}`}
                            className="studio-button outline knovera-action-sample"
                          >
                            <BookOpen size={16} aria-hidden="true" />
                            Read Sample (Free)
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. THE COMPLETE COLLECTION */}
      <section id="collection" className="knovera-collection-section" aria-labelledby="collection-heading">
        <div className="knovera-container">
          <div className="knovera-section-header">
            <div>
              <span className="studio-kicker">THE COMPLETE CATALOG</span>
              <h2 id="collection-heading" className="knovera-section-title">
                Four books. Four distinct perspectives.
              </h2>
            </div>
            <p className="knovera-section-sub">
              Every book is engineered around practical mental models, field-tested systems, and
              immediate reader leverage. Available in DRM-free universal formats.
            </p>
          </div>

          <div className="knovera-books-grid">
            {books.map((book, index) => {
              const saved = isWishlisted(book.id);
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
                      <Link href={`/books/${book.slug}`}>{book.title}</Link>
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

          {/* Dual Edition Box Set / Bundle Banner */}
          <div className="knovera-bundle-banner">
            <div className="knovera-bundle-content">
              <span className="knovera-bundle-pill">SPECIAL BOX SET · SAVE 22%</span>
              <h3 className="knovera-bundle-title">The Complete Mastery &amp; Productivity Bundle</h3>
              <p className="knovera-bundle-desc">
                Get both <em>The Focused Mind</em> and <em>Atomic Architectures</em> together in one
                comprehensive package. Includes all companion worksheets, scorecards, and future revisions.
              </p>
              <div className="knovera-bundle-meta">
                <span className="knovera-bundle-price">$29.99 USD</span>
                <span className="knovera-bundle-compare">Standard standalone sum: $38.49</span>
              </div>
            </div>
            <div className="knovera-bundle-action">
              <Link
                href="/bundles/the-complete-mastery-bundle"
                className="studio-button knovera-bundle-btn"
              >
                Explore the Box Set <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. AUTHOR PERSPECTIVE: The Voice Behind the Imprint */}
      <section className="knovera-author-section" aria-labelledby="author-heading">
        <div className="knovera-container">
          <div className="knovera-author-wrapper">
            <div className="knovera-author-letterhead">
              <span className="studio-kicker">FROM THE AUTHOR’S DESK</span>
              <h2 id="author-heading" className="knovera-author-heading">
                A Note on Independent Publishing
              </h2>
            </div>

            <div className="knovera-author-body">
              <p className="knovera-author-quote">
                &ldquo;Modern web publishing is too often engineered for algorithm compliance, manufactured
                urgency, and superficial takeaways. I write books for people who still value deep synthesis,
                unhurried contemplation, and tools they can return to for a decade.&rdquo;
              </p>

              <div className="knovera-author-text">
                <p>
                  Every book published on Knovera is written, researched, typeset, and supported directly
                  by myself. By maintaining complete independence from traditional corporate distribution,
                  I can promise three commitments to every reader:
                </p>
                <ul className="knovera-author-commitments">
                  <li>
                    <strong>Zero digital handcuffs:</strong> Every purchase delivers DRM-free universal
                    files that you own permanently on your own hard drive and e-readers.
                  </li>
                  <li>
                    <strong>Continuous evolution:</strong> As frameworks are refined in active practice,
                    revised editions and companion worksheets are automatically updated in your library.
                  </li>
                  <li>
                    <strong>Substantive density:</strong> No ghostwritten chapters, no padding to satisfy
                    arbitrary spine-width standards. Just distilled leverage from beginning to end.
                  </li>
                </ul>
              </div>

              <div className="knovera-author-signoff">
                <div className="knovera-author-identity">
                  <strong>S.R. Rehman</strong>
                  <span>Author, Engineer, and Founder of Knovera</span>
                </div>
                <Link href="/about" className="knovera-author-link">
                  Read more about the imprint &rarr;
                </Link>
              </div>
            </div>
          </div>
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
              <h3 className="knovera-pillar-title">DRM-Free Formats</h3>
              <p className="knovera-pillar-desc">
                Receive both reflowable EPUB and cleanly typeset PDF editions with margin notes. No
                proprietary reader app required.
              </p>
            </div>

            <div className="knovera-pillar-card">
              <div className="knovera-pillar-icon" aria-hidden="true">
                <Smartphone size={22} />
              </div>
              <h3 className="knovera-pillar-title">Device Compatibility</h3>
              <p className="knovera-pillar-desc">
                Seamlessly read on Kindle (via Send-to-Kindle), Apple Books, Kobo, reMarkable, iPad,
                or any PDF tablet reader.
              </p>
            </div>

            <div className="knovera-pillar-card">
              <div className="knovera-pillar-icon" aria-hidden="true">
                <RefreshCw size={22} />
              </div>
              <h3 className="knovera-pillar-title">Lifetime Free Updates</h3>
              <p className="knovera-pillar-desc">
                When new editions or companion worksheets are released, they are automatically made
                available in your library at zero additional cost.
              </p>
            </div>

            <div className="knovera-pillar-card">
              <div className="knovera-pillar-icon" aria-hidden="true">
                <ShieldCheck size={22} />
              </div>
              <h3 className="knovera-pillar-title">30-Day Guarantee</h3>
              <p className="knovera-pillar-desc">
                If an edition does not provide genuine practical value for your daily work or habits,
                reach out anytime for a prompt, courteous full refund.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
