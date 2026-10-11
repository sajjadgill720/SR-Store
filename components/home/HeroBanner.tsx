import Link from 'next/link';
import type { Book } from '../../lib/types';
import { ArrowRight, BookOpen } from 'lucide-react';
import BookCover from '../books/BookCover';
import { money, formatsLabel } from '../../lib/catalog';
export default function HeroBanner({ featuredBook: book }: {
    featuredBook?: Book;
}) {
    return <section className="studio-hero">
    <div className="studio-hero-copy">
    <span className="studio-kicker">THE KNOVERA READING ROOM</span>
    <h1>Make space<br /> for a <em>good idea.</em>
    </h1>
      <p>Thoughtfully written books for deeper focus, better habits, and everyday curiosity. Start with a few pages. Find the read that fits your life.</p>
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
        <p>{book.author} · {formatsLabel(book.formats)}</p>
        <span>{money(book.price)} USD</span>
        </div>
        </div>}
  </section>;
}
