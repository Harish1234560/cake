import type { Metadata } from 'next';
import './globals.css';
import { SHOP } from '@/lib/config';
import { SmoothScrollProvider } from '@/components/providers/SmoothScroll';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { StickyBagBar } from '@/components/layout/StickyBagBar';
import { PageLoader } from '@/components/ui/PageLoader';
import { CustomCursor } from '@/components/ui/CustomCursor';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { GrainOverlay } from '@/components/ui/GrainOverlay';

export const metadata: Metadata = {
  title: `${SHOP.name} — ${SHOP.tagline}`,
  description: `${SHOP.name} in ${SHOP.city}. ${SHOP.whatWeSell}. Delivered by us across ${SHOP.area}.`,
  keywords: ['cake shop', 'bakery', 'custom cakes', 'cupcakes', 'dessert jars', SHOP.city, SHOP.area],
  openGraph: {
    title: `${SHOP.name} — ${SHOP.tagline}`,
    description: `${SHOP.whatWeSell}. Delivered across ${SHOP.area}, ${SHOP.city}.`,
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SHOP.name} — ${SHOP.tagline}`,
    description: `${SHOP.whatWeSell}. Delivered across ${SHOP.area}, ${SHOP.city}.`,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Bakery',
    name: SHOP.name,
    description: SHOP.whatWeSell,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SHOP.city,
      addressRegion: 'Maharashtra',
      addressCountry: 'IN',
    },
    openingHours: 'Mo-Su 09:00-21:00',
    telephone: `+${SHOP.phone}`,
    areaServed: SHOP.area,
    priceRange: 'RsRs',
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Outfit:wght@200;300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-display: 'Bodoni Moda', serif;
            --font-sans: 'Outfit', sans-serif;
            --header-height: 64px;
          }
          @media (min-width: 768px) {
            :root { --header-height: 76px; }
          }
        `}</style>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <SmoothScrollProvider>
          <GrainOverlay />
          <ScrollProgress />
          <CustomCursor />
          <PageLoader />
          <Header />
          <main>{children}</main>
          <Footer />
          <StickyBagBar />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
