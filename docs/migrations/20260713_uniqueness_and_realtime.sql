-- 2026-07-10 — Uniqueness, realtime, and integrity safety net
-- Run in Supabase SQL editor (idempotent).

-- 1) UNIQUE constraints so DB rejects duplicates even if the app check races.
--    Uses partial unique indexes because seo_* fields can be NULL / empty.

CREATE UNIQUE INDEX IF NOT EXISTS products_slug_unique_idx ON public.products (slug);
CREATE UNIQUE INDEX IF NOT EXISTS products_sku_unique_idx ON public.products (sku);
CREATE UNIQUE INDEX IF NOT EXISTS products_title_unique_idx ON public.products (title);
CREATE UNIQUE INDEX IF NOT EXISTS products_seo_title_unique_idx
  ON public.products (seo_title) WHERE seo_title IS NOT NULL AND seo_title <> '';
CREATE UNIQUE INDEX IF NOT EXISTS products_seo_description_unique_idx
  ON public.products (seo_description) WHERE seo_description IS NOT NULL AND seo_description <> '';

CREATE UNIQUE INDEX IF NOT EXISTS collections_slug_unique_idx ON public.collections (slug);
CREATE UNIQUE INDEX IF NOT EXISTS collections_name_unique_idx ON public.collections (name);

CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique_idx ON public.blog_posts (slug);
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_title_unique_idx ON public.blog_posts (title);
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_seo_title_unique_idx
  ON public.blog_posts (seo_title) WHERE seo_title IS NOT NULL AND seo_title <> '';

-- 2) Enable Realtime for tables that admin edits so all open clients get instant updates.
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'products', 'product_images', 'product_collections', 'product_tags',
    'collections', 'collection_tags', 'categories', 'tags',
    'announcements', 'nav_items', 'blog_posts', 'product_reviews'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN
      -- already in publication
      NULL;
    WHEN undefined_table THEN
      -- table doesn't exist yet in this project — skip
      NULL;
    END;
  END LOOP;
END $$;
