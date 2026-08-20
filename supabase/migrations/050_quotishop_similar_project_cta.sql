-- Quotishop : CTA contact = projet similaire (nouveau projet), pas achat du listing.
-- sale_cta_label = libellé du bouton « Nous joindre » (projet sur mesure).
-- Ciblé : slug = quotishop. Réversible : 049_quotishop_sale_page_polish.sql

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
