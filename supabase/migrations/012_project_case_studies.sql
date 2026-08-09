-- Case Studies éditoriales (extension de public.projects)
-- Appliquer via : npm run db:migrate
--
-- Conserve les projets existants. Nouveaux champs vides par défaut.
-- Ne génère PAS de contenu marketing inventé.

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS reference text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS technologies text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS features jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS client_need jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS objective jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS solution jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS result jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_title jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_description jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS published_at timestamptz;

-- Références uniques quand présentes (ex. VZ—CASE 001)
CREATE UNIQUE INDEX IF NOT EXISTS projects_reference_uidx
  ON public.projects (reference)
  WHERE reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS projects_featured_published_idx
  ON public.projects (featured, published, sort_order ASC)
  WHERE published = true;

-- Attribuer une référence stable aux lignes existantes sans en avoir
DO $$
DECLARE
  r RECORD;
  n integer := 0;
BEGIN
  FOR r IN
    SELECT id
    FROM public.projects
    WHERE reference IS NULL
    ORDER BY sort_order ASC, created_at ASC
  LOOP
    n := n + 1;
    UPDATE public.projects
    SET reference = 'VZ—CASE ' || lpad(n::text, 3, '0')
    WHERE id = r.id;
  END LOOP;
END $$;

-- Sync published_at pour les déjà publiés
UPDATE public.projects
SET published_at = COALESCE(published_at, updated_at, created_at)
WHERE published = true
  AND published_at IS NULL;

COMMENT ON COLUMN public.projects.reference IS
  'Référence catalogue VORZIX (VZ—CASE 001). Stable même si le titre change.';
COMMENT ON COLUMN public.projects.features IS
  'Liste de fonctionnalités i18n : [{fr,en,ar}, ...]';
COMMENT ON COLUMN public.projects.technologies IS
  'Stack technique libre (Next.js, PostgreSQL, …).';
COMMENT ON COLUMN public.projects.client_need IS
  'Besoin client i18n JSONB {fr,en,ar}.';
COMMENT ON COLUMN public.projects.objective IS
  'Objectif i18n JSONB {fr,en,ar}.';
COMMENT ON COLUMN public.projects.solution IS
  'Réponse VORZIX i18n JSONB {fr,en,ar}.';
COMMENT ON COLUMN public.projects.result IS
  'Résultat i18n JSONB {fr,en,ar}.';

NOTIFY pgrst, 'reload schema';
