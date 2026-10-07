-- Correct the supplied UV product galleries and remove duplicate gallery rows.
delete from uv_product_images
where product_id in (
  'prd-sikku-hod-kolam',
  'prd-sikku-kaali-kolam',
  'prd-sikku-skull-kolam',
  'prd-sikku-spidey-ver3',
  'prd-sikku-snake-kolam'
);

insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-hod-kolam', '/products/sikku-01/hod-01.jpg', 'Hod Kolam Tee detail', 1),
  ('prd-sikku-hod-kolam', '/products/sikku-01/hod-02.jpg', 'Hod Kolam Tee detail', 2),
  ('prd-sikku-hod-kolam', '/products/sikku-01/hod-03.jpg', 'Hod Kolam Tee detail', 3),
  ('prd-sikku-hod-kolam', '/products/sikku-01/hod-04.jpg', 'Hod Kolam Tee detail', 4),

  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-01.jpg', 'Kaali Kolam Tee detail', 1),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-02.jpg', 'Kaali Kolam Tee detail', 2),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-03.jpg', 'Kaali Kolam Tee detail', 3),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-04.jpg', 'Kaali Kolam Tee detail', 4),
  ('prd-sikku-kaali-kolam', '/products/sikku-01/kaali-05.jpg', 'Kaali Kolam Tee detail', 5),

  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-01.jpg', 'Skull Kolam Tee detail', 1),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-02.jpg', 'Skull Kolam Tee detail', 2),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-03.jpg', 'Skull Kolam Tee detail', 3),
  ('prd-sikku-skull-kolam', '/products/sikku-01/skull-04.jpg', 'Skull Kolam Tee detail', 4),

  ('prd-sikku-spidey-ver3', '/products/sikku-02/spidey-ver3-01.jpg', 'Spidey Kolam Tee Ver 3 detail', 1),
  ('prd-sikku-spidey-ver3', '/products/sikku-02/spidey-ver3-02.jpg', 'Spidey Kolam Tee Ver 3 detail', 2),
  ('prd-sikku-spidey-ver3', '/products/sikku-02/spidey-ver3-03.jpg', 'Spidey Kolam Tee Ver 3 detail', 3),
  ('prd-sikku-spidey-ver3', '/products/sikku-02/spidey-ver3-04.jpg', 'Spidey Kolam Tee Ver 3 detail', 4),
  ('prd-sikku-spidey-ver3', '/products/sikku-02/spidey-ver3-05.jpg', 'Spidey Kolam Tee Ver 3 detail', 5),

  ('prd-sikku-snake-kolam', '/products/sikku-02/snake-01.jpg', 'Snake Kolam Tee detail', 1),
  ('prd-sikku-snake-kolam', '/products/sikku-02/snake-02.jpg', 'Snake Kolam Tee detail', 2),
  ('prd-sikku-snake-kolam', '/products/sikku-02/snake-03.jpg', 'Snake Kolam Tee detail', 3),
  ('prd-sikku-snake-kolam', '/products/sikku-02/snake-04.jpg', 'Snake Kolam Tee detail', 4),
  ('prd-sikku-snake-kolam', '/products/sikku-02/snake-05.jpg', 'Snake Kolam Tee detail', 5);
