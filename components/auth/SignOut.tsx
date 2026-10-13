'use client';
import { useState } from 'react';
import { browserAuth } from '@/lib/auth/browser';

export async function signOut() {
  const response=await fetch('/api/auth/logout',{method:'POST'});
  if(!response.ok) throw new Error('Could not sign out. Please try again.');
  await browserAuth().auth.signOut({scope:'local'});
  // Clear all in-memory reader/admin state by starting a fresh document after logout.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination
  window.location.assign('/account/login');
}
export default function SignOut() {
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  return <span><button className="studio-text-link" disabled={busy} onClick={async()=>{setBusy(true);try{await signOut();}catch{setError('Could not sign out. Please try again.');setBusy(false);}}}>{busy?'Signing out…':'Sign out'}</button>{error && <span role="alert">{error}</span>}</span>;
}
