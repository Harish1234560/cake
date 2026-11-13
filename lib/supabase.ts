import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in environment variables');
  }
  client = createClient(url, key, {
    auth: { persistSession: false },
  });
  return client;
}

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  base_image_url: string;
  gallery: string[] | null;
  tag: string | null;
  featured: boolean;
  in_stock: boolean;
  eggless_available: boolean;
  eggless_extra_price: number;
  allows_message: boolean;
  allows_photo: boolean;
  lead_time_hours: number;
  variants: { label: string; price: number }[];
  flavours: string[] | null;
  sort_order: number;
};

export type OrderStatus = 'received' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export type OrderRow = {
  id: string;
  order_code: string;
  customer_name: string;
  phone: string;
  address: string;
  landmark: string | null;
  pincode: string;
  delivery_date: string;
  time_slot: string;
  payment_method: string;
  items: CartLineDB[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
};

export type CartLineDB = {
  productId: string;
  name: string;
  image: string;
  variantLabel: string;
  unitPrice: number;
  flavour: string | null;
  eggless: boolean;
  messageOnCake: string | null;
  referencePhotoUrl: string | null;
  qty: number;
  lineTotal: number;
};

export type EnquiryRow = {
  id: string;
  name: string;
  phone: string;
  occasion: string;
  message: string;
  created_at: string;
};
