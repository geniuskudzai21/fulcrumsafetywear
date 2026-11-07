-- 006_paynow_payments.sql
-- Paynow payments: payment metadata, owner read access, server-only writes,
-- atomic order creation and idempotent payment finalization.

-- ---------------------------------------------------------------------------
-- Payments: extend the existing table with Paynow metadata
-- ---------------------------------------------------------------------------

alter table public.payments
  add column if not exists reference text,
  add column if not exists poll_url text,
  add column if not exists method text,
  add column if not exists instructions text,
  add column if not exists paid_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists raw_status text,
  add column if not exists error text;

create unique index if not exists payments_reference_key
  on public.payments (reference)
  where reference is not null;

create index if not exists payments_status_idx
  on public.payments (status);

-- ---------------------------------------------------------------------------
-- RLS: owners and admins may read payments, only service_role may write
-- ---------------------------------------------------------------------------

drop policy if exists "payments_select_own" on public.payments;
create policy "payments_select_own"
  on public.payments
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = payments.order_id
        and o.user_id = (select auth.uid())
    )
  );

drop policy if exists "payments_select_admin" on public.payments;
create policy "payments_select_admin"
  on public.payments
  for select
  to authenticated
  using (public.is_admin());

-- There are deliberately no INSERT, UPDATE or DELETE policies. The service
-- role bypasses RLS and is the only writer for payment rows.

-- ---------------------------------------------------------------------------
-- Orders: close the client-side write hole. Users may read their orders but
-- only the server (service role) and admins may create or update them.
-- ---------------------------------------------------------------------------

drop policy if exists "orders_insert_own" on public.orders;
drop policy if exists "orders_update_own" on public.orders;
drop policy if exists "orders_delete_own" on public.orders;

drop policy if exists "order_items_insert_own" on public.order_items;
drop policy if exists "order_items_update_own" on public.order_items;
drop policy if exists "order_items_delete_own" on public.order_items;

-- ---------------------------------------------------------------------------
-- Atomic order + item + payment creation. Prices always come from the
-- database, never from the client. Only the service role may call this.
-- ---------------------------------------------------------------------------

create or replace function public.create_paynow_order(
  p_user_id uuid,
  p_reference text,
  p_name text,
  p_phone text,
  p_city text,
  p_address text,
  p_method text,
  p_items jsonb
)
returns table (
  order_id uuid,
  payment_id uuid,
  total numeric,
  currency text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_payment_id uuid;
  v_total numeric(10, 2);
  v_currency text := 'USD';
  v_expected integer;
  v_count integer;
  v_method_label text;
begin
  if p_user_id is null then
    raise exception 'Not authenticated' using errcode = '42501';
  end if;

  if p_reference is null or trim(p_reference) = '' then
    raise exception 'Payment reference is required';
  end if;

  if coalesce(trim(p_name), '') = ''
    or coalesce(trim(p_phone), '') = ''
    or coalesce(trim(p_city), '') = ''
    or coalesce(trim(p_address), '') = ''
  then
    raise exception 'Delivery details are required';
  end if;

  if p_method is null
    or p_method not in ('ecocash', 'onemoney', 'zimswitch')
  then
    raise exception 'Invalid payment method';
  end if;

  if p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) = 0
  then
    raise exception 'Your cart is empty';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as item
    where jsonb_typeof(item) <> 'object'
      or (item ->> 'variantId') is null
      or (item ->> 'qty') is null
      or (item ->> 'qty')::integer < 1
  ) then
    raise exception 'Invalid cart item';
  end if;

  select count(distinct (item ->> 'variantId')::uuid)
  into v_expected
  from jsonb_array_elements(p_items) as item;

  select
    count(*),
    round(
      coalesce(
        sum(coalesce(v.price_override, p.base_price) * input.qty),
        0
      ),
      2
    )
  into v_count, v_total
  from (
    select
      (item ->> 'variantId')::uuid as variant_id,
      sum((item ->> 'qty')::integer)::integer as qty
    from jsonb_array_elements(p_items) as item
    group by 1
  ) as input
  join public.variants v on v.id = input.variant_id
  join public.products p on p.id = v.product_id
  where p.active
    and input.qty > 0;

  if v_count <> v_expected then
    raise exception 'One or more items are no longer available';
  end if;

  if v_total is null or v_total <= 0 then
    raise exception 'Order total must be greater than zero';
  end if;

  if exists (
    select 1
    from (
      select
        (item ->> 'variantId')::uuid as variant_id,
        sum((item ->> 'qty')::integer)::integer as qty
      from jsonb_array_elements(p_items) as item
      group by 1
    ) as input
    join public.variants v on v.id = input.variant_id
    where v.stock < input.qty
  ) then
    raise exception 'Insufficient stock for one or more items';
  end if;

  v_method_label := case p_method
    when 'ecocash' then 'EcoCash (Paynow)'
    when 'onemoney' then 'OneMoney (Paynow)'
    when 'zimswitch' then 'Zimswitch (Paynow)'
    else p_method
  end;

  insert into public.orders (
    user_id,
    status,
    total,
    currency,
    name,
    phone,
    city,
    address,
    payment_method
  )
  values (
    p_user_id,
    'pending',
    v_total,
    v_currency,
    trim(p_name),
    trim(p_phone),
    trim(p_city),
    trim(p_address),
    v_method_label
  )
  returning id into v_order_id;

  insert into public.order_items (order_id, variant_id, qty, unit_price)
  select
    v_order_id,
    input.variant_id,
    input.qty,
    coalesce(v.price_override, p.base_price)
  from (
    select
      (item ->> 'variantId')::uuid as variant_id,
      sum((item ->> 'qty')::integer)::integer as qty
    from jsonb_array_elements(p_items) as item
    group by 1
  ) as input
  join public.variants v on v.id = input.variant_id
  join public.products p on p.id = v.product_id;

  insert into public.payments (
    order_id,
    provider,
    reference,
    method,
    amount,
    status
  )
  values (
    v_order_id,
    'paynow',
    trim(p_reference),
    p_method,
    v_total,
    'pending'
  )
  returning id into v_payment_id;

  return query
  select v_order_id, v_payment_id, v_total, v_currency;
end;
$$;

revoke all on function public.create_paynow_order(
  uuid, text, text, text, text, text, text, jsonb
) from public;
revoke all on function public.create_paynow_order(
  uuid, text, text, text, text, text, text, jsonb
) from anon;
revoke all on function public.create_paynow_order(
  uuid, text, text, text, text, text, text, jsonb
) from authenticated;
grant execute on function public.create_paynow_order(
  uuid, text, text, text, text, text, text, jsonb
) to service_role;

-- ---------------------------------------------------------------------------
-- Idempotent finalization. Locks the payment row and only decrements stock
-- when a payment transitions to paid for the first time.
-- ---------------------------------------------------------------------------

create or replace function public.finalize_paynow_payment(
  p_reference text,
  p_status text,
  p_provider_ref text default null,
  p_poll_url text default null,
  p_amount numeric default null,
  p_raw_status text default null
)
returns table (
  payment_id uuid,
  order_id uuid,
  payment_status text,
  order_status text,
  changed boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments;
  v_order public.orders;
  v_item record;
  v_stock integer;
  v_changed boolean := false;
begin
  if p_status is null or p_status not in ('paid', 'failed') then
    raise exception 'Invalid payment status';
  end if;

  if p_reference is null or trim(p_reference) = '' then
    raise exception 'Payment reference is required';
  end if;

  select *
  into v_payment
  from public.payments
  where reference = trim(p_reference)
  for update;

  if not found then
    return;
  end if;

  if p_status = 'paid'
    and p_amount is not null
    and round(v_payment.amount, 2) <> round(p_amount, 2)
  then
    raise exception 'Amount does not match payment' using errcode = '22000';
  end if;

  select *
  into v_order
  from public.orders
  where id = v_payment.order_id
  for update;

  if not found then
    return;
  end if;

  -- Paid and failed are terminal. Duplicate or contradictory callbacks must
  -- never change stock or move an order out of a terminal state.
  if v_payment.status in ('paid', 'failed') then
    return query
    select
      v_payment.id,
      v_payment.order_id,
      v_payment.status,
      v_order.status,
      false;

    return;
  end if;

  if p_provider_ref is not null
    or p_poll_url is not null
    or p_raw_status is not null
  then
    update public.payments
    set
      provider_ref = coalesce(p_provider_ref, provider_ref),
      poll_url = coalesce(p_poll_url, poll_url),
      raw_status = coalesce(p_raw_status, raw_status),
      updated_at = now()
    where id = v_payment.id;
  end if;

  if p_status = 'paid' then
    if v_payment.status <> 'paid' then
      update public.payments
      set
        status = 'paid',
        paid_at = now(),
        raw_status = coalesce(p_raw_status, raw_status),
        error = null,
        updated_at = now()
      where id = v_payment.id;

      if v_order.status = 'pending' then
        update public.orders
        set status = 'paid'
        where id = v_order.id;
      end if;

      -- Stock is decremented exactly once, when the payment first becomes paid.
      -- Never restore stock automatically here; cancellation does that through
      -- admin_set_order_status.
      if v_order.status <> 'cancelled' then
        for v_item in
          select variant_id, qty
          from public.order_items
          where order_id = v_order.id
        loop
          select stock
          into v_stock
          from public.variants
          where id = v_item.variant_id
          for update;

          if v_stock < v_item.qty then
            raise warning 'Oversell on variant % for order % (stock %, qty %)',
              v_item.variant_id, v_order.id, v_stock, v_item.qty;
          end if;

          update public.variants
          set stock = greatest(coalesce(v_stock, 0) - v_item.qty, 0)
          where id = v_item.variant_id;
        end loop;
      end if;

      v_changed := true;
    end if;
  elsif p_status = 'failed' then
    if v_payment.status = 'pending' then
      update public.payments
      set
        status = 'failed',
        raw_status = coalesce(p_raw_status, raw_status),
        updated_at = now()
      where id = v_payment.id;

      if v_order.status = 'pending' then
        update public.orders
        set status = 'cancelled'
        where id = v_order.id;
      end if;

      v_changed := true;
    end if;
  end if;

  select * into v_payment from public.payments where id = v_payment.id;
  select * into v_order from public.orders where id = v_payment.order_id;

  return query
  select
    v_payment.id,
    v_payment.order_id,
    v_payment.status,
    v_order.status,
    v_changed;
end;
$$;

revoke all on function public.finalize_paynow_payment(
  text, text, text, text, numeric, text
) from public;
revoke all on function public.finalize_paynow_payment(
  text, text, text, text, numeric, text
) from anon;
revoke all on function public.finalize_paynow_payment(
  text, text, text, text, numeric, text
) from authenticated;
grant execute on function public.finalize_paynow_payment(
  text, text, text, text, numeric, text
) to service_role;
