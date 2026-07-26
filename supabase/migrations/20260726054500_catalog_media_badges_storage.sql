-- Add structured catalog media and badge styling support.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS badge_color TEXT,
  ADD COLUMN IF NOT EXISTS badge_text_color TEXT,
  ADD COLUMN IF NOT EXISTS badge_style TEXT;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_badge_style_check'
      AND conrelid = 'public.products'::regclass
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_badge_style_check
      CHECK (badge_style IS NULL OR badge_style IN ('solid', 'outline', 'glow'));
  END IF;
END $$;

UPDATE public.products
SET images = ARRAY[image]
WHERE (images IS NULL OR cardinality(images) = 0) AND image IS NOT NULL;

-- Storage buckets used by the admin dashboard for organized uploads.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('product-images', 'product-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('category-images', 'category-images', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY IF NOT EXISTS "Public read product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY IF NOT EXISTS "Public read category images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'category-images');

CREATE POLICY IF NOT EXISTS "Admin manage product images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'product-images' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY IF NOT EXISTS "Admin manage category images"
  ON storage.objects FOR ALL
  USING (bucket_id = 'category-images' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'category-images' AND auth.role() = 'authenticated');