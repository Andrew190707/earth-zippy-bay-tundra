-- Fix Sikku hero/gallery image references for Kaali and Swan.
delete from uv_product_images
where product_id in ('prd-sikku-kaali-kolam','prd-sikku-swan-kolam');

insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-main.jpg', 'Kaali Kolam Tee product photo', 0),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-01.jpg', 'Kaali Kolam Tee detail', 1),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-02.jpg', 'Kaali Kolam Tee detail', 2),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-03.jpg', 'Kaali Kolam Tee detail', 3),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-04.jpg', 'Kaali Kolam Tee detail', 4),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-05.jpg', 'Kaali Kolam Tee detail', 5),
  ('prd-sikku-swan-kolam', '/products/sikku-02/swan-main.jpg', 'Swan Kolam Tee product photo', 0),
  ('prd-sikku-swan-kolam', '/products/sikku-02/swan-01.jpg', 'Swan Kolam Tee detail', 1),
  ('prd-sikku-swan-kolam', '/products/sikku-02/swan-02.jpg', 'Swan Kolam Tee detail', 2),
  ('prd-sikku-swan-kolam', '/products/sikku-02/swan-03.jpg', 'Swan Kolam Tee detail', 3),
  ('prd-sikku-swan-kolam', '/products/sikku-02/swan-04.jpg', 'Swan Kolam Tee detail', 4);
