-- Re-assert the Skull Kolam Tee gallery with the exact Sikku Drop 1 Skull photos.
-- Hero: IMG_20260702_205943201.jpg.jpeg
delete from uv_product_images
where product_id = 'prd-sikku-skull-kolam';

insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-main.jpg', 'Skull Kolam Tee product photo', 0),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-01.jpg', 'Skull Kolam Tee detail', 1),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-02.jpg', 'Skull Kolam Tee detail', 2),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-03.jpg', 'Skull Kolam Tee detail', 3),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-04.jpg', 'Skull Kolam Tee detail', 4);
