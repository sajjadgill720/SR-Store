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
  ChevronDown,
  Check,
  ArrowRight,
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
    a: 'Please review our published refund policy at /legal/refunds before purchasing. For help with an order or download, contact support with your order number.',
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

  // Compute drop cap letter and remaining description text
  const descText = book.fullDescription || book.shortDescription || '';
  const firstLetter = descText.charAt(0);
  const restOfText = descText.slice(1);

  return (
    <div className="knovera-detail-page">
      {/* Running Nav Breadcrumb */}
      <div className="book-spread-nav">
        <Link className="book-nav-back" href={back}>
          <ArrowLeft size={14} aria-hidden="true" className="shrink-0" />
          <span>Return to Catalogue</span>
        </Link>
        <div className="book-nav-folio" aria-hidden="true">
          <span>FOLIO § {book.isbn ? book.isbn.slice(-4) : '0042'}</span>
          <span className="book-nav-bullet">·</span>
          <span>{book.category.toUpperCase()}</span>
        </div>
      </div>

      {/* DOUBLE-PAGE SPREAD CONTAINER */}
      <article className="book-open-spread" aria-labelledby="book-title">
        {/* LEFT PAGE: THE PLATE */}
        <section className="book-spread-left" aria-label="Frontispiece Plate">
          <div className="book-plate-wrapper">
            <div className="book-plate-frame">
              <BookCover
                src={book.coverImage}
                title={book.title}
                priority
                size="feature"
                isSaved={saved}
              />
            </div>

            {/* Bibliographic Imprint Statement under Frontispiece */}
            <div className="book-plate-imprint">
              <div className="imprint-header">
                <span className="imprint-press">KNOVERA · DIGITAL STORE</span>
                <span className="imprint-version">{book.currentEdition.version}</span>
              </div>
              <p className="imprint-statement">
                Archival digital impression typeset in Cormorant Garamond and DM Sans.
                Released without digital rights management restrictions (DRM-Free).
              </p>
              <div className="imprint-specs-row">
                <span>
                  <Download size={12} aria-hidden="true" className="shrink-0" /> {formatsLabel(book.formats)}
                </span>
                <span>
                  <Smartphone size={12} aria-hidden="true" className="shrink-0" /> Universal Reader
                </span>
                <span>
                  <ShieldCheck size={12} aria-hidden="true" className="shrink-0" /> Lifetime Updates
                </span>
              </div>
            </div>

            {book.sampleExcerpt.trim() && (
              <Link className="book-sample-plate-btn" href={samplePath}>
                <BookOpen size={15} aria-hidden="true" className="shrink-0" />
                <span>Read a free sample &rarr;</span>
              </Link>
            )}
          </div>
        </section>

        {/* CENTRAL SPREAD GUTTER / FOLD */}
        <div className="book-spread-gutter" aria-hidden="true">
          <div className="gutter-stitch-line" />
        </div>

        {/* RIGHT PAGE: THE TYPESET TEXT & ORDER SLIP */}
        <section className="book-spread-right" aria-label="Product details and purchase options">
          <div className="book-typeset-content">
            <div className="book-typeset-kicker">
              <span>{book.category.toUpperCase()}</span>
              <span className="kicker-sep">/</span>
              <span>{book.productType === 'printable' ? 'PRINTABLE WORKBOOK' : 'DIGITAL EBOOK'}</span>
            </div>

            <h1 id="book-title" className="book-typeset-title">
              {book.title}
            </h1>

            {book.subtitle && (
              <p className="book-typeset-subtitle">{book.subtitle}</p>
            )}

            <div className="book-typeset-byline">
              <span className="byline-author">By {book.author}</span>
              <span className="byline-bullet">❦</span>
              <span className="byline-imprint">Digital edition</span>
            </div>

            <div className="hairline-divider" aria-hidden="true" />

            {/* Opening Text with Traditional 3-Line Drop Cap */}
            <div className="book-dropcap-prose">
              <span className="typeset-dropcap">{firstLetter}</span>
              <p className="dropcap-lead-paragraph">{restOfText}</p>
            </div>

            {/* Marginalia Note in Right Margin */}
            <aside className="book-marginal-note" aria-label="Marginal Commentary">
              <span className="marginal-anchor" aria-hidden="true">¹</span>
              <p className="marginal-text">
                <em>On intentional craft:</em> A book is not a feed to consume in haste,
                but an intellectual room in which to linger until thought clears.
              </p>
            </aside>

            {/* ACQUISITION ORDER SLIP */}
            <div ref={purchasePanelRef} className="book-order-slip">
              <div className="order-slip-perforation" aria-hidden="true" />
              
              <div className="order-slip-head">
                <div className="order-slip-kicker">
                  <span>PRODUCT REF. {book.id.toUpperCase().slice(-6)}</span>
                  <span className="slip-fleuron">✦</span>
                </div>
                <div className="order-slip-pricing">
                  <span className="order-slip-amount">{money(book.price)}</span>
                  <span className="order-slip-cur">USD</span>
                  {book.originalPrice && (
                    <span className="order-slip-strike">{money(book.originalPrice)}</span>
                  )}
                </div>
              </div>

              <div className="order-slip-meta">
                <span className="order-slip-format-tag">{formatsLabel(book.formats)}</span>
                <span className="order-slip-delivery">Immediate Digital Delivery · DRM-Free</span>
              </div>

              <div className="order-slip-actions">
                <button
                  disabled={!available}
                  className="book-acquisition-btn"
                  onClick={() => addToCart(book, formatsLabel(book.formats))}
                  aria-label={`Add ${book.title} to cart for ${money(book.price)}`}
                >
                  <span className="btn-main-label">
                    {available
                      ? book.productType === 'printable'
                        ? 'Add printable to cart'
                        : 'Add ebook to cart'
                      : 'Currently unavailable'}
                  </span>
                  <span className="btn-price-tag">
                    {money(book.price)} <small>USD</small>
                  </span>
                </button>

                <button
                  type="button"
                  className="book-ribbon-save-btn"
                  aria-pressed={saved}
                  onClick={() => toggleWishlist(book.id)}
                  aria-label={saved ? 'Remove bookmark' : 'Save for later'}
                >
                  <Bookmark
                    size={16}
                    fill={saved ? 'currentColor' : 'none'}
                    aria-hidden="true"
                    className="shrink-0"
                  />
                  <span>{saved ? 'Saved for later' : 'Save for later'}</span>
                </button>
              </div>

              {storageError && <p className="studio-error" role="alert">{storageError}</p>}

              <ul className="order-slip-guarantees">
                <li>
                  <span className="guarantee-dot">·</span>
                  <span>Instant download links provided upon confirmation &amp; dispatched by email receipt</span>
                </li>
                <li>
                  <span className="guarantee-dot">·</span>
                  <span>Perpetual DRM-free license with complimentary future errata revisions</span>
                </li>
                <li>
                  <span className="guarantee-dot">·</span>
                  <span>Universal file formats: open in Kindle, Apple Books, Kobo, or standard PDF viewer</span>
                </li>
              </ul>
            </div>

            {/* Paired Two-Volume Slipcase Callout */}
            {isBundleEligible && (
              <div className="book-paired-slipcase">
                <div className="paired-slipcase-info">
                  <span className="studio-kicker">TWO-VOLUME BOXED SET</span>
                  <h4>The Complete Mastery &amp; Productivity Pair</h4>
                  <p>
                    Explore <em>The Focused Mind</em> and <em>Atomic Architectures</em> together. Each ebook is priced individually; see the set for the combined total.
                  </p>
                </div>
                <Link
                  href="/bundles/the-complete-mastery-bundle"
                  className="studio-button outline paired-slipcase-btn"
                >
                  Explore reading set <ArrowRight size={14} className="shrink-0" />
                </Link>
              </div>
            )}

            {/* THE COLOPHON (Signature Bibliographic Definition List) */}
            <div className="book-colophon-block">
              <div className="colophon-title-bar">
                <span className="colophon-kicker">BIBLIOGRAPHIC COLOPHON</span>
                <span className="colophon-anchor">P. {book.pageCount || 240}</span>
              </div>
              <dl className="colophon-dl">
                <div className="colophon-row">
                  <dt>Typefaces</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>Cormorant Garamond &amp; DM Sans</dd>
                </div>
                <div className="colophon-row">
                  <dt>Format</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>Reflowable EPUB 3 &amp; 300 DPI Archival PDF</dd>
                </div>
                <div className="colophon-row">
                  <dt>Edition Statement</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>{book.currentEdition.version} ({book.currentEdition.releaseDate})</dd>
                </div>
                <div className="colophon-row">
                  <dt>Preservation</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>100% DRM-Free Universal Lifetime License</dd>
                </div>
                {book.pageCount && (
                  <div className="colophon-row">
                    <dt>Typeset Length</dt>
                    <span className="dot-leader-fill" aria-hidden="true" />
                    <dd>{book.pageCount} Pages</dd>
                  </div>
                )}
                {book.isbn && (
                  <div className="colophon-row">
                    <dt>Catalog Identifier</dt>
                    <span className="dot-leader-fill" aria-hidden="true" />
                    <dd>{book.isbn}</dd>
                  </div>
                )}
                <div className="colophon-row">
                  <dt>Imprint</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>Knovera digital store</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </article>

      {/* EXTENDED EDITORIAL SECTIONS (Author's Note, TOC, Package Contents, FAQs) */}
      <section className="knovera-editorial-grid">
        <div className="knovera-editorial-main">
          {/* Author's Monograph */}
          <div className="knovera-editorial-block knovera-author-note-card">
            <span className="studio-kicker">EDITORIAL MONOGRAPH</span>
            <h2>{authorNote.heading}</h2>
            <div className="knovera-note-content">
              <p>{authorNote.text}</p>
            </div>
            <div className="knovera-note-signoff">
              <span>— Knovera</span>
            </div>
          </div>

          {/* Praise & Endorsements */}
          {book.praiseList && book.praiseList.length > 0 && (
            <div className="knovera-editorial-block sp-praise-block">
              <div className="sp-section-kicker">
                <span className="sp-dash" aria-hidden="true" />
                <span className="sp-kicker-text">PRAISE &amp; ENDORSEMENTS</span>
              </div>
              <div className="sp-praise-grid">
                {book.praiseList.map((praise, i) => (
                  <div key={i} className="sp-praise-card">
                    <blockquote className="sp-praise-quote">
                      &ldquo;{praise.quote}&rdquo;
                    </blockquote>
                    <div className="sp-praise-author">
                      <span className="sp-praise-name">{praise.author}</span>
                      <span className="sp-praise-role">{praise.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audience Reader Profile */}
          <div className="knovera-editorial-block">
            <span className="studio-kicker">READER PROFILE</span>
            <h2>Who this book is written for</h2>
            <div className="knovera-audience-card">
              <p>{book.targetAudience}</p>
            </div>
          </div>

          {/* Package Contents */}
          <div className="knovera-editorial-block">
            <span className="studio-kicker">PACKAGE CONTENTS</span>
            <h2>What you will receive</h2>
            <ul className="knovera-included-list">
              {book.whatsIncluded.map((item, index) => (
                <li key={index}>
                  <Check size={16} className="knovera-check-icon shrink-0" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Frequently Asked Questions */}
          <div className="knovera-editorial-block knovera-faq-section">
            <span className="studio-kicker">COMMONLY ASKED QUESTIONS</span>
            <h2>Reading, delivery, and support</h2>
            <div className="knovera-faq-list">
              {FAQS.map((faq, index) => (
                <details key={index} className="knovera-faq-item">
                  <summary className="knovera-faq-question">
                    <span>{faq.q}</span>
                    <ChevronDown size={17} aria-hidden="true" className="knovera-faq-chevron shrink-0" />
                  </summary>
                  <p className="knovera-faq-answer">{faq.a}{index===1 && <> <Link href="/help/kindle">Open the Kindle guide →</Link></>}{index===2 && <> <Link href="/account/library">Open your library →</Link></>}{index===4 && <> <Link href="/legal/refunds">Read the refund policy →</Link></>}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar: Table of Contents & Specifications */}
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
            <span className="studio-kicker">EDITION ARCHITECTURE</span>
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
              <dt>Store</dt>
              <dd>Knovera</dd>
            </dl>
          </div>

          {/* Reader Support Card */}
          <div className="knovera-sidebar-card knovera-support-card">
            <span className="studio-kicker">READER SUPPORT</span>
            <h4>Need assistance?</h4>
            <p>
              Have questions regarding Send-to-Kindle transfer, tablet reading, or companion files?
              Our support team is ready to help.
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
            <ShoppingBag size={15} aria-hidden="true" className="shrink-0" />
            <span>Add to cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
