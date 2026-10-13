'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Download } from 'lucide-react';
import type { Book } from '../../../lib/types';
import { formatLabel } from '../../../lib/catalog';
import BookCover from '../../../components/books/BookCover';

export default function LibraryPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [orderNumber, setOrderNumber] = useState('');
  const [busy, setBusy] = useState(true);
  const [downloading, setDownloading] = useState('');
  const [error, setError] = useState('');
  const [needsAccess, setNeedsAccess] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch('/api/me/library', { cache: 'no-store', signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) setNeedsAccess(true);
          else throw new Error(data.error || 'Could not load your books.');
        } else { setBooks(data.books); setOrderNumber(data.orderNumber); }
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Could not open your library.'); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    })();
    return () => controller.abort();
  }, []);
  async function download(bookId: string, format: string) {
    setDownloading(bookId + format); setError('');
    try {
      const response = await fetch('/api/downloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookId, format }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not prepare your download.');
      window.location.assign(data.downloadUrl);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not prepare your download.'); }
    finally { setDownloading(''); }
  }
  async function closeLibrary() {
    try {
      const response = await fetch('/api/me/library', { method: 'DELETE' });
      if (!response.ok) throw new Error('Could not close this library. Please try again.');
      setBooks([]); setOrderNumber(''); setNeedsAccess(true); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Please try again.'); }
  }
  return <div className="storefront">
    <div className="studio-page-heading"><span className="studio-kicker">A PLACE FOR YOUR BOOKS</span><h1>Your reading shelf.</h1><p>Your digital editions, ready when you are.</p></div>
    {busy && <div className="studio-shelf-grid" role="status" aria-label="Loading library">{[1, 2, 3].map(item => <div className="studio-shelf-skeleton" key={item}/>)}</div>}
    {error && <div className="studio-error" role="alert"><p>{error}</p><button className="studio-text-link" onClick={() => window.location.reload()}>Try again</button></div>}
    {!busy && needsAccess && <div className="studio-empty"><h2>Open your books securely.</h2><p>Follow the private purchase link in your receipt to unlock your shelf. If your access has expired or you need another order, request your purchase links by email.</p><Link className="studio-button" href="/access">Recover a purchase</Link><p className="studio-caption">Your library stays open on this browser for one hour after you open a purchase link.</p></div>}
    {!busy && orderNumber && <>
      <div className="studio-section-heading"><p className="studio-shelf-count">{books.length} {books.length === 1 ? 'book' : 'books'} · Order {orderNumber}</p><button className="studio-text-link" onClick={() => void closeLibrary()}>Close this library</button></div>
      <div className="studio-shelf-grid">{books.map(book => <article className="studio-shelf-book" key={book.id}>
        <Link href={`/books/${book.slug}`}><BookCover src={book.coverImage} title={book.title}/></Link>
        <div><h2>{book.title}</h2><p>{book.author}</p><p className="studio-caption">{book.currentEdition.version}</p>
          <div className="studio-download-actions">{book.formats.map(format => <button className="studio-button outline" disabled={!!downloading} key={format} onClick={() => void download(book.id, format)}><Download size={16}/>{downloading === book.id + format ? 'Preparing…' : formatLabel(format)}</button>)}</div>
          <Link className="studio-text-link" href={`/books/${book.slug}`}>View edition details</Link>
        </div></article>)}</div>
      {!books.length && <p className="studio-notice">This order has no active download access. Contact support if you need help.</p>}
      <p className="studio-caption">Download links expire after five minutes. Request a new link here whenever you need one.</p>
      <Link className="studio-text-link" href="/access">Find books from another purchase</Link>
    </>}
  </div>;
}
