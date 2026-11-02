-- make_admin.sql
-- Promote an existing account to admin. Replace the email below, then run this
-- in the Supabase SQL editor (or through the Management API).
--
-- The role-change guard trigger only blocks role changes made by a signed-in
-- non-admin. The SQL editor has no auth.uid(), so this update is allowed.

update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('you@example.com');

-- Verify the result:
select p.id, u.email, p.full_name, p.role
from public.profiles p
join auth.users u on u.id = p.id
where lower(u.email) = lower('you@example.com');
