'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import OrderAccess from './OrderAccess';
import { browserReads } from '@/lib/cache/browser';
export default function CheckoutPending({token}:{token:string}) {
  const [order,setOrder]=useState<string|null>(null),[message,setMessage]=useState('Waiting for secure payment confirmation…'),[attempt,setAttempt]=useState(0);
  useEffect(()=>{
    let active=true,timer:ReturnType<typeof setTimeout>;let tries=0;
    const controller=new AbortController();
    async function check() {
      try {
        const response=await fetch('/api/checkouts?token='+encodeURIComponent(token),{cache:'no-store',signal:controller.signal});
        const data=await response.json();
        if(!active)return;
        if(response.ok && data.publicToken){browserReads.invalidate('library');setOrder(data.publicToken);return;}
        if(!response.ok && response.status!==429){setMessage(data.error||'Unable to confirm this checkout.');return;}
        if(++tries>=40){setMessage('Confirmation is taking longer than expected. Check again or use the link in your receipt. Please do not pay again.');return;}
        timer=setTimeout(check,response.status===429?Math.max(3000,Number(response.headers.get('retry-after')||60)*1000):3000);
      }catch{if(active)setMessage('Connection interrupted. Check again to confirm your payment.');}
    }
    void check();return()=>{active=false;controller.abort();clearTimeout(timer);};
  },[token,attempt]);
  if(order)return <OrderAccess token={order}/>;
  return <div className="storefront studio-empty"><h1>Confirming your order</h1><p role="status">{message}</p><button className="studio-button" onClick={()=>setAttempt(n=>n+1)}>Check again</button><Link href="/contact">Contact support</Link></div>;
}
