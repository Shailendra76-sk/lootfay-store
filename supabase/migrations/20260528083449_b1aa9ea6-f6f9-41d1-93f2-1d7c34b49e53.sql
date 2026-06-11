
CREATE TABLE public.amazon_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text,
  current_price numeric,
  original_price numeric,
  discount_percentage integer,
  category text,
  clean_amazon_url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.amazon_products TO anon;
GRANT SELECT ON public.amazon_products TO authenticated;
GRANT ALL ON public.amazon_products TO service_role;

ALTER TABLE public.amazon_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON public.amazon_products
  FOR SELECT
  USING (true);

CREATE INDEX idx_amazon_products_category ON public.amazon_products(category);
CREATE INDEX idx_amazon_products_discount ON public.amazon_products(discount_percentage DESC);
