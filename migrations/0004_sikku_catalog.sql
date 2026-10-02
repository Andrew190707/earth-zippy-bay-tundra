-- SIKKU catalogue: replace the starter catalogue with the 11 UV tees supplied for launch.
-- Drop 01 = 6 tees at ₹750. Drop 02 = 5 tees shown as ₹899 crossed out, selling for ₹750.
-- Products without photography intentionally have no image rows and use the storefront placeholder.

delete from uv_products
where id in (
  'prd-form-overshirt',
  'prd-studio-tee',
  'prd-column-trouser',
  'prd-olive-overshirt',
  'prd-ink-tee',
  'prd-navy-trouser'
);

insert into uv_categories (id, name, slug, description)
values
  ('cat-sikku-01', 'Sikku Drop 01', 'sikku-drop-01', 'The first Sikku drop.'),
  ('cat-sikku-02', 'Sikku Drop 02', 'sikku-drop-02', 'The second Sikku drop.')
on conflict (id) do update
set name = excluded.name,
    slug = excluded.slug,
    description = excluded.description;

insert into uv_products (
  id, category_id, name, slug, description, price, compare_at_price, sku,
  sizes, colors, featured, new_arrival, published
) values
  ('prd-sikku-hod-kolam', 'cat-sikku-01', 'Hod Kolam Tee', 'hod-kolam-tee',
   'Hod Kolam Tee from Sikku Drop 01.', 750, null, 'UV-S01-001',
   array['S','M','L','XL']::text[], array['Black']::text[], false, false, true),

  ('prd-sikku-godzilla-kolam', 'cat-sikku-01', 'Godzilla Kolam Tee', 'godzilla-kolam-tee',
   'Godzilla Kolam Tee from Sikku Drop 01.', 750, null, 'UV-S01-002',
   array['S','M','L','XL']::text[], array['Black']::text[], false, false, true),

  ('prd-sikku-spidey-kolam', 'cat-sikku-01', 'Spidey Kolam Tee', 'spidey-kolam-tee',
   'Spidey Kolam Tee in white on black from Sikku Drop 01.', 750, null, 'UV-S01-003',
   array['S','M','L','XL']::text[], array['Black']::text[], false, false, true),

  ('prd-sikku-kaali-kolam', 'cat-sikku-01', 'Kaali Kolam Tee', 'kaali-kolam-tee',
   'Kaali Kolam Tee from Sikku Drop 01.', 750, null, 'UV-S01-004',
   array['S','M','L','XL']::text[], array['Black']::text[], false, false, true),

  ('prd-sikku-wolf-kolam', 'cat-sikku-01', 'Wolf Kolam Tee', 'wolf-kolam-tee',
   'Wolf Kolam Tee from Sikku Drop 01.', 750, null, 'UV-S01-005',
   array['S','M','L','XL']::text[], array['Black']::text[], false, false, true),

  ('prd-sikku-skull-kolam', 'cat-sikku-01', 'Skull Kolam Tee', 'skull-kolam-tee',
   'Skull Kolam Tee from Sikku Drop 01.', 750, null, 'UV-S01-006',
   array['S','M','L','XL']::text[], array['Black']::text[], false, false, true),

  ('prd-sikku-spidey-ver2', 'cat-sikku-02', 'Spidey Kolam Tee Ver 2', 'spidey-kolam-tee-ver-2',
   'Red on black Spidey Kolam Tee with sleeve web pattern from Sikku Drop 02.', 750, 899, 'UV-S02-001',
   array['S','M','L','XL']::text[], array['Black']::text[], true, true, true),

  ('prd-sikku-spidey-ver3', 'cat-sikku-02', 'Spidey Kolam Tee Ver 3', 'spidey-kolam-tee-ver-3',
   'Red on off-white Spidey Kolam Tee from Sikku Drop 02.', 750, 899, 'UV-S02-002',
   array['S','M','L','XL']::text[], array['Off-white']::text[], false, true, true),

  ('prd-sikku-skull-ver2', 'cat-sikku-02', 'Skull Ver 2', 'skull-ver-2',
   'Skull Tee with sleeve skull design from Sikku Drop 02.', 750, 899, 'UV-S02-003',
   array['S','M','L','XL']::text[], array['Black']::text[], false, true, true),

  ('prd-sikku-snake-kolam', 'cat-sikku-02', 'Snake Kolam Tee', 'snake-kolam-tee',
   'Snake Kolam Tee from Sikku Drop 02.', 750, 899, 'UV-S02-004',
   array['S','M','L','XL']::text[], array['Black']::text[], false, true, true),

  ('prd-sikku-swan-kolam', 'cat-sikku-02', 'Swan Kolam Tee', 'swan-kolam-tee',
   'Swan Kolam Tee from Sikku Drop 02.', 750, 899, 'UV-S02-005',
   array['S','M','L','XL']::text[], array['Black']::text[], false, true, true)
on conflict (id) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  price = excluded.price,
  compare_at_price = excluded.compare_at_price,
  sku = excluded.sku,
  sizes = excluded.sizes,
  colors = excluded.colors,
  featured = excluded.featured,
  new_arrival = excluded.new_arrival,
  published = excluded.published,
  updated_at = now();

delete from uv_product_images
where product_id in (
  'prd-sikku-hod-kolam','prd-sikku-godzilla-kolam','prd-sikku-spidey-kolam',
  'prd-sikku-kaali-kolam','prd-sikku-wolf-kolam','prd-sikku-skull-kolam',
  'prd-sikku-spidey-ver2','prd-sikku-spidey-ver3','prd-sikku-skull-ver2',
  'prd-sikku-snake-kolam','prd-sikku-swan-kolam'
);

insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-spidey-ver2', '/products/sikku-02/spidey-ver2-01.jpg', 'Spidey Kolam Tee Ver 2 front view', 0),
  ('prd-sikku-spidey-ver2', '/products/sikku-02/spidey-ver2-02.jpg', 'Spidey Kolam Tee Ver 2 back view', 1),
  ('prd-sikku-spidey-ver2', '/products/sikku-02/spidey-ver2-03.jpg', 'Spidey Kolam Tee Ver 2 side view with sleeve web', 2),
  ('prd-sikku-spidey-ver2', '/products/sikku-02/spidey-ver2-04.jpg', 'Spidey Kolam Tee Ver 2 front detail', 3),
  ('prd-sikku-spidey-ver2', '/products/sikku-02/spidey-ver2-05.jpg', 'Spidey Kolam Tee Ver 2 sleeve web detail', 4),
  ('prd-sikku-spidey-ver2', '/products/sikku-02/spidey-ver2-06.jpg', 'Spidey Kolam Tee Ver 2 rear detail', 5);

insert into uv_inventory (product_id, stock, reserved, low_stock_threshold) values
  ('prd-sikku-hod-kolam', 20, 0, 5),
  ('prd-sikku-godzilla-kolam', 20, 0, 5),
  ('prd-sikku-spidey-kolam', 20, 0, 5),
  ('prd-sikku-kaali-kolam', 20, 0, 5),
  ('prd-sikku-wolf-kolam', 20, 0, 5),
  ('prd-sikku-skull-kolam', 20, 0, 5),
  ('prd-sikku-spidey-ver2', 20, 0, 5),
  ('prd-sikku-spidey-ver3', 20, 0, 5),
  ('prd-sikku-skull-ver2', 20, 0, 5),
  ('prd-sikku-snake-kolam', 20, 0, 5),
  ('prd-sikku-swan-kolam', 20, 0, 5)
on conflict (product_id) do update set
  stock = excluded.stock,
  low_stock_threshold = excluded.low_stock_threshold,
  updated_at = now();
