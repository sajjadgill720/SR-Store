import Link from 'next/link';
import { BookOpen, Library, MessageCircle, ArrowRight } from 'lucide-react';
export const metadata = { title: 'About Knovera — Ebooks & Digital Goods' };
export default function AboutPage() {
  return <div className="storefront store-about">
    <span className="studio-kicker">MEET YOUR DIGITAL STORE</span>
    <h1>A little curiosity.<br/><em>A world of possibilities.</em></h1>
    <p className="store-about-lead">Knovera is a store for ebooks and useful digital goods. A place to find something worth reading, learn a new skill, and bring a fresh idea into your everyday.</p>
    <div className="store-feature-grid">
      <Link href="/books" className="store-feature-card"><BookOpen/><h2>Ebooks come first.</h2><p>Explore practical reads on productivity, personal growth, software, and family learning. Product pages show the price, included formats, and available samples.</p><span>Browse ebooks <ArrowRight size={16}/></span></Link>
      <Link href="/account/library" className="store-feature-card"><Library/><h2>Your finds, together.</h2><p>Your account keeps your purchases within reach. Save interesting titles for later and return to your library for available downloads.</p><span>Open your library <ArrowRight size={16}/></span></Link>
      <Link href="/community" className="store-feature-card"><MessageCircle/><h2>Keep the idea going.</h2><p>Find a reading circle, join a conversation, or keep a private reflection. There’s room for your perspective.</p><span>Meet the community <ArrowRight size={16}/></span></Link>
    </div>
    <section className="store-about-help"><h2>Before you choose.</h2><p>Read a free sample and check the product’s formats and contents. Our <Link href="/help">reading and download guides</Link> help you get started. For questions about an order, <Link href="/contact">contact support</Link> or <Link href="/access">find a previous order</Link>.</p><Link href="/legal/refunds">Delivery &amp; refund policy</Link></section>
  </div>;
}
