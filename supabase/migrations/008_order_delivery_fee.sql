-- Add server-calculated delivery pricing to Paynow orders.

alter table public.orders
  add column if not exists delivery_fee numeric(10, 2) not null default 0
  check (delivery_fee >= 0);

create or replace function public.create_paynow_order_with_delivery(
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
  delivery_fee numeric,
  currency text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_payment_id uuid;
  v_subtotal numeric(10, 2);
  v_total numeric(10, 2);
  v_delivery_fee numeric(10, 2);
  v_currency text := 'USD';
  v_expected integer;
  v_count integer;
  v_quantity integer;
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
    or p_method not in ('ecocash', 'onemoney', 'inbucks', 'zimswitch')
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

  select
    count(distinct (item ->> 'variantId')::uuid),
    sum((item ->> 'qty')::integer)::integer
  into v_expected, v_quantity
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
  into v_count, v_subtotal
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

  if v_subtotal is null or v_subtotal <= 0 then
    raise exception 'Order subtotal must be greater than zero';
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

  v_delivery_fee := case when v_quantity >= 6 then 2.50 else 5.00 end;
  v_total := round(v_subtotal + v_delivery_fee, 2);

  v_method_label := case p_method
    when 'ecocash' then 'EcoCash (Paynow)'
    when 'onemoney' then 'OneMoney (Paynow)'
    when 'inbucks' then 'InnBucks (Paynow)'
    when 'zimswitch' then 'Zimswitch (Paynow)'
    else p_method
  end;

  insert into public.orders (
    user_id,
    status,
    total,
    delivery_fee,
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
    v_delivery_fee,
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
  select v_order_id, v_payment_id, v_total, v_delivery_fee, v_currency;
end;
$$;

revoke all on function public.create_paynow_order_with_delivery(
  uuid, text, text, text, text, text, text, jsonb
) from public;
revoke all on function public.create_paynow_order_with_delivery(
  uuid, text, text, text, text, text, text, jsonb
) from anon;
revoke all on function public.create_paynow_order_with_delivery(
  uuid, text, text, text, text, text, text, jsonb
) from authenticated;
grant execute on function public.create_paynow_order_with_delivery(
  uuid, text, text, text, text, text, text, jsonb
) to service_role;
