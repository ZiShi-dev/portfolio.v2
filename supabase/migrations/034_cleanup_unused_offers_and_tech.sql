-- Nettoyage : anciennes offres archivées (catalogue précédent) + stack technique Quotishop.
-- Les colonnes CMS (technologies, featured, kind, …) restent : l’admin s’en sert encore.
-- Appliquer via : npm run db:migrate

-- Stack Next.js / TypeScript / PostgreSQL : plus exposée au visiteur.
UPDATE public.projects
SET technologies = ARRAY[]::text[],
    updated_at = now()
WHERE slug = 'quotishop';

-- Anciennes offres remplacées par vitrine / ecommerce / reservation / …
DELETE FROM public.faq_services
WHERE service_id IN (
  SELECT id FROM public.services
  WHERE slug IN ('application', 'boutique', 'maintenance', 'mobile', 'refonte', 'web')
    AND status = 'archived'
);

DELETE FROM public.service_case_studies
WHERE service_id IN (
  SELECT id FROM public.services
  WHERE slug IN ('application', 'boutique', 'maintenance', 'mobile', 'refonte', 'web')
    AND status = 'archived'
);

DELETE FROM public.services
WHERE slug IN ('application', 'boutique', 'maintenance', 'mobile', 'refonte', 'web')
  AND status = 'archived';

NOTIFY pgrst, 'reload schema';
