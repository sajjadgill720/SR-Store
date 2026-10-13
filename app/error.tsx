'use client';
import Link from 'next/link';
export default function StoreError({reset}:{error:Error & {digest?:string};reset:()=>void}) {
  return <div className="storefront"><div className="studio-page-heading"><span className="studio-kicker">PLEASE TRY AGAIN</span><h1>The store is temporarily unavailable.</h1><p>We couldn’t connect to the store’s data. Please retry in a moment.</p></div><button className="studio-button" onClick={reset}>Try again</button><Link className="studio-text-link" href="/contact">Contact support</Link></div>;
}
