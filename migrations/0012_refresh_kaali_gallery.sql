-- Refresh the Kaali Kolam Tee gallery with the exact supplied Drop 1 photos.
delete from uv_product_images
where product_id = 'prd-sikku-kaali-kolam';

insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-main.jpg', 'Kaali Kolam Tee product photo', 0),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-01.jpg', 'Kaali Kolam Tee detail', 1),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-02.jpg', 'Kaali Kolam Tee detail', 2),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-03.jpg', 'Kaali Kolam Tee detail', 3),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-04.jpg', 'Kaali Kolam Tee detail', 4);
