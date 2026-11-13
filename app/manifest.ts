import type { MetadataRoute } from 'next';
import { SHOP } from '@/lib/config';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SHOP.name,
    short_name: SHOP.name,
    description: SHOP.whatWeSell,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0604',
    theme_color: '#0a0604',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
