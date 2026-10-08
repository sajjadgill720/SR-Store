import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '../lib/store/cart';
import TopBar from '../components/layout/TopBar';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AddToCartModal from '../components/books/AddToCartModal';

export const metadata: Metadata = {
  title: 'Knovera | Curated Independent Book Studio',
  description: 'Explore transformative non-fiction works, deep-focus frameworks, and companion toolkits by Knovera. Instant DRM-free downloads in universal PDF and reflowable EPUB.',
  openGraph: {
    title: 'Knovera | Curated Independent Book Studio',
    description: 'Explore transformative non-fiction works, deep-focus frameworks, and companion toolkits by Knovera. Instant DRM-free downloads in universal PDF and reflowable EPUB.',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#FDFBF7] text-[#182A27]">
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
