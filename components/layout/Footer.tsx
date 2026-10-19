'use client';

import Link from 'next/link';
import Newsletter from './Newsletter';
import { Star, ShieldCheck, Mail, Smartphone, ArrowUp, Sparkles } from 'lucide-react';

const groups = [
  {
    title: 'The Collection',
    links: [
      ['The Focused Mind', '/books/the-focused-mind'],
      ['Atomic Architectures', '/books/atomic-architectures'],
      ['The Solo Architect', '/books/the-solo-architect'],
      ['The Young Explorer', '/books/explorers-mind-activities'],
      ['Mastery & Focus Bundle', '/bundles/the-complete-mastery-bundle'],
      ['All Editions', '/books'],
    ],
  },
  {
    title: 'Your Books',
    links: [
      ['My Library', '/account/library'],
      ['Recover a purchase', '/access'],
      ['Device & reading guidance', '/help'],
      ['Send to Kindle guide', '/help/kindle'],
      ['Contact author support', '/contact'],
    ],
  },
  {
    title: 'Imprint & Integrity',
    links: [
      ['About Knovera Press', '/about'],
      ['Free reader resources', '/free-resources'],
      ['Reader community', '/community'],
      ['Delivery & refund policy', '/legal/refunds'],
      ['Terms of license', '/legal/terms'],
      ['Privacy policy', '/legal/privacy'],
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
    <footer className="studio-footer" role="contentinfo">
      <div className="studio-footer-inner">
        {/* Subtle Top-Left Back to Top */}
        <div className="amazon-back-to-top-wrap mb-4 flex justify-start">
          <button
            type="button"
            onClick={scrollToTop}
            className="amazon-back-to-top-link inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-900 text-[13px] font-medium transition-colors bg-transparent border-0 cursor-pointer p-0"
            aria-label="Back to top"
          >
            <ArrowUp size={13} aria-hidden="true" className="shrink-0" />
            <span>Back to top</span>
          </button>
        </div>

        {/* Editorial Dispatch Card (Matching reference design) */}
        <section className="amazon-footer-dispatch-card studio-footer-invitation" aria-label="Editorial dispatch invitation">
          <div className="amazon-dispatch-main">
            <div className="amazon-dispatch-badge inline-flex items-center gap-2 text-[11px] font-bold tracking-widest text-stone-600 uppercase mb-5">
              <Sparkles size={12} className="amazon-kicker-sparkle text-amber-600 shrink-0" aria-hidden="true" />
              <span className="amazon-kicker-brand font-extrabold text-stone-900">KNOVERA</span>
              <span className="amazon-badge-divider text-stone-400">·</span>
              <span className="amazon-kicker-text font-semibold text-stone-600">EDITORIAL DISPATCH</span>
            </div>

            <p className="amazon-dispatch-desc text-stone-700 text-[15px] md:text-[16px] leading-relaxed max-w-[44ch] mb-6">
              Occasional dispatches on cognitive focus, architectural leverage,
              and systems design. Delivered directly to your inbox without algorithmic noise.
            </p>

            {/* Star Rating & Social Proof */}
            <div className="amazon-dispatch-rating flex items-center gap-2 flex-wrap text-sm">
              <div className="amazon-stars inline-flex items-center gap-0.5 text-amber-500" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="amazon-star-fill text-amber-500 fill-amber-500 shrink-0" />
                ))}
              </div>
              <span className="amazon-rating-score font-bold text-stone-900 text-sm">4.9 out of 5</span>
              <span className="amazon-rating-count text-stone-500 text-sm">· 4,200+ thoughtful readers</span>
            </div>
          </div>

          {/* Right White Card */}
          <div className="amazon-dispatch-action-box bg-white rounded-[24px] p-7 md:p-9 shadow-lg shadow-stone-900/5 border border-stone-200/60">
            <div className="amazon-action-box-inner">
              <h3 className="amazon-box-title font-serif text-2xl md:text-3xl font-normal text-stone-900 tracking-tight mb-1.5">Join the Private Dispatch</h3>
              <p className="amazon-box-subtitle text-stone-500 text-sm leading-normal mb-5">
                Curated essays, edition releases &amp; Kindle reading notes.
              </p>

              <Newsletter />
            </div>
          </div>
        </section>

        <div className="studio-footer-links">
          <div className="studio-footer-brand">
            <Link href="/" className="studio-footer-brand-title">
              Knovera
            </Link>
            <p className="studio-footer-brand-desc">
              The independent publishing press of Knovera. Distinctive digital editions designed
              for lifelong reference, deep attention, and deliberate craft.
            </p>
            <div className="studio-footer-pill">
              <span>DRM-Free</span>
              <span>·</span>
              <span>Universal EPUB &amp; PDF</span>
              <span>·</span>
              <span>Direct Support</span>
            </div>
          </div>

          {groups.map(group => (
            <div key={group.title} className="studio-footer-col">
              <h3>{group.title}</h3>
              <ul>
                {group.links.map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="studio-footer-bottom">
          <span>© 2026 Knovera Press · Distinctive Digital Editions</span>
          <span>Typeset with care in Cormorant Garamond &amp; DM Sans</span>
        </div>
      </div>
    </footer>
  );
}
