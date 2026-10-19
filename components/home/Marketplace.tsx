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
      {/* 1. HERO SECTION MATCHING REFERENCE DESIGN */}
      <section className="hero-pic-section" aria-labelledby="hero-pic-heading">
        <div className="hero-pic-container">
          <div className="hero-pic-grid">
            {/* Left: Headline, Description & CTAs */}
            <div className="hero-pic-left">
              <span className="hero-pic-kicker">EBOOKS · GUIDES · TEMPLATES</span>

              <h1 id="hero-pic-heading" className="hero-pic-headline">
                Read it tonight.<br />
                <span className="hero-pic-headline-italic">Keep it for good.</span>
              </h1>

              <p className="hero-pic-lead">
                Ebooks and working files on cognitive focus, architectural leverage and systems design.
                Paid for once, delivered to your inbox, readable on any device.
              </p>

              <div className="hero-pic-actions">
                <Link href="/books" className="hero-pic-cta-primary">
                  <span>Browse the catalogue</span>
                  <span className="hero-pic-cta-arrow" aria-hidden="true">→</span>
                </Link>

                <Link href="/samples/the-focused-mind" className="hero-pic-sample-link">
                  Read a free sample
                </Link>
              </div>

              {/* Formats specification line with dashed rule */}
              <div className="hero-pic-formats" aria-label="Available formats">
                <span className="hero-pic-formats-lead">Available as</span>
                <span className="hero-pic-formats-dash" aria-hidden="true" />
                <span className="hero-pic-formats-tags">Kindle · EPUB · PDF</span>
              </div>
            </div>

            {/* Right: 3D Fanned 3-Book Stack & Instant Delivery Stamp */}
            <div className="hero-pic-right">
              <div className="hero-pic-fan-wrap" role="region" aria-label="Featured publications">
                {/* Book 1: Back Left (Sand/oatmeal cover) */}
                <Link
                  href="/books/the-focused-mind"
                  className="hero-pic-book hero-pic-book-sand"
                  aria-label="Cognitive Focus by Knovera Press"
                >
                  <div className="hero-pic-book-texture" />
                  <div className="hero-pic-book-content">
                    <span className="hero-pic-book-press">KNOVERA PRESS</span>
                    <div className="hero-pic-book-sand-title-wrap">
                      <span className="hero-pic-book-sand-title">Cognitive</span>
                      <span className="hero-pic-book-sand-title">Focus</span>
                    </div>
                    <div className="hero-pic-book-sand-rule" />
                  </div>
                </Link>

                {/* Book 2: Back Right (Umber cover) */}
                <Link
                  href="/books"
                  className="hero-pic-book hero-pic-book-umber"
                  aria-label="Knovera Press Publications"
                >
                  <div className="hero-pic-book-texture" />
                  <div className="hero-pic-book-content">
                    <span className="hero-pic-book-press">KNOVERA PRESS</span>
                  </div>
                </Link>

                {/* Book 3: Front Center (Dark charcoal buckram with amber ribbon) */}
                <Link
                  href="/books/atomic-architectures"
                  className="hero-pic-book hero-pic-book-front"
                  aria-label="Architectural Leverage by Knovera Press"
                >
                  <div className="hero-pic-book-texture" />
                  {/* Amber Notched Ribbon Bookmark */}
                  <div className="hero-pic-ribbon" aria-hidden="true" />

                  <div className="hero-pic-book-content hero-pic-front-content">
                    <div className="hero-pic-front-header">
                      <span className="hero-pic-front-press">KNOVERA PRESS</span>
                    </div>

                    <div className="hero-pic-front-title-block">
                      <h2 className="hero-pic-front-title">
                        Architectural<br />
                        <span className="hero-pic-front-title-italic">Leverage</span>
                      </h2>
                      <div className="hero-pic-front-rule" />
                    </div>

                    <div className="hero-pic-front-footer">
                      <span className="hero-pic-front-author">02 · [AUTHOR]</span>
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
                        • INSTANT DELIVERY • KINDLE • EPUB • PDF •
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
