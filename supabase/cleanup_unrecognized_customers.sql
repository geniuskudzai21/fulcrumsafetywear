-- Keep the three recognized customer accounts and all admin accounts.
-- Delete other customer accounts and orders not belonging to those accounts.
-- This does not modify products, categories, variants, or stock.
--
-- Review the names and take a database backup before running in production.

begin;

create temporary table retained_account_ids on commit drop as
select id
from public.profiles
where role = 'admin'
   or (
     role = 'customer'
     and lower(trim(coalesce(full_name, ''))) in (
       'genius kudzai',
       'revaldo nyasha',
       'sungie eusing'
     )
   );

do $$
declare
  v_known_customers integer;
begin
  select count(distinct id)
  into v_known_customers
  from public.profiles
  where role = 'customer'
    and lower(trim(coalesce(full_name, ''))) in (
      'genius kudzai',
      'revaldo nyasha',
      'sungie eusing'
    );

  if v_known_customers <> 3 then
    raise exception
      'Expected to find all 3 named customer accounts, found %. No cleanup was completed.',
      v_known_customers;
  end if;
end;
$$;

delete from public.orders o
where not exists (
  select 1
  from retained_account_ids kept
  where kept.id = o.user_id
)
and lower(trim(coalesce(o.name, ''))) not in (
  'genius kudzai',
  'revaldo nyasha',
  'sungie eusing'
);

delete from auth.users u
using public.profiles p
where p.id = u.id
  and p.role = 'customer'
  and not exists (
    select 1
    from retained_account_ids kept
    where kept.id = p.id
  );

commit;

select
  (select count(*) from public.profiles where role = 'customer') as remaining_customers,
  (select count(*) from public.orders) as remaining_orders,
  coalesce(
    (
      select sum(total)
      from public.orders
      where status in ('paid', 'packed', 'shipped', 'delivered')
        and created_at >= date_trunc('month', now())
    ),
    0
  ) as revenue_this_month;
