-- Screenshots gallery for AI products
ALTER TABLE public.ai_products ADD COLUMN IF NOT EXISTS screenshots text[] NOT NULL DEFAULT '{}';

-- User ratings & reviews (one per user per product)
CREATE TABLE public.ai_product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.ai_products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT 'Anonymous',
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text CHECK (comment IS NULL OR char_length(comment) <= 1000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX ai_product_reviews_product_idx ON public.ai_product_reviews (product_id, created_at DESC);

ALTER TABLE public.ai_product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON public.ai_product_reviews
  FOR SELECT USING (true);

CREATE POLICY "Users insert own review" ON public.ai_product_reviews
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own review" ON public.ai_product_reviews
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own review, admins any" ON public.ai_product_reviews
  FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));
