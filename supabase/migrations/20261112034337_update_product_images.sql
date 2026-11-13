/*
# Update product image URLs to use SVG placeholders

Updates base_image_url for all seeded products to match the placeholder
SVG files in /public/images/. Replace these with real product photos
by updating the base_image_url column in the products table.
*/

UPDATE products SET base_image_url = '/images/product-mirror-glaze.svg' WHERE slug = 'mirror-glaze-chocolate';
UPDATE products SET base_image_url = '/images/product-red-velvet.svg' WHERE slug = 'red-velvet';
UPDATE products SET base_image_url = '/images/product-black-forest.svg' WHERE slug = 'black-forest';
UPDATE products SET base_image_url = '/images/product-butterscotch.svg' WHERE slug = 'butterscotch';
UPDATE products SET base_image_url = '/images/product-fresh-fruit.svg' WHERE slug = 'fresh-fruit';
UPDATE products SET base_image_url = '/images/product-pineapple.svg' WHERE slug = 'pineapple-cream';
UPDATE products SET base_image_url = '/images/product-rasmalai.svg' WHERE slug = 'rasmalai';
UPDATE products SET base_image_url = '/images/product-truffle.svg' WHERE slug = 'chocolate-truffle';
