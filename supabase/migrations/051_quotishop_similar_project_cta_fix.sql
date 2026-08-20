-- Quotishop : corriger sale_cta_label (projet similaire, pas « ce magasin »).
-- Idempotent si 050 déjà appliquée. Ciblé : slug = quotishop.

UPDATE public.projects
SET
  sale_cta_label = jsonb_build_object(
    'fr', $$Je veux un projet similaire$$,
    'en', $$I want a similar project$$,
    'ar', $$أريد مشروعًا مشابهًا$$
  ),
  updated_at = now()
WHERE slug = 'quotishop'
  AND listing_price_cents = 60000;

NOTIFY pgrst, 'reload schema';
