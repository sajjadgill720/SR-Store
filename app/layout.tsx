import type { Metadata } from 'next';
import { siteOrigin } from '@/lib/seo';
import { Suspense } from 'react';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import './theme.css';
import './storefront.css';
import './refinement.css';
import './store-identity.css';
import './customer-experience.css';
import { CartProvider } from '../lib/store/cart';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AddToCartModal from '../components/books/AddToCartModal';
import MobileNav from '../components/layout/MobileNav';
import RouteChrome from '../components/layout/RouteChrome';
import FooterReturn from '../components/layout/FooterReturn';
import MotionProvider from '../components/common/MotionProvider';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-editorial', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: 'Knovera — Ebooks & Digital Goods',
  description: 'Your store for ebooks and useful digital goods. Browse the collection, read free samples, and build your personal library.',
  openGraph: {
    title: 'Knovera — Ebooks & Digital Goods',
    description: 'Find your next read and your next conversation. Discover books and connect with a community of curious readers.',
    type: 'website',
    siteName: 'Knovera',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knovera — Ebooks & Digital Goods',
    description: 'Books for your curiosity. Conversations for your perspective. Discover Knovera.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${serif.variable} min-h-screen flex flex-col antialiased`}>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <CartProvider>
          <Suspense fallback={null}><RouteChrome /></Suspense>
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            <Suspense fallback={null}><FooterReturn /></Suspense>
            {children}
          </main>
          <Suspense fallback={null}><Footer /></Suspense>
          <MobileNav />
          <AddToCartModal />
          <MotionProvider />
        </CartProvider>
      </body>
    </html>
  );
}
