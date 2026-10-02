-- UV store schema, preserved from the existing Drizzle models.
-- IDs are text (UUID strings) so they match Better Auth user ids.

create table if not exists uv_categories (
  id text primary key,
  name text not null,
  slug text not null,
  description text not null default '',
  created_at timestamptz not null default now()
);
create unique index if not exists uv_categories_slug_idx on uv_categories (slug);

create table if not exists uv_products (
  id text primary key,
  category_id text not null references uv_categories (id) on delete restrict,
  name text not null,
  slug text not null,
  description text not null default '',
  price numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  sku text not null,
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  featured boolean not null default false,
  new_arrival boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uv_products_slug_idx on uv_products (slug);
create unique index if not exists uv_products_sku_idx on uv_products (sku);
create index if not exists uv_products_category_idx on uv_products (category_id);
create index if not exists uv_products_published_featured_idx on uv_products (published, featured);

create table if not exists uv_product_images (
  id serial primary key,
  product_id text not null references uv_products (id) on delete cascade,
  url text not null,
  alt text not null default '',
  position integer not null default 0
);
create index if not exists uv_product_images_product_idx on uv_product_images (product_id);

create table if not exists uv_inventory (
  product_id text primary key references uv_products (id) on delete cascade,
  stock integer not null default 0,
  reserved integer not null default 0,
  low_stock_threshold integer not null default 5,
  updated_at timestamptz not null default now()
);

create table if not exists uv_profiles (
  id text primary key,
  email text not null,
  full_name text not null default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index if not exists uv_profiles_email_idx on uv_profiles (email);

create table if not exists uv_addresses (
  id serial primary key,
  customer_id text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  pincode text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists uv_orders (
  id text primary key,
  order_number text not null,
  customer_id text,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  subtotal numeric(10, 2) not null,
  shipping numeric(10, 2) not null,
  total numeric(10, 2) not null,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  razorpay_order_id text,
  razorpay_payment_id text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists uv_orders_number_idx on uv_orders (order_number);
create unique index if not exists uv_orders_razorpay_order_idx on uv_orders (razorpay_order_id);
create unique index if not exists uv_orders_razorpay_payment_idx on uv_orders (razorpay_payment_id);
create index if not exists uv_orders_customer_created_idx on uv_orders (customer_id, created_at);
create index if not exists uv_orders_status_created_idx on uv_orders (status, created_at);

create table if not exists uv_order_items (
  id serial primary key,
  order_id text not null references uv_orders (id) on delete cascade,
  product_id text references uv_products (id) on delete set null,
  product_name text not null,
  sku text not null,
  image_url text,
  quantity integer not null,
  unit_price numeric(10, 2) not null,
  size text not null,
  color text not null
);
create index if not exists uv_order_items_order_idx on uv_order_items (order_id);
