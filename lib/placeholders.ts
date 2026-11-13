export const PLACEHOLDER_IMAGES = {
  products: {
    'mirror-glaze-chocolate': 'https://picsum.photos/seed/cake-mirror-glaze/800/800',
    'red-velvet': 'https://picsum.photos/seed/cake-red-velvet/800/800',
    'black-forest': 'https://picsum.photos/seed/cake-black-forest/800/800',
    'butterscotch': 'https://picsum.photos/seed/cake-butterscotch/800/800',
    'fresh-fruit': 'https://picsum.photos/seed/cake-fresh-fruit/800/800',
    'pineapple-cream': 'https://picsum.photos/seed/cake-pineapple/800/800',
    'rasmalai': 'https://picsum.photos/seed/cake-rasmalai/800/800',
    'chocolate-truffle': 'https://picsum.photos/seed/cake-truffle/800/800',
  },
  collections: {
    birthday: 'https://picsum.photos/seed/cake-birthday-1/800/1067',
    chocolate: 'https://picsum.photos/seed/cake-choc-2/800/1067',
    'fruit-cream': 'https://picsum.photos/seed/cake-fruit-3/800/1067',
    cupcakes: 'https://picsum.photos/seed/cake-cupcakes-4/800/1067',
  },
  giftBoxes: {
    'gift-1': 'https://picsum.photos/seed/gift-cake-choco/800/600',
    'gift-2': 'https://picsum.photos/seed/gift-cupcake-box/800/600',
    'gift-3': 'https://picsum.photos/seed/gift-hamper/800/600',
  },
  story: 'https://picsum.photos/seed/cake-story-craft/800/1000',
} as const;

export function getProductImage(slug: string): string {
  return PLACEHOLDER_IMAGES.products[slug as keyof typeof PLACEHOLDER_IMAGES.products] || `https://picsum.photos/seed/${slug}/800/800`;
}

export function getCollectionImage(slug: string): string {
  return PLACEHOLDER_IMAGES.collections[slug as keyof typeof PLACEHOLDER_IMAGES.collections] || `https://picsum.photos/seed/collection-${slug}/800/1067`;
}

export function getGiftImage(id: string): string {
  return PLACEHOLDER_IMAGES.giftBoxes[id as keyof typeof PLACEHOLDER_IMAGES.giftBoxes] || `https://picsum.photos/seed/${id}/800/600`;
}

const BLUR_DATA_URL = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiMxNDBkMDkiLz48L3N2Zz4=';
export function blurPlaceholder(): string { return BLUR_DATA_URL; }
