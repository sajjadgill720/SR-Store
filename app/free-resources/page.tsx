'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Download, ArrowRight } from 'lucide-react';

export default function FreeResourcesPage() {
  const resources = [
    {
      id: 'res-focus-protocol',
      title: 'Daily Focus Planner',
      bookRef: 'The Focused Mind',
      description: 'The companion morning work-block worksheet designed to eliminate attention residue and time fragmentation.',
      fileType: 'Plain text · .txt',
      fileSize: 'Free resource'
    },
    {
      id: 'res-habit-cheat-sheet',
      title: 'Habit & Friction Worksheet',
      bookRef: 'Atomic Architectures',
      description: 'Single-sheet reference guide for redesigning your home office to make productive behaviors effortless.',
      fileType: 'Plain text · .txt',
      fileSize: 'Free resource'
    },
    {
      id: 'res-mindfulness-maze',
      title: 'Young Explorer Curiosity Prompts',
      bookRef: 'The Young Explorer Activity Pack',
      description: 'Five simple questions to explore together, with space to draw, reflect, and plan your next discovery.',
      fileType: 'Plain text · .txt',
      fileSize: 'Free resource'
    },
    {
      id: 'res-solo-arch-checklist',
      title: 'Software Deployment Checklist',
      bookRef: 'The Solo Architect',
      description: 'Pre-flight invariant verification guide for solo engineers shipping modular production applications.',
      fileType: 'Plain text · .txt',
      fileSize: 'Free resource'
    }
  ];

  const handleDownloadResource = (resTitle: string) => {
    const templates: Record<string,string> = {
      'Daily Focus Planner': 'Date: __________\nMy one important task: __________\nWhat will finished look like? __________\nStart time: ____ End time: ____\nDistractions to remove: __________\nFirst small step: __________\nAfterwards: What worked? __________\nWhat will I change tomorrow? __________',
      'Habit & Friction Worksheet': 'Habit I want to build: __________\nAfter I [existing routine], I will [small action]: __________\nMake it easier: What can I prepare? __________\nMake distractions harder: __________\nTrack this week: Mon [ ] Tue [ ] Wed [ ] Thu [ ] Fri [ ] Sat [ ] Sun [ ]\nWhat helped me start? __________',
      'Young Explorer Curiosity Prompts': '1. Find something outside you have never noticed. Draw it.\n2. What question would you like to ask about it?\n3. Predict what might happen if it changes.\n4. Explore your question with a grown-up. What did you discover?\n5. Take three calm breaths. What would you like to explore tomorrow?',
      'Software Deployment Checklist': '[ ] Review changes and configuration\n[ ] Run relevant tests and check the build\n[ ] Check secrets are excluded from source and logs\n[ ] Review migrations and backup needs\n[ ] Document a rollback plan\n[ ] Deploy to staging and verify key user journeys\n[ ] Confirm monitoring and error reporting\n[ ] Deploy and verify production health\n[ ] Record version and follow-up tasks'
    };
    const content = `Knovera — Free Resource\n${resTitle}\n\n${templates[resTitle] || ''}\n\nFor personal use. Explore more at the Knovera store.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resTitle.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-[var(--store-green)] uppercase tracking-widest block mb-1">
          OPEN TO ALL READERS
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[var(--store-ink)] mb-3">
          Free Reader Companion Resources
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Free planners, prompts, and checklists you can open in any text editor or print. These are plain-text downloads. No purchase required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {resources.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-stone-500 mb-2">
                <span className="bg-stone-100 px-2 py-0.5 rounded font-medium">Companion to {item.bookRef}</span>
                <span>{item.fileSize}</span>
              </div>
              <h2 className="font-serif font-bold text-lg text-[var(--store-ink)] mb-2">
                {item.title}
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                {item.description}
              </p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700">{item.fileType}</span>
              <button
                onClick={() => handleDownloadResource(item.title)}
                className="px-4 py-2 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .txt</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Club Promo Box */}
      <div className="p-8 bg-[var(--store-ink)] text-white rounded-2xl text-center space-y-4 max-w-3xl mx-auto shadow-md">
        <h3 className="font-serif text-2xl font-bold">
          Want new companion templates as they are released?
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto">
          Join the Knovera Reader Club. When new chapters, printable packs, or book revisions come out, members receive direct download notifications.
        </p>
        <Link
          href="/reader-club"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] font-bold text-xs sm:text-sm rounded"
        >
          <span>Join Free Reader Club</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
