-- 003_cart_unique.sql
-- One persisted cart per signed-in customer. Guest carts never reach the DB.

create unique index if not exists carts_user_id_key
  on public.carts (user_id)
  where user_id is not null;
