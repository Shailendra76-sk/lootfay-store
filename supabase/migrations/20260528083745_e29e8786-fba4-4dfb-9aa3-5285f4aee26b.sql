ALTER TABLE public.amazon_products REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.amazon_products;