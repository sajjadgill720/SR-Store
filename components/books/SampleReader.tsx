'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useBrowserSearch } from '@/lib/use-browser-search';
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  X,
  ShoppingBag,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import type { Book } from '../../lib/types';
import { sampleSections, money, formatsLabel } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';

export default function SampleReader({ book }: { book: Book }) {
  const sections = sampleSections(book.sampleExcerpt || '');
  const from = useBrowserSearch().get('from');
  const bookPath = `/books/${book.slug}${
    from && /^\/books(?:\?|$)/.test(from) ? '?from=' + encodeURIComponent(from) : ''
  }`;

  const [position, setPosition] = useState(0);
  const [size, setSize] = useState(19);
  const [theme, setTheme] = useState<'paper' | 'white' | 'sepia' | 'dark'>('paper');
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { addToCart } = useCart();

  const change = useCallback(
    (next: number) => {
      const target = Math.max(0, Math.min(next, sections.length - 1));
      setPosition(target);
      requestAnimationFrame(() => {
        titleRef.current?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    },
    [sections.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        document.querySelector('dialog[open]') ||
        ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)
      ) {
        return;
      }
      if (event.key === 'ArrowRight' && position < sections.length - 1) {
        event.preventDefault();
        change(position + 1);
      }
      if (event.key === 'ArrowLeft' && position > 0) {
        event.preventDefault();
        change(position - 1);
      }
      if (event.key === 'Escape') {
        window.location.assign(bookPath);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [position, sections.length, change, bookPath]);

  // Set reader attribute on body for chrome styling
  useEffect(() => {
    document.body.setAttribute('data-reader', 'true');
    return () => {
      document.body.removeAttribute('data-reader');
    };
  }, []);

  const progressPercent =
    sections.length > 0 ? Math.round(((position + 1) / sections.length) * 100) : 100;

  return (
    <div className={`sample-reader reader-${theme}`}>
      {/* Top Reading Progress Bar */}
      <div
        className="knovera-reader-progress-track"
        role="progressbar"
        aria-valuenow={progressPercent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      >
        <div
          className="knovera-reader-progress-fill"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Reader Toolbar */}
      <header className="reader-toolbar" role="banner">
        <Link
          className="studio-icon-button knovera-reader-close"
          href={bookPath}
          aria-label="Close sample and return to book details"
        >
          <X size={20} aria-hidden="true" />
        </Link>

        <div className="knovera-reader-header-meta">
          <span className="studio-kicker">FREE SAMPLE EXCERPT</span>
          <span className="reader-toolbar-title">{book.title}</span>
        </div>

        <div className="knovera-reader-header-actions">
          <Link href={bookPath} className="studio-button outline knovera-reader-view-btn">
            View Book
          </Link>
        </div>
      </header>

      {/* Reader Customization Settings */}
      <div className="reader-settings" aria-label="Reading display preferences">
        <div role="group" aria-label="Adjust font size" className="knovera-size-group">
          <button
            className="studio-icon-button"
            aria-label="Decrease font size"
            disabled={size <= 16}
            onClick={() => setSize(s => Math.max(16, s - 2))}
          >
            <Minus size={15} aria-hidden="true" />
          </button>
          <span className="knovera-size-label" aria-live="polite">
            {size}px
          </span>
          <button
            className="studio-icon-button"
            aria-label="Increase font size"
            disabled={size >= 26}
            onClick={() => setSize(s => Math.min(26, s + 2))}
          >
            <Plus size={15} aria-hidden="true" />
          </button>
        </div>

        <div className="knovera-theme-group">
          <label htmlFor="theme-select" className="knovera-theme-label">
            Theme
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={e => setTheme(e.target.value as typeof theme)}
            className="knovera-theme-select"
          >
            <option value="paper">Ivory Paper</option>
            <option value="white">Pure White</option>
            <option value="sepia">Warm Sepia</option>
            <option value="dark">Charcoal Dark</option>
          </select>
        </div>
      </div>

      {/* Main Reading Canvas */}
      <main className="reader-page" style={{ fontSize: `${size}px` }}>
        <div className="knovera-reader-title-area">
          <span className="studio-kicker">{book.author}</span>
          <h1 ref={titleRef} tabIndex={-1} className="knovera-reader-h1">
            {book.title}
          </h1>
          <div className="knovera-reader-meta-row">
            <span className="reader-position" aria-live="polite">
              Section {position + 1} of {sections.length || 1}
            </span>
            <span className="knovera-reader-note">DRM-Free Sample · No Email Required</span>
          </div>
        </div>

        {/* Text Excerpt */}
        {sections.length > 0 ? (
          <article className="reader-excerpt" aria-label="Book excerpt content">
            {sections[position].split(/\n\s*\n/).map((paragraph, index) => (
              <p
                key={`${position}-${index}`}
                className={position === 0 && index === 0 ? 'knovera-lead-paragraph' : ''}
              >
                {paragraph}
              </p>
            ))}
          </article>
        ) : (
          <div className="knovera-reader-empty" role="status">
            <BookOpen size={36} aria-hidden="true" />
            <h2>Sample in preparation</h2>
            <p>
              A digital preview excerpt for this edition is currently being formatted. You can view
              the full table of contents and deliverables on the book detail page.
            </p>
            <Link href={bookPath} className="studio-button">
              Return to Book Details
            </Link>
          </div>
        )}

        {/* Pagination Controls */}
        {sections.length > 1 && (
          <nav className="reader-pagination" aria-label="Sample page navigation">
            <button
              className="studio-button outline knovera-page-btn"
              disabled={position === 0}
              onClick={() => change(position - 1)}
              aria-label="Previous section"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Previous</span>
            </button>

            <span className="knovera-pagination-counter" aria-live="polite">
              {position + 1} / {sections.length}
            </span>

            <button
              className="studio-button outline knovera-page-btn"
              disabled={position >= sections.length - 1}
              onClick={() => change(position + 1)}
              aria-label="Next section"
            >
              <span>Next</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </nav>
        )}

        {/* End of Sample Decision Point */}
        {position >= sections.length - 1 && sections.length > 0 && (
          <section className="knovera-reader-conclusion" aria-labelledby="conclusion-heading">
            <div className="knovera-conclusion-card">
              <span className="studio-kicker">END OF FREE SAMPLE</span>
              <h2 id="conclusion-heading" className="knovera-conclusion-title">
                Continue reading the complete edition.
              </h2>
              <p className="knovera-conclusion-desc">
                Includes universal EPUB and printable typeset PDF editions, plus all companion worksheets
                and free lifetime updates.
              </p>

              <div className="knovera-conclusion-meta">
                <span className="knovera-conclusion-price">{money(book.price)} USD</span>
                <span className="knovera-conclusion-formats">
                  {formatsLabel(book.formats)} · DRM-Free Universal License
                </span>
              </div>

              <div className="knovera-conclusion-actions">
                <button
                  disabled={!book.isInStock || book.rightsStatus !== 'wide'}
                  className="studio-button knovera-conclusion-buy"
                  onClick={() => addToCart(book)}
                >
                  <ShoppingBag size={17} aria-hidden="true" />
                  <span>Add Digital Edition to Cart · {money(book.price)}</span>
                </button>
                <Link href={bookPath} className="studio-button outline">
                  View Full Table of Contents
                </Link>
              </div>

              <div className="knovera-conclusion-guarantee">
                <CheckCircle size={15} aria-hidden="true" />
                <span>30-Day Money-Back Guarantee · Direct from Author S.R. Rehman</span>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Reader Bottom Bar */}
      <footer className="reader-bottom">
        <Link href={bookPath} className="knovera-reader-return">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Return to book page</span>
        </Link>
        <span className="knovera-reader-keyboard-hint">
          Keyboard navigation: Use &larr; and &rarr; arrow keys to turn pages, Esc to exit.
        </span>
      </footer>
    </div>
  );
}
