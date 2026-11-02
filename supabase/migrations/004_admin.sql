-- 004_admin.sql
-- Admin dashboard support: profile email, audit log, admin RLS, stats RPCs,
-- product save RPC and the order status state machine.

-- ---------------------------------------------------------------------------
-- Profiles: store the auth email so the admin customer list does not need
-- direct access to auth.users.
-- ---------------------------------------------------------------------------

alter table public.profiles add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and p.email is null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    ),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Audit log
-- ---------------------------------------------------------------------------

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references auth.users (id),
  action text not null,
  entity text not null,
  entity_id uuid,
  created_at timestamptz not null default now()
);

alter table public.audit_log enable row level security;

drop policy if exists "audit_log_select_admin" on public.audit_log;
create policy "audit_log_select_admin"
  on public.audit_log
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "audit_log_insert_admin" on public.audit_log;
create policy "audit_log_insert_admin"
  on public.audit_log
  for insert
  to authenticated
  with check (public.is_admin() and admin_id = (select auth.uid()));

create index if not exists audit_log_created_at_idx
  on public.audit_log (created_at desc);

create or replace function public.audit_admin_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_admin uuid := (select auth.uid());
  v_entity_id uuid;
begin
  if v_admin is null or not public.is_admin() then
    return null;
  end if;

  if tg_op = 'DELETE' then
    v_entity_id := (to_jsonb(old) ->> 'id')::uuid;
  else
    v_entity_id := (to_jsonb(new) ->> 'id')::uuid;
  end if;

  insert into public.audit_log (admin_id, action, entity, entity_id)
  values (v_admin, lower(tg_op), tg_table_name, v_entity_id);

  return null;
end;
$$;

drop trigger if exists audit_products_write on public.products;
create trigger audit_products_write
  after insert or update or delete on public.products
  for each row execute function public.audit_admin_write();

drop trigger if exists audit_variants_write on public.variants;
create trigger audit_variants_write
  after insert or update or delete on public.variants
  for each row execute function public.audit_admin_write();

drop trigger if exists audit_categories_write on public.categories;
create trigger audit_categories_write
  after insert or update or delete on public.categories
  for each row execute function public.audit_admin_write();

drop trigger if exists audit_orders_write on public.orders;
create trigger audit_orders_write
  after insert or update or delete on public.orders
  for each row execute function public.audit_admin_write();

drop trigger if exists audit_order_items_write on public.order_items;
create trigger audit_order_items_write
  after insert or update or delete on public.order_items
  for each row execute function public.audit_admin_write();

drop trigger if exists audit_profiles_write on public.profiles;
create trigger audit_profiles_write
  after insert or update or delete on public.profiles
  for each row execute function public.audit_admin_write();

-- ---------------------------------------------------------------------------
-- Admin RLS policies
-- ---------------------------------------------------------------------------

drop policy if exists "profiles_select_admin" on public.profiles;
create policy "profiles_select_admin"
  on public.profiles
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "orders_select_admin" on public.orders;
create policy "orders_select_admin"
  on public.orders
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "order_items_select_admin" on public.order_items;
create policy "order_items_select_admin"
  on public.order_items
  for select
  to authenticated
  using (public.is_admin());

-- Product images live in the public products bucket. Writes are admin-only.
drop policy if exists "storage_products_public_read" on storage.objects;
create policy "storage_products_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'products');

drop policy if exists "storage_products_admin_insert" on storage.objects;
create policy "storage_products_admin_insert"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "storage_products_admin_update" on storage.objects;
create policy "storage_products_admin_update"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

drop policy if exists "storage_products_admin_delete" on storage.objects;
create policy "storage_products_admin_delete"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'products' and public.is_admin());

-- ---------------------------------------------------------------------------
-- Dashboard stats and customer list (SQL aggregation, never client math)
-- ---------------------------------------------------------------------------

create or replace function public.admin_dashboard_stats(p_low_stock integer default 5)
returns table (
  orders_today bigint,
  revenue_this_month numeric,
  low_stock_count bigint,
  new_customers bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
  select
    (
      select count(*)
      from public.orders
      where created_at >= current_date
    )::bigint as orders_today,
    coalesce(
      (
        select sum(total)
        from public.orders
        where status in ('paid', 'packed', 'shipped', 'delivered')
          and created_at >= date_trunc('month', now())
      ),
      0
    )::numeric as revenue_this_month,
    (
      select count(*)
      from public.variants v
      join public.products p on p.id = v.product_id
      where p.active
        and v.stock <= p_low_stock
    )::bigint as low_stock_count,
    (
      select count(*)
      from public.profiles
      where role = 'customer'
        and created_at >= date_trunc('month', now())
    )::bigint as new_customers;
end;
$$;

revoke all on function public.admin_dashboard_stats(integer) from public;
grant execute on function public.admin_dashboard_stats(integer) to authenticated;

create or replace function public.admin_customers(p_search text default null)
returns table (
  id uuid,
  full_name text,
  email text,
  created_at timestamptz,
  order_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
  select
    p.id,
    p.full_name,
    p.email,
    p.created_at,
    count(o.id)::bigint as order_count
  from public.profiles p
  left join public.orders o on o.user_id = p.id
  where p.role = 'customer'
    and (
      p_search is null
      or trim(p_search) = ''
      or p.full_name ilike '%' || trim(p_search) || '%'
      or p.email ilike '%' || trim(p_search) || '%'
    )
  group by p.id, p.full_name, p.email, p.created_at
  order by p.created_at desc
  limit 200;
end;
$$;

revoke all on function public.admin_customers(text) from public;
grant execute on function public.admin_customers(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Product save RPC (atomic product + variants write)
-- ---------------------------------------------------------------------------

create or replace function public.admin_save_product(
  p_product_id uuid,
  p_name text,
  p_slug text,
  p_description text,
  p_category_id uuid,
  p_base_price numeric,
  p_tag text,
  p_image_path text,
  p_active boolean,
  p_variants jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid;
  v_slug text;
  v_base_slug text;
  v_suffix integer := 1;
  v_variant jsonb;
  v_variant_id uuid;
  v_keep uuid[] := '{}';
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_name is null or trim(p_name) = '' then
    raise exception 'Product name is required';
  end if;

  if p_category_id is null then
    raise exception 'Category is required';
  end if;

  if p_base_price is null or p_base_price < 0 then
    raise exception 'Base price is invalid';
  end if;

  if p_variants is null
    or jsonb_typeof(p_variants) <> 'array'
    or jsonb_array_length(p_variants) = 0
  then
    raise exception 'At least one variant is required';
  end if;

  v_base_slug := coalesce(
    nullif(trim(p_slug), ''),
    trim(both '-' from regexp_replace(lower(p_name), '[^a-z0-9]+', '-', 'g'))
  );

  if v_base_slug is null or v_base_slug = '' then
    v_base_slug := 'product';
  end if;

  v_slug := v_base_slug;

  while exists (
    select 1
    from public.products
    where slug = v_slug
      and (p_product_id is null or id <> p_product_id)
  ) loop
    v_suffix := v_suffix + 1;
    v_slug := v_base_slug || '-' || v_suffix;
  end loop;

  if p_product_id is null then
    insert into public.products (
      name, slug, description, category_id, base_price, image_path, tag, active
    )
    values (
      trim(p_name),
      v_slug,
      nullif(trim(p_description), ''),
      p_category_id,
      p_base_price,
      nullif(trim(p_image_path), ''),
      nullif(trim(p_tag), ''),
      coalesce(p_active, true)
    )
    returning id into v_id;
  else
    update public.products
    set
      name = trim(p_name),
      slug = v_slug,
      description = nullif(trim(p_description), ''),
      category_id = p_category_id,
      base_price = p_base_price,
      image_path = nullif(trim(p_image_path), ''),
      tag = nullif(trim(p_tag), ''),
      active = coalesce(p_active, true)
    where id = p_product_id
    returning id into v_id;

    if v_id is null then
      raise exception 'Product not found';
    end if;
  end if;

  for v_variant in select * from jsonb_array_elements(p_variants)
  loop
    if coalesce(trim(v_variant ->> 'colorName'), '') = ''
      or coalesce(trim(v_variant ->> 'colorHex'), '') = ''
      or coalesce(trim(v_variant ->> 'size'), '') = ''
      or coalesce(trim(v_variant ->> 'sku'), '') = ''
    then
      raise exception 'Every variant needs colour, hex, size and SKU';
    end if;

    if (v_variant ->> 'stock')::integer < 0 then
      raise exception 'Variant stock cannot be negative';
    end if;

    v_variant_id := nullif(v_variant ->> 'id', '')::uuid;

    if v_variant_id is not null then
      if not exists (
        select 1
        from public.variants
        where id = v_variant_id
          and product_id = v_id
      ) then
        raise exception 'Variant not found for this product';
      end if;

      update public.variants
      set
        color_name = trim(v_variant ->> 'colorName'),
        color_hex = trim(v_variant ->> 'colorHex'),
        size = trim(v_variant ->> 'size'),
        sku = trim(v_variant ->> 'sku'),
        stock = (v_variant ->> 'stock')::integer,
        price_override = nullif(v_variant ->> 'priceOverride', '')::numeric
      where id = v_variant_id;
    else
      insert into public.variants (
        product_id, color_name, color_hex, size, sku, stock, price_override
      )
      values (
        v_id,
        trim(v_variant ->> 'colorName'),
        trim(v_variant ->> 'colorHex'),
        trim(v_variant ->> 'size'),
        trim(v_variant ->> 'sku'),
        (v_variant ->> 'stock')::integer,
        nullif(v_variant ->> 'priceOverride', '')::numeric
      )
      returning id into v_variant_id;
    end if;

    v_keep := v_keep || v_variant_id;
  end loop;

  delete from public.variants
  where product_id = v_id
    and not (id = any(v_keep));

  return v_id;
end;
$$;

revoke all on function public.admin_save_product(
  uuid, text, text, text, uuid, numeric, text, text, boolean, jsonb
) from public;
grant execute on function public.admin_save_product(
  uuid, text, text, text, uuid, numeric, text, text, boolean, jsonb
) to authenticated;

-- ---------------------------------------------------------------------------
-- Order status state machine
-- ---------------------------------------------------------------------------

create or replace function public.admin_set_order_status(
  p_order_id uuid,
  p_status text
)
returns public.orders
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.orders;
  v_item record;
  v_allowed text[];
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select *
  into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.status = p_status then
    return v_order;
  end if;

  v_allowed := case v_order.status
    when 'pending' then array['paid', 'cancelled']
    when 'paid' then array['packed', 'cancelled']
    when 'packed' then array['shipped', 'cancelled']
    when 'shipped' then array['delivered']
    else array[]::text[]
  end;

  if not (p_status = any(v_allowed)) then
    raise exception 'Invalid transition from % to %', v_order.status, p_status;
  end if;

  if p_status = 'cancelled' then
    for v_item in
      select variant_id, qty
      from public.order_items
      where order_id = p_order_id
    loop
      update public.variants
      set stock = stock + v_item.qty
      where id = v_item.variant_id;
    end loop;
  end if;

  update public.orders
  set status = p_status
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

revoke all on function public.admin_set_order_status(uuid, text) from public;
grant execute on function public.admin_set_order_status(uuid, text) to authenticated;

create index if not exists orders_created_at_idx
  on public.orders (created_at desc);
create index if not exists products_active_idx
  on public.products (active);
create index if not exists variants_stock_idx
  on public.variants (stock);
