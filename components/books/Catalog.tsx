'use client';
import Link from 'next/link';
import { useBrowserSearch, replaceCatalogSearch } from '@/lib/use-browser-search';
import { Bookmark, Search, X, ArrowRight, Library, List, Grid } from 'lucide-react';
import type { Book, BundleOffer } from '../../lib/types';
import { discoverBooks, money } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
import BookCard from './BookCard';
import BookCover from './BookCover';

const SPINE_PALETTES = [
  { bg: '#3A342C', text: '#F7F3EB', sub: '#D9CFBD', border: '#2A251F', width: 46, height: 275 }, // Buckram Black
  { bg: '#8A7B66', text: '#1A1815', sub: '#3A342C', border: '#736551', width: 40, height: 250 }, // Raw Umber
  { bg: '#D9CFBD', text: '#1A1815', sub: '#5F594F', border: '#C2B5A0', width: 52, height: 290 }, // Bookbinder's Sand
  { bg: '#F2ECE0', text: '#1A1815', sub: '#8A7B66', border: '#DDD3C1', width: 42, height: 240 }, // Archival Cream
  { bg: '#4A3B32', text: '#FCFAF6', sub: '#D9CFBD', border: '#382B23', width: 48, height: 280 }, // Deep Leather
  { bg: '#675C4E', text: '#F7F3EB', sub: '#D9CFBD', border: '#534A3E', width: 38, height: 260 }, // Hearth Umber
];

function getSpineVariant(index: number) {
  return SPINE_PALETTES[index % SPINE_PALETTES.length];
}

function toRoman(num: number): string {
  const lookup: [number, string][] = [
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
  ];
  let result = '';
  let n = num;
  for (const [val, sym] of lookup) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result || 'I';
}

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
    const view = (params.get('view') || 'shelf') as 'shelf' | 'index' | 'grid';
    const { wishlist, storageError } = useCart();

    const update = (key: string, value: string) => {
        const next = new URLSearchParams(params.toString());
        if (key !== 'page') next.delete('page');
        if (!value || value === 'All' || value === 'featured' || (key === 'view' && value === 'shelf'))
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
    const pageBundles = visibleBundles.slice(Math.max(0, start - filtered.length), Math.max(0, start + 12 - filtered.length));
    const returnTo = '/books' + (params.size ? '?' + params.toString() : '');

    return <div className="storefront knovera-catalog-page">
    <div className="studio-page-heading">
      <span className="studio-kicker">THE COMPLETE COLLECTION · VOL. 2026</span>
      <h1>A book for where you are.</h1>
      <p className="catalog-lead-text">Browse by standing cloth volume or bibliographic index, inspect excerpts, and choose your next perspective.</p>
    </div>

    {/* Search & Saved Toolbar */}
    <div className="studio-catalog-toolbar">
      <label className="studio-search">
        <Search size={18} aria-hidden="true" className="shrink-0"/>
        <span className="sr-only">Search the catalog</span>
        <input
          id="catalog-search"
          aria-label="Search the catalog"
          type="search"
          placeholder="Search titles, authors, keywords..."
          value={query}
          onChange={event => update('q', event.target.value)}
        />
        {query && <button aria-label="Clear search" onClick={() => update('q', '')}>
          <X size={16}/>
        </button>}
      </label>
      <button
        className={`studio-button outline ${savedOnly ? 'active' : ''}`}
        aria-pressed={savedOnly}
        onClick={() => update('saved', savedOnly ? '' : '1')}
      >
        <Bookmark size={15} aria-hidden="true" fill={savedOnly ? 'currentColor' : 'none'} className="shrink-0"/>
        Saved books {wishlist.length > 0 && <span className="saved-count-pill">({wishlist.length})</span>}
      </button>
    </div>

    {/* Topic Filters */}
    <div className="studio-topic-row" role="group" aria-label="Browse by topic">
      {categories.map(topic => (
        <button
          key={topic}
          aria-pressed={category === topic}
          onClick={() => update('category', topic)}
          className="topic-tab-button"
        >
          {topic === 'All' ? 'All Editions' : topic}
        </button>
      ))}
    </div>

    {/* Meta, Filters & Presentation View Mode Toggle */}
    <div className="studio-catalog-meta">
      <div className="catalog-meta-left">
        <p className="catalog-meta-summary" aria-live="polite">
          <span className="catalog-folio-marker">§</span> {filtered.length + visibleBundles.length} {category === 'Bundles' ? visibleBundles.length === 1 ? 'set' : 'sets' : filtered.length === 1 ? 'title' : 'titles'}{query ? ` matching “${query}”` : ''}{savedOnly ? ' saved on this device' : ''}
        </p>
      </div>

      <div className="catalog-meta-controls">
        {/* Presentation Switcher: Shelf / Index / Plates */}
        <div className="catalog-presentation-toggle" role="group" aria-label="Catalogue layout">
          <span className="catalog-toggle-label">VIEW:</span>
          <button
            type="button"
            className={`catalog-toggle-btn ${view === 'shelf' ? 'active' : ''}`}
            onClick={() => update('view', 'shelf')}
            aria-pressed={view === 'shelf'}
            title="Standing Shelf View"
          >
            <Library size={13} aria-hidden="true" className="shrink-0"/>
            <span>Shelf</span>
          </button>
          <span className="catalog-toggle-sep" aria-hidden="true">/</span>
          <button
            type="button"
            className={`catalog-toggle-btn ${view === 'index' ? 'active' : ''}`}
            onClick={() => update('view', 'index')}
            aria-pressed={view === 'index'}
            title="Bibliographic Index View"
          >
            <List size={13} aria-hidden="true" className="shrink-0"/>
            <span>Index</span>
          </button>
          <span className="catalog-toggle-sep" aria-hidden="true">/</span>
          <button
            type="button"
            className={`catalog-toggle-btn ${view === 'grid' ? 'active' : ''}`}
            onClick={() => update('view', 'grid')}
            aria-pressed={view === 'grid'}
            title="Cover Plates View"
          >
            <Grid size={13} aria-hidden="true" className="shrink-0"/>
            <span>Plates</span>
          </button>
        </div>

        <details className="studio-filter-details">
          <summary>Format & Sort</summary>
          <div className="filter-dropdown-panel">
            <label>Format
              <select value={format} onChange={event => update('format', event.target.value)}>
                <option value="All">All formats</option>
                <option value="epub">EPUB</option>
                <option value="pdf">PDF</option>
                <option value="printable_pdf">Printable PDF</option>
              </select>
            </label>
            <label>Sort
              <select value={sort} onChange={event => update('sort', event.target.value)}>
                <option value="featured">Knovera picks</option>
                <option value="title">Title A–Z</option>
                <option value="price_asc">Price low to high</option>
                <option value="price_desc">Price high to low</option>
              </select>
            </label>
          </div>
        </details>
      </div>
    </div>

    {storageError && <p className="studio-error" role="alert">{storageError}</p>}
    {savedOnly && <p className="studio-caption">Saved locally in this browser. No external synchronization required.</p>}

    {/* VIEW 1: STANDING SPINE SHELF (Default View) */}
    {view === 'shelf' && pageBooks.length > 0 && (
      <section className="catalog-shelf-section" aria-label="Standing Cloth Book Shelf">
        <div className="catalog-shelf-hint" aria-hidden="true">
          <span className="shelf-hint-fleuron">❦</span>
          <span>Books stand on cloth binding spines. Hover or tap any volume to examine plate and details.</span>
        </div>
        <div className="catalog-shelf-container">
          <div className="catalog-shelf-books">
            {pageBooks.map((book, index) => {
              const spine = getSpineVariant(index);
              const saved = wishlist.includes(book.id);
              const detail = `/books/${book.slug}${returnTo ? '?from=' + encodeURIComponent(returnTo) : ''}`;
              return (
                <div
                  key={book.id}
                  className="standing-spine-wrap"
                  style={{
                    '--spine-w': `${spine.width}px`,
                    '--spine-h': `${spine.height}px`,
                    '--spine-bg': spine.bg,
                    '--spine-color': spine.text,
                    '--spine-sub': spine.sub,
                    '--spine-border': spine.border,
                  } as React.CSSProperties}
                >
                  <Link
                    href={detail}
                    className="standing-spine"
                    aria-label={`${book.title} by ${book.author}, ${money(book.price)}`}
                  >
                    {saved && <span className="spine-ribbon-tab" title="Saved edition" aria-hidden="true" />}
                    <span className="spine-headband" aria-hidden="true" />
                    <span className="spine-title-vert">{book.title}</span>
                    <div className="spine-foot">
                      <span className="spine-author-caps">{book.author}</span>
                      <span className="spine-colophon-mark">KP</span>
                    </div>
                  </Link>

                  {/* Peek Cover Plate on Hover / Focus */}
                  <div className="spine-peek-card" aria-hidden="true">
                    <div className="spine-peek-cover">
                      <BookCover src={book.coverImage} title={book.title} size="small" isSaved={saved} />
                    </div>
                    <div className="spine-peek-body">
                      <span className="spine-peek-kicker">{book.category}</span>
                      <h4 className="spine-peek-title">{book.title}</h4>
                      <p className="spine-peek-author">by {book.author}</p>
                      <p className="spine-peek-desc">{book.shortDescription}</p>
                      <div className="spine-peek-action">
                        <span className="spine-peek-price">{money(book.price)} <small>USD</small></span>
                        <span className="spine-peek-inspect">Read Edition →</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Tangible wooden cloth shelf rule */}
          <div className="shelf-beam" aria-hidden="true">
            <div className="shelf-beam-lip" />
            <div className="shelf-beam-face" />
            <div className="shelf-beam-shadow" />
          </div>
        </div>
      </section>
    )}

    {/* VIEW 2: BIBLIOGRAPHIC INDEX TABLE */}
    {view === 'index' && pageBooks.length > 0 && (
      <div className="catalog-index-section" aria-label="Bibliographic index">
        <div className="catalog-index-header">
          <span className="ci-num">FOLIO</span>
          <span className="ci-title">TITLE & EDITION STATEMENT</span>
          <span className="ci-author">AUTHOR</span>
          <span className="ci-format">FORMATS</span>
          <span className="ci-price">PRICE & ENTRY</span>
        </div>
        <ol className="catalog-index-list">
          {pageBooks.map((book, index) => {
            const roman = toRoman(start + index + 1);
            const detail = `/books/${book.slug}${returnTo ? '?from=' + encodeURIComponent(returnTo) : ''}`;
            const saved = wishlist.includes(book.id);
            return (
              <li key={book.id} className="catalog-index-row">
                <span className="ci-num" aria-hidden="true">{roman}.</span>
                <div className="ci-title">
                  <Link href={detail} className="ci-title-link">
                    <span className="ci-title-text">{book.title}</span>
                    {saved && <span className="ci-saved-badge">✦ SAVED</span>}
                  </Link>
                  {book.subtitle && <span className="ci-subtitle">{book.subtitle}</span>}
                  <span className="ci-category-tag">{book.category}</span>
                </div>
                <span className="ci-author">{book.author}</span>
                <span className="ci-format">
                  {book.formats.map(f => f === 'printable_pdf' ? 'Printable' : f.toUpperCase()).join(' · ')}
                </span>
                <div className="ci-price">
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <span className="ci-price-val">{money(book.price)}</span>
                  <Link href={detail} className="studio-button outline ci-inspect-btn">
                    Open <ArrowRight size={13} aria-hidden="true" className="shrink-0"/>
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    )}

    {/* VIEW 3: PLATES / CARD GRID */}
    {view === 'grid' && pageBooks.length > 0 && (
      <div className="edition-grid">
        {pageBooks.map((book, index) => (
          <BookCard key={book.id} book={book} returnTo={returnTo} priority={index === 0}/>
        ))}
      </div>
    )}

    {/* Bundles section */}
    {pageBundles.map(bundle => (
      <article className="studio-set-card" key={bundle.id}>
        <span className="studio-kicker">ARCHIVAL PAIR · TWO-VOLUME SLIPCASE</span>
        <h2>{bundle.title}</h2>
        <p>{bundle.description}</p>
        <p className="studio-caption">Explore the titles in this paired imprint. Editions are priced individually.</p>
        <Link className="studio-button outline" href={`/bundles/${bundle.slug}`}>
          Explore the set <ArrowRight size={17} className="shrink-0"/>
        </Link>
      </article>
    ))}

    {/* Pagination */}
    {pageCount > 1 && (
      <nav className="studio-catalog-meta pagination-nav" aria-label="Catalog pages">
        <button
          className="studio-button outline"
          disabled={page === 1}
          onClick={() => update('page', String(page - 1))}
        >
          ← Previous Folio
        </button>
        <span aria-live="polite" className="pagination-label">
          Page {page} of {pageCount}
        </span>
        <button
          className="studio-button outline"
          disabled={page === pageCount}
          onClick={() => update('page', String(page + 1))}
        >
          Next Folio →
        </button>
      </nav>
    )}

    {/* Empty state */}
    {!filtered.length && !visibleBundles.length && (
      <div className="studio-empty">
        <Search size={28} aria-hidden="true"/>
        <h2>{savedOnly ? 'Your personal library slip is clean.' : 'No books catalogued under this query.'}</h2>
        <p>{savedOnly ? 'Use the bookmark ribbon on any volume to record it in this browser.' : 'Try a different search keyword or browse all topics.'}</p>
        <button className="studio-button outline" onClick={reset}>Return to All Books</button>
      </div>
    )}
  </div>;
}
