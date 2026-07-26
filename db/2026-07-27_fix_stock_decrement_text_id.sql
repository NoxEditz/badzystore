-- PATCH: Fix checkout crash caused by UUID/TEXT type mismatch.
--
-- The products table uses TEXT primary keys (e.g. "p01", "prod_xxx"), but the
-- original decrement_product_stock function declared its parameter as UUID.
-- Postgres rejects the cast and checkout reports a misleading "Insufficient
-- stock" error for EVERY order.
--
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query).
-- It drops the broken signature and recreates it with TEXT.

DROP FUNCTION IF EXISTS public.decrement_product_stock(UUID, INT);

CREATE OR REPLACE FUNCTION public.decrement_product_stock(product_id TEXT, quantity INT)
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

REVOKE ALL ON FUNCTION public.decrement_product_stock(TEXT, INT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.decrement_product_stock(TEXT, INT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_product_stock(TEXT, INT) TO service_role;
