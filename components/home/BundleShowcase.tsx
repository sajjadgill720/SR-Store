'use client';

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, BookOpen, MousePointerClick, X } from 'lucide-react';
import type { BundleOffer } from '@/lib/types';
import { formatsLabel, money } from '@/lib/catalog';
import './BundleShowcase.css';

export default function BundleShowcase({ bundle }: { bundle: BundleOffer }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const previewId = useId();
  const selected = bundle.books.find(book => book.id === selectedId);
  const title = bundle.title.replace(/^The Complete /, '').replace(/ Bundle$/, '');

  function tilt(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse') return;
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--tilt-y', `${((event.clientX - rect.left) / rect.width - .5) * 5}deg`);
    element.style.setProperty('--tilt-x', `${((event.clientY - rect.top) / rect.height - .5) * -3}deg`);
  }
  function resetTilt(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  }
  function navigateBooks(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + bundle.books.length) % bundle.books.length;
    setSelectedId(bundle.books[next].id);
    buttons.current[next]?.focus();
  }
  function closePreview() {
    const index = bundle.books.findIndex(book => book.id === selectedId);
    setSelectedId(null);
    buttons.current[index]?.focus({preventScroll:true});
  }

  return <div className="bshow-showcase">
    <div className="bshow-stage" onPointerMove={tilt} onPointerLeave={resetTilt}>
      <div className="bshow-halo" aria-hidden="true"/>
      <div className="bshow-scene">
        <div className="bshow-books" role="group" aria-label="Preview the ebooks in this set" style={{'--book-count':bundle.books.length} as CSSProperties}>
          {bundle.books.map((book,index) => <button key={book.id} ref={element=>{buttons.current[index]=element;}} type="button" className={`bshow-book ${index % 2 ? 'bshow-umber' : 'bshow-sand'} ${selectedId === book.id ? 'bshow-selected' : ''}`} aria-label={`Preview ${book.title.split(':')[0]}`} aria-pressed={selectedId===book.id} aria-controls={previewId} onClick={()=>setSelectedId(selectedId===book.id ? null : book.id)} onKeyDown={event=>navigateBooks(event,index)}>
            <span className="bshow-spine" aria-hidden="true"/>
            <span className="bshow-imprint">KNOVERA</span>
            {index % 2 === 0 && <span className="bshow-ribbon" aria-hidden="true"/>}
            <span className="bshow-bookTitle">{book.title.split(':')[0].replace('Architectures', 'Archi\u00adtectures')}</span>
            <span className="bshow-rule" aria-hidden="true"/>
            <span className="bshow-peek" aria-hidden="true"><ArrowUpRight size={15}/></span>
          </button>)}
        </div>
        <div className="bshow-seal" aria-hidden="true"><span>DIGITAL SET</span><strong>{bundle.books.length}</strong><span>EBOOKS</span></div>
        <div className="bshow-slipcase" aria-hidden="true"><div className="bshow-label"><span>THE KNOVERA COLLECTION</span><strong>{title}</strong><i/><small>{bundle.books.length} EBOOKS · YOUR DIGITAL SHELF</small></div></div>
      </div>
    </div>
    <p className="bshow-hint"><MousePointerClick size={15} aria-hidden="true"/> Select a book to peek inside</p>
    <div id={previewId} className={`bshow-preview ${selected ? 'bshow-previewOpen' : ''}`} role="region" aria-label="Ebook preview">
      {selected ? <>
        <button type="button" className="bshow-close" aria-label="Close book preview" onClick={closePreview}><X size={17}/></button>
        <div key={selected.id} className="bshow-previewContent">
          <div className="bshow-meta"><span>{selected.category}</span><span>{formatsLabel(selected.formats)}</span></div>
          <h4 aria-live="polite">{selected.title.split(':')[0]}</h4>
          <p>{selected.shortDescription}</p>
          <div className="bshow-actions">{selected.sampleExcerpt.trim() && <Link href={`/samples/${selected.slug}`} className="bshow-sample"><BookOpen size={15}/> Read a free sample <ArrowRight size={15}/></Link>}<Link href={`/books/${selected.slug}`} className="bshow-details">Details · {money(selected.price)} <ArrowUpRight size={14}/></Link></div>
        </div>
      </> : <div className="bshow-invitation"><span className="bshow-invitationIcon"><BookOpen size={21}/></span><div><h4>Good ideas belong together.</h4><p>Lift a book from the set. Find your next chapter.</p></div></div>}
    </div>
  </div>;
}
