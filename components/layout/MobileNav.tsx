'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, Library, ShoppingBag, Users } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
function Navigation() {
    const path = usePathname();
    const { cartCount, isModalOpen } = useCart();
    if (isModalOpen || path.startsWith('/samples/') || path.startsWith('/checkout'))
        return null;
    const links = [{ href: '/', label: 'Home', icon: Home }, { href: '/books', label: 'Books', icon: BookOpen }, { href: '/community', label: 'Community', icon: Users }, { href: '/account/library', label: 'Library', icon: Library }, { href: '/cart', label: 'Cart', icon: ShoppingBag }];
    return <nav aria-label="Mobile quick navigation" className="mobile-nav sm:hidden">{links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={path === href || (href !== '/' && path.startsWith(href + '/')) ? 'page' : undefined} aria-label={href === '/cart' ? `Cart, ${cartCount} items` : undefined}>
        <span className="relative">
        <Icon aria-hidden="true"/>{href === '/cart' && cartCount > 0 && <span className="mobile-cart-count">{cartCount}</span>}</span>
        <span>{label}</span>
        </Link>)}</nav>;
}
export default function MobileNav() {
    return <Suspense fallback={null}>
    <Navigation />
    </Suspense>;
}
