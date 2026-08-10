-- Image de couverture + tarif fixe (offres « à vendre »)
-- Appliquer via : npm run db:migrate

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS cover_image text
  CHECK (
    cover_image IS NULL
    OR (
      char_length(cover_image) BETWEEN 8 AND 2048
      AND cover_image ~* '^https?://'
    )
  );

COMMENT ON COLUMN public.services.cover_image IS
  'URL publique de la photo produit (catalogue + page détail).';

-- Élargir pricing_mode : fixed = prix affiché tel quel (sites à vendre)
ALTER TABLE public.services
  DROP CONSTRAINT IF EXISTS services_pricing_mode_check;

ALTER TABLE public.services
  ADD CONSTRAINT services_pricing_mode_check
  CHECK (pricing_mode IN ('starting_at', 'fixed', 'quote_only', 'contact'));
