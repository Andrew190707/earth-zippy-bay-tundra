-- UV storefront updates: M-XXL sizing and supplied Sikku photography.
update uv_products
set sizes = array['M','L','XL','XXL']::text[],
    updated_at = now()
where id in (
  'prd-sikku-hod-kolam','prd-sikku-godzilla-kolam','prd-sikku-spidey-kolam',
  'prd-sikku-kaali-kolam','prd-sikku-wolf-kolam','prd-sikku-skull-kolam',
  'prd-sikku-spidey-ver2','prd-sikku-spidey-ver3','prd-sikku-skull-ver2',
  'prd-sikku-snake-kolam','prd-sikku-swan-kolam'
);

delete from uv_product_images
where product_id in (
  'prd-sikku-hod-kolam','prd-sikku-godzilla-kolam',
  'prd-sikku-kaali-kolam','prd-sikku-skull-kolam','prd-sikku-swan-kolam'
);

insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-hod-kolam', '/products/sikku-01/hod-01.jpg', 'Hod Kolam Tee product photo', 0),
  ('prd-sikku-godzilla-kolam', '/products/sikku-01/godzilla-01.jpg', 'Godzilla Kolam Tee product photo', 0),
  ('prd-sikku-godzilla-kolam', '/products/sikku-01/godzilla-02.jpg', 'Godzilla Kolam Tee detail', 1),
  ('prd-sikku-godzilla-kolam', '/products/sikku-01/godzilla-03.jpg', 'Godzilla Kolam Tee detail', 2),
  ('prd-sikku-godzilla-kolam', '/products/sikku-01/godzilla-04.jpg', 'Godzilla Kolam Tee detail', 3),
  ('prd-sikku-godzilla-kolam', '/products/sikku-01/godzilla-05.jpg', 'Godzilla Kolam Tee detail', 4),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kali-01.jpg', 'Kaali Kolam Tee product photo', 0),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-01.jpg', 'Skull Kolam Tee product photo', 0),
  ('prd-sikku-swan-kolam', '/products/sikku-02/swan-01.jpg', 'Swan Kolam Tee product photo', 0),
  ('prd-sikku-swan-kolam', '/products/sikku-02/swan-02.jpg', 'Swan Kolam Tee detail', 1);
