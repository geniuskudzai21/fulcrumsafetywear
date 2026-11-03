-- seed_admin_orders.sql
-- Adds 10 fake orders so the admin dashboard has data. Safe to run once.

do $$
declare
  v_names text[] := array[
    'Tendai Moyo',
    'Rudo Chikafu',
    'Farai Ncube',
    'Nyasha Dube',
    'Tapiwa Sibanda',
    'Chipo Mutasa',
    'Kudzai Mhlanga',
    'Anesu Zhou',
    'Blessing Ndlovu',
    'Simba Mupfumi'
  ];
  v_phones text[] := array[
    '0779000001',
    '0779000002',
    '0779000003',
    '0779000004',
    '0779000005',
    '0779000006',
    '0779000007',
    '0779000008',
    '0779000009',
    '0779000010'
  ];
  v_cities text[] := array[
    'Harare',
    'Bulawayo',
    'Mutare',
    'Gweru',
    'Masvingo',
    'Kwekwe',
    'Chitungwiza',
    'Harare',
    'Bulawayo',
    'Harare'
  ];
  v_statuses text[] := array[
    'pending',
    'paid',
    'packed',
    'shipped',
    'delivered',
    'cancelled',
    'paid',
    'pending',
    'delivered',
    'packed'
  ];
  v_i integer;
  v_j integer;
  v_order_id uuid;
  v_variant record;
  v_variant_count integer;
  v_offset integer;
  v_qty integer;
  v_total numeric;
  v_created timestamptz;
begin
  if exists (select 1 from public.orders where phone like '07790000%') then
    return;
  end if;

  select count(*) into v_variant_count from public.variants;
  if v_variant_count = 0 then
    return;
  end if;

  for v_i in 1..10 loop
    v_created := case
      when v_i <= 2 then now() - ((v_i - 1) * interval '2 hours')
      else now() - ((v_i - 2) * interval '1 day')
    end;

    insert into public.orders (
      status, total, currency, name, phone, city, address, payment_method, created_at
    )
    values (
      v_statuses[v_i],
      0,
      'USD',
      v_names[v_i],
      v_phones[v_i],
      v_cities[v_i],
      '12 Industrial Road, ' || v_cities[v_i],
      'Cash on delivery',
      v_created
    )
    returning id into v_order_id;

    v_total := 0;

    for v_j in 1..(1 + (v_i % 3)) loop
      v_offset := ((v_i * 3) + v_j) % v_variant_count;

      select
        v.id,
        coalesce(v.price_override, p.base_price) as price
      into v_variant
      from public.variants v
      join public.products p on p.id = v.product_id
      order by v.id
      limit 1 offset v_offset;

      v_qty := 1 + (v_j % 2);

      insert into public.order_items (
        order_id, variant_id, qty, unit_price, created_at
      )
      values (
        v_order_id, v_variant.id, v_qty, v_variant.price, v_created
      );

      v_total := v_total + (v_qty * v_variant.price);
    end loop;

    update public.orders
    set total = v_total
    where id = v_order_id;
  end loop;
end;
$$;
