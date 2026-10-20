import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import './CommunityHero.css';
import ReaderClubEntry from '../layout/ReaderClubEntry';

export default function CommunityHero() {
  return <section className="reader-hero" aria-labelledby="reader-hero-heading">
    <div className="reader-hero-copy">
      <span className="reader-hero-kicker">YOUR READER COMMUNITY</span>
      <h1 id="reader-hero-heading">Read together.<br/><em>Find your people.</em></h1>
      <p>A place for curious minds. Find your circle, share a perspective, and keep a little space for yourself.</p>
      <div className="reader-hero-actions"><a href="#circles" className="reader-hero-primary">Find your circle <ArrowRight size={18} aria-hidden="true"/></a><Link href="/community/discussions/protecting-your-first-hour" className="reader-hero-sample">Try a guided read</Link></div>
      <ReaderClubEntry />
    </div>
    <figure className="reader-hero-art">
      <Image src="/images/community/reader-circle.png" alt="An illustration of four readers sharing ideas around a table, with a book, an ereader, and tea." width={1254} height={1254} sizes="(max-width: 760px) 220px, 380px" priority className="reader-hero-image"/>
    </figure>
  </section>;
}
