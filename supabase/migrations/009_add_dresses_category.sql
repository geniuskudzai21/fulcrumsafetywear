insert into public.categories (name, slug)
values ('Dresses', 'dresses')
on conflict (slug) do nothing;
