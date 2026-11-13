import type { MetadataRoute } from 'next';
import { SHOP } from '@/lib/config';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: '/', lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: '/checkout', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: '/admin/login', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];
}
