'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react';
export default function AccessPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(''); setSubmitted(false);
    try {
      const response = await fetch('/api/access/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not request recovery.');
      setSubmitted(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Please try again later.'); }
    finally { setBusy(false); }
  }
  return <div className="storefront"><Link className="studio-back" href="/account/library"><ArrowLeft size={16} />Back to your library</Link><div className="studio-page-heading"><span className="studio-kicker">BACK TO YOUR BOOKS</span><h1>Recover your purchase.</h1><p>Enter the email used at checkout. We’ll email your purchase links to that address.</p></div><form className="studio-checkout-form studio-recovery-form" onSubmit={submit}><label htmlFor="recovery-email">Purchase email</label><input id="recovery-email" type="email" required autoComplete="email" value={email} onChange={event => { setEmail(event.target.value); setSubmitted(false); }} />{error && <p className="studio-error" role="alert">{error}</p>}<button className="studio-button" disabled={busy}>{busy ? 'Requesting…' : 'Email my purchase links'}<ArrowRight size={17} /></button><p className="studio-caption">Your order links are private. They will only be sent to your purchase email.</p></form>{submitted && <section className="studio-section" role="status"><Mail size={28} /><h2>Check your inbox.</h2><p>If a purchase matches this address, we’ll email its order links. Check your spam folder too, and allow a few minutes for delivery.</p><Link className="studio-text-link" href="/contact">Need help? Contact support</Link></section>}</div>;
}
