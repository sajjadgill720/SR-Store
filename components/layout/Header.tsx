'use client';
import { Suspense, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ShoppingBag, Menu, X, Search } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
const links = [{ href: '/books', label: 'Books' }, { href: '/about', label: 'About' }, { href: '/community', label: 'Community' }, { href: '/account/library', label: 'My Library' }];
function Navigation() {
    const path = usePathname();
    const marketplace = path === '/';
    const [menuPath, setMenuPath] = useState<string | null>(null);
    const open = menuPath === path;
    const trigger = useRef<HTMLButtonElement>(null);
    const { cartCount } = useCart();
    const active = (href: string) => path === href || path.startsWith(href + '/');
    return <header className={`studio-header${marketplace ? ' market-header' : ''}`} onKeyDown={event => { if (event.key === 'Escape' && open) {
        setMenuPath(null);
        trigger.current?.focus();
    } }}>
    <div className="studio-header-inner">
      <Link href="/" className="studio-brand" aria-label="Knovera home">
    <BookOpen size={24} aria-hidden="true"/>
    <span>Knovera
    </span>
    </Link>
      {marketplace ? <form className="market-header-search" action="/books" method="get" role="search"><label className="sr-only" htmlFor="market-category">Search category</label><select id="market-category" name="category" defaultValue=""><option value="">All books</option><option>Productivity</option><option>Personal Growth</option><option>Children &amp; Family</option></select><label className="sr-only" htmlFor="market-search">Search Knovera</label><input id="market-search" name="q" type="search" placeholder="Search books, topics, and authors" /><button aria-label="Search catalog"><Search size={21} /></button></form> : <nav className="studio-desktop-nav" aria-label="Main navigation">{links.map(link => <Link key={link.href} href={link.href} aria-current={active(link.href) ? 'page' : undefined}>{link.label}</Link>)}</nav>}
      <div className="studio-header-actions">
    {marketplace && <Link href="/account/library" className="market-library-link"><small>Your reading space</small><strong>My library</strong></Link>}
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
    {marketplace && <nav className="market-departments" aria-label="Book departments"><div><Link href="/books"><Menu size={17} /> All books</Link><Link href="/books?category=Productivity">Productivity</Link><Link href="/books?category=Personal+Growth">Personal growth</Link><Link href="/books?category=Children+%26+Family">Children &amp; family</Link><Link href="/free-resources">Free resources</Link><Link href="/community">Reader community</Link><Link href="/help" className="market-department-help">Reading &amp; download help <BookOpen size={15} /></Link></div></nav>}
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
