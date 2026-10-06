-- Add the missing primary Sikku product photos sourced from the UV Drive folders.
insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-spidey-kolam', '/products/sikku-01/spidey-main.jpg', 'Spidey Kolam Tee product photo', 0),
  ('prd-sikku-wolf-kolam', '/products/sikku-01/wolf-01.jpg', 'Wolf Kolam Tee product photo', 0),
  ('prd-sikku-spidey-ver3', '/products/sikku-02/spidey-ver3-main.jpg', 'Spidey Kolam Tee Ver 3 product photo', 0),
  ('prd-sikku-skull-ver2', '/products/sikku-02/skull-ver2-main.jpg', 'Skull Ver 2 product photo', 0),
  ('prd-sikku-snake-kolam', '/products/sikku-02/snake-main.jpg', 'Snake Kolam Tee product photo', 0)
on conflict do nothing;
