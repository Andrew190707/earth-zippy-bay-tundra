-- Add additional Drive-sourced gallery images that were successfully imported.
insert into uv_product_images (product_id, url, alt, position) values
  ('prd-sikku-spidey-kolam', '/products/sikku-01/spidey-02.jpg', 'Spidey Kolam Tee detail', 1),
  ('prd-sikku-spidey-kolam', '/products/sikku-01/spidey-03.jpg', 'Spidey Kolam Tee detail', 2),
  ('prd-sikku-spidey-kolam', '/products/sikku-01/spidey-04.jpg', 'Spidey Kolam Tee detail', 3),
  ('prd-sikku-spidey-kolam', '/products/sikku-01/spidey-05.jpg', 'Spidey Kolam Tee detail', 4),
  ('prd-sikku-wolf-kolam', '/products/sikku-01/wolf-02.jpg', 'Wolf Kolam Tee detail', 1),
  ('prd-sikku-wolf-kolam', '/products/sikku-01/wolf-03.jpg', 'Wolf Kolam Tee detail', 2),
  ('prd-sikku-wolf-kolam', '/products/sikku-01/wolf-04.jpg', 'Wolf Kolam Tee detail', 3),
  ('prd-sikku-wolf-kolam', '/products/sikku-01/wolf-05.jpg', 'Wolf Kolam Tee detail', 4),
  ('prd-sikku-spidey-ver3', '/products/sikku-02/spidey-ver3-02.jpg', 'Spidey Kolam Tee Ver 3 detail', 1)
on conflict do nothing;
