'use client';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { X, Check, ArrowRight } from 'lucide-react';
import { useCart } from '../../lib/store/cart';
import BookCover from './BookCover';
import { money } from '../../lib/catalog';
export default function AddToCartModal() {
    const { isModalOpen, closeModal, modalItem, cartCount, storageError } = useCart();
    const dialog = useRef<HTMLDialogElement>(null);
    const returnFocus = useRef<HTMLElement | null>(null);
    useEffect(() => {
        if (!isModalOpen || !modalItem)
            return;
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const node = dialog.current;
        node?.showModal();
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { node?.close(); document.body.style.overflow = overflow; returnFocus.current?.focus(); };
    }, [isModalOpen, modalItem]);
    return <dialog ref={dialog} className="studio-cart-dialog" aria-labelledby="cart-dialog-title" onKeyDown={event => {
            if (event.key !== 'Tab')
                return;
            const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])') || []).filter(node => node.getClientRects().length);
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
            }
            if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
            }
        }} onCancel={event => { event.preventDefault(); closeModal(); }} onClick={event => { if (event.target === dialog.current) {
        const bounds = dialog.current.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)
            closeModal();
    } }}>
    {modalItem && <>
        <button autoFocus className="studio-icon-button studio-dialog-close" aria-label="Close cart confirmation" onClick={closeModal}>
        <X size={20}/>
        </button>
        <span className="studio-kicker">
        <Check size={16} aria-hidden="true"/>ADDED TO YOUR CART</span>
        <h2 id="cart-dialog-title">A little more perspective.</h2>
        <div className="studio-dialog-book">
        <BookCover src={modalItem.coverImage} title={modalItem.title} size="small"/>
        <div>
        <h3>{modalItem.title}</h3>
        <p>{modalItem.formatSelected} · Quantity {modalItem.quantity}</p>
        <strong>{money(modalItem.price)} USD</strong>
        </div>
        </div>{storageError && <p className="studio-error" role="alert">{storageError}</p>}<Link className="studio-button" href="/cart" onClick={closeModal}>View cart ({cartCount}) <ArrowRight size={17}/>
        </Link>
        <button className="studio-button outline" onClick={closeModal}>Keep browsing</button>
        <p className="studio-caption">You can review your digital edition before checkout.</p>
        </>}
  </dialog>;
}
