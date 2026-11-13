export const SHOP = {
  name: 'Maison Gateaux',
  tagline: 'Cakes as a patient craft',
  whatWeSell:
    'freshly baked custom and ready cakes, cupcakes, dessert jars, gift combos',
  city: 'Mumbai',
  area: 'Bandra West, Bandra East, Khar, Santacruz West, Santacruz East',
  pincodes: ['400050', '400051', '400052', '400053', '400054', '400055'],
  deliveryFee: 60,
  freeDeliveryAbove: 1500,
  whatsapp: '919876543210',
  phone: '919876543210',
  hours: '9:00 AM to 9:00 PM',
  minNoticeNormal: 6,
  minNoticeCustom: 24,
  sameDayCutoff: '16:00',
  orderPrefix: 'MG',
  instagram: 'https://instagram.com/maison.gateaux',
  instagramHandle: '@maison.gateaux',
} as const;

export const DELIVERY_SLOTS = [
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
] as const;

export const USE_PLACEHOLDER_FRAMES = true;

export const FRAME_COUNT = {
  mobile: 120,
  desktop: 120,
} as const;

export const HERO_CHAPTERS = [
  { id: '01', title: 'The Selection', text: 'Seven ingredients, and not one we can\u2019t name.' },
  { id: '02', title: 'The Cream', text: 'Soft butter, golden yolk, sugar beaten light.' },
  { id: '03', title: 'The Melt', text: 'Dark chocolate, loosened to a satin ribbon.' },
  { id: '04', title: 'The Fold', text: 'Flour and cocoa, folded slow until it\u2019s silk.' },
  { id: '05', title: 'The Pour', text: 'Into the tin in one pour, smooth and level.' },
  { id: '06', title: 'The Bake', text: 'Forty minutes of warmth, and no peeking.' },
  { id: '07', title: 'The Rest', text: 'Out of the oven and breathing steam.' },
  { id: '08', title: 'The Glaze', text: 'A mirror glaze, then one clean slice.' },
  { id: '09', title: 'The Plate', text: 'Fresh berries, gold leaf, cream. Served.' },
] as const;

export const CATEGORIES = [
  { id: 'birthday', name: 'Birthday Cakes', slug: 'birthday', image: 'https://images.pexels.com/photos/33759172/pexels-photo-33759172.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 'chocolate', name: 'Chocolate Cakes', slug: 'chocolate', image: 'https://images.pexels.com/photos/39800488/pexels-photo-39800488.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 'fruit-cream', name: 'Fruit & Cream Cakes', slug: 'fruit-cream', image: 'https://images.pexels.com/photos/3913295/pexels-photo-3913295.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { id: 'cupcakes', name: 'Cupcakes & Jars', slug: 'cupcakes', image: 'https://images.pexels.com/photos/11128671/pexels-photo-11128671.jpeg?auto=compress&cs=tinysrgb&w=900' },
] as const;

export const PRODUCT_IMAGES = {
  'mirror-glaze-chocolate': 'https://images.pexels.com/photos/4396304/pexels-photo-4396304.jpeg?auto=compress&cs=tinysrgb&w=900',
  'red-velvet': 'https://images.pexels.com/photos/38774006/pexels-photo-38774006.jpeg?auto=compress&cs=tinysrgb&w=900',
  'black-forest': 'https://images.pexels.com/photos/8802102/pexels-photo-8802102.jpeg?auto=compress&cs=tinysrgb&w=900',
  butterscotch: 'https://images.pexels.com/photos/2688948/pexels-photo-2688948.jpeg?auto=compress&cs=tinysrgb&w=900',
  'fresh-fruit': 'https://images.pexels.com/photos/3913295/pexels-photo-3913295.jpeg?auto=compress&cs=tinysrgb&w=900',
  'pineapple-cream': 'https://images.pexels.com/photos/13963474/pexels-photo-13963474.jpeg?auto=compress&cs=tinysrgb&w=900',
  rasmalai: 'https://images.pexels.com/photos/29177190/pexels-photo-29177190.jpeg?auto=compress&cs=tinysrgb&w=900',
  'chocolate-truffle': 'https://images.pexels.com/photos/34802626/pexels-photo-34802626.jpeg?auto=compress&cs=tinysrgb&w=900',
} as const;

export const SHOP_FILTERS = ['All', 'Birthday', 'Chocolate', 'Fruit & Cream', 'Cupcakes & Jars', 'Eggless'] as const;

export const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price low to high' },
  { id: 'price-desc', label: 'Price high to low' },
] as const;

export const GIFT_BOXES = [
  { id: 'gift-1', name: 'Cake + Chocolate Box', description: 'A 500 g cake of your choice paired with a box of 12 handcrafted chocolates.', price: 1290, image: 'https://images.pexels.com/photos/10390457/pexels-photo-10390457.jpeg?auto=compress&cs=tinysrgb&w=900', tag: null as string | null },
  { id: 'gift-2', name: 'Cupcake Box of 6', description: 'Six assorted cupcakes in a matte black gift box with a handwritten note card.', price: 690, image: 'https://images.pexels.com/photos/7180271/pexels-photo-7180271.jpeg?auto=compress&cs=tinysrgb&w=900', tag: 'Most loved' as string | null },
  { id: 'gift-3', name: 'Celebration Hamper', description: 'A 1 kg cake, 6 cupcakes, a jar of chocolate truffle, and a candle set.', price: 1890, image: 'https://images.pexels.com/photos/7180260/pexels-photo-7180260.jpeg?auto=compress&cs=tinysrgb&w=900', tag: null as string | null },
] as const;

export const WHY_US = [
  { title: 'Baked Each Morning', text: 'Nothing sits overnight. If it isn\u2019t fresh today, it isn\u2019t sold.' },
  { title: 'Real Ingredients', text: 'Belgian chocolate, fresh cream, real fruit. No shortcuts, no premixes.' },
  { title: 'Eggless On Request', text: 'Every cake can be made eggless at a small additional cost.' },
  { title: 'Custom Designs', text: 'Photo cakes, theme cakes, and structural cakes built to your brief.' },
  { title: 'Delivered By Us', text: 'Our own team delivers, so your cake arrives exactly as it left the kitchen.' },
  { title: 'Message On Cake, Free', text: 'A handwritten message on every cake, up to 30 characters, at no charge.' },
] as const;

export type Review = { id: string; name: string; ordered: string; rating: number; quote: string };

export const REVIEWS: Review[] = [
  { id: 'r1', name: 'Ananya Sharma', ordered: 'Mirror Glaze Chocolate Cake', rating: 5, quote: 'The glaze was so glossy I could see my reflection. My daughter refused to cut it for ten minutes.' },
  { id: 'r2', name: 'Rohan Mehta', ordered: 'Red Velvet Cream Cheese', rating: 5, quote: 'Delivered to Bandra in under two hours. Still cold, still perfect. This is my cake shop now.' },
  { id: 'r3', name: 'Priya Nair', ordered: 'Rasmalai Cake', rating: 5, quote: 'I ordered the eggless version for my parents\u2019 anniversary. They said it tasted like home.' },
];

export const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Corporate Event', 'Just Because', 'Other'] as const;

export function isPincodeServed(pincode: string): boolean {
  return (SHOP.pincodes as readonly string[]).includes(pincode);
}

export function deliveryFeeFor(subtotal: number): number {
  if (subtotal >= SHOP.freeDeliveryAbove) return 0;
  return SHOP.deliveryFee;
}
