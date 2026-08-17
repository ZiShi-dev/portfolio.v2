-- Courte description i18n par projet lié à une offre (page /offres/[slug]).
-- Appliquer via : npm run db:migrate

ALTER TABLE public.service_case_studies
  ADD COLUMN IF NOT EXISTS blurb jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.service_case_studies.blurb IS
  'Courte description i18n {fr,en,ar} affichée sous le projet sur la page détail d’offre.';

NOTIFY pgrst, 'reload schema';
