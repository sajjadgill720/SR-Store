'use client';
import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from './FooterLink';
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react';


export default function Newsletter() {
  const router = useRouter();
  const inputId = useId();
  const errorId = useId();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setError('');
    try { sessionStorage.setItem('knovera-reader-club-email', email.trim()); } catch { /* The next step still works without browser storage. */ }
    router.push('/reader-club#preferences');
  };
  return <div className="store-newsletter-card">
    <h2>Good reads. Fresh finds.</h2>
    <p>Ebook releases, reading inspiration, and useful digital goods. Choose your topics on the next step.</p>
    <form onSubmit={submit}>
      <label htmlFor={inputId}>Email address</label>
      <div className="store-newsletter-input"><Mail size={18} aria-hidden="true"/><input id={inputId} type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={event=>{setEmail(event.target.value);setError('');}} aria-describedby={error?errorId:undefined}/></div>
      <button className="store-auth-submit" disabled={busy}>{busy?<><Loader2 size={17} className="animate-spin"/> Opening topics…</>:<>Sign up free <ArrowRight size={17}/></>}</button>
      {error && <p id={errorId} className="store-auth-error" role="alert">{error}</p>}
      <p className="store-newsletter-privacy"><Lock size={14} aria-hidden="true"/> Unsubscribe from any issue. <Link href="/legal/privacy">Privacy policy</Link></p>
    </form>
  </div>;
}
