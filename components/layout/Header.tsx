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
    <header className="print-running-head studio-header">
      <div className="running-head-bar">
        <div className="running-head-inner">
          <Link href="/" className="running-head-brand-link" aria-label="KNOVERA — Home">
            <span className="running-head-brand">KNOVERA</span>
          </Link>

          {/* Desktop Single-Tier Navigation matching reference design */}
          <nav className="running-head-nav hidden md:flex" aria-label="Primary navigation">
            <Link
              href="/books"
              className={`running-head-link ${active('/books') ? 'is-active' : ''}`}
              aria-current={active('/books') ? 'page' : undefined}
            >
              <span className="running-head-numeral">i.</span>
              <span className="running-head-title">Ebooks</span>
            </Link>

            <Link
              href="/community"
              className={`running-head-link ${active('/community') ? 'is-active' : ''}`}
              aria-current={active('/community') ? 'page' : undefined}
            >
              <span className="running-head-numeral">ii.</span>
              <span className="running-head-title">Reader Community</span>
            </Link>

            <Link
              href="/about"
              className={`running-head-link ${active('/about') || active('/colophon') ? 'is-active' : ''}`}
              aria-current={active('/about') || active('/colophon') ? 'page' : undefined}
            >
              <span className="running-head-numeral">iii.</span>
              <span className="running-head-title">Colophon</span>
            </Link>

            <Link
              href="/account/library"
              className={`running-head-link ${active('/account/library') ? 'is-active' : ''}`}
              aria-current={active('/account/library') ? 'page' : undefined}
            >
              <span className="running-head-numeral">iv.</span>
              <span className="running-head-title">Library</span>
            </Link>

            <Link
              href="/newsletter"
              className={`running-head-link ${active('/newsletter') ? 'is-active' : ''}`}
              aria-current={active('/newsletter') ? 'page' : undefined}
            >
              <span className="running-head-numeral">v.</span>
              <span className="running-head-title">Dispatch</span>
            </Link>
          </nav>

          <div className="running-head-right">
            <Link
              href="/cart"
              className="running-head-cart-link"
              aria-label={`Cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
            >
              <ShoppingBag size={15} aria-hidden="true" className="running-head-cart-icon" />
              <span>Cart ({cartCount})</span>
            </Link>

            <button
              ref={trigger}
              className="running-head-trigger md:hidden"
              aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-controls="print-mobile-toc"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {menuOpen && (
        <nav id="print-mobile-toc" className="print-mobile-drawer hairline-top" aria-label="Mobile navigation">
          <div className="print-mobile-drawer-inner">
            <span className="print-mobile-eyebrow">SECTIONS</span>
            <ol className="print-mobile-list">
              {[
                { roman: 'i.', href: '/books', label: 'Ebooks' },
                { roman: 'ii.', href: '/community', label: 'Reader Community' },
                { roman: 'iii.', href: '/about', label: 'Colophon' },
                { roman: 'iv.', href: '/account/library', label: 'Library' },
                { roman: 'v.', href: '/newsletter', label: 'Dispatch' },
              ].map(item => (
                <li key={item.href} className="print-mobile-item">
                  <Link
                    href={item.href}
                    className={`print-mobile-link ${active(item.href) ? 'is-active' : ''}`}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active(item.href) ? 'page' : undefined}
                  >
                    <span className="print-mobile-roman">{item.roman}</span>
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
