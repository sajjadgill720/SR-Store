'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Download, ArrowRight } from 'lucide-react';
import type { Book } from '../../../lib/types';
import { formatLabel } from '../../../lib/catalog';
import BookCover from '../../../components/books/BookCover';
export default function LibraryPage() {
    const [email, setEmail] = useState('');
    const [loadedEmail, setLoadedEmail] = useState('');
    const [books, setBooks] = useState<Book[]>([]);
    const [busy, setBusy] = useState(false);
    const [downloading, setDownloading] = useState('');
    const [error, setError] = useState('');
    const request = useRef<AbortController | null>(null);
    const load = useCallback(async (value: string) => {
        request.current?.abort();
        const controller = new AbortController();
        request.current = controller;
        setBusy(true);
        setError('');
        setBooks([]);
        setLoadedEmail('');
        try {
            const response = await fetch('/api/me/library?email=' + encodeURIComponent(value.trim().toLowerCase()), { cache: 'no-store', signal: controller.signal });
            const data = await response.json();
            if (!response.ok)
                throw new Error(data.error || 'Could not open your library.');
            if (!controller.signal.aborted) {
                setBooks(data.books || []);
                setLoadedEmail(value.trim().toLowerCase());
            }
        }
        catch (reason) {
            if (!controller.signal.aborted)
                setError(reason instanceof Error ? reason.message : 'Could not open your library. Try again.');
        }
        finally {
            if (!controller.signal.aborted)
                setBusy(false);
        }
    }, []);
    useEffect(() => { const controller = new AbortController(); queueMicrotask(() => { if (controller.signal.aborted)
        return; try {
        const saved = localStorage.getItem('sr_reader_email');
        if (saved) {
            setEmail(saved);
            void load(saved);
        }
    }
    catch { /* The email form remains usable. */ } }); return () => { controller.abort(); request.current?.abort(); }; }, [load]);
    const submit = (event: React.FormEvent) => { event.preventDefault(); try {
        localStorage.setItem('sr_reader_email', email.trim().toLowerCase());
    }
    catch { /* Lookup works without device storage. */ } void load(email); };
    const download = async (bookId: string, format: string) => { setDownloading(bookId + '-' + format); setError(''); try {
        const response = await fetch('/api/downloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: loadedEmail, bookId, format }) });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.error || 'Could not prepare your download.');
        window.location.assign(data.downloadUrl);
    }
    catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not prepare your download. Try again.');
    }
    finally {
        setDownloading('');
    } };
    return <div className="storefront">
    <div className="studio-page-heading">
    <span className="studio-kicker">A PLACE FOR YOUR BOOKS</span>
    <h1>Your reading shelf.</h1>
    <p>Your digital editions, ready when you are.</p>
    </div>
    <details className="studio-library-email" open={!loadedEmail}>
    <summary>Find or switch a purchase email</summary>
    <form className="studio-library-lookup" onSubmit={submit}>
    <label htmlFor="library-email">Email used at checkout</label>
    <div>
    <input id="library-email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)}/>
    <button className="studio-button" disabled={busy}>{busy ? 'Opening…' : 'Find my books'}<ArrowRight size={16}/>
    </button>
    </div>{email && <button type="button" className="studio-text-link" onClick={() => {
                request.current?.abort();
                try {
                    localStorage.removeItem('sr_reader_email');
                }
                catch { /* The form can still be cleared. */ }
                setEmail('');
                setLoadedEmail('');
                setBooks([]);
                setError('');
                setBusy(false);
            }}>Forget email on this device</button>}</form>
    </details>
    <p className="studio-caption">Email lookup preview — this is not a signed-in account.</p>
    {error && <div className="studio-error" role="alert">
        <p>{error}</p>
        <Link className="studio-text-link" href="/contact">Contact support</Link>
        </div>}
    {busy && <div className="studio-shelf-grid" role="status" aria-label="Loading library">{[1, 2, 3].map(item => <div className="studio-shelf-skeleton" key={item}/>)}</div>}
    {!busy && loadedEmail && <>
        <p className="studio-shelf-count">{books.length} {books.length === 1 ? 'book' : 'books'} found for {loadedEmail}</p>
        <div className="studio-notice">
        <p>Demo files illustrate access. Published PDF and EPUB files are not connected.</p>
        </div>
        <div className="studio-shelf-grid">{books.map(book => <article className="studio-shelf-book" key={book.id}>
            <Link href={`/books/${book.slug}`}>
            <BookCover src={book.coverImage} title={book.title}/>
            </Link>
            <div>
            <h2>{book.title}</h2>
            <p>{book.author}</p>
            <p className="studio-caption">{book.currentEdition.version}</p>
            <div className="studio-download-actions">{book.formats.map(format => <button className="studio-button outline" disabled={!!downloading} key={format} onClick={() => download(book.id, format)}>
                <Download size={16}/>{downloading === book.id + '-' + format ? 'Preparing…' : `Demo ${formatLabel(format)}`}</button>)}</div>
            <Link className="studio-text-link" href={`/books/${book.slug}`}>View edition details</Link>
            </div>
            </article>)}</div>{!books.length && <div className="studio-empty">
            <h2>Let’s find your books.</h2>
            <p>No active editions were found for this email. Try the address on your order, or use purchase recovery.</p>
            <div className="studio-actions">
            <Link className="studio-button" href="/access">Recover a purchase</Link>
            <Link className="studio-button outline" href="/books">Explore books</Link>
            </div>
            </div>}</>}
    {!busy && !loadedEmail && !error && <div className="studio-empty">
        <h2>Already have a book?</h2>
        <p>Enter the email used for your order above. Your shelf will show available formats and edition details.</p>
        <Link className="studio-text-link" href="/access">Need to recover your purchase?</Link>
        </div>}
  </div>;
}
