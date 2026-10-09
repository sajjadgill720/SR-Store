'use client';

import Link from 'next/link';
import { BookOpen, Home, Library, ShoppingBag } from 'lucide-react';
import { useCart } from '../../lib/store/cart';

export default function MobileNav() {
  const { cartCount, isModalOpen } = useCart();
  if (isModalOpen) return null;
  return (
    <nav aria-label="Mobile quick navigation" className="mobile-nav sm:hidden">
      <Link href="/"><Home aria-hidden="true" /><span>Home</span></Link>
      <Link href="/books"><BookOpen aria-hidden="true" /><span>Explore</span></Link>
      <Link href="/account/library"><Library aria-hidden="true" /><span>Library</span></Link>
      <Link href="/cart" aria-label={`Cart, ${cartCount} items`}>
        <span className="relative"><ShoppingBag aria-hidden="true" />{cartCount > 0 && <span className="mobile-cart-count">{cartCount}</span>}</span>
        <span>Cart</span>
      </Link>
    </nav>
  );
}
