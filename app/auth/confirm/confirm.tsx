'use client';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function Confirm() {
  const params=useSearchParams();
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  async function confirm() {
    setBusy(true);setError('');
    try {
      const response=await fetch('/api/auth/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token_hash:params.get('token_hash'),type:params.get('type'),next:params.get('next')})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error||'Could not verify your link.');
      window.history.replaceState(null,'','/auth/confirm');
      window.location.assign(data.next);
    } catch(reason) {setError(reason instanceof Error?reason.message:'Could not verify your link.');setBusy(false);}
  }
  return <section className="storefront studio-empty"><h1>Confirm your account access.</h1><p>Continue to verify your email or open your password-reset form.</p><button className="studio-button" disabled={busy} onClick={()=>void confirm()}>{busy?'Verifying…':'Continue'}</button>{error && <p role="alert" className="studio-error">{error}</p>}<p><Link href="/account/login">Return to sign in</Link></p></section>;
}
