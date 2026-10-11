import { Suspense } from 'react';
import { connection } from 'next/server';
import Link from 'next/link';
import { ArrowRight, BookOpen, Download, LifeBuoy } from 'lucide-react';
import HeroBanner from '../components/home/HeroBanner';
import BookCard from '../components/books/BookCard';
import { db } from '../lib/db/store';
async function HomeContent() {
    await connection();
    const books = db.getBooks().filter(book => book.isPublished && book.productType !== 'bundle');
    const featured = books.find(book => book.featured) || books[0];
    return <div className="storefront">
    <HeroBanner featuredBook={featured}/>
    <section className="studio-section" id="reading-room">
    <div className="studio-section-heading">
    <div>
    <span className="studio-kicker">A SMALL, INTENTIONAL COLLECTION</span>
    <h2>Find your next perspective.</h2>
    <p>Focus, personal growth, and curiosity — choose what speaks to you.</p>
    </div>
    <Link className="studio-text-link" href="/books">Browse all books <ArrowRight size={16} aria-hidden="true"/>
    </Link>
    </div>
      {books.length ? <div className="edition-grid">{books.map(book => <BookCard key={book.id} book={book}/>)}</div> : <div className="studio-empty">
        <h3>A new chapter is on its way.</h3>
        <p>Published titles will appear here.</p>
        <Link href="/about">Meet Knovera</Link>
        </div>}
    </section>
    <section className="studio-about-strip">
    <span className="studio-kicker">INDEPENDENT BY DESIGN</span>
    <h2>Books to spend time with.</h2>
    <p>Knovera is an independent book studio publishing practical nonfiction and companion activities. Explore the scope, read a sample, and decide at your own pace.</p>
    <Link className="studio-text-link" href="/about">The story behind Knovera <ArrowRight size={16} aria-hidden="true"/>
    </Link>
    </section>
    <section className="studio-section studio-reading-steps" aria-label="How reading with Knovera works">
    <div>
    <BookOpen aria-hidden="true"/>
    <h3>Try a few pages.</h3>
    <p>Read a sample without giving your email. Adjust the text to suit your reading style.</p>
    </div>
    <div>
    <Download aria-hidden="true"/>
    <h3>Know your edition.</h3>
    <p>Each book lists its digital formats, contents, and price before you add it to your cart.</p>
    </div>
    <div>
    <LifeBuoy aria-hidden="true"/>
    <h3>Find your books again.</h3>
    <p>Use your library or purchase recovery to return to your order.</p>
    <Link href="/access" className="studio-text-link">Recover a purchase</Link>
    </div>
    </section>
  </div>;
}
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening the reading room…</div>}>
    <HomeContent />
    </Suspense>;
}
