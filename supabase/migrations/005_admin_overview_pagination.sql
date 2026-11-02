-- Show complete customer/order totals and paginate the customer list.

drop function if exists public.admin_dashboard_stats(integer);

create function public.admin_dashboard_stats(p_low_stock integer default 5)
returns table (
  orders_today bigint,
  revenue_this_month numeric,
  low_stock_count bigint,
  new_customers bigint,
  total_customers bigint,
  total_orders bigint
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
    )::bigint,
    coalesce(
      (
        select sum(total)
        from public.orders
        where status in ('paid', 'packed', 'shipped', 'delivered')
          and created_at >= date_trunc('month', now())
      ),
      0
    )::numeric,
    (
      select count(*)
      from public.variants v
      join public.products p on p.id = v.product_id
      where p.active
        and v.stock <= p_low_stock
    )::bigint,
    (
      select count(*)
      from public.profiles
      where role = 'customer'
        and created_at >= date_trunc('month', now())
    )::bigint,
    (
      select count(*)
      from public.profiles
      where role = 'customer'
    )::bigint,
    (
      select count(*)
      from public.orders
    )::bigint;
end;
$$;

revoke all on function public.admin_dashboard_stats(integer) from public;
grant execute on function public.admin_dashboard_stats(integer) to authenticated;

drop function if exists public.admin_customers(text);

create function public.admin_customers(
  p_search text default null,
  p_page integer default 1
)
returns table (
  id uuid,
  full_name text,
  email text,
  created_at timestamptz,
  order_count bigint,
  total_count bigint,
  page_number integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_total bigint;
  v_page integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select count(*)
  into v_total
  from public.profiles p
  where p.role = 'customer'
    and (
      p_search is null
      or trim(p_search) = ''
      or p.full_name ilike '%' || trim(p_search) || '%'
      or p.email ilike '%' || trim(p_search) || '%'
    );

  v_page := greatest(
    1,
    least(
      coalesce(p_page, 1),
      greatest(ceil(v_total::numeric / 50)::integer, 1)
    )
  );

  return query
  with matching as (
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
  )
  select
    matching.id,
    matching.full_name,
    matching.email,
    matching.created_at,
    matching.order_count,
    v_total,
    v_page
  from matching
  order by matching.created_at desc
  limit 50
  offset ((v_page - 1) * 50);
end;
$$;

revoke all on function public.admin_customers(text, integer) from public;
grant execute on function public.admin_customers(text, integer) to authenticated;
