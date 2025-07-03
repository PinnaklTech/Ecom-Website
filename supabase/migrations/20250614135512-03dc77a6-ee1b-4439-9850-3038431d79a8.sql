
-- Add the is_featured column to products if it doesn't already exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;

-- Create or replace a function to enforce the 6-featured-products limit
CREATE OR REPLACE FUNCTION public.enforce_featured_limit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_featured = true AND (OLD.is_featured IS NULL OR OLD.is_featured = false) THEN
    IF (SELECT COUNT(*) FROM public.products WHERE is_featured = true) >= 6 THEN
      RAISE EXCEPTION 'Cannot feature more than 6 products. Please unfeature another product first.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create a trigger to enforce the limit if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'enforce_featured_products_limit'
  ) THEN
    CREATE TRIGGER enforce_featured_products_limit
      BEFORE UPDATE ON public.products
      FOR EACH ROW
      EXECUTE FUNCTION public.enforce_featured_limit();
  END IF;
END $$;

-- Create an index for fast queries
CREATE INDEX IF NOT EXISTS idx_products_featured ON public.products(is_featured) WHERE is_featured = true;
