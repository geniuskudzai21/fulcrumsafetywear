# Fulcrum Safety Wear

Next.js storefront for Fulcrum Safety Wear with a Supabase catalogue, customer
accounts, and a cart that syncs across devices.

## Requirements

- Node.js 20+
- A Supabase project
- Optional: a Google Cloud project for Google sign-in

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in the Supabase values:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

   `SUPABASE_SERVICE_ROLE_KEY` is server-only. Never expose it to the browser.
   The auth and cart features only use the anon key plus the signed-in user's
   cookies.

3. Apply the SQL migrations in `supabase/migrations/` to your database in
   numeric order, through `005_admin_overview_pagination.sql`.

4. Create your first customer account, then replace `you@example.com` in
   `supabase/make_admin.sql` with that account's email and run the script in the
   Supabase SQL editor. This grants access to `/admin`; the admin dashboard and
   customer list show all registered customer accounts, with pagination.

5. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Auth setup

In **Supabase Dashboard > Authentication > URL Configuration**:

- **Site URL**: `http://localhost:3000` for local development, or your
  production URL.
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://your-domain.com/auth/callback` (production)

The app appends `?next=/account` or `?next=/reset-password` to the callback.
If your project uses strict redirect matching, add
`http://localhost:3000/auth/callback**` and the production equivalent.

In **Authentication > Providers > Email**:

- Enable email sign-in.
- Keep **Confirm email** enabled. New users must confirm before they can sign
  in.
- Password reset and signup confirmation emails both return through
  `/auth/callback`.
- Supabase's default email service has strict sending limits. If signup or
  password-reset emails are rate-limited, check **Authentication > Logs** and
  **Authentication > Rate Limits**. For reliable production email delivery,
  configure a custom SMTP provider and review its sending limits.

## Google Cloud setup

1. In **Google Cloud Console > APIs & Services > Credentials**, create an
   **OAuth client ID** of type **Web application**.
2. Add an **Authorized redirect URI** for Supabase (not the app):
   `https://<your-project-ref>.supabase.co/auth/v1/callback`
3. In **Supabase Dashboard > Authentication > Providers > Google**, enable the
   provider and paste the Google **Client ID** and **Client secret**.
4. Add the app callback URLs from the section above to the Supabase redirect
   allowlist.

## Testing the auth and cart flow

1. Visit `/account` or `/checkout` while signed out, or press Checkout in the
   cart. You should be redirected to `/login?next=...`.
2. Sign up at `/signup`. With email confirmation enabled, you should see the
   "Check your email" message. Confirm the email, then sign in.
3. Add items to the cart while signed out. Sign in. The guest cart is merged
   into the database and the header count updates.
4. Refresh while signed in. The cart should reload from the database, not
   duplicate the guest items.
5. Open `/account` to see the profile and empty order history. Open `/checkout`
   to review the synced cart.
6. Change quantities and remove items, then refresh to confirm they persist.
7. Sign out. The local cart is cleared and `/account` and `/checkout` redirect
   to `/login` again.
8. Test `/forgot-password` with a confirmed account, follow the email link, and
   set a new password on `/reset-password`.

## Scripts

- `npm run dev` - development server
- `npm run build` - production build
- `npm run start` - serve the production build
- `npm run lint` - ESLint
- `npm run typecheck` - TypeScript check
