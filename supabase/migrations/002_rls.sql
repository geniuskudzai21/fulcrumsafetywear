-- 002_rls.sql
-- Row level security for the storefront. RLS is enabled on every table.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- Returns true when the current auth user has role = 'admin' in profiles.
-- SECURITY DEFINER so policy checks do not recurse through profiles RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS everywhere
-- ---------------------------------------------------------------------------

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.profiles enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;

-- ---------------------------------------------------------------------------
-- categories: public catalogue, admin writes
-- ---------------------------------------------------------------------------

-- Everyone (including guests) may read categories.
create policy "categories_select_public"
  on public.categories
  for select
  to anon, authenticated
  using (true);

-- Only admins may add categories.
create policy "categories_insert_admin"
  on public.categories
  for insert
  to authenticated
  with check (public.is_admin());

-- Only admins may edit categories.
create policy "categories_update_admin"
  on public.categories
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Only admins may delete categories.
create policy "categories_delete_admin"
  on public.categories
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- products: public read of active products, admin writes
-- ---------------------------------------------------------------------------

-- Guests and customers see active products; admins also see inactive ones.
create policy "products_select_active_or_admin"
  on public.products
  for select
  to anon, authenticated
  using (active or public.is_admin());

-- Only admins may create products.
create policy "products_insert_admin"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

-- Only admins may edit products.
create policy "products_update_admin"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Only admins may delete products.
create policy "products_delete_admin"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- variants: public read while the parent product is active, admin writes
-- ---------------------------------------------------------------------------

-- Guests and customers see variants of active products; admins see all variants.
create policy "variants_select_active_or_admin"
  on public.variants
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.products p
      where p.id = variants.product_id
        and (p.active or public.is_admin())
    )
  );

-- Only admins may create variants.
create policy "variants_insert_admin"
  on public.variants
  for insert
  to authenticated
  with check (public.is_admin());

-- Only admins may edit variants.
create policy "variants_update_admin"
  on public.variants
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Only admins may delete variants.
create policy "variants_delete_admin"
  on public.variants
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- profiles: own row only, role changes guarded by trigger
-- ---------------------------------------------------------------------------

-- Users may read only their own profile.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = (select auth.uid()));

-- Users may update only their own profile (role escalation is blocked below).
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Blocks non-admins from changing the role column on their own profile.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not public.is_admin()
  then
    raise exception 'Only admins can change a profile role';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row
  execute function public.prevent_profile_role_change();

-- ---------------------------------------------------------------------------
-- carts: owners only
-- ---------------------------------------------------------------------------

-- Users may read only their own cart.
create policy "carts_select_own"
  on public.carts
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Users may create a cart only for themselves.
create policy "carts_insert_own"
  on public.carts
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Users may update only their own cart.
create policy "carts_update_own"
  on public.carts
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Users may delete only their own cart.
create policy "carts_delete_own"
  on public.carts
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- cart_items: owners only, via their cart
-- ---------------------------------------------------------------------------

-- Users may read items only from carts they own.
create policy "cart_items_select_own"
  on public.cart_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = (select auth.uid())
    )
  );

-- Users may add items only to carts they own.
create policy "cart_items_insert_own"
  on public.cart_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = (select auth.uid())
    )
  );

-- Users may update items only in carts they own.
create policy "cart_items_update_own"
  on public.cart_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = (select auth.uid())
    )
  );

-- Users may delete items only from carts they own.
create policy "cart_items_delete_own"
  on public.cart_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.carts c
      where c.id = cart_items.cart_id
        and c.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- orders: owners only
-- ---------------------------------------------------------------------------

-- Users may read only their own orders.
create policy "orders_select_own"
  on public.orders
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Users may create orders only for themselves.
create policy "orders_insert_own"
  on public.orders
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Users may update only their own orders.
create policy "orders_update_own"
  on public.orders
  for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Users may delete only their own orders.
create policy "orders_delete_own"
  on public.orders
  for delete
  to authenticated
  using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- order_items: owners only, via their order
-- ---------------------------------------------------------------------------

-- Users may read items only from orders they own.
create policy "order_items_select_own"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- Users may add items only to orders they own.
create policy "order_items_insert_own"
  on public.order_items
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- Users may update items only in orders they own.
create policy "order_items_update_own"
  on public.order_items
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- Users may delete items only from orders they own.
create policy "order_items_delete_own"
  on public.order_items
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_items.order_id
        and o.user_id = (select auth.uid())
    )
  );

-- ---------------------------------------------------------------------------
-- payments: no client access
-- ---------------------------------------------------------------------------
-- RLS is enabled with no policies, so anon and authenticated get no access.
-- Only the service_role key (which bypasses RLS) can read or write payments.

-- ---------------------------------------------------------------------------
-- Profile bootstrap
-- ---------------------------------------------------------------------------

-- Creates a customer profile whenever Supabase Auth inserts a new user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
