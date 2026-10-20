'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Download, ArrowRight } from 'lucide-react';
import { RESOURCE_TEMPLATES } from '@/lib/data/reader-resources';

const resources = [
  {id:'focus-planner',title:'Daily Focus Planner',book:'The Focused Mind',slug:'the-focused-mind',description:'Plan one important task and a distraction-free work block.'},
  {id:'habit-worksheet',title:'Habit & Friction Worksheet',book:'Atomic Architectures',slug:'atomic-architectures',description:'Make a small habit easier to start and track it for a week.'},
  {id:'curiosity-prompts',title:'Young Explorer Curiosity Prompts',book:'The Young Explorer',slug:'explorers-mind-activities',description:'Five simple prompts to explore, draw, and reflect together.'},
  {id:'deployment-checklist',title:'Software Deployment Checklist',book:'The Solo Architect',slug:'the-solo-architect',description:'Check the essentials before and after a software release.'},
];

export default function FreeResourcesPage() {
  const [notice, setNotice] = useState<Record<string,string>>({});
  function download(resource: typeof resources[number]) {
    try {
      const content = `Knovera — Free Reader Resource\n${resource.title}\n\n${RESOURCE_TEMPLATES[resource.title]}\n\nFor personal use. Related ebook: ${resource.book}.`;
      const url = URL.createObjectURL(new Blob([content], {type:'text/plain;charset=utf-8'}));
      const link = document.createElement('a');
      link.href = url; link.download = `${resource.id}.txt`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice(previous => ({...previous,[resource.id]:'Download started. Find the .txt file in your browser’s Downloads, then open it in a text editor.'}));
    } catch {
      setNotice(previous => ({...previous,[resource.id]:'Download unavailable? Open the preview below and copy the template into your notes.'}));
    }
  }
  return <div className="storefront reader-resources">
    <header className="studio-page-heading"><span className="studio-kicker">FREE · NO SIGNUP · NO PURCHASE</span><h1>Small tools. A good place to start.</h1><p>Planners, prompts, and checklists to use on their own or alongside an ebook. Preview the whole template before downloading.</p></header>
    <section className="reader-resource-guide" aria-label="How to use free resources"><ol><li><strong>1. Choose</strong><span>Pick a tool for your next task.</span></li><li><strong>2. Preview or download</strong><span>Read here or save the free .txt file.</span></li><li><strong>3. Make it yours</strong><span>Open in any text editor, fill it in, or print.</span></li></ol><p>Editable plain-text templates, not PDFs or complete ebooks. No email address required.</p></section>
    <div className="reader-resource-grid">{resources.map(resource => <article key={resource.id} className="reader-resource-card">
      <span className="studio-kicker">FREE TEMPLATE · .TXT</span><h2>{resource.title}</h2><p>{resource.description}</p>
      <button type="button" className="studio-button" aria-label={`Download ${resource.title} as a text file`} onClick={() => download(resource)}><Download size={16} aria-hidden="true"/>Download .txt</button>
      {notice[resource.id] && <p role="status" className="reader-resource-status">{notice[resource.id]}</p>}
      <details><summary>Preview template</summary><pre>{RESOURCE_TEMPLATES[resource.title]}</pre><p>Copy into your notes to use without downloading.</p></details>
      <Link className="reader-resource-related" href={`/samples/${resource.slug}`}>Related ebook: {resource.book}<ArrowRight size={14} aria-hidden="true"/><span className="sr-only"> — read a free sample</span></Link>
    </article>)}</div>
    <section className="reader-resource-next" aria-label="Keep exploring"><div><h2>Put an idea into practice.</h2><p>Explore reading circles and keep a private reflection. No ebook purchase needed.</p><Link href="/community">Reader community <ArrowRight size={16}/></Link></div><div><h2>Occasional reading news?</h2><p>The Reader Club is an optional email newsletter, separate from your account and community activity.</p><Link href="/reader-club">Choose newsletter topics <ArrowRight size={16}/></Link></div></section>
    <details className="reader-resource-faq"><summary>How do I open, edit, or print a template?</summary><p>On a phone, open your browser’s Downloads or your Files app. On a computer, open the Downloads folder. Open the .txt file in a text editor such as Notepad or TextEdit, edit your answers, and save your own copy. Use the editor’s Print command for a paper copy. You can also copy the preview here without downloading.</p><p>For personal use. These are companions, not the paid ebooks or activity packs. Your edits stay in the file you save; they are not sent to the store.</p><Link href="/contact">Get help with a resource →</Link></details>
  </div>;
}
