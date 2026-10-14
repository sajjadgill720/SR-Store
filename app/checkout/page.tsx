'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
import { money } from '../../lib/catalog';
import BookCover from '../../components/books/BookCover';
export default function CheckoutPage() {
    const { items, cartTotal } = useCart();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        setEmailError('');
        setError('');
        if (!email.trim() || !email.includes('@')) {
            setEmailError('Enter the email you want to use for your library.');
            return;
        }
        setBusy(true);
        try {
            const response = await fetch('/api/checkouts', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customerEmail:email.trim(),customerName:name.trim()||undefined,items:items.map(item=>({bookId:item.bookId,quantity:item.quantity}))})});
            const data=await response.json();
            if(!response.ok || !data.checkoutUrl) throw new Error(data.error || 'Could not open secure checkout.');
            window.location.assign(data.checkoutUrl);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Could not open checkout. Your cart and details have been kept.');
            setBusy(false);
        }
    };
    if (!items.length && !busy)
        return <div className="storefront studio-empty">
        <h1>Your cart is empty.</h1>
        <p>Choose a digital edition before continuing.</p>
        <Link className="studio-button" href="/books">Explore books</Link>
        </div>;
    if (!items.length && busy)
        return <div className="storefront studio-skeleton" role="status">Opening your order…</div>;
    return <div className="storefront">
    <Link href="/cart" className="studio-back">
    <ArrowLeft size={16}/>Edit your cart</Link>
    <div className="studio-page-heading">
    <span className="studio-kicker">ONE SIMPLE STEP</span>
    <h1>Make it your next read.</h1>
    <p>No account registration required.</p>
    </div>
    <div className="studio-notice">
    <strong>Secure checkout with Lemon Squeezy</strong>
    <p>Lemon Squeezy handles payment and applicable taxes as merchant of record. Your books unlock after payment confirmation.</p>
    </div>
    <div className="studio-checkout-layout">
    <form className="studio-checkout-form" onSubmit={submit}>
    <h2>Your reading details</h2>
    <label htmlFor="checkout-email">Email address</label>
    <input id="checkout-email" type="email" autoComplete="email" required value={email} onChange={event => { setEmail(event.target.value); setEmailError(''); }} aria-invalid={!!emailError} aria-describedby={emailError ? 'checkout-email-error' : 'checkout-email-help'}/>
    <p id="checkout-email-help" className="studio-caption">Use this email to find your books in your library.</p>{emailError && <p role="alert" id="checkout-email-error" className="studio-error">{emailError}</p>}<label htmlFor="checkout-name">Name <span className="studio-caption">(optional)</span>
    </label>
    <input id="checkout-name" autoComplete="name" value={name} onChange={event => setName(event.target.value)}/>{error && <p className="studio-error" role="alert">{error}</p>}<button className="studio-button" disabled={busy}>{busy ? 'Opening secure checkout…' : `Continue to payment · ${money(cartTotal)} USD`}<ArrowRight size={17}/>
    </button>
    <p className="studio-caption" aria-live="polite">{busy ? 'Opening Lemon Squeezy…' : 'Final taxes and total are shown on the secure checkout page. Your cart is kept if you cancel.'}</p>
    </form>
    <aside className="studio-order-summary">
    <span className="studio-kicker">YOUR DIGITAL EDITIONS</span>{items.map(item => <div className="studio-summary-item" key={item.bookId}>
        <BookCover src={item.coverImage} title={item.title} size="small"/>
        <div>
        <h3>{item.title}</h3>
        <p>{item.formatSelected} · Quantity {item.quantity}</p>
        <strong>{money(item.price * item.quantity)}</strong>
        </div>
        </div>)}<dl>
    <dt className="studio-total">Subtotal before tax</dt>
    <dd className="studio-total">{money(cartTotal)} USD</dd>
    </dl>
    <Link href="/contact" className="studio-text-link">Need a hand?</Link>
    </aside>
  </div>
    </div>;
}
