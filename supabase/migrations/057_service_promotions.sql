-- Prix promotionnel : null désactive la promotion.
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS promotion_price_cents bigint;
ALTER TABLE public.services ADD CONSTRAINT services_promotion_price_check CHECK (
  promotion_price_cents IS NULL OR (
    pricing_mode IN ('fixed', 'starting_at')
    AND starting_price_cents IS NOT NULL
    AND promotion_price_cents >= 0
    AND promotion_price_cents < starting_price_cents
  )
);
