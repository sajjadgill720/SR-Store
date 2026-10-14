'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import CheckoutPending from '@/components/books/CheckoutPending';
import OrderAccess from '../../../components/books/OrderAccess';
function Content() { const params=useSearchParams(); const checkout=params.get('checkout'); const token=params.get('token'); if(checkout)return <CheckoutPending key={checkout} token={checkout}/>; return <OrderAccess key={token} token={token}/>; }
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening your order…</div>}>
    <Content />
    </Suspense>;
}
