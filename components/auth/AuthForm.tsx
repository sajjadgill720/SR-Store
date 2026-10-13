'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { browserAuth } from '@/lib/auth/browser';
import { authDestination } from '@/lib/auth/navigation';

export default function AuthForm({ admin = false, update = false }: {admin?:boolean;update?:boolean}) {
  const params = useSearchParams();
  const [mode,setMode] = useState<'login'|'signup'|'forgot'|'update'>(update?'update':'login');
  const [busy,setBusy] = useState(false);
  const [email,setEmail] = useState('');
  const [message,setMessage] = useState('');
  const [error,setError] = useState(params.get('error') === 'link' ? 'This link could not be verified. Request a new link, or open it in the browser where you started.' : params.get('error') === 'admin' ? 'Your account does not have administrator access.' : '');
  const next = admin ? '/admin' : authDestination(params.get('next'));
  const title = mode==='signup'?'Create your reader account':mode==='forgot'?'Reset your password':mode==='update'?'Choose a new password':admin?'Admin sign in':'Welcome back';
  const callback = (destination:string) => `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`;
  async function finish() {
    const response = await fetch('/api/auth/session',{cache:'no-store'});
    const result = await response.json();
    if (!response.ok || !result.user) throw new Error(result.error || 'Confirm your email before signing in.');
    if (next==='/admin' && result.user.role!=='admin') throw new Error('You are signed in as a reader. Administrator access must be granted by the owner.');
    window.location.assign(next);
  }
  async function submit(event:React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setBusy(true);setError('');setMessage('');
    const values = new FormData(event.currentTarget);
    try {
      const client = browserAuth();
      const password = String(values.get('password') || '');
      if (mode==='login') {
        const {error}=await client.auth.signInWithPassword({email:email.trim(),password});
        if(error) throw error;
        await finish();
      } else if(mode==='signup') {
        const {data,error}=await client.auth.signUp({email:email.trim(),password,options:{data:{name:String(values.get('name')||'').trim()},emailRedirectTo:callback(next)}});
        if(error) throw error;
        if(data.session) await finish();
        else setMessage('Check your email for a confirmation link. If you already have an account, sign in or reset your password.');
      } else if(mode==='forgot') {
        const {error}=await client.auth.resetPasswordForEmail(email.trim(),{redirectTo:callback('/account/update-password')});
        if(error) throw error;
        setMessage('If an account exists for this address, you will receive a password-reset email.');
      } else {
        if(password!==values.get('confirm')) throw new Error('The passwords do not match.');
        const user=await client.auth.getUser();
        if(user.error || !user.data.user) throw new Error('Open a fresh password-reset link from your email first.');
        const {error}=await client.auth.updateUser({password});
        if(error) throw error;
        const signedOut=await client.auth.signOut({scope:'global'});
        if(signedOut.error) throw signedOut.error;
        await fetch('/api/auth/logout',{method:'POST'});
        setMessage('Password updated. Sign in with your new password.');setMode('login');
      }
    } catch(reason) {setError(reason instanceof Error?reason.message:'Could not complete your request. Please try again.');}
    finally {setBusy(false);}
  }
  async function resend() {
    setBusy(true);setError('');setMessage('');
    try {
      if(!email.trim()) throw new Error('Enter your email address first.');
      const {error}=await browserAuth().auth.resend({type:'signup',email:email.trim(),options:{emailRedirectTo:callback(next)}});
      if(error) throw error;
      setMessage('If confirmation is needed, a new link will arrive in your inbox.');
    } catch(reason) {setError(reason instanceof Error?reason.message:'Could not resend your confirmation.');}
    finally {setBusy(false);}
  }
  function switchMode(value:typeof mode) {setMode(value);setError('');setMessage('');}
  return <section className="storefront" style={{maxWidth:560,paddingTop:48,paddingBottom:64}}>
    <div className="studio-page-heading"><span className="studio-kicker">{admin?'KNOVERA ADMIN':'YOUR KNOVERA ACCOUNT'}</span><h1>{title}</h1><p>{admin?'Use the account granted access by the store owner.':'One account for your books, conversations, and reading journal.'}</p></div>
    <form className="studio-library-lookup" onSubmit={submit} style={{display:'grid',gap:16}}>
      {mode==='signup' && <label>Display name<input name="name" autoComplete="nickname" required minLength={2} maxLength={60}/></label>}
      {mode!=='update' && <label>Email address<input name="email" type="email" autoComplete="email" required value={email} onChange={event=>setEmail(event.target.value)}/></label>}
      {mode!=='forgot' && <label>{mode==='update'?'New password':'Password'}<input name="password" type="password" autoComplete={mode==='login'?'current-password':'new-password'} required minLength={mode==='login'?1:10} maxLength={128}/></label>}
      {mode==='update' && <label>Confirm new password<input name="confirm" type="password" autoComplete="new-password" required minLength={10} maxLength={128}/></label>}
      {(mode==='signup'||mode==='update') && <p className="studio-caption">Use at least 10 characters. Your display name is public; your email and journal are private.</p>}
      <button className="studio-button" disabled={busy}>{busy?'Please wait…':mode==='signup'?'Create account':mode==='forgot'?'Send reset link':mode==='update'?'Save password':'Sign in'}</button>
    </form>
    {error && <p className="studio-error" role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <div className="studio-actions" style={{marginTop:24}}>
      {mode==='login' && <button className="studio-text-link" disabled={busy} onClick={()=>switchMode('forgot')}>Forgot password?</button>}
      {!admin && mode==='login' && <button className="studio-text-link" disabled={busy} onClick={()=>switchMode('signup')}>Create an account</button>}
      {mode!=='login' && <button className="studio-text-link" disabled={busy} onClick={()=>switchMode('login')}>Back to sign in</button>}
      {(mode==='login'||mode==='signup') && <button className="studio-text-link" disabled={busy} onClick={()=>void resend()}>Resend confirmation email</button>}
    </div>
    <p className="studio-caption"><Link href="/account/library">My library</Link> · <Link href="/">Back to store</Link></p>
  </section>;
}
