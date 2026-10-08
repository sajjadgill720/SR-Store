'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Download, 
  Smartphone, 
  BookOpen, 
  Library, 
  HelpCircle,
  Clock
} from 'lucide-react';

function OrderDetailsContent() {
  const params = useParams();
  const token = params?.token as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/orders/lookup?token=${encodeURIComponent(token)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found or invalid token.');
        return res.json();
      })
      .then((data) => {
        setOrder(data.order);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [token]);

  const handleDownload = async (bookId: string, format: string) => {
    if (!order) return;
    setDownloading(`${bookId}-${format}`);
    try {
      const res = await fetch('/api/downloads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: order.customerEmail,
          bookId,
          format
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to issue download link');
      window.location.href = data.downloadUrl;
    } catch (e: any) {
      alert(`Download error: ${e.message}`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-stone-500">
        <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-[#008bd2]" />
        <span>Loading purchase receipt...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-16 max-w-lg mx-auto px-4 text-center">
        <div className="p-6 bg-stone-50 rounded-xl border border-stone-200">
          <h2 className="font-serif text-xl font-bold text-[#182A27] mb-2">Order Not Found</h2>
          <p className="text-xs text-stone-500 mb-4">{error || 'Unable to locate order receipt.'}</p>
          <Link href="/access" className="px-4 py-2 bg-[#23584B] text-white text-xs font-bold rounded">
            Recover Access With Email
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2 mb-6">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
              OFFICIAL PURCHASE RECEIPT
            </span>
            <h1 className="font-serif text-2xl font-bold text-[#182A27]">
              Order #{order.orderNumber}
            </h1>
          </div>
          <div className="text-xs text-stone-500">
            <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {order.items.map((item: any) => (
            <div key={item.id} className="p-4 bg-stone-50 rounded-lg border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif font-bold text-base text-[#182A27]">{item.title}</h3>
                <p className="text-xs text-stone-500">Edition: {item.editionVersion}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(item.bookId, 'epub')}
                  disabled={downloading === `${item.bookId}-epub`}
                  className="px-3 py-1.5 bg-[#008bd2] hover:bg-[#0077b5] text-white text-xs font-bold rounded flex items-center gap-1"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>EPUB</span>
                </button>
                <button
                  onClick={() => handleDownload(item.bookId, 'pdf')}
                  disabled={downloading === `${item.bookId}-pdf`}
                  className="px-3 py-1.5 bg-[#23584B] hover:bg-[#182A27] text-white text-xs font-bold rounded flex items-center gap-1"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-[#182A27]">
          <span>Total Paid</span>
          <span>${(order.totalAmount / 100).toFixed(2)} USD</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderDetailsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-stone-500 font-sans">Loading order details...</div>}>
      <OrderDetailsContent />
    </Suspense>
  );
}
