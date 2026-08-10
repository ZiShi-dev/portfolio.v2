-- Lien direct offre « à vendre » → page détail Case Study (/projets/[slug])
-- Appliquer via : npm run db:migrate

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS linked_project_id uuid
  REFERENCES public.projects(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS services_linked_project_idx
  ON public.services (linked_project_id)
  WHERE linked_project_id IS NOT NULL;

COMMENT ON COLUMN public.services.linked_project_id IS
  'Projet (case study) principal lié — CTA « Voir le projet » sur /offres/[slug].';
