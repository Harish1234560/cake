/*
# Create initial schema for Maison Gateaux cake shop

1. New Tables
- `products`: cake catalog with variants, flavours, stock, eggless options
- `orders`: customer orders with items jsonb, delivery details, status
- `enquiries`: customer enquiry form submissions
2. Enums
- `order_status`: received, preparing, out_for_delivery, delivered, cancelled
3. Security
- Enable RLS on all tables
- Public read-only SELECT on products (anon + authenticated)
- No public access to orders or enquiries (service_role only)
4. Storage
- `reference-photos` bucket for customer-uploaded cake reference photos
5. Functions
- `generate_order_code()`: atomic daily counter for order codes (MG-YYYYMMDD-001)
6. Indexes
- orders by created_at, status, delivery_date
- products by category, sort_order
*/

-- Order status enum
DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  base_image_url text NOT NULL,
  gallery text[],
  tag text,
  featured boolean NOT NULL DEFAULT false,
  in_stock boolean NOT NULL DEFAULT true,
  eggless_available boolean NOT NULL DEFAULT true,
  eggless_extra_price integer NOT NULL DEFAULT 50,
  allows_message boolean NOT NULL DEFAULT true,
  allows_photo boolean NOT NULL DEFAULT false,
  lead_time_hours integer NOT NULL DEFAULT 6,
  variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  flavours text[],
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  landmark text,
  pincode text NOT NULL,
  delivery_date date NOT NULL,
  time_slot text NOT NULL,
  payment_method text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  subtotal integer NOT NULL DEFAULT 0,
  delivery_fee integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  notes text,
  status order_status NOT NULL DEFAULT 'received',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enquiries table
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  occasion text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_delivery_date ON orders (delivery_date);
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_sort_order ON products (sort_order);

-- Order code generation function (atomic daily counter)
CREATE OR REPLACE FUNCTION generate_order_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  today_code text;
  next_num integer;
  final_code text;
BEGIN
  today_code := 'MG-' || to_char(now(), 'YYYYMMDD');

  SELECT count(*) + 1 INTO next_num
  FROM orders
  WHERE order_code LIKE today_code || '-%';

  final_code := today_code || '-' || lpad(next_num::text, 3, '0');

  RETURN final_code;
END;
$$;

-- RLS: products (public read-only)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON products TO anon, authenticated;
GRANT ALL ON products TO service_role;

DROP POLICY IF EXISTS "public_read_products" ON products;
CREATE POLICY "public_read_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

-- RLS: orders (service_role only, no public access)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
GRANT ALL ON orders TO service_role;

DROP POLICY IF EXISTS "service_all_orders" ON orders;
CREATE POLICY "service_all_orders" ON orders FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- RLS: enquiries (service_role only, no public access)
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
GRANT ALL ON enquiries TO service_role;

DROP POLICY IF EXISTS "service_all_enquiries" ON enquiries;
CREATE POLICY "service_all_enquiries" ON enquiries FOR ALL
  TO service_role USING (true) WITH CHECK (true);

-- Revoke execute on generate_order_code from public
REVOKE EXECUTE ON FUNCTION generate_order_code() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION generate_order_code() TO service_role;

-- Storage bucket for reference photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('reference-photos', 'reference-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for reference-photos bucket
DROP POLICY IF EXISTS "public_upload_reference_photos" ON storage.objects;
CREATE POLICY "public_upload_reference_photos" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'reference-photos');

DROP POLICY IF EXISTS "public_read_reference_photos" ON storage.objects;
CREATE POLICY "public_read_reference_photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'reference-photos');
