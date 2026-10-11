'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderAccess from '../../../components/books/OrderAccess';
function Content() { const token = useSearchParams().get('token'); return <OrderAccess key={token} token={token}/>; }
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening your order…</div>}>
    <Content />
    </Suspense>;
}
