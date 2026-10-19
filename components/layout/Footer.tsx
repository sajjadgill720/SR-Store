'use client';

import Link from 'next/link';
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
      ['Retrieve an Acquisition', '/access'],
      ['Reading Device Guidance', '/help'],
      ['Send to Kindle Manual', '/help/kindle'],
      ['Editorial Desk Support', '/contact'],
    ],
  },
  {
    roman: 'III',
    title: 'Imprint & Integrity',
    links: [
      ['About Knovera Press', '/about'],
      ['Free Reading Resources', '/free-resources'],
      ['The Readers Circle', '/community'],
      ['Delivery & Refunds', '/legal/refunds'],
      ['Terms of License', '/legal/terms'],
      ['Privacy & Retention', '/legal/privacy'],
    ],
  },
];

export default function Footer() {
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
            <span>↑ Return to the first page</span>
          </button>
        </div>

        {/* The Dispatch Letter & Postal Requisition Slip */}
        <section className="dispatch-envelope-section" aria-label="Editorial dispatch correspondence">
          <div className="dispatch-letter-left">
            <div className="dispatch-eyebrow">
              <span className="dispatch-fleuron">❦</span>
              <span>KNOVERA PRESS · DISPATCH SERVICE · ISSUE 28</span>
            </div>

            <h2 className="dispatch-headline">
              Notes from <span className="headline-italic">the press.</span>
            </h2>

            <p className="dispatch-body">
              Occasional monographs on cognitive focus, architectural leverage, and systems craft.
              Delivered directly to your inbox without algorithmic noise or commercial dilution.
            </p>

            <div className="dispatch-endorsement">
              <span className="endorsement-mark">❦</span>
              <span>Over 4,200 thoughtful craftspeople subscribe to this private correspondence.</span>
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
              Knovera Press
            </Link>
            <p className="colophon-brand-mission">
              An independent publishing press dedicated to books of exceptional typography and deep attention.
              All digital editions are delivered DRM-free in open, permanent formats.
            </p>
            <div className="colophon-brand-badges">
              <span>100% DRM-FREE</span>
              <span className="badge-sep">·</span>
              <span>UNIVERSAL EPUB &amp; PDF</span>
              <span className="badge-sep">·</span>
              <span>PERPETUAL LICENSE</span>
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
            <span>Typeset in Cormorant Garamond &amp; DM Sans</span>
            <span className="colophon-sep">❦</span>
            <span>Printed digitally on archival web standards</span>
            <span className="colophon-sep">❦</span>
            <span>Imprint No. 42 · San Francisco &amp; London</span>
          </div>
          <div className="colophon-copyright">
            <span>© 2026 KNOVERA PRESS · ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
