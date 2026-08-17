-- Retire les colonnes d’offres devenues inutiles (catalogue « à vendre »).
-- Appliquer via : npm run db:migrate

-- quote_only et contact affichaient le même comportement (pas de prix).
UPDATE public.services
SET pricing_mode = 'contact'
WHERE pricing_mode = 'quote_only';

ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_pricing_mode_check;

ALTER TABLE public.services
  ALTER COLUMN pricing_mode SET DEFAULT 'contact';

ALTER TABLE public.services
  ADD CONSTRAINT services_pricing_mode_check
  CHECK (pricing_mode IN ('starting_at', 'fixed', 'contact'));

DROP INDEX IF EXISTS public.services_offer_kind_published_idx;
DROP INDEX IF EXISTS public.services_linked_project_idx;

ALTER TABLE public.services
  DROP COLUMN IF EXISTS offer_kind,
  DROP COLUMN IF EXISTS show_cta_buy,
  DROP COLUMN IF EXISTS cover_image,
  DROP COLUMN IF EXISTS linked_project_id,
  DROP COLUMN IF EXISTS featured;

NOTIFY pgrst, 'reload schema';
