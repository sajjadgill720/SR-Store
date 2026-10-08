'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Download, 
  BookOpen, 
  Smartphone, 
  Library, 
  ArrowRight, 
  ShieldCheck, 
  Clock,
  Sparkles
} from 'lucide-react';

function ReturnPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Missing order capability token. Please check your purchase confirmation link.');
      setLoading(false);
      return;
    }

    // Fetch order details by public capability token
    fetch(`/api/orders/lookup?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order verification failed or token expired.');
        return res.json();
      })
      .then((data) => {
        setOrderData(data.order);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleDownload = async (bookId: string, format: string) => {
    if (!orderData) return;
    setDownloadingFormat(`${bookId}-${format}`);
    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: orderData.customerEmail,
          bookId,
          format
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Download failed');

      // Trigger actual download via the signed token URL
      window.location.href = json.downloadUrl;
    } catch (err: any) {
      alert(`Download Error: ${err.message}`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center">
        <Clock className="w-10 h-10 text-[#008bd2] animate-spin mx-auto mb-3" />
        <h2 className="font-serif text-xl font-bold text-[#182A27]">
          Verifying Order Payment Status...
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Connecting to local database ledger and activating your digital entitlements.
        </p>
      </div>
    );
  }

  if (error || !orderData) {
    return (
      <div className="py-16 max-w-xl mx-auto px-4 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
          <h2 className="font-serif text-xl font-bold mb-2">Unable to Verify Order</h2>
          <p className="text-xs sm:text-sm mb-4">{error || 'Order record not found.'}</p>
          <Link
            href="/access"
            className="inline-block px-4 py-2 bg-[#182A27] text-white font-bold text-xs rounded"
          >
            Recover Access with Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4">
      
      {/* Success Hero Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm text-center mb-8">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block mb-1">
          PAYMENT CONFIRMED • ACCESS ACTIVE
        </span>
        <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#182A27] mb-2">
          Thank You for Your Direct Purchase!
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          Order <strong>{orderData.orderNumber}</strong> has been fulfilled. An access receipt was sent to <strong>{orderData.customerEmail}</strong>.
        </p>

        <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500">
          <span>Total Paid: <strong>${(orderData.totalAmount / 100).toFixed(2)}</strong></span>
          <span>Status: <strong className="text-emerald-700 uppercase">Paid</strong></span>
          <span>Method: <strong>Direct Fulfill Simulator</strong></span>
        </div>
      </div>

      {/* Instant Downloads Card (Primary Action) */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#23584B]/30 shadow-md mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#182A27] flex items-center gap-2">
              <Download className="w-5 h-5 text-[#23584B]" />
              <span>Download Your Digital Files Now</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Files are DRM-free and ready for your e-reader, tablet, smartphone, or PC.
            </p>
          </div>
          <Link
            href="/help"
            className="text-xs font-bold text-[#008bd2] hover:underline hidden sm:inline"
          >
            Device Transfer Help
          </Link>
        </div>

        {/* List of purchased items with download buttons */}
        <div className="space-y-6">
          {orderData.items.map((item: any) => (
            <div
              key={item.id}
              className="p-5 bg-stone-50 rounded-xl border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h3 className="font-serif font-bold text-base text-[#182A27]">
                  {item.title}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Edition: {item.editionVersion} • Personal reader license
                </p>
              </div>

              {/* Action Buttons for Formats */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => handleDownload(item.bookId, 'epub')}
                  disabled={downloadingFormat === `${item.bookId}-epub`}
                  className="px-3.5 py-2 bg-[#008bd2] hover:bg-[#0077b5] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Download EPUB (E-Reader / Mobile)</span>
                </button>

                <button
                  onClick={() => handleDownload(item.bookId, 'pdf')}
                  disabled={downloadingFormat === `${item.bookId}-pdf`}
                  className="px-3.5 py-2 bg-[#23584B] hover:bg-[#182A27] text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Download PDF (Universal)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reader Library & Kindle Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        
        {/* Card 1: Permanent Library Access */}
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#23584B] flex items-center justify-center mb-3">
              <Library className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#182A27] mb-1">
              Your Reader Library
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Your purchased titles and all future edition corrections remain in your library. You can visit anytime without repurchasing.
            </p>
          </div>

          <Link
            href="/account/library"
            className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-[#008bd2] hover:underline flex items-center gap-1"
          >
            <span>Open My Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Device Transfer Help */}
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#008bd2] flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-base text-[#182A27] mb-1">
              Transfer to Your Reading Device
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Easily transfer or open your downloaded EPUB on your favorite e-reader, iPad, Android tablet, or desktop reading app in seconds.
            </p>
          </div>

          <Link
            href="/help"
            className="mt-4 pt-3 border-t border-stone-100 text-xs font-bold text-[#008bd2] hover:underline flex items-center gap-1"
          >
            <span>Read Device Guide</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
}

export default function CheckoutReturnPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-stone-500">Loading order status...</div>}>
      <ReturnPageContent />
    </Suspense>
  );
}
