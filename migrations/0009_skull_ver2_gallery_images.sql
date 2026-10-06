-- Add the five Google Drive-sourced Skull Ver 2 gallery images.
insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-skull-ver2', '/products/sikku-02/skull-ver2-01.jpg', 'Skull Ver 2 product detail', 1),
  ('prd-sikku-skull-ver2', '/products/sikku-02/skull-ver2-02.jpg', 'Skull Ver 2 product detail', 2),
  ('prd-sikku-skull-ver2', '/products/sikku-02/skull-ver2-03.jpg', 'Skull Ver 2 product detail', 3),
  ('prd-sikku-skull-ver2', '/products/sikku-02/skull-ver2-04.jpg', 'Skull Ver 2 product detail', 4),
  ('prd-sikku-skull-ver2', '/products/sikku-02/skull-ver2-05.jpg', 'Skull Ver 2 product detail', 5)
on conflict do nothing;
