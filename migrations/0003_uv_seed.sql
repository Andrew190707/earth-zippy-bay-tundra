-- Sample UV catalogue. Replace these rows from the admin desk with live pieces.

insert into uv_categories (id, name, slug, description)
values
  ('cat-shirts', 'Shirts', 'shirts', 'Considered layers for the long day.'),
  ('cat-tees', 'T-Shirts', 't-shirts', 'Quiet knits. Daily rotation.'),
  ('cat-bottoms', 'Bottomwear', 'bottomwear', 'Trousers with room to move.')
on conflict (id) do nothing;

insert into uv_products (
  id, category_id, name, slug, description, price, compare_at_price, sku,
  sizes, colors, featured, new_arrival, published
) values
  (
    'prd-form-overshirt',
    'cat-shirts',
    'Form Study Overshirt',
    'form-study-overshirt',
    'A sculptural charcoal overshirt cut from a dense cotton-twill. Relaxed through the body, clean at the shoulder, with a weight that holds its shape after a full day. Designed as the piece you reach for without thinking.',
    4890, 6200, 'UV-OVR-001',
    array['S','M','L','XL']::text[], array['Charcoal','Olive']::text[],
    true, true, true
  ),
  (
    'prd-studio-tee',
    'cat-tees',
    'Studio Tee',
    'studio-tee',
    'A heavyweight jersey tee with a slightly dropped shoulder and a dry, lived-in hand. Cut to sit clean at the hip. The kind of basic that quietly becomes the uniform.',
    1890, null, 'UV-TEE-001',
    array['S','M','L','XL']::text[], array['Bone','Ink']::text[],
    true, true, true
  ),
  (
    'prd-column-trouser',
    'cat-bottoms',
    'Column Trouser',
    'column-trouser',
    'A straight-leg trouser with a soft crease and a considered drape. Mid-rise, easy through the thigh, finishing just above the shoe. Tailoring without the ceremony.',
    3490, 4200, 'UV-TRS-001',
    array['S','M','L','XL']::text[], array['Stone','Navy']::text[],
    true, false, true
  ),
  (
    'prd-olive-overshirt',
    'cat-shirts',
    'Field Overshirt',
    'field-overshirt',
    'The same considered overshirt, in a muted olive. Two chest pockets, a modest collar, and a fabric that softens without losing structure. Made to be worn open over a knit, or closed as a light jacket.',
    4890, null, 'UV-OVR-002',
    array['S','M','L','XL']::text[], array['Olive','Charcoal']::text[],
    false, true, true
  ),
  (
    'prd-ink-tee',
    'cat-tees',
    'Ink Tee',
    'ink-tee',
    'A dense charcoal-black tee with a tight, even stitch and a slightly longer back. Washes dark. Pairs with everything in the wardrobe, which is rather the point.',
    1890, null, 'UV-TEE-002',
    array['S','M','L','XL']::text[], array['Ink','Bone']::text[],
    false, false, true
  ),
  (
    'prd-navy-trouser',
    'cat-bottoms',
    'Harbour Trouser',
    'harbour-trouser',
    'Navy wool-blend trousers with a clean waist and a quiet taper. Belt loops, a considered pocket bag, and a hem that falls with intent. Evening, office, or neither.',
    3690, 4490, 'UV-TRS-002',
    array['S','M','L','XL']::text[], array['Navy','Stone']::text[],
    true, true, true
  )
on conflict (id) do nothing;

insert into uv_product_images (product_id, url, alt, position) values
  ('prd-form-overshirt', '/products/uv-overshirt.jpg', 'Form Study Overshirt in charcoal', 0),
  ('prd-studio-tee', '/products/uv-tee.jpg', 'Studio Tee in bone', 0),
  ('prd-column-trouser', '/products/uv-trouser.jpg', 'Column Trouser in stone', 0),
  ('prd-olive-overshirt', '/products/uv-overshirt-olive.jpg', 'Field Overshirt in olive', 0),
  ('prd-ink-tee', '/products/uv-tee-ink.jpg', 'Ink Tee folded still life', 0),
  ('prd-navy-trouser', '/products/uv-trouser-navy.jpg', 'Harbour Trouser in navy', 0);

insert into uv_inventory (product_id, stock, reserved, low_stock_threshold) values
  ('prd-form-overshirt', 18, 0, 5),
  ('prd-studio-tee', 28, 0, 5),
  ('prd-column-trouser', 14, 0, 5),
  ('prd-olive-overshirt', 12, 0, 4),
  ('prd-ink-tee', 22, 0, 5),
  ('prd-navy-trouser', 10, 0, 4)
on conflict (product_id) do nothing;
