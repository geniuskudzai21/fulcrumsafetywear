-- 001_schema.sql
-- Core storefront schema: catalogue, customers, carts, orders and payments.

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  description text,
  category_id uuid not null references public.categories (id) on delete restrict,
  base_price numeric(10, 2) not null check (base_price >= 0),
  image_path text,
  tag text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create unique index products_slug_idx on public.products (slug);

create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  color_name text not null,
  color_hex text not null,
  size text not null,
  sku text not null unique,
  stock integer not null default 0 check (stock >= 0),
  price_override numeric(10, 2) check (price_override is null or price_override >= 0),
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.variants (id) on delete restrict,
  qty integer not null check (qty > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending',
  total numeric(10, 2) not null default 0 check (total >= 0),
  currency text not null default 'USD',
  name text not null,
  phone text not null,
  city text not null,
  address text not null,
  payment_method text not null,
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  variant_id uuid not null references public.variants (id) on delete restrict,
  qty integer not null check (qty > 0),
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  provider text not null,
  provider_ref text,
  status text not null default 'pending',
  amount numeric(10, 2) not null check (amount >= 0),
  created_at timestamptz not null default now()
);

-- Foreign key indexes and catalogue lookup index.
create index products_category_id_idx on public.products (category_id);
create index variants_product_id_idx on public.variants (product_id);
create index carts_user_id_idx on public.carts (user_id);
create index cart_items_cart_id_idx on public.cart_items (cart_id);
create index cart_items_variant_id_idx on public.cart_items (variant_id);
create index orders_user_id_idx on public.orders (user_id);
create index order_items_order_id_idx on public.order_items (order_id);
create index order_items_variant_id_idx on public.order_items (variant_id);
create index payments_order_id_idx on public.payments (order_id);
