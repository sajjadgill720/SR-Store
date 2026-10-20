'use client';
import { Suspense, useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '../../lib/store/cart';

function Navigation() {
  const path = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const menuOpen = openPath === path;
  const setMenuOpen = useCallback((open: boolean) => setOpenPath(open ? path : null), [path]);
  const trigger = useRef<HTMLButtonElement>(null);
  const { cartCount } = useCart();
  const active = (href: string) => path === href || (href !== '/' && path.startsWith(href + '/'));


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
  }, [menuOpen, setMenuOpen]);

  if (['/account/login','/account/signup','/account/update-password'].includes(path)) return null;

  return (
    <header className="print-running-head studio-header">
      <div className="running-head-bar">
        <div className="running-head-inner">
          <Link href="/" className="running-head-brand-link" aria-label="KNOVERA — Home">
            <span className="running-head-brand">KNOVERA<small className="store-brand-descriptor">DIGITAL STORE</small></span>
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
              <span className="running-head-title">About</span>
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
              <span className="running-head-title">Newsletter</span>
            </Link>
          </nav>

          <div className="running-head-right">
            <Link href="/books?saved=1" className="store-header-saved">Saved</Link>
            <Link href="/account/login" className="store-header-account">Sign in</Link>
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
                { roman: 'iii.', href: '/about', label: 'About' },
                { roman: 'iv.', href: '/account/library', label: 'Library' },
                { roman: 'v.', href: '/newsletter', label: 'Newsletter' },
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
