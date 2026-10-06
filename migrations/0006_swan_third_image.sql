-- Add the third supplied Swan Kolam Tee photo after the initial storefront migration.
insert into uv_product_images (product_id, url, alt, position)
values ('prd-sikku-swan-kolam', '/products/sikku-02/swan-03.jpg', 'Swan Kolam Tee detail', 2)
on conflict do nothing;
