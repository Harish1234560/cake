/*
# Seed 8 sample products for Maison Gateaux

1. Inserts 8 cakes with realistic INR prices
2. Categories: chocolate, birthday, fruit-cream
3. Each has variants (500g, 1kg, 2kg), flavours, and flags
*/

INSERT INTO products (slug, name, category, description, base_image_url, tag, featured, in_stock, eggless_available, eggless_extra_price, allows_message, allows_photo, lead_time_hours, variants, flavours, sort_order)
VALUES
  ('mirror-glaze-chocolate', 'Mirror Glaze Chocolate Cake', 'chocolate', 'Dark chocolate sponge with a glossy mirror glaze finish.', '/images/product-mirror-glaze.jpg', 'Signature', true, true, true, 50, true, false, 6, '[{"label":"500 g","price":890},{"label":"1 kg","price":1490},{"label":"2 kg","price":2690}]'::jsonb, ARRAY['Dark Chocolate','Milk Chocolate','Hazelnut'], 1),
  ('red-velvet', 'Red Velvet Cream Cheese', 'birthday', 'Classic red velvet with whipped cream cheese frosting.', '/images/product-red-velvet.jpg', 'Most loved', true, true, true, 50, true, false, 6, '[{"label":"500 g","price":790},{"label":"1 kg","price":1290},{"label":"2 kg","price":2390}]'::jsonb, ARRAY['Classic','Strawberry'], 2),
  ('black-forest', 'Black Forest', 'chocolate', 'Chocolate sponge, cherries, and whipped cream layers.', '/images/product-black-forest.jpg', NULL, false, true, true, 50, true, false, 6, '[{"label":"500 g","price":690},{"label":"1 kg","price":1190},{"label":"2 kg","price":2190}]'::jsonb, ARRAY['Classic','Extra Cherry'], 3),
  ('butterscotch', 'Butterscotch Crunch', 'birthday', 'Butterscotch sponge with caramelized crunch bits.', '/images/product-butterscotch.jpg', NULL, false, true, true, 50, true, false, 6, '[{"label":"500 g","price":690},{"label":"1 kg","price":1090},{"label":"2 kg","price":1990}]'::jsonb, ARRAY['Classic'], 4),
  ('fresh-fruit', 'Fresh Fruit Cake', 'fruit-cream', 'Vanilla sponge with seasonal fresh fruit and cream.', '/images/product-fresh-fruit.jpg', 'Seasonal', false, true, true, 50, true, false, 6, '[{"label":"500 g","price":790},{"label":"1 kg","price":1390},{"label":"2 kg","price":2490}]'::jsonb, ARRAY['Mixed Fruit','Strawberry','Mango'], 5),
  ('pineapple-cream', 'Pineapple Cream', 'fruit-cream', 'Pineapple-infused sponge with whipped cream.', '/images/product-pineapple.jpg', NULL, false, true, true, 50, true, false, 6, '[{"label":"500 g","price":690},{"label":"1 kg","price":1090},{"label":"2 kg","price":1990}]'::jsonb, ARRAY['Classic'], 6),
  ('rasmalai', 'Rasmalai Cake', 'birthday', 'Fusion rasmalai-flavoured cake with saffron cream.', '/images/product-rasmalai.jpg', 'New', true, true, true, 50, true, false, 6, '[{"label":"500 g","price":890},{"label":"1 kg","price":1490},{"label":"2 kg","price":2690}]'::jsonb, ARRAY['Classic','Sugar-Free'], 7),
  ('chocolate-truffle', 'Chocolate Truffle', 'chocolate', 'Rich chocolate truffle ganache on dark sponge.', '/images/product-truffle.jpg', NULL, false, true, true, 50, true, true, 24, '[{"label":"500 g","price":790},{"label":"1 kg","price":1290},{"label":"2 kg","price":2390}]'::jsonb, ARRAY['Dark','Milk','White'], 8)
ON CONFLICT (slug) DO NOTHING;
