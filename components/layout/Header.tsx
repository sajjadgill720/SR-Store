'use client';
import { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
const links = [{ href: '/books', label: 'Books' }, { href: '/about', label: 'About' }, { href: '/community', label: 'Community' }, { href: '/account/library', label: 'My Library' }];
function Navigation() {
    const path = usePathname();
    const [menuPath, setMenuPath] = useState<string | null>(null);
    const open = menuPath === path;
    const trigger = useRef<HTMLButtonElement>(null);
    const { cartCount } = useCart();
    const active = (href: string) => path === href || path.startsWith(href + '/');
    return <header className="studio-header" onKeyDown={event => { if (event.key === 'Escape' && open) {
        setMenuPath(null);
        trigger.current?.focus();
    } }}>
    <div className="studio-header-inner">
      <Link href="/" className="studio-brand" aria-label="Knovera home">
    <BookOpen size={24} aria-hidden="true"/>
    <span>Knovera<small>INDEPENDENT BOOK STUDIO</small>
    </span>
    </Link>
      <nav className="studio-desktop-nav" aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} aria-current={active(link.href) ? 'page' : undefined}>{link.label}</Link>)}</nav>
      <div className="studio-header-actions">
    <Link href="/books#catalog-search" className="studio-icon-button" aria-label="Search books">
    <Search size={20} aria-hidden="true"/>
    </Link>
    <Link href="/cart" className="studio-cart-link" aria-label={`Cart, ${cartCount} items`}>
    <ShoppingBag size={20} aria-hidden="true"/>
    <span>Cart{cartCount > 0 ? ` (${cartCount})` : ''}</span>
    </Link>
        <button ref={trigger} className="studio-icon-button studio-menu-trigger" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-controls="studio-mobile-menu" aria-expanded={open} onClick={() => setMenuPath(open ? null : path)}>{open ? <X size={22}/> : <Menu size={22}/>}</button>
      </div>
    </div>
    {open && <nav id="studio-mobile-menu" className="studio-mobile-menu" aria-label="Mobile main navigation">{links.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuPath(null)} aria-current={active(link.href) ? 'page' : undefined}>{link.label}</Link>)}<Link href="/access" onClick={() => setMenuPath(null)}>Recover a purchase</Link>
        </nav>}
  </header>;
}
export default function Header() {
    return <Suspense fallback={<header className="studio-header studio-header-placeholder">
        <Link href="/" className="studio-brand">Knovera</Link>
        </header>}>
    <Navigation />
    </Suspense>;
}
