-- Lien vers une application (store / app web) en plus du lien site.
-- Appliquer via : npm run db:migrate

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS app_link text;

COMMENT ON COLUMN public.projects.app_link IS
  'URL de l’application (Play Store, App Store, PWA…). Optionnel.';
