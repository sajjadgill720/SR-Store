'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useBrowserSearch } from '@/lib/use-browser-search';
import {
  Bookmark,
  BookOpen,
  ArrowLeft,
  ShoppingBag,
  Download,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  Check,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import type { Book } from '../../lib/types';
import { formatsLabel, money } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
import BookCover from './BookCover';

// Author's personal note tailored to each real title
const AUTHOR_NOTES: Record<string, { heading: string; text: string }> = {
  'the-focused-mind': {
    heading: 'Why I Wrote The Focused Mind',
    text: 'In an economy engineered to monopolize human attention, depth has become both exceptionally scarce and extraordinarily valuable. I wrote this guide after years of struggling with digital fragmentation and attention residue. This is not a collection of abstract productivity platitudes; it is the battle-tested operating system I use every morning to protect my cognitive environment and produce high-leverage work without burnout.',
  },
  'atomic-architectures': {
    heading: 'Why I Wrote Atomic Architectures',
    text: 'For years, I believed that failing to maintain a habit was a moral or character defect: I simply "lacked discipline." But cognitive science and behavioral physiology prove the exact opposite: relying on raw willpower is an architectural design flaw. I wrote this book to help builders and thinkers design environmental friction loops where high-performance habits become the path of least resistance.',
  },
  'the-solo-architect': {
    heading: 'Why I Wrote The Solo Architect',
    text: 'For a decade, the software industry suffered from collective organizational mimicry: startups with two engineers were told to build twenty microservices with Kubernetes clusters and distributed buses. The result was catastrophic latency and endless maintenance. I wrote this playbook to codify the modular monolith architecture and agentic pair-programming workflows that allow a single disciplined craftsperson to ship durable software in days, not quarters.',
  },
  'explorers-mind-activities': {
    heading: 'Why I Wrote The Young Explorer',
    text: 'As modern screens become more addictive and rapid-fire, I wanted to create a peaceful, tactile haven for children and families. These 75 worksheets combine foundational STEM concepts with calming finger-labyrinths and mindfulness mazes. Formatted in crisp 300 DPI vector lines, they are designed to be printed freely in your household as many times as your children wish.',
  },
};

const FAQS = [
  {
    q: 'What file formats will I receive?',
    a: 'Every digital edition includes both reflowable EPUB (compatible with Kindle, Apple Books, Kobo, and e-readers) and a typeset PDF edition formatted with generous margins and printable companion worksheets. Printable editions arrive in 300 DPI high-resolution PDF for household printing.',
  },
  {
    q: 'How do I transfer this book to my Kindle or e-reader?',
    a: 'Amazon supports standard EPUB files via their official Send-to-Kindle tool (amazon.com/sendtokindle) or by emailing the file directly to your Kindle address. Apple Books and Kobo open the EPUB with a single tap. See our Device Guidance page for step-by-step instructions.',
  },
  {
    q: 'How do downloads and library access work?',
    a: 'Your download links appear immediately on the order confirmation screen after checkout. You also receive an email receipt with your private order token. You can open and re-download your books anytime from My Library using either your verified account or receipt email.',
  },
  {
    q: 'Are these books protected by DRM?',
    a: 'No. All Knovera books are 100% DRM-free. You own the files you purchase and can store backups on your computer, tablet, or personal cloud without proprietary software restrictions.',
  },
  {
    q: 'What is your refund policy?',
    a: 'Every book comes with an unconditional 30-day money-back guarantee. If an edition does not provide genuine practical value for your daily work or habits, email author support for a prompt full refund.',
  },
  {
    q: 'Will I receive future edition updates?',
    a: 'Yes. When errata are corrected, formatting is refined, or companion worksheets are updated, new editions are uploaded directly to your library at zero additional charge.',
  },
];

export default function BookDetail({ book }: { book: Book }) {
  const { addToCart, toggleWishlist, isWishlisted, storageError } = useCart();
  const params = useBrowserSearch();
  const from = params.get('from') || '/books';
  const back = /^\/books(?:\?|$)/.test(from) ? from : '/books';
  const samplePath = `/samples/${book.slug}?from=${encodeURIComponent(back)}`;
  const available = book.isInStock && book.isPublished && book.rightsStatus === 'wide';
  const saved = isWishlisted(book.id);

  // Mobile Sticky Bar Observer
  const purchasePanelRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const target = purchasePanelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show sticky bar when the main purchase panel is scrolled out of view above
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const authorNote = AUTHOR_NOTES[book.slug] || {
    heading: `A Note on ${book.title}`,
    text: book.fullDescription,
  };

  const isBundleEligible =
    book.slug === 'the-focused-mind' || book.slug === 'atomic-architectures';

  return (
    <div className="knovera-detail-page">
      {/* Back Link */}
      <div className="knovera-detail-nav">
        <Link className="studio-back" href={back}>
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to collection</span>
        </Link>
      </div>

      {/* Main Book Hero Layout */}
      <section className="knovera-product-hero" aria-labelledby="book-title">
        <div className="knovera-product-cover-column">
          <div className="knovera-cover-frame">
            <BookCover src={book.coverImage} title={book.title} priority size="feature" />
          </div>

          {book.sampleExcerpt.trim() && (
            <Link className="knovera-cover-sample-cta" href={samplePath}>
              <BookOpen size={16} aria-hidden="true" />
              <span>Read free sample excerpt &rarr;</span>
            </Link>
          )}

          <div className="knovera-cover-spec-pills">
            <span className="knovera-spec-pill">
              <Download size={13} aria-hidden="true" /> DRM-Free
            </span>
            <span className="knovera-spec-pill">
              <Smartphone size={13} aria-hidden="true" /> Kindle / iPad Ready
            </span>
          </div>
        </div>

        <div className="knovera-product-info-column">
          <div className="knovera-product-kicker">
            <span>{book.category.toUpperCase()}</span>
            <span className="knovera-bullet" aria-hidden="true">·</span>
            <span>{book.productType === 'printable' ? 'DIGITAL PRINTABLE' : 'DIGITAL MASTER EDITION'}</span>
          </div>

          <h1 id="book-title" className="knovera-product-title">{book.title}</h1>

          {book.subtitle && <p className="knovera-product-subtitle">{book.subtitle}</p>}

          <p className="knovera-product-byline">
            Distinctive Edition · <strong>Knovera Press</strong>
          </p>

          <p className="knovera-product-lead">{book.shortDescription}</p>

          {/* Purchase Panel */}
          <div ref={purchasePanelRef} className="knovera-purchase-card">
            <div className="knovera-purchase-price-row">
              <div className="knovera-price-display">
                <span className="knovera-current-price">{money(book.price)}</span>
                <span className="knovera-currency">USD</span>
                {book.originalPrice && (
                  <span className="knovera-original-price">{money(book.originalPrice)}</span>
                )}
              </div>
              <span className="knovera-formats-tag">{formatsLabel(book.formats)}</span>
            </div>

            <p className="knovera-purchase-clarity">
              Instant digital delivery · DRM-free files · No shipping or physical packaging
            </p>

            <div className="knovera-purchase-buttons">
              <button
                disabled={!available}
                className="studio-button knovera-buy-button"
                onClick={() => addToCart(book, formatsLabel(book.formats))}
              >
                <ShoppingBag size={18} aria-hidden="true" />
                <span>
                  {available
                    ? book.productType === 'printable'
                      ? 'Add Printable Edition to Cart'
                      : 'Add Digital Edition to Cart'
                    : 'Currently Unavailable'}
                </span>
              </button>

              {book.sampleExcerpt.trim() && (
                <Link className="studio-button outline knovera-sample-button" href={samplePath}>
                  <BookOpen size={16} aria-hidden="true" />
                  <span>Read Free Sample</span>
                </Link>
              )}
            </div>

            {storageError && <p className="studio-error" role="alert">{storageError}</p>}

            <div className="knovera-purchase-perks">
              <div className="knovera-perk">
                <Check size={14} className="knovera-perk-icon" aria-hidden="true" />
                <span>Instant download link + email access receipt</span>
              </div>
              <div className="knovera-perk">
                <Check size={14} className="knovera-perk-icon" aria-hidden="true" />
                <span>Lifetime free updates as new revisions publish</span>
              </div>
              <div className="knovera-perk">
                <Check size={14} className="knovera-perk-icon" aria-hidden="true" />
                <span>30-day money-back guarantee with immediate refund</span>
              </div>
            </div>

            <div className="knovera-purchase-actions-row">
              <button
                type="button"
                className="knovera-save-btn"
                aria-pressed={saved}
                onClick={() => toggleWishlist(book.id)}
              >
                <Bookmark
                  size={15}
                  fill={saved ? 'currentColor' : 'none'}
                  aria-hidden="true"
                />
                <span>{saved ? 'Saved in this browser' : 'Save for later'}</span>
              </button>
              <Link href="/help" className="knovera-help-link">
                <HelpCircle size={15} aria-hidden="true" />
                <span>Reading on your device</span>
              </Link>
            </div>
          </div>

          {/* Dual Edition Box Set Recommendation (Only when eligible) */}
          {isBundleEligible && (
            <div className="knovera-bundle-callout">
              <div className="knovera-bundle-callout-text">
                <span className="knovera-bundle-callout-kicker">LOOKING FOR THE COMPLETE PAIR?</span>
                <h4>The Complete Mastery &amp; Productivity Box Set</h4>
                <p>
                  Get both <em>The Focused Mind</em> and <em>Atomic Architectures</em> together for $29.99 (Save 22%).
                </p>
              </div>
              <Link
                href="/bundles/the-complete-mastery-bundle"
                className="studio-button outline knovera-bundle-callout-btn"
              >
                View Box Set &rarr;
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Editorial Content Sections */}
      <section className="knovera-editorial-grid">
        {/* Left main column: Narrative, Outcomes, Deliverables, Author Note */}
        <div className="knovera-editorial-main">
          {/* Author's Personal Note */}
          <div className="knovera-editorial-block knovera-author-note-card">
            <span className="studio-kicker">EDITORIAL MONOGRAPH</span>
            <h2>{authorNote.heading}</h2>
            <div className="knovera-note-content">
              <p>{authorNote.text}</p>
            </div>
            <div className="knovera-note-signoff">
              <span>— Knovera Editorial Press</span>
            </div>
          </div>

          {/* Full description */}
          <div className="knovera-editorial-block">
            <span className="studio-kicker">ABOUT THIS EDITION</span>
            <h2>The Framework &amp; Philosophy</h2>
            <div className="knovera-prose">
              <p>{book.fullDescription}</p>
            </div>
          </div>

          {/* Who It Is For */}
          <div className="knovera-editorial-block">
            <span className="studio-kicker">READER PROFILE</span>
            <h2>Who this book is written for</h2>
            <div className="knovera-audience-card">
              <p>{book.targetAudience}</p>
            </div>
          </div>

          {/* What's Included */}
          <div className="knovera-editorial-block">
            <span className="studio-kicker">PACKAGE CONTENTS</span>
            <h2>What you will receive</h2>
            <ul className="knovera-included-list">
              {book.whatsIncluded.map((item, index) => (
                <li key={index}>
                  <Check size={18} className="knovera-check-icon" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Sample Pages Excerpt Feature */}
          {book.sampleExcerpt.trim() && (
            <div className="knovera-editorial-block knovera-sample-card">
              <div className="knovera-sample-header">
                <div>
                  <span className="studio-kicker">SAMPLE EXCERPT</span>
                  <h2>A taste of the opening chapter</h2>
                </div>
                <Link href={samplePath} className="studio-button outline knovera-sample-open-btn">
                  Open in Reader &rarr;
                </Link>
              </div>
              <blockquote className="knovera-sample-blockquote">
                {book.sampleExcerpt.split(/\n\s*\n/).slice(0, 3).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </blockquote>
              <div className="knovera-sample-footer">
                <Link href={samplePath} className="knovera-sample-full-link">
                  Read complete free sample excerpt (no email required) &rarr;
                </Link>
              </div>
            </div>
          )}

          {/* Frequently Asked Questions */}
          <div className="knovera-editorial-block knovera-faq-section">
            <span className="studio-kicker">COMMONLY ASKED QUESTIONS</span>
            <h2>Reading, delivery, and guarantee</h2>
            <div className="knovera-faq-list">
              {FAQS.map((faq, index) => (
                <details key={index} className="knovera-faq-item">
                  <summary className="knovera-faq-question">
                    <span>{faq.q}</span>
                    <ChevronDown size={18} aria-hidden="true" className="knovera-faq-chevron" />
                  </summary>
                  <p className="knovera-faq-answer">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar: Table of Contents and Technical Specifications */}
        <aside className="knovera-editorial-sidebar">
          {/* Table of Contents */}
          <div className="knovera-sidebar-card">
            <span className="studio-kicker">STRUCTURE</span>
            <h3>Table of Contents</h3>
            <ol className="knovera-toc-list">
              {book.tableOfContents.map((chapter, index) => (
                <li key={index} className="knovera-toc-item">
                  <span className="knovera-toc-num">{String(index + 1).padStart(2, '0')}</span>
                  <span className="knovera-toc-title">{chapter.replace(/^\d+\.\s*/, '')}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Technical Edition Specifications */}
          <div className="knovera-sidebar-card">
            <span className="studio-kicker">SPECIFICATIONS</span>
            <h3>Edition &amp; File Details</h3>
            <dl className="knovera-specs-list">
              {book.pageCount && (
                <>
                  <dt>Length</dt>
                  <dd>{book.pageCount} typeset pages</dd>
                </>
              )}
              <dt>Edition</dt>
              <dd>{book.currentEdition.version}</dd>
              <dt>Release Date</dt>
              <dd>{book.currentEdition.releaseDate}</dd>
              <dt>Formats</dt>
              <dd>{formatsLabel(book.formats)}</dd>
              {book.isbn && (
                <>
                  <dt>ISBN</dt>
                  <dd>{book.isbn}</dd>
                </>
              )}
              <dt>Rights &amp; DRM</dt>
              <dd>DRM-Free Universal License</dd>
              <dt>Publisher</dt>
              <dd>Knovera Press</dd>
            </dl>
            {book.currentEdition.releaseNotes && (
              <p className="knovera-release-notes">
                <strong>Release Notes:</strong> {book.currentEdition.releaseNotes}
              </p>
            )}
          </div>

          {/* Direct Support & Reassurance */}
          <div className="knovera-sidebar-card knovera-support-card">
            <span className="studio-kicker">READER SUPPORT</span>
            <h4>Need assistance?</h4>
            <p>
              Have a question about Kindle transfer, tablet reading, or companion materials? We are
              here to assist you directly.
            </p>
            <Link href="/contact" className="knovera-support-link">
              Contact reader support &rarr;
            </Link>
          </div>
        </aside>
      </section>

      {/* Mobile Compact Sticky Purchase Bar */}
      <div
        className={`knovera-mobile-sticky-bar sm:hidden ${showStickyBar ? 'is-visible' : ''}`}
        aria-hidden={!showStickyBar}
      >
        <div className="knovera-sticky-inner">
          <div className="knovera-sticky-info">
            <span className="knovera-sticky-title">{book.title}</span>
            <span className="knovera-sticky-price">{money(book.price)} USD</span>
          </div>
          <button
            disabled={!available}
            className="studio-button knovera-sticky-btn"
            onClick={() => addToCart(book, formatsLabel(book.formats))}
            tabIndex={showStickyBar ? 0 : -1}
          >
            <ShoppingBag size={16} aria-hidden="true" />
            <span>Add to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
