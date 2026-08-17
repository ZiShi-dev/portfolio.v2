-- Les projets vendus décrivent le travail réalisé (listing_intent), plus l’offre catalogue.
-- Appliquer via : npm run db:migrate

DROP INDEX IF EXISTS public.projects_provided_service_idx;

ALTER TABLE public.projects
  DROP COLUMN IF EXISTS provided_service_id;

NOTIFY pgrst, 'reload schema';
