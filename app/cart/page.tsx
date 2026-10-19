'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
import { money } from '../../lib/catalog';
import BookCover from '../../components/books/BookCover';

export default function CartPage() {
  const { items, cartTotal, cartCount, removeFromCart, updateQuantity, clearCart, storageError } = useCart();

  return (
    <div className="storefront cart-ledger-page">
      <div className="cart-nav-back-wrap">
        <Link className="studio-back" href="/books">
          <ArrowLeft size={14} className="shrink-0" />
          <span>Return to Catalogue</span>
        </Link>
        <div className="cart-nav-folio" aria-hidden="true">
          <span>FOLIO § 0088</span>
          <span className="cart-nav-sep">·</span>
          <span>ORDER REQUISITION</span>
        </div>
      </div>

      <div className="studio-page-heading">
        <span className="studio-kicker">DISPATCH REQUISITION · DIGITAL IMPRINTS</span>
        <h1>Your reading slip.</h1>
        <p className="cart-lead-text">
          Review your selected digital volumes prior to settlement. Delivered instantaneously in DRM-free formats.
        </p>
      </div>

      {storageError && <p className="studio-error" role="alert">{storageError}</p>}

      {!items.length ? (
        <div className="studio-empty cart-empty-slip">
          <span className="empty-slip-fleuron" aria-hidden="true">❦</span>
          <h2>Your personal requisition slip is clean.</h2>
          <p>No volumes are currently queued for settlement. Examine the catalogue or read an excerpt.</p>
          <Link className="studio-button outline" href="/books">
            Explore All Editions
          </Link>
        </div>
      ) : (
        <div className="cart-ledger-layout">
          {/* LEFT: Ruled Ledger Table */}
          <section aria-label="Books in your requisition" className="cart-ledger-main">
            <div className="cart-ledger-header">
              <span className="clh-item">VOLUME</span>
              <span className="clh-qty">COPIES</span>
              <span className="clh-price">AMOUNT</span>
            </div>

            <div className="cart-ledger-rows">
              {items.map((item, index) => (
                <article className="cart-ledger-row" key={item.bookId}>
                  <div className="cart-row-left">
                    <span className="cart-row-index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                    <Link
                      href={`/books/${item.slug}`}
                      className="cart-row-cover shrink-0"
                      aria-label={`View ${item.title}`}
                    >
                      <BookCover src={item.coverImage} title={item.title} size="small" />
                    </Link>
                    <div className="cart-row-info">
                      <Link href={`/books/${item.slug}`} className="cart-row-title-link">
                        <h2 className="cart-row-title">{item.title}</h2>
                      </Link>
                      <p className="cart-row-author">by {item.author}</p>
                      <p className="cart-row-format">
                        {item.formatSelected} · {money(item.price)} USD / copy
                      </p>
                    </div>
                  </div>

                  <div className="cart-row-controls">
                    <div className="cart-stepper" aria-label={`Quantity for ${item.title}`}>
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${item.title}`}
                        onClick={() => updateQuantity(item.bookId, item.quantity - 1)}
                        className="stepper-btn"
                      >
                        <Minus size={13} />
                      </button>
                      <output aria-live="polite" className="stepper-val">
                        {item.quantity}
                      </output>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${item.title}`}
                        disabled={item.quantity >= 99}
                        onClick={() => updateQuantity(item.bookId, item.quantity + 1)}
                        className="stepper-btn"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      type="button"
                      className="cart-remove-link"
                      onClick={() => removeFromCart(item.bookId)}
                      aria-label={`Remove ${item.title} from cart`}
                    >
                      <Trash2 size={13} className="shrink-0" />
                      <span>Remove</span>
                    </button>
                  </div>

                  <div className="cart-row-total">
                    <span className="cart-row-amount">
                      {money(item.price * item.quantity)}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="cart-ledger-footer-actions">
              <button
                type="button"
                className="cart-clear-btn"
                onClick={() => {
                  if (window.confirm('Clear all volumes from your reading slip?')) clearCart();
                }}
              >
                Clear entire slip
              </button>
              <Link href="/books" className="cart-continue-link">
                ← Add additional editions
              </Link>
            </div>
          </section>

          {/* RIGHT: Accounting Settlement Slip */}
          <aside className="cart-summary-slip" aria-label="Settlement Requisition Summary">
            <div className="slip-perforation-edge" aria-hidden="true" />
            <div className="slip-inner">
              <div className="slip-kicker-bar">
                <span>SETTLEMENT STATEMENT</span>
                <span className="slip-number">SLIP NO. 0842-KP</span>
              </div>

              <h2 className="slip-title">Acquisition Ledger</h2>
              <p className="slip-caption">
                All editions are delivered digitally upon completion. Universal DRM-free licensing included.
              </p>

              <dl className="slip-ledger-dl">
                <div className="slip-ledger-row">
                  <dt>Selected Volumes ({cartCount})</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>{money(cartTotal)}</dd>
                </div>
                <div className="slip-ledger-row">
                  <dt>Format Preparation</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>EPUB + Archival PDF</dd>
                </div>
                <div className="slip-ledger-row">
                  <dt>Delivery Method</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>Direct Instant Download</dd>
                </div>
                <div className="slip-ledger-row">
                  <dt>License Rights</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd>DRM-Free Perpetual</dd>
                </div>
                <div className="slip-ledger-row slip-total-row">
                  <dt className="slip-total-label">Total Acquisition</dt>
                  <span className="dot-leader-fill" aria-hidden="true" />
                  <dd className="slip-total-val">{money(cartTotal)} USD</dd>
                </div>
              </dl>

              <Link href="/checkout" className="cart-checkout-btn">
                <span>Proceed to Settlement</span>
                <ArrowRight size={14} className="shrink-0" />
              </Link>

              <div className="slip-guarantees-box">
                <p className="slip-assurance">
                  Immediate digital delivery link presented on screen and sent to your email receipt.
                </p>
                <div className="slip-extra-links">
                  <Link href="/contact" className="slip-sub-link">
                    Questions about your acquisition?
                  </Link>
                  <Link href="/legal/refunds" className="slip-sub-link">
                    Delivery &amp; refund terms
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
