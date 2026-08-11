-- Ajoute le type de projet "for_sale" (projet à vendre).
-- Appliquer via : npm run db:migrate

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_kind_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_kind_check
  CHECK (kind IN ('personal', 'sold', 'for_sale'));

COMMENT ON COLUMN public.projects.kind IS
  'personal | sold | for_sale — catégorie affichée sur le site';
