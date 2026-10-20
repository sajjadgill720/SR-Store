import Newsletter from '@/components/layout/Newsletter';
export const metadata = { title: 'Reading notes — Knovera' };
export default function NewsletterPage() {
  return <section className="storefront store-newsletter-page"><span className="studio-kicker">THE KNOVERA NEWSLETTER</span><h1>A little inspiration for your inbox.</h1><p>Discover ebooks, new arrivals, and useful digital finds.</p><Newsletter /></section>;
}
