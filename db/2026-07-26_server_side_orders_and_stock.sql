-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- 1. Atomic stock decrement so two shoppers can't oversell the same unit.
-- 2. Orders are inserted by the server (service role) only, so the browser
--    loses its INSERT grant and the permissive public INSERT policy.
-- 3. Indexes for the admin dashboard and catalog pages.

CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id UUID, quantity INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining INT;
BEGIN
  UPDATE public.products
  SET stock = stock - quantity
  WHERE id = product_id
    AND (quantity <= 0 OR stock >= quantity)
  RETURNING stock INTO remaining;

  IF remaining IS NULL THEN
    RAISE EXCEPTION 'Insufficient stock for product %', product_id
      USING ERRCODE = '23514';
  END IF;

  RETURN remaining;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_product_stock(UUID, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_product_stock(UUID, INT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(UUID, INT) TO service_role;

-- Orders: the browser no longer writes directly.
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
REVOKE INSERT ON public.orders FROM anon, authenticated;
GRANT ALL ON public.orders TO service_role;

-- Indexes.
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_order_number_idx ON public.orders (order_number);
CREATE INDEX IF NOT EXISTS products_slug_idx ON public.products (slug);
