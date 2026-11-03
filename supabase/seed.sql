-- seed.sql
-- Catalogue data derived from lib/data/products.ts.
-- Idempotent: re-running only inserts rows that are missing.

insert into public.categories (name, slug)
values
  ('Shirts', 'shirts'),
  ('Hi-Vis', 'hi-vis'),
  ('Trousers', 'trousers'),
  ('Sets', 'sets'),
  ('Accessories', 'accessories')
on conflict (slug) do nothing;

insert into public.products (
  name,
  slug,
  description,
  category_id,
  base_price,
  image_path,
  tag,
  active
)
values
  (
    'Hi-Vis Long Sleeve Polo',
    'hi-vis-long-sleeve-polo',
    'Breathable polo with two reflective bands across the body and sleeves. Contrast navy hem and cuffs hide dirt.',
    (select id from public.categories where slug = 'hi-vis'),
    18.00,
    '/images/jacket.jpeg',
    'Best seller',
    true
  ),
  (
    'Two-Tone Work Shirt, Short Sleeve',
    'two-tone-work-shirt-short-sleeve',
    'Colour-block work shirt with contrast collar, piping and sleeve cuffs. Good for teams and uniforms.',
    (select id from public.categories where slug = 'shirts'),
    15.00,
    '/images/shirts.jpeg',
    '10 colourways',
    true
  ),
  (
    'Safari Utility Work Shirt',
    'safari-utility-work-shirt',
    'Olive and stone shirt with twin flap chest pockets and button front. Made for mines, farms and field work.',
    (select id from public.categories where slug = 'shirts'),
    16.00,
    '/images/shirt1.jpeg',
    null,
    true
  ),
  (
    'Reflective Cargo Work Trousers',
    'reflective-cargo-work-trousers',
    'Reinforced panels, cargo leg pocket and reflective ankle bands. Available in three colours.',
    (select id from public.categories where slug = 'trousers'),
    28.00,
    '/images/trousers.jpeg',
    'New',
    true
  ),
  (
    'Hi-Vis Jacket and Trouser Set',
    'hi-vis-jacket-and-trouser-set',
    'Grey and black jacket with reflective bands and matching trousers with tool pockets and knee reinforcement.',
    (select id from public.categories where slug = 'sets'),
    65.00,
    '/images/combo.jpeg',
    'Save on the set',
    true
  ),
  (
    'Reflective Safety Harness Belt',
    'reflective-safety-harness-belt',
    'Lightweight hi-vis cross-body strap with reflective strips and an adjustable buckle. One size fits most.',
    (select id from public.categories where slug = 'accessories'),
    4.00,
    '/images/thing.jpeg',
    null,
    true
  )
on conflict (slug) do nothing;

-- One variant per colour and size, with 20 units of stock each.
with variant_seed (product_slug, color_name, color_hex, has_sizes) as (
  values
    ('hi-vis-long-sleeve-polo', 'Royal blue', '#1d4ed8', true),
    ('hi-vis-long-sleeve-polo', 'Sky blue', '#7cc4f0', true),
    ('hi-vis-long-sleeve-polo', 'Navy', '#17234a', true),
    ('hi-vis-long-sleeve-polo', 'Yellow', '#f7e015', true),
    ('hi-vis-long-sleeve-polo', 'Red', '#e5242b', true),
    ('hi-vis-long-sleeve-polo', 'Green', '#6fdc2b', true),
    ('hi-vis-long-sleeve-polo', 'Orange', '#ff6a1a', true),
    ('two-tone-work-shirt-short-sleeve', 'Black / Royal blue', '#1d4ed8', true),
    ('two-tone-work-shirt-short-sleeve', 'Navy / Sky blue', '#4a90d9', true),
    ('two-tone-work-shirt-short-sleeve', 'Charcoal / Orange', '#ff7a1a', true),
    ('two-tone-work-shirt-short-sleeve', 'Black / Yellow', '#f7e015', true),
    ('two-tone-work-shirt-short-sleeve', 'Navy / Red', '#e5242b', true),
    ('two-tone-work-shirt-short-sleeve', 'Green / Grey', '#14532d', true),
    ('two-tone-work-shirt-short-sleeve', 'Black / Pink', '#ff6fb5', true),
    ('two-tone-work-shirt-short-sleeve', 'Navy / Beige', '#d9c7a3', true),
    ('two-tone-work-shirt-short-sleeve', 'Black / Grey', '#6b7280', true),
    ('two-tone-work-shirt-short-sleeve', 'Royal blue / Navy', '#1e40af', true),
    ('safari-utility-work-shirt', 'Olive / Stone', '#6b7456', true),
    ('reflective-cargo-work-trousers', 'Charcoal', '#4b4f58', true),
    ('reflective-cargo-work-trousers', 'Petrol blue', '#2f5d80', true),
    ('reflective-cargo-work-trousers', 'Olive', '#4a5a3a', true),
    ('hi-vis-jacket-and-trouser-set', 'Grey / Black', '#4b4f58', true),
    ('reflective-safety-harness-belt', 'Lime', '#c8f032', false)
)
insert into public.variants (
  product_id,
  color_name,
  color_hex,
  size,
  sku,
  stock
)
select
  p.id,
  v.color_name,
  v.color_hex,
  s.size,
  'FSW-' || upper(replace(p.slug, '-', '')) || '-' ||
    upper(regexp_replace(v.color_name, '[^A-Za-z0-9]', '', 'g')) || '-' ||
    replace(s.size, ' ', ''),
  20
from variant_seed v
join public.products p on p.slug = v.product_slug
cross join lateral unnest(
  case
    when v.has_sizes then array['S', 'M', 'L', 'XL', '2XL', '3XL']
    else array['One Size']
  end
) as s (size)
on conflict (sku) do nothing;
