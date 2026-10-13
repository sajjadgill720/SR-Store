'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useBrowserSearch } from '@/lib/use-browser-search';
import { ArrowLeft, ArrowRight, Minus, Plus, X, ShoppingBag } from 'lucide-react';
import type { Book } from '../../lib/types';
import { sampleSections, money } from '../../lib/catalog';
import { useCart } from '../../lib/store/cart';
export default function SampleReader({ book }: {
    book: Book;
}) {
    const sections = sampleSections(book.sampleExcerpt);
    const from = useBrowserSearch().get('from');
    const bookPath = `/books/${book.slug}${from && /^\/books(?:\?|$)/.test(from) ? '?from=' + encodeURIComponent(from) : ''}`;
    const [position, setPosition] = useState(0);
    const [size, setSize] = useState(18);
    const [theme, setTheme] = useState('paper');
    const title = useRef<HTMLHeadingElement>(null);
    const { addToCart } = useCart();
    const change = useCallback((next: number) => { setPosition(Math.max(0, Math.min(next, sections.length - 1))); requestAnimationFrame(() => { title.current?.focus({ preventScroll: true }); title.current?.scrollIntoView({ block: 'start', behavior: 'instant' }); }); }, [sections.length]);
    useEffect(() => {
        const keyboard = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement;
            if (event.altKey || event.ctrlKey || event.metaKey || document.querySelector('dialog[open]') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName))
                return;
            if (event.key === 'ArrowRight' && position < sections.length - 1) {
                event.preventDefault();
                change(position + 1);
            }
            if (event.key === 'ArrowLeft' && position > 0) {
                event.preventDefault();
                change(position - 1);
            }
        };
        window.addEventListener('keydown', keyboard);
        return () => window.removeEventListener('keydown', keyboard);
    }, [position, sections.length, change]);
    return <div className={`sample-reader reader-${theme}`}>
    <div className="reader-toolbar">
    <Link className="studio-icon-button" href={bookPath} aria-label="Close sample and return to book">
    <X size={20}/>
    </Link>
    <div>
    <span className="studio-kicker">FREE SAMPLE</span>
    <span className="reader-toolbar-title">{book.title}</span>
    </div>
    <Link className="studio-button outline" href={bookPath}>View book</Link>
    </div>
    <div className="reader-settings" aria-label="Reader settings">
    <div role="group" aria-label="Text size">
    <button className="studio-icon-button" aria-label="Decrease text size" disabled={size <= 16} onClick={() => setSize(value => value - 2)}>
    <Minus size={16}/>
    </button>
    <span aria-live="polite">{size}px</span>
    <button className="studio-icon-button" aria-label="Increase text size" disabled={size >= 26} onClick={() => setSize(value => value + 2)}>
    <Plus size={16}/>
    </button>
    </div>
    <label>Reading theme<select value={theme} onChange={event => setTheme(event.target.value)}>
    <option value="paper">Paper</option>
    <option value="white">White</option>
    <option value="sepia">Sepia</option>
    <option value="dark">Dark</option>
    </select>
    </label>
    </div>
    <article className="reader-page" style={{ fontSize: size }}>
    <span className="studio-kicker">{book.author}</span>
    <h1 ref={title} tabIndex={-1}>{book.title}</h1>
    <p className="reader-position" aria-live="polite">Section {position + 1} of {sections.length || 1}</p>
      {sections.length ? <div className="reader-excerpt">{sections[position].split(/\n\s*\n/).map((paragraph, index) => <p key={position + '-' + index}>{paragraph}</p>)}</div> : <p>A sample for this edition is not available yet.</p>}
      <nav className="reader-pagination" aria-label="Sample sections">
    <button className="studio-button outline" disabled={position === 0} onClick={() => change(position - 1)}>
    <ArrowLeft size={16}/>Previous</button>
    <span>{position + 1} / {sections.length || 1}</span>
    <button className="studio-button outline" disabled={position >= sections.length - 1} onClick={() => change(position + 1)}>Next<ArrowRight size={16}/>
    </button>
    </nav>
      {position >= sections.length - 1 && <section className="reader-ending">
        <span className="studio-kicker">THE END OF THE SAMPLE</span>
        <h2>Want to spend more time with it?</h2>
        <p>Explore the full contents, edition details, and available formats before deciding.</p>
        <div className="studio-actions">
        <Link className="studio-button" href={bookPath}>View book details <ArrowRight size={16}/>
        </Link>
        <button className="studio-button outline" disabled={!book.isInStock || book.rightsStatus !== 'wide'} onClick={() => addToCart(book)}>
        <ShoppingBag size={17}/>Add to cart · {money(book.price)}</button>
        </div>
        <p className="studio-caption">Digital edition · Current checkout is a test purchase.</p>
        </section>}
    </article>
    <div className="reader-bottom">
    <Link href={bookPath}>
    <ArrowLeft size={15}/>Back to book</Link>
    <span>Use ← and → to move between sample sections.</span>
    </div>
  </div>;
}
