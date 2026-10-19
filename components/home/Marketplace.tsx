'use client';

import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  Download,
  ShieldCheck,
  Smartphone,
  RefreshCw,
  Bookmark,
} from 'lucide-react';
import BookCover from '../books/BookCover';
import { money, formatsLabel } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
import type { Book } from '../../lib/types';

const motionQuery = '(prefers-reduced-motion: reduce)';
const subscribeMotion = (notify: () => void) => {
  const query = window.matchMedia(motionQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
const getReducedMotion = () => window.matchMedia(motionQuery).matches;

export default function Marketplace({ books }: { books: Book[] }) {
  const { toggleWishlist, isWishlisted } = useCart();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(true);
  const showcase = useRef<HTMLDivElement>(null);
  const reducedMotion = useSyncExternalStore(subscribeMotion, getReducedMotion, () => true);
  const featured = books.find(book => book.id === selectedId) || books.find(book => book.featured) || books[0];
  const selectedIndex = featured ? books.findIndex(book => book.id === featured.id) : 0;
  const canRotate = books.length > 1;
  const autoRotate = playing && !reducedMotion && canRotate;
  const move = (direction: number) => {
    setPlaying(false);
    setSelectedId(books[(selectedIndex + direction + books.length) % books.length].id);
  };
  useEffect(() => {
    if (!autoRotate) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible' || showcase.current?.matches(':hover') || showcase.current?.contains(document.activeElement)) return;
      setSelectedId(books[(selectedIndex + 1) % books.length].id);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [autoRotate, books, selectedIndex]);
  const readerProfiles = [
    { name: 'Aisha', role: 'Student', initials: 'A', title: 'A little space to learn.', text: 'A chapter between classes. A new subject to explore. Reading that fits around a busy day.' },
    { name: 'Daniel', role: 'Everyday reader', initials: 'D', title: 'Something beyond the everyday.', text: 'An interesting idea for the commute, a quiet evening, or a well-earned weekend.' },
    { name: 'Sara', role: 'Parent', initials: 'S', title: 'Curiosity to share.', text: 'Make room for reading together, discovering new interests, and asking another question.' },
    { name: 'Omar', role: 'Freelancer', initials: 'O', title: 'A fresh point of view.', text: 'Step away from the to-do list and spend a little time with a different perspective.' },
  ];

  return (
    <div className="knovera-home">
      {/* 1. HERO SHOWCASE: Distinctive, editorial, no oversized empty hero */}
      <section className="knovera-hero" aria-labelledby="hero-heading">
        <div className="knovera-hero-container">
          <div className="knovera-hero-grid">
            {/* Left: Press & Imprint Framing */}
            <div className="knovera-hero-content">
              <h1 id="hero-heading" className="knovera-hero-title">
                Books engineered for
                <br />
                <em>unbroken focus</em> &amp; leverage.
              </h1>

              <p className="knovera-hero-lead">
                Definitive digital reference editions on cognitive architecture, systems design,
                and high-leverage craft. Archival typesetting, completely DRM-free, and designed for decades of reference.
              </p>

              <div className="knovera-hero-actions">
                <a href="#collection" className="studio-button knovera-hero-cta">
                  <span>Explore the Collection</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
                {featured && featured.sampleExcerpt.trim() && (
                  <Link
                    href={`/samples/${featured.slug}`}
                    className="studio-button outline knovera-hero-sample-btn"
                  >
                    <BookOpen size={16} aria-hidden="true" />
                    <span>Read Free Sample</span>
                  </Link>
                )}
              </div>

              {/* Quick Trust Highlights right under actions for immediate confidence */}
              <div className="knovera-hero-specs" aria-label="Format specifications">
                <div className="knovera-spec-item">
                  <Download size={14} aria-hidden="true" />
                  <span>DRM-Free EPUB &amp; Typeset PDF</span>
                </div>
                <div className="knovera-spec-item">
                  <Smartphone size={14} aria-hidden="true" />
                  <span>Kindle &amp; Apple Books Ready</span>
                </div>
                <div className="knovera-spec-item">
                  <ShieldCheck size={14} aria-hidden="true" />
                  <span>Lifetime Revisions Included</span>
                </div>
              </div>
            </div>

            {/* Right: Featured Book Spotlight with visible price and zero fold delay */}
            {featured && (
              <div id="featured-book" className="knovera-featured-box rotating-showcase" ref={showcase} role="region" aria-roledescription="carousel" aria-label="Discover books" data-playing={autoRotate}>
                <div className="knovera-featured-card">
                  <div className="knovera-spotlight-eyebrow">
                    <span className="knovera-spotlight-label">FEATURED TITLE</span>
                    <span className="knovera-spotlight-dot" aria-hidden="true">·</span>
                    <span className="knovera-spotlight-cat">{featured.category}</span>
                  </div>

                  <div className="knovera-featured-layout" role="group" aria-roledescription="slide" aria-label={`${selectedIndex + 1} of ${books.length}: ${featured.title}`}>
                    <div className="knovera-featured-cover-wrap" key={featured.id}>
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
                      <h2 className="knovera-featured-title">
                        <Link href={`/books/${featured.slug}`}>{featured.title}</Link>
                      </h2>
                      <p className="knovera-featured-desc">{featured.subtitle || featured.shortDescription}</p>

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
                          {formatsLabel(featured.formats)}{featured.pageCount ? ` · ${featured.pageCount} pages` : ''}
                        </span>
                      </div>

                      <div className="knovera-featured-buttons">
                        <Link
                          href={`/books/${featured.slug}`}
                          className="studio-button knovera-featured-cta"
                          aria-label={`View Edition and Purchase ${featured.title} for ${money(featured.price)}`}
                        >
                          <span>View edition</span><ArrowRight size={16} aria-hidden="true" />
                        </Link>
                        {featured.sampleExcerpt.trim() && (
                          <Link
                            href={`/samples/${featured.slug}`}
                            className="studio-button outline knovera-action-sample"
                          >
                            <BookOpen size={16} aria-hidden="true" />
                            Read Free Sample Excerpt
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {canRotate && (
                  <div className="knovera-hero-edition-tabs" role="tablist" aria-label="Select spotlight volume">
                    {books.map((book, idx) => (
                      <button
                        key={book.id}
                        type="button"
                        role="tab"
                        aria-selected={book.id === featured.id}
                        className={`knovera-hero-tab-btn ${book.id === featured.id ? 'active' : ''}`}
                        onClick={() => {
                          setPlaying(false);
                          setSelectedId(book.id);
                        }}
                      >
                        <span className="tab-idx">{String(idx + 1).padStart(2, '0')}</span>
                        <span className="tab-name">{book.title.split(':')[0]}</span>
                      </button>
                    ))}
                  </div>
                )}
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

      {/* 3. EDITORIAL PRAISE & CRITICAL RECEPTION (Stripe Press Signature) */}
      <section id="readers" className="sp-praise-block" aria-labelledby="praise-heading">
        <div className="knovera-container">
          <div className="sp-section-kicker">
            <span className="sp-dash" aria-hidden="true" />
            <span className="sp-kicker-text">EVERYDAY READERS</span>
          </div>
          <div className="knovera-section-header">
            <h2 id="praise-heading" className="knovera-section-title">Different days. A shared curiosity.</h2>
            <p className="knovera-section-sub">For the moments you make your own.</p>
          </div>
          <p className="reader-profile-note">Illustrative reader profiles, not customer reviews.</p>
          <div className="sp-praise-grid">
            {readerProfiles.map(profile => (
              <article className="sp-praise-card reader-profile" key={profile.name}>
                <div className="reader-profile-top">
                  <span className="reader-profile-avatar" aria-hidden="true">{profile.initials}</span>
                  <div><h3 className="sp-praise-name">{profile.name}</h3><span className="sp-praise-role">{profile.role} · Illustrative profile</span></div>
                  <BookOpen className="reader-profile-icon" size={24} aria-hidden="true" />
                </div>
                <h4 className="reader-profile-title">{profile.title}</h4>
                <p className="reader-profile-copy">{profile.text}</p>
              </article>
            ))}
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
              <h3 className="knovera-pillar-title">Here to help</h3>
              <p className="knovera-pillar-desc">
                Need help with a download or your order? Visit our support page for assistance and
                review our published refund policy before purchasing.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
