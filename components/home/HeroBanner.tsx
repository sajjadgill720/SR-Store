import Link from 'next/link';
import type { Book } from '../../lib/types';
import { ArrowRight, BookOpen } from 'lucide-react';
import BookCover from '../books/BookCover';
import { money, formatsLabel, authorLabel } from '../../lib/catalog';
export default function HeroBanner({ featuredBook: book }: {
    featuredBook?: Book;
}) {
    return <section className="studio-hero">
    <div className="studio-hero-copy">
    <span className="studio-kicker">READ • DISCOVER • CONNECT</span>
    <h1>Your next read.<br /> A whole <em>new world.</em>
    </h1>
      <p>Follow your curiosity. Discover books, explore new perspectives, and find people who love a good conversation as much as you do.</p>
      <div className="studio-actions">
    <Link className="studio-button" href="/books">Explore books <ArrowRight size={17} aria-hidden="true"/>
    </Link>{book?.sampleExcerpt.trim() && <Link className="studio-button outline" href={`/samples/${book.slug}`}>
        <BookOpen size={17} aria-hidden="true"/>Read a sample</Link>}</div>
    </div>
    {book && <div className="studio-hero-feature">
        <Link href={`/books/${book.slug}`} aria-label={`View ${book.title}`}>
        <BookCover src={book.coverImage} title={book.title} priority size="feature"/>
        </Link>
        <div>
        <span className="studio-kicker">ON THE READING TABLE</span>
        <Link href={`/books/${book.slug}`}>
        <h2>{book.title}</h2>
        </Link>
        <p>{authorLabel(book.author)} · {formatsLabel(book.formats)}</p>
        <span>{money(book.price)} USD</span>
        </div>
        </div>}
  </section>;
}
