
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
  tags TEXT[] DEFAULT '{}',
  specs JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are publicly readable"
  ON public.products FOR SELECT
  USING (true);

CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL CHECK (phone ~ '^01[0125][0-9]{8}$'),
  email TEXT NOT NULL,
  governorate TEXT NOT NULL,
  city TEXT NOT NULL,
  street TEXT NOT NULL,
  landmark TEXT,
  items JSONB NOT NULL,
  subtotal_egp NUMERIC NOT NULL CHECK (subtotal_egp >= 0),
  shipping_egp NUMERIC NOT NULL CHECK (shipping_egp >= 0),
  total_egp NUMERIC NOT NULL CHECK (total_egp >= 0),
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'cod',
  order_status TEXT NOT NULL DEFAULT 'placed',
  payment_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT INSERT ON public.orders TO anon, authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Anyone (guest checkout) can insert an order. Reads/updates only via server-side admin (service_role).
CREATE POLICY "Anyone can place an order"
  ON public.orders FOR INSERT
  WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

GRANT SELECT ON public.settings TO anon, authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings are publicly readable"
  ON public.settings FOR SELECT
  USING (true);
