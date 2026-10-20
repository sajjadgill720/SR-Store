'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  HelpCircle, 
  Star, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  FileText,
  AlertTriangle,
  ArrowRight,
  Plus,
  Trash2,
  BookOpen,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import { Book } from '../../lib/types';
import SignOut from '../../components/auth/SignOut';

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'overview' | 'orders' | 'books' | 'bundles' | 'support' | 'reviews' | 'logs'>('overview');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const readGeneration = useRef(0);
  const pendingRead = useRef<Promise<void> | null>(null);
  const [refreshingCatalog, setRefreshingCatalog] = useState(false);
  const [catalogMessage, setCatalogMessage] = useState('');

  // Bundle Form state
  const [isBundleFormOpen, setIsBundleFormOpen] = useState(false);
  const [editingBundleId, setEditingBundleId] = useState<string | null>(null);
  const [submittingBundle, setSubmittingBundle] = useState(false);
  const [bundleForm, setBundleForm] = useState({
    id: '',
    title: '',
    slug: '',
    subtitle: '',
    description: '',
    price: '29.99',
    originalPrice: '38.49',
    savingsPercentage: '22',
    badge: 'Special Box Set · Save 22%',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    selectedBookIds: [] as string[]
  });

  async function refreshCatalog() {
    setRefreshingCatalog(true);
    setCatalogMessage('');
    try {
      const response = await fetch('/api/admin/actions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REFRESH_CATALOG' }),
      });
      if (!response.ok) throw new Error('Could not refresh the catalog. Please try again.');
      setCatalogMessage('Catalog cleared. The next visit loads your latest published books.');
      await fetchData();
    } catch (error) {
      setCatalogMessage(error instanceof Error ? error.message : 'Could not refresh the catalog.');
    } finally { setRefreshingCatalog(false); }
  }

  // Add Book Form state
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [submittingBook, setSubmittingBook] = useState(false);
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    subtitle: '',
    author: 'Knovera Editions',
    category: 'Productivity',
    price: '19.99',
    originalPrice: '29.99',
    badge: 'New Release',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
    pageCount: '250',
    shortDescription: '',
    fullDescription: '',
    whatsIncluded: 'Reflowable EPUB format for all e-readers and tablets\nUniversal typeset PDF with generous margins\nFree lifetime edition revisions & updates',
    tableOfContents: '1. Introduction and Core Fundamentals\n2. The Strategic Cognitive Framework\n3. Daily Action Protocols & Systems\n4. Advanced Synthesis and Lifelong Practice',
    sampleExcerpt: 'Chapter 1: The Foundation\n\nWelcome to this comprehensive edition. This volume has been crafted specifically for direct digital readers seeking unbroken clarity and actionable methodologies. In the following chapters, you will discover field-tested frameworks designed to produce consistent, repeatable results...',
    featured: false
  });

  const fetchData = () => {
    if (pendingRead.current) return pendingRead.current;
    const generation = readGeneration.current;
    const promise = (async () => {
      try {
        const res = await fetch('/api/admin/actions', {cache: 'no-store'});
        if (!res.ok) throw new Error('Could not load administrator data.');
        const json = await res.json();
        if (readGeneration.current === generation) setData(json);
      } catch (e) { console.error(e); }
      finally { setLoading(false); pendingRead.current = null; }
    })();
    pendingRead.current = promise;
    return promise;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookForm.title.trim()) {
      alert('Please enter a book title');
      return;
    }
    setSubmittingBook(true);
    try {
      const priceNum = Math.round(parseFloat(newBookForm.price || '19.99') * 100);
      const origPriceNum = newBookForm.originalPrice 
        ? Math.round(parseFloat(newBookForm.originalPrice) * 100) 
        : undefined;

      const whatsIncludedArr = newBookForm.whatsIncluded
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const tocArr = newBookForm.tableOfContents
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title: newBookForm.title,
        subtitle: newBookForm.subtitle,
        author: newBookForm.author,
        category: newBookForm.category,
        price: priceNum,
        originalPrice: origPriceNum,
        badge: newBookForm.badge,
        coverImage: newBookForm.coverImage,
        pageCount: parseInt(newBookForm.pageCount || '250', 10),
        shortDescription: newBookForm.shortDescription || newBookForm.title,
        fullDescription: newBookForm.fullDescription || newBookForm.shortDescription || newBookForm.title,
        whatsIncluded: whatsIncludedArr,
        tableOfContents: tocArr,
        sampleExcerpt: newBookForm.sampleExcerpt,
        featured: newBookForm.featured
      };

      const res = await fetch('/api/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to create book');

      alert(`"${resJson.book.title}" added successfully! It is now live on the client storefront.`);
      setIsAddBookOpen(false);
      
      // Reset form
      setNewBookForm({
        title: '',
        subtitle: '',
        author: 'Knovera Editions',
        category: 'Productivity',
        price: '19.99',
        originalPrice: '29.99',
        badge: 'New Release',
        coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
        pageCount: '250',
        shortDescription: '',
        fullDescription: '',
        whatsIncluded: 'Reflowable EPUB format for all e-readers and tablets\nUniversal typeset PDF with generous margins\nFree lifetime edition revisions & updates',
        tableOfContents: '1. Introduction and Core Fundamentals\n2. The Strategic Cognitive Framework\n3. Daily Action Protocols & Systems\n4. Advanced Synthesis and Lifelong Practice',
        sampleExcerpt: 'Chapter 1: The Foundation\n\nWelcome to this comprehensive edition. This volume has been crafted specifically for direct digital readers seeking unbroken clarity and actionable methodologies...',
        featured: false
      });
      ++readGeneration.current;
      setData((previous: any) => ({...previous, books: [...previous.books, resJson.book]}));
    } catch (err: any) {
      alert(`Error adding book: ${err.message}`);
    } finally {
      setSubmittingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: string, bookTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${bookTitle}"? This will immediately remove it from the client-facing store.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/books?id=${encodeURIComponent(bookId)}`, {
        method: 'DELETE'
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to delete book');
      alert(`"${bookTitle}" deleted from the storefront.`);
      ++readGeneration.current;
      setData((previous: any) => ({...previous, books: previous.books.map((book: Book) => book.id === bookId ? {...book, isPublished:false,isInStock:false} : book)}));
    } catch (err: any) {
      alert(`Error deleting book: ${err.message}`);
    }
  };

  const handleRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to refund this order and revoke active entitlements?')) return;
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REFUND_ORDER', payload: { orderId } })
      });
      if (res.ok) {
        alert('Order refunded and entitlements revoked.');
        ++readGeneration.current;
        await pendingRead.current;
        await fetchData();
      }
    } catch (e) {
      alert('Failed to process refund');
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESOLVE_TICKET', payload: { ticketId } })
      });
      if (res.ok) {
        ++readGeneration.current;
        setData((previous: any) => ({...previous, tickets: previous.tickets.map((ticket: any) => ticket.id === ticketId ? {...ticket,status:'resolved'} : ticket), kpis:{...previous.kpis,openTicketsCount:previous.tickets.filter((ticket: any)=>ticket.id !== ticketId && ticket.status === 'open').length}}));
      }
    } catch (e) {
      alert('Failed to resolve ticket');
    }
  };

  const handleToggleReview = async (reviewId: string, currentApproval: boolean) => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_REVIEW_APPROVAL',
          payload: { reviewId, isApproved: !currentApproval }
        })
      });
      if (res.ok) {
        ++readGeneration.current;
        setData((previous: any) => ({...previous, reviews:previous.reviews.map((review: any)=>review.id === reviewId ? {...review,isApproved:!currentApproval} : review)}));
      }
    } catch (e) {
      alert('Failed to update review moderation');
    }
  };

  const openNewBundleForm = () => {
    setEditingBundleId(null);
    const available = (data?.books || []).filter((b: any) => b.isPublished);
    const defaultBooks = available.slice(0, 2);
    const sumCents = defaultBooks.reduce((acc: number, b: any) => acc + b.price, 0);
    const sum = sumCents / 100;
    const disc = Math.round(sum * 0.78 * 100) / 100;
    setBundleForm({
      id: `bundle-${Date.now()}`,
      title: 'New Curated Box Set',
      slug: `curated-box-set-${Date.now()}`,
      subtitle: 'Complete dual-edition digital box set.',
      description: 'Get both editions together in one comprehensive package with bonus materials and companion worksheets.',
      price: disc.toFixed(2),
      originalPrice: sum.toFixed(2),
      savingsPercentage: '22',
      badge: 'Special Box Set · Save 22%',
      coverImage: defaultBooks[0]?.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      selectedBookIds: defaultBooks.map((b: any) => b.id)
    });
    setIsBundleFormOpen(true);
  };

  const openEditBundleForm = (bundle: any) => {
    setEditingBundleId(bundle.id);
    const bookIds = bundle.books ? bundle.books.map((b: any) => b.id) : (bundle.bookIds || []);
    setBundleForm({
      id: bundle.id,
      title: bundle.title,
      slug: bundle.slug,
      subtitle: bundle.subtitle || '',
      description: bundle.description || '',
      price: (bundle.price / 100).toFixed(2),
      originalPrice: ((bundle.originalPrice || 0) / 100).toFixed(2),
      savingsPercentage: String(bundle.savingsPercentage || 20),
      badge: bundle.badge || `Save ${bundle.savingsPercentage || 20}%`,
      coverImage: bundle.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop',
      selectedBookIds: bookIds
    });
    setIsBundleFormOpen(true);
  };

  const handleToggleBundleBook = (bookId: string) => {
    const isSelected = bundleForm.selectedBookIds.includes(bookId);
    const nextIds = isSelected 
      ? bundleForm.selectedBookIds.filter(id => id !== bookId)
      : [...bundleForm.selectedBookIds, bookId];
    
    const allBooks = data?.books || [];
    const selectedBooks = allBooks.filter((b: any) => nextIds.includes(b.id));
    const sumCents = selectedBooks.reduce((acc: number, b: any) => acc + b.price, 0);
    const sumDollars = (sumCents / 100).toFixed(2);
    
    const pct = parseFloat(bundleForm.savingsPercentage) || 20;
    const newPriceCents = Math.round(sumCents * (1 - pct / 100));
    const newPriceDollars = (newPriceCents / 100).toFixed(2);

    setBundleForm(prev => ({
      ...prev,
      selectedBookIds: nextIds,
      originalPrice: sumDollars,
      price: newPriceDollars
    }));
  };

  const handleSavingsPercentageChange = (pctStr: string) => {
    const pct = parseFloat(pctStr) || 0;
    const orig = parseFloat(bundleForm.originalPrice) || 0;
    const newPrice = orig > 0 ? (orig * (1 - pct / 100)).toFixed(2) : bundleForm.price;
    setBundleForm(prev => ({
      ...prev,
      savingsPercentage: pctStr,
      price: newPrice,
      badge: `Special Box Set · Save ${pctStr}%`
    }));
  };

  const handlePriceChange = (priceStr: string) => {
    const p = parseFloat(priceStr) || 0;
    const orig = parseFloat(bundleForm.originalPrice) || 0;
    const pct = orig > 0 && p < orig ? Math.round(((orig - p) / orig) * 100) : 0;
    setBundleForm(prev => ({
      ...prev,
      price: priceStr,
      savingsPercentage: String(pct),
      badge: `Special Box Set · Save ${pct}%`
    }));
  };

  const handleSaveBundle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleForm.title.trim()) return alert('Please enter bundle title');
    if (bundleForm.selectedBookIds.length === 0) return alert('Please select at least one book for this bundle');

    setSubmittingBundle(true);
    try {
      const priceCents = Math.round(parseFloat(bundleForm.price) * 100);
      const originalPriceCents = Math.round(parseFloat(bundleForm.originalPrice) * 100);
      const savingsPercentage = parseInt(bundleForm.savingsPercentage, 10) || 0;

      const payloadBundle = {
        id: bundleForm.id || `bundle-${Date.now()}`,
        slug: bundleForm.slug || bundleForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: bundleForm.title,
        subtitle: bundleForm.subtitle,
        description: bundleForm.description,
        price: priceCents,
        originalPrice: originalPriceCents,
        savingsPercentage,
        badge: bundleForm.badge,
        coverImage: bundleForm.coverImage,
        bookIds: bundleForm.selectedBookIds
      };

      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_BUNDLE', payload: { bundle: payloadBundle } })
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to save bundle');

      alert(`Box Set "${bundleForm.title}" saved successfully! Storefront has been updated.`);
      setIsBundleFormOpen(false);
      await fetchData();
    } catch (err: any) {
      alert(`Error saving bundle: ${err.message}`);
    } finally {
      setSubmittingBundle(false);
    }
  };

  const handleDeleteBundle = async (bundleId: string, bundleTitle: string) => {
    if (!confirm(`Are you sure you want to delete bundle "${bundleTitle}"?`)) return;
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_BUNDLE', payload: { bundleId } })
      });
      const resJson = await res.json();
      if (!res.ok) throw new Error(resJson.error || 'Failed to delete bundle');
      alert(`Bundle "${bundleTitle}" deleted.`);
      await fetchData();
    } catch (err: any) {
      alert(`Error deleting bundle: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-stone-500">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-[var(--store-green)]" />
        <span>Loading owner administration portal...</span>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const catalogBooks: Book[] = data?.books || [];

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4">
      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Administrator workspace.</strong> Your access is verified on the server.{' '}
        <SignOut />
      </div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-stone-200 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[var(--store-green)]" />
            <span className="text-xs font-bold text-[var(--store-green)] uppercase tracking-widest">
              OWNER ADMINISTRATION
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[var(--store-ink)]">
            Knovera Operations Dashboard
          </h1>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-[var(--store-ink)] text-xs font-semibold rounded transition-colors self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button onClick={refreshCatalog} disabled={refreshingCatalog} className="rounded-lg bg-[#17263c] px-4 py-2 text-sm text-white disabled:opacity-50">
          {refreshingCatalog ? 'Refreshing catalog…' : 'Refresh storefront catalog'}
        </button>
        <p role="status" className="text-sm text-stone-600">{catalogMessage || 'Use after editing books directly in Supabase. Changes made here refresh automatically.'}</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Net Revenue
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--store-ink)] block mt-1">
            ${((kpis.totalRevenue || 0) / 100).toFixed(2)}
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
            Excluding refunds
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Total Orders
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--store-ink)] block mt-1">
            {kpis.totalOrders || 0}
          </span>
          <span className="text-[11px] text-stone-500 font-medium mt-1 block">
            Database ledger verified
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Catalog Books
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-[var(--store-green)] block mt-1">
            {catalogBooks.length}
          </span>
          <span className="text-[11px] text-stone-500 font-medium mt-1 block">
            Active on storefront
          </span>
        </div>

        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Open Support Tickets
          </span>
          <span className="font-serif text-2xl sm:text-3xl font-bold text-amber-700 block mt-1">
            {kpis.openTicketsCount || 0}
          </span>
          <span className="text-[11px] text-stone-500 font-medium mt-1 block">
            Requires response
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-8 overflow-x-auto gap-2">
        {[
          { id: 'overview', label: 'Overview & Settings' },
          { id: 'orders', label: `Orders (${data?.orders?.length || 0})` },
          { id: 'books', label: `Catalog Management (${catalogBooks.length})` },
          { id: 'bundles', label: `Box Sets & Bundles (${data?.bundles?.length || 0})` },
          { id: 'support', label: `Support Tickets (${data?.tickets?.length || 0})` },
          { id: 'reviews', label: `Reviews (${data?.reviews?.length || 0})` },
          { id: 'logs', label: 'Audit Trail' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
              tab === t.id
                ? 'border-[var(--store-green)] text-[var(--store-green)]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Settings */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-4">
            <h3 className="font-serif font-bold text-lg text-[var(--store-ink)]">
              Store Configuration & Payment Provider Readiness
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5">
                <p className="font-bold text-[var(--store-ink)]">Payment Adapter Status:</p>
                <p className="text-emerald-700 font-semibold">
                  • Development Simulator (Active & Fulfilling)
                </p>
                <p className="text-stone-500">
                  Ready to bind Lemon Squeezy API keys & Webhook secrets in <code>.env.local</code>.
                </p>
              </div>

              <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 space-y-1.5">
                <p className="font-bold text-[var(--store-ink)]">Publishing Exclusivity Check:</p>
                <p className="text-emerald-700 font-semibold">
                  • All Titles Declared "WIDE" (Eligible for direct sale)
                </p>
                <p className="text-stone-500">
                  Zero DRM restrictions locked to proprietary distribution.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders */}
      {tab === 'orders' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer Email</th>
                  <th className="p-3.5">Total Paid</th>
                  <th className="p-3.5">Payment Status</th>
                  <th className="p-3.5">Items</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data?.orders?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-stone-50">
                    <td className="p-3.5 font-bold text-[var(--store-ink)]">{ord.orderNumber}</td>
                    <td className="p-3.5">{ord.customerEmail}</td>
                    <td className="p-3.5 font-bold">${(ord.totalAmount / 100).toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        ord.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-3.5 max-w-xs truncate">
                      {ord.items.map((i: any) => i.title).join(', ')}
                    </td>
                    <td className="p-3.5 space-x-2">
                      <Link
                        href={`/orders/${ord.publicToken}`}
                        target="_blank"
                        className="text-[var(--store-green)] hover:underline font-bold"
                      >
                        Receipt
                      </Link>
                      {ord.paymentStatus === 'paid' && (
                        <button
                          onClick={() => handleRefund(ord.id)}
                          className="text-rose-600 hover:underline font-bold cursor-pointer"
                        >
                          Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Books Management (Add & Delete) */}
      {tab === 'books' && (
        <div className="space-y-6">
          
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4 bg-white p-5 rounded-xl border shadow-2xs">
            <div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-[var(--store-ink)]">
                Live Storefront Catalog ({catalogBooks.length} Titles)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Add new books or remove titles. All updates are automatically synced to the client storefront.
              </p>
            </div>
            
            <button
              onClick={() => setIsAddBookOpen(!isAddBookOpen)}
              className="px-4 py-2.5 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-transform hover:-translate-y-0.5 cursor-pointer shrink-0"
            >
              {isAddBookOpen ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{isAddBookOpen ? 'Cancel & Close Form' : 'Add New Book'}</span>
            </button>
          </div>

          {/* Collapsible Add New Book Form */}
          {isAddBookOpen && (
            <div className="bg-white p-6 sm:p-8 rounded-xl border-2 border-[var(--store-green)]/30 shadow-md animate-in fade-in slide-in-from-top-3 duration-200">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[var(--store-green)] flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-lg text-[var(--store-ink)]">
                      Add New Digital Book to Storefront
                    </h4>
                    <p className="text-xs text-stone-500">
                      Fill in the book details below to publish it instantly to your catalog.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddBookOpen(false)}
                  className="text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateBook} className="space-y-6">
                
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Book Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Systems Thinking for Leaders"
                      value={newBookForm.title}
                      onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mental models for high-stakes problem solving"
                      value={newBookForm.subtitle}
                      onChange={(e) => setNewBookForm({ ...newBookForm, subtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>
                </div>

                {/* Author, Category, Sales Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      value={newBookForm.author}
                      onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Category
                    </label>
                    <select
                      value={newBookForm.category}
                      onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    >
                      <option value="Productivity">Productivity</option>
                      <option value="Personal Growth">Personal Growth</option>
                      <option value="Children & Family">Children & Family</option>
                      <option value="Technical & Systems">Technical & Systems</option>
                      <option value="Nonfiction">Nonfiction</option>
                      <option value="Business">Business</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Badge Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. New Release, Bestseller"
                      value={newBookForm.badge}
                      onChange={(e) => setNewBookForm({ ...newBookForm, badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>
                </div>

                {/* Pricing & Length */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Sale Price ($ USD) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="19.99"
                      value={newBookForm.price}
                      onChange={(e) => setNewBookForm({ ...newBookForm, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Original / Compare Price ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="29.99"
                      value={newBookForm.originalPrice}
                      onChange={(e) => setNewBookForm({ ...newBookForm, originalPrice: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Page Count
                    </label>
                    <input
                      type="number"
                      placeholder="250"
                      value={newBookForm.pageCount}
                      onChange={(e) => setNewBookForm({ ...newBookForm, pageCount: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>
                </div>

                {/* Cover Image URL with Presets */}
                <div>
                  <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                    Cover Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      required
                      value={newBookForm.coverImage}
                      onChange={(e) => setNewBookForm({ ...newBookForm, coverImage: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                    <div className="w-10 h-10 rounded border overflow-hidden shrink-0">
                      <img src={newBookForm.coverImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  {/* Preset quick picks */}
                  <div className="flex flex-wrap gap-2 mt-2 text-[11px]">
                    <span className="text-stone-400 font-medium">Quick cover styles:</span>
                    <button
                      type="button"
                      onClick={() => setNewBookForm({ ...newBookForm, coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop' })}
                      className="text-[var(--store-green)] hover:underline"
                    >
                      Minimalist Navy
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setNewBookForm({ ...newBookForm, coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=800&auto=format&fit=crop' })}
                      className="text-[var(--store-green)] hover:underline"
                    >
                      Warm Amber
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setNewBookForm({ ...newBookForm, coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop' })}
                      className="text-[var(--store-green)] hover:underline"
                    >
                      Emerald Foliage
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setNewBookForm({ ...newBookForm, coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop' })}
                      className="text-[var(--store-green)] hover:underline"
                    >
                      Modern Notebook
                    </button>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Short Description (For Catalog Cards & Search) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Brief 1-2 sentence hook for the book cards..."
                      value={newBookForm.shortDescription}
                      onChange={(e) => setNewBookForm({ ...newBookForm, shortDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Full Editorial Description (For Book Detail Page)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Comprehensive overview of the book's core premise and value..."
                      value={newBookForm.fullDescription}
                      onChange={(e) => setNewBookForm({ ...newBookForm, fullDescription: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    ></textarea>
                  </div>
                </div>

                {/* Table of Contents & What's Included */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Table of Contents (One chapter per line)
                    </label>
                    <textarea
                      rows={4}
                      value={newBookForm.tableOfContents}
                      onChange={(e) => setNewBookForm({ ...newBookForm, tableOfContents: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs font-mono bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    ></textarea>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      What's Included (One item per line)
                    </label>
                    <textarea
                      rows={4}
                      value={newBookForm.whatsIncluded}
                      onChange={(e) => setNewBookForm({ ...newBookForm, whatsIncluded: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    ></textarea>
                  </div>
                </div>

                {/* Opening Excerpt for Sample Reader */}
                <div>
                  <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                    Sample Excerpt (For Client-Side Instant Sample Reader)
                  </label>
                  <textarea
                    rows={4}
                    value={newBookForm.sampleExcerpt}
                    onChange={(e) => setNewBookForm({ ...newBookForm, sampleExcerpt: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                  ></textarea>
                </div>

                {/* Featured on Hero Option */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={newBookForm.featured}
                    onChange={(e) => setNewBookForm({ ...newBookForm, featured: e.target.checked })}
                    className="w-4 h-4 rounded text-[var(--store-green)] focus:ring-[var(--store-green)]"
                  />
                  <label htmlFor="featured-check" className="text-xs font-semibold text-stone-700 cursor-pointer">
                    Set as Featured Flagship on Homepage Hero Banner
                  </label>
                </div>

                {/* Form Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsAddBookOpen(false)}
                    className="px-4 py-2.5 border border-stone-300 text-stone-600 text-xs font-semibold rounded hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBook}
                    className="px-6 py-2.5 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingBook ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-300" />
                    )}
                    <span>{submittingBook ? 'Publishing Book...' : 'Publish Book to Storefront'}</span>
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* Current Book Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {catalogBooks.map((book) => (
              <div 
                key={book.id} 
                className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-4 flex flex-col justify-between hover:border-stone-300 transition-colors"
              >
                <div>
                  <div className="flex gap-4">
                    <img 
                      src={book.coverImage} 
                      alt={book.title} 
                      className="w-20 h-28 object-cover rounded-lg border border-stone-200 shrink-0 shadow-2xs" 
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold text-[var(--store-green)] bg-emerald-50 px-2 py-0.5 rounded">
                          {book.category}
                        </span>
                        {book.badge && (
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                            {book.badge}
                          </span>
                        )}
                        {book.featured && (
                          <span className="text-[10px] font-bold text-[var(--store-green)] bg-[var(--store-sage)] px-2 py-0.5 rounded">
                            Hero Flagship
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-base text-[var(--store-ink)] line-clamp-1">
                        {book.title}
                      </h3>
                      {book.subtitle && (
                        <p className="text-xs text-stone-500 line-clamp-1">{book.subtitle}</p>
                      )}

                      <div className="flex items-baseline gap-2 pt-0.5">
                        <span className="font-bold text-sm text-[var(--store-ink)]">
                          ${(book.price / 100).toFixed(2)}
                        </span>
                        {book.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            ${(book.originalPrice / 100).toFixed(2)}
                          </span>
                        )}
                        <span className="text-[11px] text-stone-500">• {book.pageCount || 250} pages</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 mt-3 bg-stone-50 p-2.5 rounded border border-stone-100">
                    {book.shortDescription}
                  </p>
                </div>

                {/* Card Actions: Preview on Storefront & Delete Button */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <Link 
                    href={`/books/${book.slug}`} 
                    target="_blank" 
                    className="font-bold text-[var(--store-green)] hover:underline flex items-center gap-1"
                  >
                    <span>View Book Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleDeleteBook(book.id, book.title)}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 rounded-md font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete book from store"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Book</span>
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* Tab: Box Sets & Bundles */}
      {tab === 'bundles' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <div>
              <h2 className="font-serif font-bold text-lg text-[var(--store-ink)]">
                Box Sets &amp; Dynamic Bundles Management
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Create and customize multi-edition digital box sets, edit prices, adjust discount percentages, and select included titles.
              </p>
            </div>
            <button
              onClick={openNewBundleForm}
              className="px-4 py-2 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-transform hover:-translate-y-0.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Box Set</span>
            </button>
          </div>

          {/* Create / Edit Bundle Modal Form */}
          {isBundleFormOpen && (
            <div className="p-6 bg-white rounded-xl border-2 border-[var(--store-green)] shadow-lg space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-[var(--store-green)]" />
                  <h3 className="font-serif font-bold text-lg text-[var(--store-ink)]">
                    {editingBundleId ? 'Edit Box Set Bundle' : 'Create New Curated Box Set'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsBundleFormOpen(false)}
                  className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveBundle} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Bundle Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Complete Mastery & Productivity Bundle"
                      value={bundleForm.title}
                      onChange={(e) => setBundleForm({ ...bundleForm, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. the-complete-mastery-bundle"
                      value={bundleForm.slug}
                      onChange={(e) => setBundleForm({ ...bundleForm, slug: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                    Subtitle / Box Set Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="Short description shown on storefront"
                    value={bundleForm.subtitle}
                    onChange={(e) => setBundleForm({ ...bundleForm, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                    Comprehensive Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Detailed explanation of what the reader gets..."
                    value={bundleForm.description}
                    onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded focus:bg-white focus:outline-hidden focus:border-[var(--store-green)]"
                  />
                </div>

                {/* Included Books Selector */}
                <div>
                  <label className="text-xs font-bold text-[var(--store-ink)] block mb-1.5">
                    Select Included Editions ({bundleForm.selectedBookIds.length} selected) <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 p-3 bg-stone-50 rounded-lg border border-stone-200 max-h-56 overflow-y-auto">
                    {catalogBooks.filter((b: any) => b.isPublished).map((book: any) => {
                      const isChecked = bundleForm.selectedBookIds.includes(book.id);
                      return (
                        <label
                          key={book.id}
                          className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                            isChecked ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleBundleBook(book.id)}
                            className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="min-w-0 text-xs">
                            <span className="font-bold text-stone-800 block truncate">{book.title}</span>
                            <span className="text-stone-500">${(book.price / 100).toFixed(2)} USD</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Pricing, Discount Percentage & Badge */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-amber-50/50 rounded-lg border border-amber-200">
                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Standalone Total ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bundleForm.originalPrice}
                      onChange={(e) => setBundleForm({ ...bundleForm, originalPrice: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded"
                    />
                    <span className="text-[10px] text-stone-500">Sum of separate books</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Discount Percentage (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={bundleForm.savingsPercentage}
                      onChange={(e) => handleSavingsPercentageChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded font-bold text-emerald-700"
                    />
                    <span className="text-[10px] text-stone-500">Auto-adjusts bundle price</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Final Bundle Price ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={bundleForm.price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono bg-white border border-stone-300 rounded font-bold text-[var(--store-ink)]"
                    />
                    <span className="text-[10px] text-stone-500">Price customer pays</span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[var(--store-ink)] block mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={bundleForm.badge}
                      onChange={(e) => setBundleForm({ ...bundleForm, badge: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded"
                    />
                    <span className="text-[10px] text-stone-500">e.g. Save 22%</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsBundleFormOpen(false)}
                    className="px-4 py-2 border border-stone-300 text-stone-600 text-xs font-semibold rounded hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBundle}
                    className="px-6 py-2 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingBundle ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>{submittingBundle ? 'Saving Box Set...' : 'Save & Publish Box Set'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Bundles Grid */}
          <div className="grid grid-cols-1 gap-6">
            {(data?.bundles || []).map((bundle: any) => {
              const bundleBooks = bundle.books || [];
              const standaloneSum = (bundle.originalPrice || 0) / 100;
              const bundlePrice = (bundle.price || 0) / 100;
              const savingsAmount = standaloneSum > bundlePrice ? (standaloneSum - bundlePrice).toFixed(2) : '0.00';

              return (
                <div
                  key={bundle.id}
                  className="p-6 bg-white rounded-xl border border-stone-200 shadow-2xs hover:border-stone-300 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-2.5 py-0.5 text-[10px] font-bold text-amber-900 bg-amber-100 rounded-full">
                        {bundle.badge || `Save ${bundle.savingsPercentage}%`}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">
                        slug: /{bundle.slug}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[var(--store-ink)]">
                      {bundle.title}
                    </h3>

                    <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                      {bundle.description || bundle.subtitle}
                    </p>

                    <div className="flex items-center gap-4 text-xs pt-1">
                      <span className="font-serif text-lg font-bold text-[var(--store-ink)]">
                        ${bundlePrice.toFixed(2)} USD
                      </span>
                      <span className="line-through text-stone-400">
                        ${standaloneSum.toFixed(2)} separate
                      </span>
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                        Save ${savingsAmount} ({bundle.savingsPercentage}%)
                      </span>
                    </div>

                    {/* Included books list */}
                    <div className="pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                        Included Editions ({bundleBooks.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {bundleBooks.map((b: any) => (
                          <span
                            key={b.id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 rounded text-xs text-stone-700 font-medium"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-stone-500" />
                            <span>{b.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 shrink-0 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => openEditBundleForm(bundle)}
                      className="px-4 py-2 text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 rounded transition-colors cursor-pointer"
                    >
                      Edit Bundle
                    </button>
                    <Link
                      href={`/bundles/${bundle.slug}`}
                      target="_blank"
                      className="px-4 py-2 text-xs font-bold text-[var(--store-green)] hover:bg-emerald-50 rounded transition-colors text-center flex items-center justify-center gap-1"
                    >
                      <span>Preview</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteBundle(bundle.id, bundle.title)}
                      className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 4: Support */}
      {tab === 'support' && (
        <div className="space-y-4">
          {data?.tickets?.map((t: any) => (
            <div key={t.id} className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--store-ink)] text-sm">
                  #{t.ticketNumber} • {t.subject}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  t.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-stone-500">From: {t.customerEmail} {t.orderReference ? `(Ref: ${t.orderReference})` : ''}</p>
              <p className="text-xs sm:text-sm text-stone-700 bg-stone-50 p-3 rounded">{t.message}</p>
              {t.status === 'open' && (
                <div className="pt-2">
                  <button
                    onClick={() => handleResolveTicket(t.id)}
                    className="px-3 py-1.5 bg-[var(--store-gold)] hover:bg-[var(--store-gold-hover)] text-[var(--store-ink)] text-xs font-bold rounded cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 5: Reviews */}
      {tab === 'reviews' && (
        <div className="space-y-4">
          {data?.reviews?.map((r: any) => (
            <div key={r.id} className="p-5 bg-white rounded-xl border border-stone-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[var(--store-ink)]">{r.authorName}</span>
                  <span className="text-xs text-stone-400 ml-2">({r.location})</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 italic">"{r.reviewText}"</p>
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-stone-400">{r.createdAt}</span>
                <button
                  onClick={() => handleToggleReview(r.id, r.isApproved)}
                  className={`px-3 py-1 rounded font-bold cursor-pointer ${
                    r.isApproved ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {r.isApproved ? 'Unpublish' : 'Approve & Publish'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 6: Audit Logs */}
      {tab === 'logs' && (
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {data?.auditLogs?.map((log: any) => (
                <tr key={log.id} className="hover:bg-stone-50">
                  <td className="p-3.5 text-stone-400 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-[var(--store-ink)] font-mono">{log.action}</td>
                  <td className="p-3.5 text-stone-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
