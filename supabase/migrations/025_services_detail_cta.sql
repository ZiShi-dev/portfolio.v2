-- Destination du CTA secondaire sur la page détail d'une offre.
-- Appliquer via : npm run db:migrate

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS detail_cta_type text NOT NULL DEFAULT 'linked_project'
    CHECK (detail_cta_type IN ('linked_project', 'projects', 'custom')),
  ADD COLUMN IF NOT EXISTS detail_cta_url text,
  ADD COLUMN IF NOT EXISTS detail_cta_label jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_detail_cta_url_length;

ALTER TABLE public.services
  ADD CONSTRAINT services_detail_cta_url_length
  CHECK (
    detail_cta_url IS NULL
    OR char_length(detail_cta_url) BETWEEN 1 AND 2048
  );

COMMENT ON COLUMN public.services.detail_cta_type IS
  'Destination du CTA détail : projet lié, liste /projets ou URL personnalisée.';
COMMENT ON COLUMN public.services.detail_cta_url IS
  'URL relative same-site ou URL HTTP(S), utilisée uniquement pour detail_cta_type=custom.';
COMMENT ON COLUMN public.services.detail_cta_label IS
  'Libellé i18n {fr,en,ar} du CTA détail. Vide = libellé automatique.';

NOTIFY pgrst, 'reload schema';
