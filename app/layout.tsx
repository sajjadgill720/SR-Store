import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DM_Sans, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import './storefront.css';
import { CartProvider } from '../lib/store/cart';
import TopBar from '../components/layout/TopBar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AddToCartModal from '../components/books/AddToCartModal';
import MobileNav from '../components/layout/MobileNav';
import RouteChrome from '../components/layout/RouteChrome';

const sans = DM_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600', '700'], style: ['normal', 'italic'], variable: '--font-editorial', display: 'swap' });

export const metadata: Metadata = {
  title: 'Knovera — Independent Book Studio',
  description: 'Explore practical nonfiction and printable activity books by Knovera. Read samples, browse digital formats, and find your next perspective.',
  openGraph: {
    title: 'Knovera — Independent Book Studio',
    description: 'Explore independent nonfiction and companion activities. Start with a sample and find a book for where you are.',
    type: 'website',
    siteName: 'Knovera',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knovera — Independent Book Studio',
    description: 'Independent books for focus, personal growth, and curiosity. Read a sample at your own pace.',
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
          <TopBar />
          <Header />
          <main id="main-content" className="flex-1" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <MobileNav />
          <AddToCartModal />
        </CartProvider>
      </body>
    </html>
  );
}
