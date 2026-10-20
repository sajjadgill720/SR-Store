'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft, ShoppingBag, Undo2 } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
import { updateShopping } from '../../lib/store/shopping';
import type { CartItem } from '../../lib/types';
import { money } from '../../lib/catalog';
import BookCover from '../../components/books/BookCover';

export default function CartPage() {
  const { items, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart, storageError } = useCart();
  const [removed, setRemoved] = useState<CartItem[]>([]);
  function remove(item: CartItem) { setRemoved([item]); removeFromCart(item.bookId); }
  function undo() {
    updateShopping(previous => ({...previous, items:[...previous.items,...removed.filter(item=>!previous.items.some(current=>current.bookId===item.bookId))]}));
    setRemoved([]);
  }
  return <div className="storefront store-cart">
    <Link className="studio-back" href="/books"><ArrowLeft size={16}/> Continue shopping</Link>
    <div className="studio-page-heading"><span className="studio-kicker">YOUR DIGITAL GOODS</span><h1>Your cart.</h1><p>Review your finds, then continue to secure checkout.</p></div>
    {storageError && <p className="studio-error" role="alert">{storageError}</p>}
    {removed.length>0 && <div className="store-cart-feedback" role="status"><span>{removed.length===1?'Item removed.':'Cart cleared.'}</span><button type="button" onClick={undo}><Undo2 size={16}/> Undo</button></div>}
    {!items.length ? <section className="store-cart-empty"><ShoppingBag size={32} aria-hidden="true"/><h2>Your next discovery is waiting.</h2><p>Explore our ebooks and try a free sample before you choose.</p><Link className="studio-button" href="/books">Explore ebooks <ArrowRight size={17}/></Link></section> : <div className="store-cart-layout">
      <section aria-label="Items in your cart" className="store-cart-items">
        <div className="store-cart-section-heading"><h2>{cartCount} {cartCount===1?'item':'items'} in your cart</h2><button type="button" className="store-cart-clear" onClick={()=>{setRemoved(items);clearCart();}}>Clear cart</button></div>
        {items.map(item=><article className="store-cart-item" key={item.bookId}>
          <Link href={`/books/${item.slug}`} className="store-cart-cover" aria-label={`View ${item.title}`}><BookCover src={item.coverImage} title={item.title} size="small"/></Link>
          <div className="store-cart-item-info"><Link href={`/books/${item.slug}`}><h2 className="store-cart-item-title">{item.title}</h2></Link><p>{item.formatSelected}</p><span className="store-cart-unit-price">{money(item.price)} each</span>
            <div className="store-cart-item-actions"><div className="store-cart-stepper" role="group" aria-label={`Quantity for ${item.title}`}><button type="button" aria-label={`Decrease quantity of ${item.title}`} disabled={item.quantity<=1} onClick={()=>updateQuantity(item.bookId,item.quantity-1)}><Minus size={16}/></button><output aria-live="polite">{item.quantity}</output><button type="button" aria-label={`Increase quantity of ${item.title}`} disabled={item.quantity>=99} onClick={()=>updateQuantity(item.bookId,item.quantity+1)}><Plus size={16}/></button></div><button type="button" className="store-cart-remove" onClick={()=>remove(item)} aria-label={`Remove ${item.title} from cart`}><Trash2 size={15}/> Remove</button></div>
          </div><strong className="store-cart-item-price">{money(item.price*item.quantity)}</strong>
        </article>)}
        <p className="store-cart-digital-note">Digital products only. No shipping or delivery fees.</p>
      </section>
      <aside className="store-cart-summary" aria-labelledby="cart-summary-title"><h2 id="cart-summary-title">Order summary</h2><dl><div><dt>Subtotal ({cartCount} {cartCount===1?'item':'items'})</dt><dd>{money(cartTotal)}</dd></div><div><dt>Delivery</dt><dd>Digital download</dd></div><div className="store-cart-total"><dt>Total before tax</dt><dd>{money(cartTotal)} <small>USD</small></dd></div></dl><p className="store-cart-tax-note">Any applicable taxes are shown at payment.</p><Link href="/checkout" className="store-primary-action">Continue to checkout <ArrowRight size={18}/></Link><p className="store-cart-access-note">Access your downloads after payment confirmation.</p><Link href="/legal/refunds" className="store-cart-policy">Delivery &amp; refund policy</Link><Link href="/contact" className="store-cart-policy">Need help with your order?</Link></aside>
    </div>}
  </div>;
}
