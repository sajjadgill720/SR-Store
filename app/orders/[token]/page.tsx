'use client';
import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import OrderAccess from '../../../components/books/OrderAccess';
function Content() { const params = useParams<{
    token: string;
}>(); return <OrderAccess key={params.token} token={params.token}/>; }
export default function Page() {
    return <Suspense fallback={<div className="storefront studio-skeleton" role="status">Opening your order…</div>}>
    <Content />
    </Suspense>;
}
