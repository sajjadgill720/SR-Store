'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BOOKS_DATA } from '@/lib/data/books';
import { Book } from '@/lib/types';
import { 
  Library, 
  Download, 
  Smartphone, 
  BookOpen, 
  RefreshCw, 
  FileCheck, 
  ShieldCheck, 
  Mail, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function ReaderLibraryPage() {
  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [entitledBooks, setEntitledBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Auto-load email from localStorage if available
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem('sr_reader_email') || 'reader@example.com';
      if (savedEmail) {
        setEmail(savedEmail);
        loadLibraryForEmail(savedEmail);
      }
    } catch (e) {}
  }, []);

  const loadLibraryForEmail = async (targetEmail: string) => {
    setLoading(true);
    setSubmittedEmail(targetEmail);
    try {
      const res = await fetch(`/api/me/library?email=${encodeURIComponent(targetEmail.trim().toLowerCase())}`);
      const data = await res.json();
      if (res.ok && data.books) {
        setEntitledBooks(data.books);
      } else {
        setEntitledBooks([]);
      }
    } catch (err) {
      console.error(err);
      setEntitledBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        localStorage.setItem('sr_reader_email', email.trim().toLowerCase());
      } catch (e) {}
      loadLibraryForEmail(email.trim());
    }
  };

  const handleDownload = async (bookId: string, format: string) => {
    setDownloading(`${bookId}-${format}`);
    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: submittedEmail,
          bookId,
          format
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue download link');
      window.location.href = data.downloadUrl;
    } catch (err: any) {
      alert(`Download Error: ${err.message}`);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4">
      
      {/* Header */}
      <div className="mb-8 pb-4 border-b border-stone-200 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Library className="w-5 h-5 text-[#23584B]" />
            <span className="text-xs font-bold text-[#23584B] uppercase tracking-widest">
              DIRECT READER ACCESS
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#182A27]">
            My Reader Library
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Your permanent shelf of purchased DRM-free ebooks, printable kits, and free edition corrections.
          </p>
        </div>

        {/* Change / Enter Email Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2 items-center">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="reader@example.com"
            className="px-3 py-1.5 text-xs bg-white border border-stone-300 rounded focus:border-[#23584B] focus:outline-hidden"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 bg-[#23584B] hover:bg-[#182A27] text-white text-xs font-bold rounded transition-colors"
          >
            Access Shelf
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[#008bd2]" />
          <span>Verifying active entitlements in database...</span>
        </div>
      ) : entitledBooks.length > 0 ? (
        <div className="space-y-8">
          
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Verified Reader: <strong>{submittedEmail}</strong> ({entitledBooks.length} active entitlements)
              </span>
            </div>
            <Link href="/help" className="font-bold underline text-emerald-900">
              Device Reading Guide →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {entitledBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-4 mb-4">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-20 h-28 object-cover rounded shadow-md border border-stone-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-[#23584B] uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                        {book.category}
                      </span>
                      <h2 className="font-serif font-bold text-base text-[#182A27] leading-snug">
                        {book.title}
                      </h2>
                      <p className="text-xs text-stone-500">by {book.author}</p>
                      <p className="text-xs text-emerald-700 font-semibold pt-1">
                        Current: {book.currentEdition.version}
                      </p>
                    </div>
                  </div>

                  {/* Edition Notes */}
                  <div className="p-3 bg-stone-50 rounded-lg text-xs text-stone-600 mb-4 border border-stone-100">
                    <p className="font-bold text-[#182A27] mb-1">Release Notes:</p>
                    <p className="italic">{book.currentEdition.releaseNotes}</p>
                  </div>
                </div>

                {/* Download Formats */}
                <div className="pt-4 border-t border-stone-100">
                  <span className="text-xs font-bold text-[#182A27] block mb-2">
                    Generate Signed Download Link:
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload(book.id, 'epub')}
                      disabled={downloading === `${book.id}-epub`}
                      className="py-2.5 px-3 bg-[#008bd2] hover:bg-[#0077b5] text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>EPUB Format</span>
                    </button>

                    <button
                      onClick={() => handleDownload(book.id, 'pdf')}
                      disabled={downloading === `${book.id}-pdf`}
                      className="py-2.5 px-3 bg-[#23584B] hover:bg-[#182A27] text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>PDF Format</span>
                    </button>
                  </div>

                  <div className="mt-2 text-center">
                    <Link
                      href={`/samples/${book.slug}`}
                      className="text-[11px] text-stone-400 hover:text-stone-700 underline"
                    >
                      View web reading preview
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-2xs">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#182A27] mb-2">
            No Active Purchases Found for {submittedEmail || 'this email'}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mb-6 leading-relaxed">
            If you purchased with a different email address, enter it above or visit our Access Recovery portal to have your purchase tokens securely sent to you.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/access"
              className="px-5 py-2.5 bg-[#23584B] hover:bg-[#182A27] text-white text-xs font-bold rounded transition-colors"
            >
              Recover Purchases With Email
            </Link>
            <Link
              href="/books"
              className="px-5 py-2.5 bg-[#008bd2] hover:bg-[#0077b5] text-white text-xs font-bold rounded transition-colors"
            >
              Browse Bookstore Catalog
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
