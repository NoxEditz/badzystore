-- Badzy Store — Supabase Database Schema & RLS Policies

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_ar TEXT,
  description TEXT,
  description_ar TEXT,
  price_egp NUMERIC NOT NULL CHECK (price_egp >= 0),
  old_price_egp NUMERIC CHECK (old_price_egp >= 0),
  category TEXT NOT NULL,
  image TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
  sku TEXT,
  rating NUMERIC DEFAULT 5.0,
  reviews_count INT DEFAULT 0,
  badge TEXT,
  badge_color TEXT,
  badge_text_color TEXT,
  badge_style TEXT CHECK (badge_style IS NULL OR badge_style IN ('solid', 'outline', 'glow')),
  tags TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  landmark TEXT,
  items JSONB NOT NULL,
  subtotal_egp NUMERIC NOT NULL,
  shipping_egp NUMERIC NOT NULL,
  total_egp NUMERIC NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'cod',
  order_status TEXT NOT NULL DEFAULT 'placed',
  payment_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Settings Table
CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Products: Everyone can read products; only authenticated admin can write
CREATE POLICY "Allow public read access on products" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access on products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders: Anyone can insert an order (place order at checkout); only authenticated admin can view/update all orders
CREATE POLICY "Allow public order placement" ON public.orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access on orders" ON public.orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Settings: Everyone can read settings; only admin can write
CREATE POLICY "Allow public read settings" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Allow admin edit settings" ON public.settings
  FOR ALL USING (auth.role() = 'authenticated');

-- 5. Atomic Stock Decrement Procedure
CREATE OR REPLACE FUNCTION decrement_product_stock(product_id TEXT, quantity INT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.products
  SET stock = stock - quantity
  WHERE id = product_id AND stock >= quantity;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient stock for product ID %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
