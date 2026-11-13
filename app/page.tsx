import { HomeContent } from '@/components/HomeContent';
import { getSupabaseServer, type Product } from '@/lib/supabase';

async function getProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error || !data) {
      return getFallbackProducts();
    }
    return data as Product[];
  } catch {
    return getFallbackProducts();
  }
}

function getFallbackProducts(): Product[] {
  return [
    {
      id: 'fallback-1', slug: 'mirror-glaze-chocolate', name: 'Mirror Glaze Chocolate Cake',
      category: 'chocolate', description: 'Dark chocolate sponge with a glossy mirror glaze.',
      base_image_url: 'https://picsum.photos/seed/cake-mirror-glaze/800/800', gallery: null, tag: 'Signature',
      featured: true, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: false, lead_time_hours: 6,
      variants: [{ label: '500 g', price: 890 }, { label: '1 kg', price: 1490 }, { label: '2 kg', price: 2690 }],
      flavours: ['Dark Chocolate', 'Milk Chocolate', 'Hazelnut'], sort_order: 1,
    },
    {
      id: 'fallback-2', slug: 'red-velvet', name: 'Red Velvet Cream Cheese',
      category: 'birthday', description: 'Classic red velvet with whipped cream cheese frosting.',
      base_image_url: 'https://picsum.photos/seed/cake-red-velvet/800/800', gallery: null, tag: 'Most loved',
      featured: true, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: false, lead_time_hours: 6,
      variants: [{ label: '500 g', price: 790 }, { label: '1 kg', price: 1290 }, { label: '2 kg', price: 2390 }],
      flavours: ['Classic', 'Strawberry'], sort_order: 2,
    },
    {
      id: 'fallback-3', slug: 'black-forest', name: 'Black Forest',
      category: 'chocolate', description: 'Chocolate sponge, cherries, and whipped cream layers.',
      base_image_url: 'https://picsum.photos/seed/cake-black-forest/800/800', gallery: null, tag: null,
      featured: false, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: false, lead_time_hours: 6,
      variants: [{ label: '500 g', price: 690 }, { label: '1 kg', price: 1190 }, { label: '2 kg', price: 2190 }],
      flavours: ['Classic', 'Extra Cherry'], sort_order: 3,
    },
    {
      id: 'fallback-4', slug: 'butterscotch', name: 'Butterscotch Crunch',
      category: 'birthday', description: 'Butterscotch sponge with caramelized crunch bits.',
      base_image_url: 'https://picsum.photos/seed/cake-butterscotch/800/800', gallery: null, tag: null,
      featured: false, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: false, lead_time_hours: 6,
      variants: [{ label: '500 g', price: 690 }, { label: '1 kg', price: 1090 }, { label: '2 kg', price: 1990 }],
      flavours: ['Classic'], sort_order: 4,
    },
    {
      id: 'fallback-5', slug: 'fresh-fruit', name: 'Fresh Fruit Cake',
      category: 'fruit-cream', description: 'Vanilla sponge with seasonal fresh fruit and cream.',
      base_image_url: 'https://picsum.photos/seed/cake-fresh-fruit/800/800', gallery: null, tag: 'Seasonal',
      featured: false, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: false, lead_time_hours: 6,
      variants: [{ label: '500 g', price: 790 }, { label: '1 kg', price: 1390 }, { label: '2 kg', price: 2490 }],
      flavours: ['Mixed Fruit', 'Strawberry', 'Mango'], sort_order: 5,
    },
    {
      id: 'fallback-6', slug: 'pineapple-cream', name: 'Pineapple Cream',
      category: 'fruit-cream', description: 'Pineapple-infused sponge with whipped cream.',
      base_image_url: 'https://picsum.photos/seed/cake-pineapple/800/800', gallery: null, tag: null,
      featured: false, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: false, lead_time_hours: 6,
      variants: [{ label: '500 g', price: 690 }, { label: '1 kg', price: 1090 }, { label: '2 kg', price: 1990 }],
      flavours: ['Classic'], sort_order: 6,
    },
    {
      id: 'fallback-7', slug: 'rasmalai', name: 'Rasmalai Cake',
      category: 'birthday', description: 'Fusion rasmalai-flavoured cake with saffron cream.',
      base_image_url: 'https://picsum.photos/seed/cake-rasmalai/800/800', gallery: null, tag: 'New',
      featured: true, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: false, lead_time_hours: 6,
      variants: [{ label: '500 g', price: 890 }, { label: '1 kg', price: 1490 }, { label: '2 kg', price: 2690 }],
      flavours: ['Classic', 'Sugar-Free'], sort_order: 7,
    },
    {
      id: 'fallback-8', slug: 'chocolate-truffle', name: 'Chocolate Truffle',
      category: 'chocolate', description: 'Rich chocolate truffle ganache on dark sponge.',
      base_image_url: 'https://picsum.photos/seed/cake-truffle/800/800', gallery: null, tag: null,
      featured: false, in_stock: true, eggless_available: true, eggless_extra_price: 50,
      allows_message: true, allows_photo: true, lead_time_hours: 24,
      variants: [{ label: '500 g', price: 790 }, { label: '1 kg', price: 1290 }, { label: '2 kg', price: 2390 }],
      flavours: ['Dark', 'Milk', 'White'], sort_order: 8,
    },
  ];
}

export default async function HomePage() {
  const products = await getProducts();
  return <HomeContent products={products} />;
}
