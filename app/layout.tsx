import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../lib/store/cart';
import TopBar from '../components/layout/TopBar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AddToCartModal from '../components/books/AddToCartModal';

export const metadata: Metadata = {
  title: 'Knovera — Independent Book Studio',
  description: 'Explore transformative non-fiction works, deep-focus frameworks, and companion toolkits by Knovera. Beautifully typeset, DRM-free EPUB and PDF editions with instant delivery and lifetime updates.',
  openGraph: {
    title: 'Knovera — Independent Book Studio',
    description: 'Explore transformative non-fiction works, deep-focus frameworks, and companion toolkits by Knovera. DRM-free downloads with lifetime updates.',
    type: 'website',
    siteName: 'Knovera',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Knovera — Independent Book Studio',
    description: 'Explore transformative non-fiction. DRM-free EPUB & PDF with lifetime updates.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col antialiased">
        <CartProvider>
          <TopBar />
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <AddToCartModal />
        </CartProvider>
      </body>
    </html>
  );
}
