'use client';
import { Suspense, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, BookOpen } from 'lucide-react';
import { useCart } from '../../lib/store/cart';

const tableOfContents = [
  { roman: 'I', href: '/books', label: 'Catalogue' },
  { roman: 'II', href: '/community', label: 'Community' },
  { roman: 'III', href: '/about', label: 'Colophon' },
  { roman: 'IV', href: '/account/library', label: 'Library' },
];

function getPageMetadata(pathname: string) {
  if (pathname === '/') return { section: 'Frontispiece & Imprint', folio: 'p. 001' };
  if (pathname === '/books') return { section: 'The Catalogue', folio: 'p. 014' };
  if (pathname.startsWith('/books/')) return { section: 'Volume Detail', folio: 'p. 042' };
  if (pathname.startsWith('/community')) return { section: "The Reader's Circle", folio: 'p. 068' };
  if (pathname === '/cart') return { section: 'The Order Ledger', folio: 'p. 088' };
  if (pathname === '/checkout') return { section: 'Acquisition & License', folio: 'p. 092' };
  if (pathname.startsWith('/account')) return { section: 'Personal Library', folio: 'p. 104' };
  if (pathname === '/about') return { section: 'Imprint History', folio: 'p. 118' };
  if (pathname.startsWith('/help')) return { section: 'Reading Guidance', folio: 'p. 132' };
  if (pathname.startsWith('/access')) return { section: 'Purchase Retrieval', folio: 'p. 140' };
  return { section: 'Knovera Press', folio: 'p. 050' };
}

function Navigation() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { cartCount } = useCart();
  const active = (href: string) => path === href || (href !== '/' && path.startsWith(href + '/'));
  const { section, folio } = getPageMetadata(path);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  // Handle ESC key
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        trigger.current?.focus();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className="print-running-head studio-header hairline-bottom">
      {/* 1. TOP RUNNING HEAD RULE */}
      <div className="running-head-bar">
        <div className="running-head-inner">
          <Link href="/" className="running-head-left" aria-label="Knovera Press — Home">
            <span className="running-head-brand">KNOVERA PRESS</span>
            <span className="running-head-meta hidden sm:inline">· EST. 2026</span>
          </Link>

          <div className="running-head-center">
            <span className="running-head-section">{section}</span>
          </div>

          <div className="running-head-right">
            <span className="running-head-folio" aria-label={`Folio page number ${folio}`}>{folio}</span>
            <span className="running-head-divider" aria-hidden="true">·</span>
            <Link
              href="/cart"
              className="running-head-cart"
              aria-label={`Order slip with ${cartCount} ${cartCount === 1 ? 'edition' : 'editions'}`}
            >
              <span>[ Cart</span>
              <span className="running-head-cart-num">{cartCount.toString().padStart(2, '0')}</span>
              <span>]</span>
            </Link>

            <button
              ref={trigger}
              className="running-head-trigger sm:hidden"
              aria-label={menuOpen ? 'Close index menu' : 'Open table of contents'}
              aria-controls="print-mobile-toc"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. TABLE OF CONTENTS BAR (Desktop dot-leader navigation) */}
      <nav className="running-head-toc hidden sm:block" aria-label="Table of Contents navigation">
        <div className="running-head-toc-inner">
          {tableOfContents.map((item, idx) => (
            <div key={item.href} className="running-head-toc-item">
              <Link
                href={item.href}
                className={`running-head-toc-link ${active(item.href) ? 'is-active' : ''}`}
                aria-current={active(item.href) ? 'page' : undefined}
              >
                <span className="running-head-roman">{item.roman}.</span>
                <span className="running-head-label">{item.label}</span>
              </Link>
              {idx < tableOfContents.length - 1 && (
                <span className="running-head-leader" aria-hidden="true">············</span>
              )}
            </div>
          ))}
          <div className="running-head-toc-spacer" />
          <div className="running-head-toc-utility">
            <Link href="/access" className="running-head-util-link">Access</Link>
            <span className="running-head-util-divider">/</span>
            <Link href="/help" className="running-head-util-link">Help</Link>
          </div>
        </div>
      </nav>

      {/* 3. MOBILE FOLIO DRAWER */}
      {menuOpen && (
        <nav id="print-mobile-toc" className="print-mobile-drawer hairline-top" aria-label="Mobile Table of Contents">
          <div className="print-mobile-drawer-inner">
            <span className="print-mobile-eyebrow">TABLE OF CONTENTS</span>
            <ol className="print-mobile-list">
              {tableOfContents.map(item => (
                <li key={item.href} className="print-mobile-item">
                  <Link
                    href={item.href}
                    className={`print-mobile-link ${active(item.href) ? 'is-active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active(item.href) ? 'page' : undefined}
                  >
                    <span className="print-mobile-roman">{item.roman}.</span>
                    <span className="print-mobile-label">{item.label}</span>
                    <span className="print-mobile-dots" aria-hidden="true">························</span>
                  </Link>
                </li>
              ))}
            </ol>
            <div className="print-mobile-secondary">
              <Link href="/access" className="print-mobile-sublink" onClick={() => setMenuOpen(false)}>
                Find previous orders
              </Link>
              <Link href="/help" className="print-mobile-sublink" onClick={() => setMenuOpen(false)}>
                Device &amp; Kindle reading guide
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

export default function Header() {
  return (
    <Suspense
      fallback={
        <header className="studio-header studio-header-placeholder">
          <div className="studio-header-inner">
            <Link href="/" className="studio-brand">
              <span className="studio-brand-name">Knovera</span>
            </Link>
          </div>
        </header>
      }
    >
      <Navigation />
    </Suspense>
  );
}
