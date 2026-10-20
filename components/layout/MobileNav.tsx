'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, Library, ShoppingBag, User } from 'lucide-react';
import { useCart } from '../../lib/store/cart';

function Navigation() {
  const path = usePathname();
  const { cartCount, isModalOpen } = useCart();

  if (isModalOpen || path.startsWith('/samples/') || path.startsWith('/checkout') || ['/account/login','/account/signup','/account/update-password'].includes(path)) {
    return null;
  }

  const links = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/books', label: 'Books', icon: BookOpen },
    { href: '/about', label: 'About', icon: User },
    { href: '/account/library', label: 'Library', icon: Library },
    { href: '/cart', label: 'Cart', icon: ShoppingBag },
  ];

  return (
    <nav aria-label="Mobile quick navigation" className="mobile-nav sm:hidden">
      {links.map(({ href, label, icon: Icon }) => {
        const isActive = path === href || (href !== '/' && path.startsWith(href + '/'));
        return (
          <Link
            key={href}
            href={href}
            className="mobile-nav-link"
            aria-current={isActive ? 'page' : undefined}
            aria-label={href === '/cart' ? `Cart, ${cartCount} items` : label}
          >
            <span className="relative inline-flex items-center justify-center">
              <Icon size={20} aria-hidden="true" />
              {href === '/cart' && cartCount > 0 && (
                <span className="mobile-cart-count">{cartCount}</span>
              )}
            </span>
            <span className="mobile-nav-label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function MobileNav() {
  return (
    <Suspense fallback={null}>
      <Navigation />
    </Suspense>
  );
}
