'use client';
import Link from 'next/link';
import { useBrowserSearch, replaceCatalogSearch } from '@/lib/use-browser-search';
import { Bookmark, Search, X, ArrowRight } from 'lucide-react';
import type { Book, BundleOffer } from '../../lib/types';
import { discoverBooks } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
import BookCard from './BookCard';
export default function Catalog({ books, bundles }: {
    books: Book[];
    bundles: BundleOffer[];
}) {
    const params = useBrowserSearch();
    const query = params.get('q') || '';
    const category = params.get('category') || 'All';
    const format = params.get('format') || 'All';
    const sort = params.get('sort') || 'featured';
    const savedOnly = params.get('saved') === '1';
    const { wishlist, storageError } = useCart();
    const update = (key: string, value: string) => {
        const next = new URLSearchParams(params.toString());
        if (key !== 'page') next.delete('page');
        if (!value || value === 'All' || value === 'featured')
            next.delete(key);
        else
            next.set(key, value);
        replaceCatalogSearch('/books' + (next.size ? '?' + next.toString() : ''));
    };
    const reset = () => replaceCatalogSearch('/books');
    const categories = ['All', ...new Set(books.map(book => book.category)), ...(bundles.length && !books.some(book => book.category === 'Bundles') ? ['Bundles'] : [])];
    const filtered = discoverBooks(books, query, category, savedOnly ? wishlist : undefined)
        .filter(book => format === 'All' || book.formats.includes(format as Book['formats'][number]))
        .sort((a, b) => sort === 'price_asc' ? a.price - b.price : sort === 'price_desc' ? b.price - a.price : sort === 'title' ? a.title.localeCompare(b.title) : Number(!!b.featured) - Number(!!a.featured));
    const visibleBundles = category === 'Bundles' && !savedOnly ? bundles.filter(bundle => (bundle.title + bundle.description).toLowerCase().includes(query.toLowerCase().trim())) : [];
    const pageCount = Math.max(1, Math.ceil((filtered.length + visibleBundles.length) / 12));
    const page = Math.min(pageCount, Math.max(1, Math.floor(Number(params.get('page')) || 1)));
    const start = (page - 1) * 12;
    const pageBooks = filtered.slice(start, start + 12);
    const pageBundles = visibleBundles.slice(Math.max(0,start-filtered.length), Math.max(0,start+12-filtered.length));
    const returnTo = '/books' + (params.size ? '?' + params.toString() : '');
    return <div className="storefront">
    <div className="studio-page-heading">
    <span className="studio-kicker">THE COMPLETE COLLECTION</span>
    <h1>A book for where you are.</h1>
    <p>Browse by topic, read a few pages, and choose your next perspective.</p>
    </div>
    <div className="studio-catalog-toolbar">
    <label className="studio-search">
    <Search size={19} aria-hidden="true"/>
    <span className="sr-only">Search the catalog</span>
    <input id="catalog-search" aria-label="Search the catalog" type="search" placeholder="Search books, topics, or author" value={query} onChange={event => update('q', event.target.value)}/>{query && <button aria-label="Clear search" onClick={() => update('q', '')}>
        <X size={18}/>
        </button>}</label>
      <button className="studio-button outline" aria-pressed={savedOnly} onClick={() => update('saved', savedOnly ? '' : '1')}>
    <Bookmark size={17} aria-hidden="true"/>Saved books</button>
    </div>
    <div className="studio-topic-row" role="group" aria-label="Browse by topic">{categories.map(topic => <button key={topic} aria-pressed={category === topic} onClick={() => update('category', topic)}>{topic === 'All' ? 'All books' : topic}</button>)}</div>
    <div className="studio-catalog-meta">
    <p aria-live="polite">{filtered.length + visibleBundles.length} {category === 'Bundles' ? visibleBundles.length === 1 ? 'set' : 'sets' : filtered.length === 1 ? 'book' : 'books'}{query ? ` matching “${query}”` : ''}{savedOnly ? ' saved on this device' : ''}</p>
      <details className="studio-filter-details">
    <summary>Reading format & sort</summary>
    <div>
    <label>Format<select value={format} onChange={event => update('format', event.target.value)}>
    <option value="All">All formats</option>
    <option value="epub">EPUB</option>
    <option value="pdf">PDF</option>
    <option value="printable_pdf">Printable PDF</option>
    </select>
    </label>
    <label>Sort<select value={sort} onChange={event => update('sort', event.target.value)}>
    <option value="featured">Knovera picks</option>
    <option value="title">Title A–Z</option>
    <option value="price_asc">Price low to high</option>
    <option value="price_desc">Price high to low</option>
    </select>
    </label>
    </div>
    </details>
    </div>
    {storageError && <p className="studio-error" role="alert">{storageError}</p>}
    {savedOnly && <p className="studio-caption">Saved in this browser. No account or cloud synchronization is connected.</p>}
    <div className="edition-grid">{pageBooks.map((book, index) => <BookCard key={book.id} book={book} returnTo={returnTo} priority={index === 0}/>)}</div>
    {pageBundles.map(bundle => <article className="studio-set-card" key={bundle.id}>
        <span className="studio-kicker">A PAIR OF RELATED READS</span>
        <h2>{bundle.title}</h2>
        <p>{bundle.description}</p>
        <p className="studio-caption">Explore the titles in this set. Editions are priced individually.</p>
        <Link className="studio-button outline" href={`/bundles/${bundle.slug}`}>Explore the set <ArrowRight size={17}/>
        </Link>
        </article>)}
    {pageCount > 1 && <nav className="studio-catalog-meta" aria-label="Catalog pages"><button className="studio-button outline" disabled={page === 1} onClick={() => update('page',String(page-1))}>Previous</button><span aria-live="polite">Page {page} of {pageCount}</span><button className="studio-button outline" disabled={page === pageCount} onClick={() => update('page',String(page+1))}>Next</button></nav>}
    {!filtered.length && !visibleBundles.length && <div className="studio-empty">
        <Search size={28} aria-hidden="true"/>
        <h2>{savedOnly ? 'Your next read can wait here.' : 'No books match just yet.'}</h2>
        <p>{savedOnly ? 'Use a bookmark on any book to save it in this browser.' : 'Try a shorter search or choose a different topic.'}</p>
        <button className="studio-button outline" onClick={reset}>Show all books</button>
        </div>}
  </div>;
}
