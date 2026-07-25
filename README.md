# Badzy Store — E-commerce Platform

Welcome to the Badzy Store repository! This is a modern, high-performance e-commerce platform built with **TanStack Start**, **React**, **Tailwind CSS**, and **Supabase**.

## 🚀 Integrations & Tech Stack

This project relies on several key technologies and integrations:

1. **Frontend Framework:** [TanStack Start](https://tanstack.com/start/latest) (React + SSR + Routing)
2. **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
3. **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage)
4. **Build Tool:** [Vite](https://vitejs.dev/) with [Nitro](https://nitro.unjs.io/) for server deployment.

---

## 🔑 Required Environment Variables

To make this website work properly, you need to create a `.env` file in the root of your project and add the following keys. You will also need to add these exact keys to your hosting provider (e.g., Vercel) during deployment.

```env
# Supabase Configuration
# You can find these in your Supabase Dashboard -> Project Settings -> API
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

*(Note: If you have additional API keys for payment gateways like Stripe or Paymob, add them here as well).*

---

## 🌍 How to Deploy for FREE (Vercel)

We recommend **Vercel** for hosting as it provides a generous free tier and works perfectly with TanStack Start/Nitro.

### Step 1: Push your code to GitHub
1. Create a free account on [GitHub](https://github.com).
2. Create a new repository and push this codebase to it.

### Step 2: Set up Vercel
1. Go to [Vercel](https://vercel.com/) and create a free account (you can sign up with GitHub).
2. Click **Add New...** -> **Project**.
3. Import your Badzy Store GitHub repository.

### Step 3: Configure Vercel Settings
Vercel will usually auto-detect the framework, but just to be safe, ensure the following settings:
- **Framework Preset:** Vite (or Other)
- **Build Command:** `npm run build`
- **Output Directory:** `.output/public` (Nitro's default output directory)
- **Install Command:** `npm install`

### Step 4: Add Environment Variables
Before clicking "Deploy", expand the **Environment Variables** section and add your Supabase keys:
- Name: `VITE_SUPABASE_URL`, Value: `your-project-url`
- Name: `VITE_SUPABASE_ANON_KEY`, Value: `your-anon-key`

### Step 5: Deploy!
Click **Deploy**. Vercel will build your site and give you a free `your-site.vercel.app` domain. You can later add your own custom domain (e.g., `badzystore.com`) for free in the Vercel Project Settings under "Domains".

---

## 💻 Local Development Setup

If you want to run the project locally on your machine:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file and add your Supabase keys.
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open `http://localhost:8080` in your browser.

## 🎨 Design Assets
- **Logo:** Located at `public/logo.png`. Update this file to change the site-wide logo and favicon.
- **Favicon:** The site automatically uses `public/logo.png` as the browser tab icon.

---
*Built with ❤️ for Egyptian Gamers.*
