'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Newsletter from './Newsletter';
import { ArrowUp } from 'lucide-react';

const groups = [
  {
    roman: 'I',
    title: 'The Collection',
    links: [
      ['The Focused Mind', '/books/the-focused-mind'],
      ['Atomic Architectures', '/books/atomic-architectures'],
      ['The Solo Architect', '/books/the-solo-architect'],
      ['The Young Explorer', '/books/explorers-mind-activities'],
      ['Mastery & Focus Bundle', '/bundles/the-complete-mastery-bundle'],
      ['Complete Catalogue', '/books'],
    ],
  },
  {
    roman: 'II',
    title: 'Reader Library',
    links: [
      ['My Account & Library', '/account/library'],
      ['Find a previous order', '/access'],
      ['Reading Device Guidance', '/help'],
      ['Send to Kindle Manual', '/help/kindle'],
      ['Contact support', '/contact'],
    ],
  },
  {
    roman: 'III',
    title: 'About & policies',
    links: [
      ['About Knovera', '/about'],
      ['Free Reading Resources', '/free-resources'],
      ['The Readers Circle', '/community'],
      ['Delivery & Refunds', '/legal/refunds'],
      ['Terms of License', '/legal/terms'],
      ['Privacy & Retention', '/legal/privacy'],
    ],
  },
];

export default function Footer() {
  const path = usePathname();
  if (['/account/login','/account/signup','/account/update-password'].includes(path)) return null;
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="colophon-footer" role="contentinfo">
      <div className="colophon-footer-inner">
        {/* Bibliographic Footnote: Return to the first page */}
        <div className="return-to-first-page-wrap">
          <button
            type="button"
            onClick={scrollToTop}
            className="return-to-first-page-btn"
            aria-label="Return to the first page"
          >
            <ArrowUp size={12} aria-hidden="true" className="shrink-0" />
            <span>Back to top</span>
          </button>
        </div>

        {/* The Dispatch Letter & Postal Requisition Slip */}
        <section className="dispatch-envelope-section" aria-label="Knovera newsletter">
          <div className="dispatch-letter-left">
            <div className="dispatch-eyebrow">
              <span className="dispatch-fleuron">✦</span>
              <span>KNOVERA · READING NOTES</span>
            </div>

            <h2 className="dispatch-headline">
              Something good for <span className="headline-italic">your inbox.</span>
            </h2>

            <p className="dispatch-body">
              Discover your next read, explore new arrivals, and find digital tools for everyday life. Thoughtfully chosen, delivered to your inbox.
            </p>

            <div className="dispatch-endorsement">
              <span className="endorsement-mark">✦</span>
              <span>Ebooks first. Curiosity always.</span>
            </div>
          </div>

          <div className="dispatch-slip-right">
            <Newsletter />
          </div>
        </section>

        {/* Directory Structured as Table of Contents */}
        <div className="colophon-directory">
          <div className="colophon-brand-block">
            <Link href="/" className="colophon-brand-title">
              Knovera
            </Link>
            <p className="colophon-brand-mission">
              Your store for ebooks and useful digital goods. Explore the collection, try a sample, and keep your purchases together in your library.
            </p>
            <div className="colophon-brand-badges">
              <span>DIGITAL GOODS</span>
              <span className="badge-sep">·</span>
              <span>EBOOKS &amp; MORE</span>
              <span className="badge-sep">·</span>
              <span>YOUR PERSONAL LIBRARY</span>
            </div>
          </div>

          <div className="colophon-toc-columns">
            {groups.map(group => (
              <div key={group.title} className="colophon-toc-group">
                <h3 className="colophon-toc-heading">
                  <span className="toc-roman">{group.roman}.</span> {group.title}
                </h3>
                <ul className="colophon-toc-list">
                  {group.links.map(([label, href]) => (
                    <li key={href}>
                      <Link href={href} className="colophon-toc-link">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Final Colophon Imprint Statement */}
        <div className="colophon-imprint-bar">
          <div className="colophon-imprint-text">
            <span>Made for curious minds</span>
            <span className="colophon-sep">✦</span>
            <span>Digital products. Real possibilities.</span>
            <span className="colophon-sep">✦</span>
            <span><Link href="/contact">Contact support</Link></span>
          </div>
          <div className="colophon-copyright">
            <span>© 2026 KNOVERA · ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
