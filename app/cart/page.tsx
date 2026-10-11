'use client';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
import { money } from '../../lib/catalog';
import BookCover from '../../components/books/BookCover';
export default function CartPage() {
    const { items, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart, storageError } = useCart();
    return <div className="storefront">
    <Link className="studio-back" href="/books">
    <ArrowLeft size={16}/>Back to books</Link>
    <div className="studio-page-heading">
    <span className="studio-kicker">YOUR READING LIST</span>
    <h1>Your cart.</h1>
    <p>Review your digital editions before checkout. No physical books or shipping.</p>
    </div>
    {storageError && <p className="studio-error" role="alert">{storageError}</p>}
    {!items.length ? <div className="studio-empty">
        <h2>Find something worth a few pages.</h2>
        <p>Your cart is empty. Read a sample or explore the collection.</p>
        <Link className="studio-button" href="/books">Explore books</Link>
        </div> :
            <div className="studio-checkout-layout">
            <section aria-label="Books in your cart" className="studio-cart-items">{items.map(item => <article className="studio-cart-item" key={item.bookId}>
                <Link href={`/books/${item.slug}`} aria-label={`View ${item.title}`}>
                <BookCover src={item.coverImage} title={item.title} size="small"/>
                </Link>
                <div className="studio-cart-item-info">
                <Link href={`/books/${item.slug}`}>
                <h2>{item.title}</h2>
                </Link>
                <p>{item.author}</p>
                <p className="studio-caption">{item.formatSelected} · {money(item.price)} USD each</p>
                <div className="studio-cart-item-controls">
                <div className="studio-stepper" aria-label={`Quantity for ${item.title}`}>
                <button aria-label={`Decrease quantity of ${item.title}`} onClick={() => updateQuantity(item.bookId, item.quantity - 1)}>
                <Minus size={16}/>
                </button>
                <output aria-live="polite">{item.quantity}</output>
                <button aria-label={`Increase quantity of ${item.title}`} disabled={item.quantity >= 99} onClick={() => updateQuantity(item.bookId, item.quantity + 1)}>
                <Plus size={16}/>
                </button>
                </div>
                <button className="studio-text-link" onClick={() => removeFromCart(item.bookId)} aria-label={`Remove ${item.title} from cart`}>
                <Trash2 size={15}/>Remove</button>
                <strong>{money(item.price * item.quantity)}</strong>
                </div>
                </div>
                </article>)}<button className="studio-text-link" onClick={() => { if (window.confirm('Remove all books from your cart?'))
                clearCart(); }}>Clear cart</button>
            </section>
      <aside className="studio-order-summary">
            <span className="studio-kicker">ORDER SUMMARY</span>
            <h2>A little room for reading.</h2>
            <dl>
            <dt>{cartCount} digital {cartCount === 1 ? 'edition' : 'editions'}</dt>
            <dd>{money(cartTotal)}</dd>
            <dt>Currency</dt>
            <dd>USD</dd>
            <dt>Delivery</dt>
            <dd>Digital download</dd>
            <dt className="studio-total">Total</dt>
            <dd className="studio-total">{money(cartTotal)} USD</dd>
            </dl>
            <Link href="/checkout" className="studio-button">Continue to checkout <ArrowRight size={17}/>
            </Link>
            <p className="studio-caption">This checkout creates a test order. No payment is collected. Each book is priced individually.</p>
            <Link className="studio-text-link" href="/contact">Questions about your order?</Link>
            <Link className="studio-text-link" href="/legal/refunds">Delivery & refund policy</Link>
            </aside>
    </div>}
  </div>;
}
