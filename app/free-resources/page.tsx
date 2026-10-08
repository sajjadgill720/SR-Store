'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Download, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

export default function FreeResourcesPage() {
  const resources = [
    {
      id: 'res-focus-protocol',
      title: 'Daily 90-Minute Focus Protocol (PDF)',
      bookRef: 'The Focused Mind',
      description: 'The companion morning work-block worksheet designed to eliminate attention residue and time fragmentation.',
      fileType: 'PDF Document',
      fileSize: '1.2 MB'
    },
    {
      id: 'res-habit-cheat-sheet',
      title: 'The Habit Stacking & Friction Matrix (PDF)',
      bookRef: 'Atomic Architectures',
      description: 'Single-sheet reference guide for redesigning your home office to make productive behaviors effortless.',
      fileType: 'PDF Document',
      fileSize: '850 KB'
    },
    {
      id: 'res-mindfulness-maze',
      title: 'Young Explorer Calming Maze Sample (Printable)',
      bookRef: 'The Young Explorer Activity Pack',
      description: 'Sample 5-page high-resolution vector printable pack with finger-trace labyrinths for ages 6–10.',
      fileType: 'Printable 300 DPI PDF',
      fileSize: '3.4 MB'
    },
    {
      id: 'res-solo-arch-checklist',
      title: 'Production Software Deployment Checklist',
      bookRef: 'The Solo Architect',
      description: 'Pre-flight invariant verification guide for solo engineers shipping modular production applications.',
      fileType: 'PDF Checklist',
      fileSize: '620 KB'
    }
  ];

  const handleDownloadResource = (resTitle: string) => {
    // Generate sample PDF file download for demo
    const content = `Knovera — Free Companion Resource\nTitle: ${resTitle}\nLicense: Free public personal-use license.\nVisit https://knovera.store for full book editions and reader club benefits.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resTitle.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4">
      
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-4">
          <Gift className="w-6 h-6" />
        </div>
        <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest block mb-1">
          OPEN TO ALL READERS
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#182A27] mb-3">
          Free Reader Companion Resources
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          Complementary worksheets, checklists, and printable samples to help you apply core concepts immediately. No purchase required.
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
              <h2 className="font-serif font-bold text-lg text-[#182A27] mb-2">
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
                className="px-4 py-2 bg-[#008bd2] hover:bg-[#0077b5] text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instant Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Club Promo Box */}
      <div className="p-8 bg-[#182A27] text-white rounded-2xl text-center space-y-4 max-w-3xl mx-auto shadow-md">
        <h3 className="font-serif text-2xl font-bold">
          Want new companion templates as they are released?
        </h3>
        <p className="text-xs sm:text-sm text-stone-300 max-w-lg mx-auto">
          Join the Knovera Reader Club. When new chapters, printable packs, or book revisions come out, members receive direct download notifications.
        </p>
        <Link
          href="/reader-club"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#008bd2] hover:bg-[#0077b5] text-white font-bold text-xs sm:text-sm rounded"
        >
          <span>Join Free Reader Club</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
}
