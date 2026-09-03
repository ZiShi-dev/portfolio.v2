-- Retirer les maquettes d’exemple du site public (projets fictifs du seed CMS).
-- Idempotent : réapplique published = false si besoin. npm run db:migrate

UPDATE public.projects
SET published = false,
    featured = false
WHERE slug IN ('nova', 'maison-belle', 'atelier-lumiere', 'fitpro');

DELETE FROM public.service_case_studies
WHERE project_id IN (
  SELECT id FROM public.projects
  WHERE slug IN ('nova', 'maison-belle', 'atelier-lumiere', 'fitpro')
);

NOTIFY pgrst, 'reload schema';
