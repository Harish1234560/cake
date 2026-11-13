'use client';

import dynamic from 'next/dynamic';
import { Shop } from '@/components/sections/Shop';
import { GiftBoxes } from '@/components/sections/GiftBoxes';
import { Story } from '@/components/sections/Story';
import { WhyUs } from '@/components/sections/WhyUs';
import { Reviews } from '@/components/sections/Reviews';
import { Contact } from '@/components/sections/Contact';
import { Marquee } from '@/components/sections/Marquee';
import type { Product } from '@/lib/supabase';

const ScrollHero = dynamic(
  () => import('@/components/hero/ScrollHero').then((m) => m.ScrollHero),
  {
    ssr: false,
    loading: () => (
      <div className="h-[100svh] w-full flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <p className="font-display text-2xl text-[var(--fg-faint)]">Maison Gateaux</p>
      </div>
    ),
  }
);

const CollectionCarousel = dynamic(
  () => import('@/components/sections/CollectionCarousel').then((m) => m.CollectionCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="h-[50vh] w-full" style={{ background: 'var(--bg)' }} />
    ),
  }
);

export function HomeContent({ products }: { products: Product[] }) {
  return (
    <>
      <ScrollHero />
      <Marquee />
      <CollectionCarousel />
      <Shop products={products} />
      <GiftBoxes />
      <Story />
      <WhyUs />
      <Reviews />
      <Contact />
    </>
  );
}
