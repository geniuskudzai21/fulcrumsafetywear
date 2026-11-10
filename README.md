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

3. Apply every SQL migration in `supabase/migrations/` to your database in
   numeric order, through the latest migration (`008_order_delivery_fee.sql`).

4. To preview the storefront with sample products, run `supabase/seed.sql` in
   the Supabase SQL Editor.
   The seed script adds catalogue data only; it does not create customers or
   orders. To remove unrecognized customer accounts and orders while keeping
   the three named customers and admins, review and run
   `supabase/cleanup_unrecognized_customers.sql` after taking a database backup.

5. Create your first customer account, then replace `you@example.com` in
   `supabase/make_admin.sql` with that account's email and run the script in the
   Supabase SQL editor. This grants access to `/admin`; the admin dashboard and
   customer list show all registered customer accounts, with pagination.

6. Start the app:

   ```bash
   npm run dev
   ```

## Supabase Auth setup

In **Supabase Dashboard > Authentication > URL Configuration**:

- **Site URL**: `http://localhost:3000` for local development, or your
  production URL.
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://fulcrumindustrial.co.zw/auth/callback` (production)

The app appends `?next=/account` or `?next=/reset-password` to the callback.
If your project uses strict redirect matching, add
`http://localhost:3000/auth/callback**` and the production equivalent.

Google sign-in uses the bare callback URL `https://<your-site>/auth/callback`
and stores the return path in a short-lived cookie. If Google returns you to
`/?code=...` instead, Supabase rejected the callback URL and fell back to the
Site URL. Check that **Site URL** matches the environment you are testing and
that both callback entries above are in **Redirect URLs**, including the `**`
wildcard form if matching is strict.

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

## Paynow setup

Checkout adds a flat $5 USD delivery fee, reduced to $2.50 for orders of six
or more items. The fee is included in the Paynow amount and saved with the
order.

### Which link do I visit?

Use these official Paynow links:

| Task | Link |
| --- | --- |
| Create a Paynow merchant account | https://www.paynow.co.zw/Customer/Register |
| Sign in to an existing account | https://www.paynow.co.zw |
| Create/manage the integration and get the ID/key | https://www.paynow.co.zw/Home/Receive |
| Official integration-key instructions | https://developers.paynow.co.zw/docs/paynow/integration_generation/ |
| Test mode instructions | https://developers.paynow.co.zw/docs/paynow/test_mode/ |
| Node.js SDK guide | https://developers.paynow.co.zw/docs/paynow/nodejs_quickstart/ |
| Initiate transaction API | https://developers.paynow.co.zw/docs/paynow/initiate_transaction |
| Mobile money API | https://developers.paynow.co.zw/docs/paynow/initiate_mobile_transaction/ |

Paynow is server-only. Add these values to `.env` and never prefix them with
`NEXT_PUBLIC_`:

```bash
PAYNOW_INTEGRATION_ID=your-test-integration-id
PAYNOW_INTEGRATION_KEY=your-test-integration-key
PAYNOW_RESULT_URL=https://your-public-url/api/paynow/webhook
PAYNOW_RETURN_URL=https://your-public-url/checkout/return
# Optional and only while testing:
PAYNOW_AUTH_EMAIL=your-paynow-merchant-login-email
```

### 1. Create the Paynow merchant account

1. Go to https://www.paynow.co.zw/Customer/Register.
2. Complete registration and the email validation step.
3. Sign in and add the bank account/settlement details you want to receive
   payments into.

### 2. Create the advanced integration

1. Open https://www.paynow.co.zw/Home/Receive ("Other Ways To Get Paid").
2. Click **Create/Manage Shopping Carts**.
3. Click **Create Advanced Integration**.
4. Give it a name, for example `Fulcrum Website`.
5. Choose whether the integration absorbs Paynow fees.
6. Enter the email address that should receive transaction updates.
7. Leave **Notification URL** blank. This app sends a per-transaction
   `resulturl` and `returnurl` to Paynow.
8. Select the payment methods: **EcoCash**, **InnBucks** and **Zimswitch**.
   Visa/Mastercard can be added too, but the checkout UI currently offers only
   those three.
9. Click **Save**.
10. In **Integration Keys**, copy the **Integration ID**.
11. Click **Email Key To Company Address** to receive the **Integration Key**.
    Paynow does not display it on the page. Keep it secret.

The integration ID must have the payment methods selected. If EcoCash, InnBucks
or Zimswitch is not enabled on the integration, Paynow returns an error when
the app tries to start that payment.

### 3. Configure the URLs and environment

- `PAYNOW_RESULT_URL` must be a publicly reachable HTTPS URL. Paynow posts
  status updates there. Use the exact URL
  `https://fulcrumindustrial.co.zw/api/paynow/webhook`.
- `PAYNOW_RETURN_URL` must be
  `https://fulcrumindustrial.co.zw/checkout/return`. The app appends
  `?payment=<payment-id>` automatically.
- Local development needs a tunnel such as ngrok or cloudflared, because
  Paynow cannot reach `localhost`. Put the tunnel URL in both variables.
- `PAYNOW_AUTH_EMAIL` is optional. Set it to your Paynow merchant login email
  **only while testing**, because Paynow test mode requires the `authemail`
  field to match the merchant account. Remove it or change it to a real
  support address before going live.
- Never commit `.env` and never expose the integration key in client code.

### 4. Test in Paynow test mode

A new integration starts in test mode, so no real money moves.

1. Sign in to Paynow in the same browser as the merchant account that created
   the integration. Only that account can fake a test payment.
2. Set `PAYNOW_AUTH_EMAIL` to that merchant account's login email.
3. Run the app behind a public HTTPS tunnel and set the two URL variables to
   the tunnel URLs.
4. Use these EcoCash test numbers:

   | Number | Result |
   | --- | --- |
   | `0771111111` | Success, status update about 5 seconds later |
   | `0772222222` | Delayed success, about 30 seconds later |
   | `0773333333` | User cancels, failed status update about 30 seconds later |
   | `0774444444` | Insufficient balance, fails during initiation |

5. For Zimswitch, the app redirects to Paynow. In test mode, choose
   **TESTING: Faked Success** and click **Make Payment**.
6. InnBucks uses Paynow's hosted payment page rather than the mobile-money
   prompt API. Select InnBucks on that page to complete payment. InnBucks may
   not be available in Paynow test mode; confirm availability with Paynow or
   test using the live integration.
7. Watch the server logs and Supabase `payments`/`orders` tables to confirm the
   webhook and stock updates.

### 5. Go live

1. After at least one successful test transaction, return to **Integration
   Keys** and click **Request to be Set Live**.
2. Generate a new key, update `PAYNOW_INTEGRATION_KEY`, and redeploy.
3. Remove `PAYNOW_AUTH_EMAIL` (or set it to a real support address) so live
   customers use their own `authemail`.
4. Confirm both URLs still use the production domain and that HTTPS works.

### Paynow test checklist

1. **Success**: pay with `0771111111`. The webhook should mark the payment and
   order `paid`, and stock should drop by the ordered quantity.
2. **Failure**: pay with `0774444444`. Initiation should report an error, the
   payment should be `failed`, the order `cancelled`, and stock unchanged.
3. **Cancelled**: pay with `0773333333`. The failed status update should mark
   the payment `failed`, the order `cancelled`, and stock unchanged.
4. **Zimswitch**: choose Zimswitch, fake success on the Paynow test page, and
   confirm the return page shows paid and stock decreases once.
5. **Duplicate webhook**: replay the same successful webhook body three times.
   The first request decrements stock; later requests return `changed: false`
   and must not decrement again.
6. **Poll fallback**: block the webhook, complete a payment, then call
   `GET /api/payments/<id>/status`. It should poll Paynow and finalize once.
7. **Return page**: after paying, `/checkout/return?payment=<id>` should show
   the confirmed status and must not change any rows by itself.
8. **Hash tamper**: post a webhook body with an altered `hash`. It should return
   400 and make no database changes.
9. **Amount mismatch**: post a validly hashed webhook with a different amount.
   It should return 400 and leave the payment untouched.
10. **RLS**: another signed-in user cannot read the payment or order. Anon and
    authenticated clients cannot insert, update or delete `payments` rows.
11. **Rate limit**: submit more than five checkout requests in a minute. The
    route should return 429 with `Retry-After`.

The `paynow` npm package has no TypeScript declarations, so the app includes a
local declaration in `types/paynow.d.ts`. Checkout rate limiting is in-memory
per server instance; add a shared store such as Upstash if you need a global
limit across instances.

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
