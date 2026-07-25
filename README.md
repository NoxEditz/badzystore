# Badzy Store — launch setup guide

Badzy Store is an Egypt-focused gaming-accessories e-commerce site built with **TanStack Start**, **React 19**, **TanStack Router**, **Zustand**, **Tailwind CSS v4**, and **Supabase**.

This README is the launch checklist for making the site fully functional, including the required keys, free services, manual accounts, and deployment recommendation.

---

## 1. Best free deployment choice

### Recommended: Cloudflare-compatible deployment

This project is configured through `@lovable.dev/vite-tanstack-config` and builds with a **Nitro Cloudflare target by default**. In practice, that makes **Cloudflare Pages / Workers** the most natural free deployment path for the generated app.

- Best fit for the generated build output and SSR/server functions
- Works well with TanStack Start + Nitro
- Easier to keep aligned with the project’s current runtime defaults

If you prefer Vercel, it can still work, but you should verify the runtime/output settings carefully after each deploy.

- Cloudflare Pages: <https://pages.cloudflare.com>
- Cloudflare Workers: <https://workers.cloudflare.com>
- Build command: `npm run build`
- Install command: `npm install`

---

## 2. Required free/mostly-free accounts

| Need | Why | Where |
|---|---|---|
| GitHub account | Stores the code and connects to your deployment provider | <https://github.com> |
| Cloudflare account | Free hosting/deployment path that matches the current build target | <https://cloudflare.com> |
| Supabase project | Database for products, orders, settings, admin data, and storage | <https://supabase.com> |
| WhatsApp Business number | Customer support and order-confirmation links | WhatsApp Business mobile app |
| InstaPay handle or Vodafone Cash number | Manual payment receiving details | Your bank/Vodafone Cash app |
| Domain name | Professional live URL, optional at first | Namecheap, GoDaddy, Cloudflare Registrar, or `.com.eg` registrar |
| Payment gateway account | Real card/Fawry payments later; not required for COD/manual transfer launch | Paymob, Kashier, Geidea, Fawry/Accept |
| Courier/shipping account | Delivery once orders start | Bosta, Mylerz, Aramex Egypt, or manual local delivery |
| Analytics/ads accounts | Optional marketing tracking | Google Analytics, Meta Business, TikTok Ads |

You can launch on a free deployment-provider URL with Supabase free tier, COD, and manual InstaPay/Vodafone Cash before buying a domain or opening a payment-gateway account.

---

## 3. Environment variables

Create a local `.env` file and add the same values in your deployment provider’s environment settings.

### Required for Supabase-backed features

```env
# Supabase Dashboard → Project Settings → API
VITE_SUPABASE_URL="https://your-project-id.supabase.co"

# Use Supabase's new publishable key if available.
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_xxxxxxxxxxxxxxxxx"

# Optional legacy fallback supported by this project.
# VITE_SUPABASE_ANON_KEY="your-old-anon-key"

# Server-only admin login values. Do NOT prefix these with VITE_.
ADMIN_PASSKEY="generate-a-long-random-admin-passkey"
ADMIN_SESSION_SECRET="generate-a-long-random-session-secret"

# Server-only Supabase service role key for admin/server operations.
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="sb_secret_or_service_role_key"
```

Local development note: if `ADMIN_PASSKEY` is not set and `NODE_ENV` is not `production`, the admin passkey falls back to `6565`. If `ADMIN_SESSION_SECRET` is not set locally, the app uses a development-only secret. These fallbacks are only for quick local testing. Always set strong `ADMIN_PASSKEY` and `ADMIN_SESSION_SECRET` values before deploying publicly.

Generate strong secrets locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Recommended before real customers visit

```env
VITE_STORE_DOMAIN="https://your-domain.com"
VITE_WHATSAPP_NUMBER="2010XXXXXXXX"
VITE_VODAFONE_CASH_NUMBER="010XXXXXXXX"
VITE_INSTAPAY_HANDLE="yourname@instapay"
VITE_FREE_SHIPPING_THRESHOLD="2500"
VITE_DEFAULT_SHIPPING_FEE="50"
```

Important: `VITE_WHATSAPP_NUMBER` must be in international format for `wa.me` links, e.g. `201001234567` without `+`, spaces, or dashes.

Default storefront values exist in `src/lib/config.ts`, so these variables are optional for local development but should be set for a real launch:

- `VITE_STORE_DOMAIN` defaults to `badzystore.com`
- `VITE_WHATSAPP_NUMBER` defaults to `201012345678`
- `VITE_VODAFONE_CASH_NUMBER` defaults to `01012345678`
- `VITE_INSTAPAY_HANDLE` defaults to `badzystore@instapay`
- `VITE_FREE_SHIPPING_THRESHOLD` defaults to `2500`
- `VITE_DEFAULT_SHIPPING_FEE` defaults to `50`

### Optional integrations for later

```env
# Payment gateways — public/client keys only here.
VITE_PAYMOB_PUBLIC_KEY=""
VITE_STRIPE_PUBLIC_KEY=""

# Courier/shipping integrations.
VITE_BOSTA_API_KEY=""
VITE_MYLERZ_API_KEY=""

# Analytics pixels.
VITE_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
VITE_META_PIXEL_ID=""
VITE_TIKTOK_PIXEL_ID=""
```

Never put service-role keys, payment secret keys, or private API tokens in `VITE_*` variables. `VITE_*` values are bundled into browser JavaScript.

---

## 4. Supabase setup checklist

1. Create a free project at <https://supabase.com>.
2. Copy the project URL into `VITE_SUPABASE_URL`.
3. Copy the publishable/anon key into `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY`.
4. Run the SQL in `supabase/schema.sql` from the Supabase SQL Editor.
5. Apply any files in `supabase/migrations/` if they are not already included in the schema.
6. Enable Row Level Security (RLS) on public tables.
7. Confirm these minimum policies:
   - `products`: public read; admin-only insert/update/delete.
   - `orders`: anonymous/customer insert; admin-only select/update/delete.
   - `settings`: public read for storefront-safe settings; admin-only write.
   - storage buckets: public read for product images; admin-only upload/delete.
8. Add your first products or migrate the existing seeded products.
9. Test checkout and confirm orders appear in Supabase.

Critical: without Supabase configured correctly, orders and stock cannot be trusted across devices.

---

## 5. Current payment status

Safe launch-ready methods:

- **Cash on Delivery (COD)** — default checkout option.
- **InstaPay / bank transfer** — customer enters transfer reference; payment remains pending verification.

Not live yet:

- **Card payments** — do not enable until Paymob/Stripe/Kashier/Geidea is actually integrated server-side.
- **Fawry** — do not show real Fawry codes until a real Fawry provider creates references.

Recommended Egypt payment providers:

- Paymob: <https://paymob.com>
- Kashier: <https://kashier.io>
- Geidea: <https://www.geidea.net>
- Fawry: <https://fawry.com>

---

## 6. Local development

```bash
npm install
npm run dev
```

Open the local URL printed by Vite, usually <http://localhost:5173>.

Useful commands:

```bash
npm run build
npm run lint
npm run format
```

---

## 7. Deployment steps

1. Push the repository to GitHub.
2. Go to your deployment provider and import the repository.
3. Keep build command as `npm run build`.
4. Add every required environment variable from section 3.
5. Deploy.
6. After deploy, test:
   - Homepage loads.
   - Shop/product pages load products.
   - Checkout creates an order in Supabase.
   - Admin login works with `ADMIN_PASSKEY`.
   - WhatsApp links go to your real number.
7. Add a custom domain when ready.

---

## 8. Go-live checklist

- [ ] Supabase URL/key set in your deployment provider.
- [ ] `ADMIN_PASSKEY` and `ADMIN_SESSION_SECRET` set in your deployment provider.
- [ ] `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` set if server/admin Supabase operations are enabled.
- [ ] Supabase schema and RLS policies applied.
- [ ] Real WhatsApp Business number set.
- [ ] Real InstaPay/Vodafone Cash receiving details set.
- [ ] Test order appears in Supabase and admin dashboard.
- [ ] Product stock changes after checkout.
- [ ] Admin route is not indexed (`robots` noindex is already set in route metadata).
- [ ] `public/robots.txt` and `public/sitemap.xml` use the real domain before final SEO launch.
- [ ] Placeholder product images replaced with real SKU photos.
- [ ] Return, FAQ, warranty, and contact pages reviewed in Arabic and English.
- [ ] Legal/business requirements checked for selling in Egypt.

---

## 9. Important security notes

- The admin passkey is server-side via `ADMIN_PASSKEY`; never hardcode admin passwords in React files.
- Use a long random passkey, not `admin123` or any guessable word.
- Keep Supabase service-role keys out of the frontend and out of Git.
- Enable RLS before sharing the site publicly.
- Real payment verification must happen server-side or through the provider dashboard/API.

---

## 10. Design assets

- Logo: `public/logo.png` and `public/logo.webp`
- Favicons: `public/favicon.ico`, `public/favicon-32.png`, `public/favicon-192.png`
- Product imagery: prefer your own product photos or Supabase Storage-hosted images.

---

Built for Egyptian gamers. 🎮
