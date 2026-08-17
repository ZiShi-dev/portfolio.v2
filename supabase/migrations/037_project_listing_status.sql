-- Trois statuts projet : personnel / à vendre / vendu.
-- À vendre : prix demandé + intention. Vendu : prix de vente + offre fournie.
-- Appliquer via : npm run db:migrate

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_kind_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_kind_check
  CHECK (kind IN ('personal', 'for_sale', 'sold'));

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS listing_price_cents integer
    CHECK (listing_price_cents IS NULL OR listing_price_cents >= 0),
  ADD COLUMN IF NOT EXISTS listing_intent jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS provided_service_id uuid
    REFERENCES public.services(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS projects_provided_service_idx
  ON public.projects (provided_service_id)
  WHERE provided_service_id IS NOT NULL;

COMMENT ON COLUMN public.projects.kind IS
  'personal = projet perso ; for_sale = à vendre ; sold = vendu / client.';
COMMENT ON COLUMN public.projects.listing_price_cents IS
  'Prix demandé (à vendre) ou prix de vente (vendu), en centimes EUR.';
COMMENT ON COLUMN public.projects.listing_intent IS
  'i18n {fr,en,ar} : ce que VORZIX veut faire du projet à vendre.';
COMMENT ON COLUMN public.projects.provided_service_id IS
  'Offre fournie pour un projet vendu.';

NOTIFY pgrst, 'reload schema';
