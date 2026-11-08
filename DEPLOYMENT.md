# Vercel Deployment Plan — Fulcrum Safety Wear

## 1. Prerequisites
- GitHub repo `geniuskudzai21/fulcrumsafetywear` on `main` (already configured).
- Vercel account + access to the GitHub repo.
- Production Supabase project (separate from local, recommended).
- Domain ready (optional, but recommended before final auth config).
- Node 20+ (repo runs on Node 22 locally).

## 2. Pre-flight checks (local)
```bash
npm run typecheck
npm run lint
npm run build
```
- Confirm `.env` is NOT committed (`.gitignore` already ignores `.env*`).
- Confirm all changes are pushed: `git push origin main`.

## 3. Create the Vercel project
1. Vercel Dashboard → **Add New → Project** → import `fulcrumsafetywear`.
2. Framework preset: **Next.js** (auto-detected).
3. Build & Output settings (defaults are correct):
   - Install: `npm install`
   - Build: `npm run build`
   - Output: `.next`
4. No `vercel.json` needed.

## 4. Environment variables
Add these in **Project → Settings → Environment Variables** for **Production** and **Preview**:

| Name | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `<anon key>` | Public |
| `NEXT_PUBLIC_SITE_URL` | `https://fulcrumindustrial.co.zw` | Canonical URL for metadata/sitemap/robots |
| `SUPABASE_SERVICE_ROLE_KEY` | optional | Server-only; currently **not referenced** in app code, add only if you introduce server admin ops |

Important: `NEXT_PUBLIC_*` values are **inlined at build time** — changing them requires a redeploy.

## 5. First deploy + domain
1. Click **Deploy**, get the `*.vercel.app` URL.
2. Add your custom domain under **Settings → Domains** and configure DNS.
3. Set `NEXT_PUBLIC_SITE_URL` to the final canonical URL, then **redeploy**.
4. Enable automatic deployments from `main` (default).

## 6. Supabase production configuration

### Authentication → URL Configuration
- Site URL: `https://fulcrumindustrial.co.zw`
- Redirect URLs:
  - `https://fulcrumindustrial.co.zw/auth/callback`
  - `https://*.vercel.app/auth/callback` (preview deployments)

### Email provider
- Enable email sign-in and keep **Confirm email** on.
- Configure **custom SMTP** (Resend/SendGrid/Postmark) before launch — Supabase's default mailer has strict rate limits that break signup/reset.

### Google OAuth (if enabled)
- Google Cloud OAuth client (Web application).
- Authorized redirect URI: `https://<ref>.supabase.co/auth/v1/callback`
- Supabase → Auth → Providers → Google: add Client ID + secret.

### Storage
- Create a **public** bucket named `products` (migrations only add policies, not the bucket).
- Admin image uploads depend on this.

### Paynow
- Register/sign in: https://www.paynow.co.zw/Customer/Register
- Create the integration and get the ID/key: https://www.paynow.co.zw/Home/Receive
- Full steps: https://developers.paynow.co.zw/docs/paynow/integration_generation/
- Test mode: https://developers.paynow.co.zw/docs/paynow/test_mode/
- Create an **Advanced Integration**, leave the Paynow Notification URL blank, and enable EcoCash, InnBucks and Zimswitch.
- Set `PAYNOW_INTEGRATION_ID`, `PAYNOW_INTEGRATION_KEY`, `PAYNOW_RESULT_URL` and `PAYNOW_RETURN_URL` as server-only Vercel env vars.
- `PAYNOW_RESULT_URL` must be `https://<domain>/api/paynow/webhook` and publicly reachable.
- `PAYNOW_RETURN_URL` must be `https://<domain>/checkout/return`.
- While testing, set `PAYNOW_AUTH_EMAIL` to the Paynow merchant login email. Remove it before going live.
- After a successful test, click **Request to be Set Live**, generate a new key, update the env vars, and redeploy.
- Run the test checklist in `README.md` against the Paynow test integration before going live.

## 7. Database setup
1. Apply migrations in order (`001` → `006`) via Supabase SQL Editor, or `supabase link` + `supabase db push`.
2. Seed catalogue (fresh project): run `supabase/seed.sql`.
3. Create the admin user (sign up first), then run `supabase/make_admin.sql` with the real email.
4. Verify RLS is enabled and policies exist.

> Take a Supabase backup before running migrations on any existing data.

## 8. Post-deploy verification
- Home loads products, search/filter/sort work.
- Product detail pages render and images load.
- Signup → confirmation email → login works.
- Google sign-in works.
- Forgot/reset password round-trips.
- Cart syncs across devices; checkout requires auth.
- Paynow test payment succeeds; webhook marks the order paid and decrements stock.
- Failed and cancelled Paynow payments leave stock unchanged.
- `/admin` accessible only to the admin account; product image upload succeeds.
- `sitemap.xml` and `robots.txt` show the production domain.
- No console errors; Vercel + Supabase logs clean.

## 9. Security & operations
- Keep the service role key secret; never add it to the browser or `NEXT_PUBLIC_*`.
- Confirm email verification and review Supabase rate limits.
- Ensure HTTPS only (Vercel provides it).
- Enable Supabase backups and monitor Auth/DB logs.
- Avoid production seeding of demo/admin orders.

## 10. Rollback
- Vercel → Deployments → **Promote/Rollback** to a previous build instantly.
- Database migrations are forward-only; restore from Supabase backup if a migration must be undone.

## 11. Optional CI
- Add `npm run typecheck && npm run lint` as a GitHub Actions check, or protect `main` and rely on Vercel's build.
