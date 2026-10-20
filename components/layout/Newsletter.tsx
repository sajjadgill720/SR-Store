'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, Loader2, Lock, Mail } from 'lucide-react';

export default function Newsletter() {
  const inputId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, topics: ['general'] }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not save your signup.');
      }
      setStatus('success');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save your signup. Please try again.');
      setStatus('idle');
    }
  };

  return <div className="store-newsletter-card">
    <h2>Good reads. Fresh finds.</h2>
    <p>Ebook releases, reading inspiration, and useful digital goods. A little more curiosity in your inbox.</p>
    <form onSubmit={submit}>
      <label htmlFor={inputId}>Email address</label>
      <div className="store-newsletter-input"><Mail size={18} aria-hidden="true"/><input id={inputId} type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={event=>{setEmail(event.target.value);setError('');if(status==='success')setStatus('idle');}} aria-describedby={error?errorId:undefined}/></div>
      <button className="store-auth-submit" disabled={status==='loading'||status==='success'}>{status==='loading'?<><Loader2 size={17} className="animate-spin"/> Signing up…</>:status==='success'?<><CheckCircle2 size={17}/> Check your inbox</>:<>Sign up free <ArrowRight size={17}/></>}</button>
      {error && <p id={errorId} className="store-auth-error" role="alert">{error}</p>}
      {status==='success'?<p role="status">Check your inbox to confirm your subscription. If you are already subscribed, you’re all set.</p>:<p className="store-newsletter-privacy"><Lock size={14} aria-hidden="true"/> Unsubscribe from any issue. <Link href="/legal/privacy">Privacy policy</Link></p>}
    </form>
  </div>;
}
