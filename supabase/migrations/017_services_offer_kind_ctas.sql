-- Type d’offre (service vs produit à vendre) + CTAs visibles gérés en admin.
-- Appliquer via : npm run db:migrate

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS offer_kind text NOT NULL DEFAULT 'service'
    CHECK (offer_kind IN ('service', 'product')),
  ADD COLUMN IF NOT EXISTS show_cta_buy boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS show_cta_start boolean NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS services_offer_kind_published_idx
  ON public.services (offer_kind, sort_order ASC)
  WHERE status = 'published';

COMMENT ON COLUMN public.services.offer_kind IS
  'service = prestation sur-mesure ; product = offre / site à vendre.';
COMMENT ON COLUMN public.services.show_cta_buy IS
  'Affiche le bouton Acheter sur le site public.';
COMMENT ON COLUMN public.services.show_cta_start IS
  'Affiche le bouton Démarrer un projet sur le site public.';

-- Produits déjà tarifés : activer Acheter par défaut
UPDATE public.services
SET show_cta_buy = true
WHERE pricing_mode = 'starting_at'
  AND show_cta_buy = false;
