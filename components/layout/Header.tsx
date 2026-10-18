'use client';
import { Suspense, useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, BookOpen } from 'lucide-react';
import { useCart } from '../../lib/store/cart';

const links = [
  { href: '/books', label: 'Books' },
  { href: '/about', label: 'About' },
  { href: '/account/library', label: 'My Library' },
];

function Navigation() {
  const path = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const { cartCount } = useCart();
  const active = (href: string) => path === href || (href !== '/' && path.startsWith(href + '/'));

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
    <header className="studio-header">
      <div className="studio-header-inner">
        <Link href="/" className="studio-brand" aria-label="Knovera — Distinctive Digital Editions">
          <span className="studio-brand-mark">
            <BookOpen size={20} aria-hidden="true" className="studio-brand-icon" />
            <span className="studio-brand-name">Knovera</span>
          </span>
          <small className="studio-brand-sub">Independent Digital Press</small>
        </Link>

        <nav className="studio-desktop-nav" aria-label="Main navigation">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="studio-nav-link"
              aria-current={active(link.href) ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="studio-header-actions">
          <Link
            href="/cart"
            className="studio-cart-link"
            aria-label={`Shopping cart with ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="studio-cart-text">Cart</span>
            {cartCount > 0 && <span className="studio-cart-badge">{cartCount}</span>}
          </Link>

          <button
            ref={trigger}
            className="studio-icon-button studio-menu-trigger sm:hidden"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="studio-mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="studio-mobile-menu" className="studio-mobile-menu" aria-label="Mobile main navigation">
          <div className="studio-mobile-menu-inner">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="studio-mobile-link"
                onClick={() => setMenuOpen(false)}
                aria-current={active(link.href) ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="studio-mobile-divider" />
            <Link
              href="/access"
              className="studio-mobile-sublink"
              onClick={() => setMenuOpen(false)}
            >
              Recover a purchase
            </Link>
            <Link
              href="/help"
              className="studio-mobile-sublink"
              onClick={() => setMenuOpen(false)}
            >
              Reading & device guidance
            </Link>
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
