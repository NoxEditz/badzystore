# Badzy Store

Badzy Store is a high-performance, bilingual (English & Arabic) e-commerce storefront built with modern web technologies. It is designed to be fully standalone, robust, and easily deployable to edge environments like Cloudflare Pages.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React-based, file-based routing)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) (Client state, Cart, Lang)
- **Database / Auth / Storage**: [Supabase](https://supabase.com/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)

> **Note:** This project does not use any third-party closed-source build platforms. It relies entirely on standard open-source tools and self-configured environment variables.

## Key Features

1. **Bilingual Support (EN/AR)**
   Seamless real-time switching between English and Arabic, including RTL layout support.
2. **Dynamic Store Settings & Catalog**
   The storefront is fully manageable via the Admin dashboard (`/admin`), where you can add categories, update products, and customize store settings without changing any code.
3. **Cart & Checkout Flow**
   A fast, edge-rendered checkout process that handles both Cash on Delivery (COD) and InstaPay/Bank Transfer. Server-side validation prevents out-of-stock items from being purchased.
4. **SEO & Metadata**
   Automatically generated Open Graph tags, JSON-LD structured data for products, and SEO-friendly URLs.
5. **Analytics Integration**
   Built-in Google Analytics (GA4) with real tracking for `add_to_cart`, `begin_checkout`, and `purchase` events.

## Prerequisites

- Node.js (v18+)
- npm or pnpm
- A [Supabase](https://supabase.com) project

## Environment Variables

Copy the `.env.example` file to `.env` (or set them in your deployment dashboard) and fill in the values:

```bash
cp .env.example .env
```

Required variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY` (or `VITE_SUPABASE_ANON_KEY`): Your Supabase anonymous key.
- `VITE_GA_MEASUREMENT_ID`: Google Analytics 4 Measurement ID (e.g., `G-XXXXXXXXXX`).
- `VITE_STORE_DOMAIN`: The public URL of the store (e.g., `https://badzystore.com`).

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Supabase Database Setup

After running the standard migrations in the Supabase SQL editor, you **must also** run `db/2026-07-26_server_side_orders_and_stock.sql`.

This file:
- Creates the atomic stock decrement function used during checkout.
- Secures the `orders` table to service-role-only inserts (preventing client-side order manipulation).
- Adds performance indexes on frequently queried columns.

Without it, checkout will fail with a stock decrement error.

## Deployment

This project is optimized for **Cloudflare Pages**.

1. Connect your repository to Cloudflare Pages.
2. Set the build command to `npm run build`.
3. Set the build output directory to `.output/public`.
4. Add the required environment variables in the Cloudflare Pages settings.

## Admin Dashboard

Access the admin dashboard at `/admin`.
Authentication requires a passkey set in your Supabase configuration (custom logic depending on your setup). The dashboard allows you to:
- Manage orders
- Add/Edit/Delete products and manage stock levels
- Upload product images to Supabase Storage
- Manage custom categories
- Adjust store settings (shipping fees, banners, trust cards, contact info)