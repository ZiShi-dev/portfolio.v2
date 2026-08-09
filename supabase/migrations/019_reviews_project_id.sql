-- Lier un avis client à un Case Study (projet).
-- Appliquer via : npm run db:migrate

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS project_id uuid
    REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reviews_project_id_idx
  ON public.reviews (project_id)
  WHERE project_id IS NOT NULL;

COMMENT ON COLUMN public.reviews.project_id IS
  'Case Study associé (optionnel). Affiché sur /projets/[slug] si publié.';
