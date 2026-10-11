'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Download, CircleCheck, Clock, CircleAlert } from 'lucide-react';
import type { Order } from '../../lib/types';
import { formatLabel, money, orderPresentation } from '../../lib/catalog';
type Receipt = Pick<Order, 'id' | 'orderNumber' | 'customerEmail' | 'customerName' | 'totalAmount' | 'paymentStatus' | 'createdAt' | 'items'> & {
    provider?: Order['provider'];
};
export default function OrderAccess({ token }: {
    token: string | null;
}) {
    const [order, setOrder] = useState<Receipt | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [downloadError, setDownloadError] = useState('');
    const [downloading, setDownloading] = useState('');
    useEffect(() => {
        const controller = new AbortController();
        queueMicrotask(async () => { if (controller.signal.aborted)
            return; try {
            if (!token)
                throw new Error('Your order link is missing. Use purchase recovery to find it.');
            const response = await fetch('/api/orders/lookup?token=' + encodeURIComponent(token), { cache: 'no-store', signal: controller.signal });
            const data = await response.json();
            if (!response.ok || !data.order)
                throw new Error(data.error || 'We could not find that order.');
            if (!controller.signal.aborted)
                setOrder(data.order);
        }
        catch (reason) {
            if (!controller.signal.aborted)
                setError(reason instanceof Error ? reason.message : 'Could not load your order. Please try again.');
        }
        finally {
            if (!controller.signal.aborted)
                setLoading(false);
        } });
        return () => controller.abort();
    }, [token]);
    const download = async (bookId: string, format: string) => { if (!order)
        return; setDownloading(bookId + '-' + format); setDownloadError(''); try {
        const response = await fetch('/api/downloads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: order.customerEmail, bookId, format }) });
        const data = await response.json();
        if (!response.ok)
            throw new Error(data.error || 'Could not prepare the download.');
        window.location.assign(data.downloadUrl);
    }
    catch (reason) {
        setDownloadError(reason instanceof Error ? reason.message : 'Could not prepare your download. Please try again.');
    }
    finally {
        setDownloading('');
    } };
    if (loading)
        return <div className="storefront studio-skeleton" role="status">
        <Clock size={28}/>
        <h1>Opening your order…</h1>
        <p>Checking the recorded payment and access status.</p>
        </div>;
    if (error || !order)
        return <div className="storefront studio-empty">
        <CircleAlert aria-hidden="true"/>
        <h1>Let’s find your order.</h1>
        <p role="alert">{error || 'The order could not be found.'}</p>
        <div className="studio-actions">
        <Link className="studio-button" href="/access">Recover a purchase</Link>
        <Link className="studio-button outline" href="/contact">Contact support</Link>
        <button className="studio-button outline" onClick={() => window.location.reload()}>Try again</button>
        </div>
        </div>;
    const status = orderPresentation(order.paymentStatus);
    const test = order.provider === 'development_simulator';
    const Icon = status.accessible ? CircleCheck : order.paymentStatus === 'pending' ? Clock : CircleAlert;
    return <div className="storefront">
    <section className="studio-order-heading">
    <Icon size={30} aria-hidden="true"/>
    <span className="studio-kicker">{test ? 'TEST ORDER' : 'ORDER STATUS'}</span>
    <h1>{test && status.accessible ? 'Your test order is ready.' : status.title}</h1>
    <p>{status.description}</p>{test && <p className="studio-caption">No payment was collected. Downloads are demo files, not the published edition.</p>}<dl>
    <dt>Order</dt>
    <dd>{order.orderNumber}</dd>
    <dt>Email</dt>
    <dd>{order.customerEmail}</dd>
    <dt>Status</dt>
    <dd>{order.paymentStatus}</dd>
    <dt>{test ? 'Recorded total' : 'Order total'}</dt>
    <dd>{money(order.totalAmount)} USD</dd>
    </dl>
    </section>
    <section className="studio-order-files">
    <div className="studio-section-heading">
    <div>
    <span className="studio-kicker">YOUR DIGITAL EDITIONS</span>
    <h2>{status.accessible ? 'Choose a reading format.' : 'Books in this order'}</h2>
    </div>
    <Link className="studio-text-link" href="/help">Reading & device help</Link>
    </div>{order.items.map(item => <article className="studio-order-file" key={item.id}>
        <div>
        <h3>{item.title}</h3>
        <p>{item.editionVersion}</p>
        </div>{status.accessible && <div className="studio-download-actions">{item.formats.map(format => <button key={format} disabled={!!downloading} className="studio-button outline" onClick={() => download(item.bookId, format)}>
                <Download size={16}/>{downloading === item.bookId + '-' + format ? 'Preparing…' : `${test ? 'Demo ' : ''}${formatLabel(format)}`}</button>)}</div>}</article>)}{downloadError && <p className="studio-error" role="alert">{downloadError}</p>}<div className="studio-actions">
    <Link className="studio-button" href="/account/library">Open my library <ArrowRight size={17}/>
    </Link>
    <Link className="studio-button outline" href="/contact">Get help with this order</Link>
    </div>
    <p className="studio-caption">Keep this page’s link to return to your order. Receipt email delivery is not connected in this preview.</p>
    </section>
  </div>;
}
