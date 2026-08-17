-- Quotishop : URL live + liaison à l’offre e-commerce (seule catégorie correspondante).
-- Appliquer via : npm run db:migrate

UPDATE public.projects
SET
  link = 'https://quotishop-five.vercel.app/',
  published = true,
  published_at = COALESCE(published_at, now())
WHERE slug = 'quotishop';

-- Retirer Quotishop des offres qui ne lui correspondent pas
DELETE FROM public.service_case_studies scs
USING public.projects p, public.services s
WHERE scs.project_id = p.id
  AND scs.service_id = s.id
  AND p.slug = 'quotishop'
  AND s.slug <> 'ecommerce';

INSERT INTO public.service_case_studies (service_id, project_id, sort_order, blurb)
SELECT s.id, p.id, 10, jsonb_build_object(
  'fr', $$Boutique en ligne : catalogue, panier, commandes et paiement — déjà publiée.$$,
  'en', $$Online shop: catalog, cart, orders and payment — already live.$$,
  'ar', $$متجر إلكتروني: فهرس وسلة وطلبات ودفع — منشور فعلاً.$$
)
FROM public.services s
JOIN public.projects p ON p.slug = 'quotishop'
WHERE s.slug = 'ecommerce'
ON CONFLICT (service_id, project_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    blurb = EXCLUDED.blurb;

NOTIFY pgrst, 'reload schema';
