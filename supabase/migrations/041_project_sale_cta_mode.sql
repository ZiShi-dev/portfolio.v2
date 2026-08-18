-- CTA final des pages « projet à vendre » : parcours d’intérêt ou contacts admin.
-- inquiry  = /demarrer-un-projet (contexte listing)
-- contacts = email / WhatsApp / Discord des réglages site

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS sale_cta_mode text NOT NULL DEFAULT 'inquiry';

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_sale_cta_mode_check;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_sale_cta_mode_check
  CHECK (sale_cta_mode IN ('inquiry', 'contacts'));

COMMENT ON COLUMN public.projects.sale_cta_mode IS
  'CTA de vente : inquiry (parcours projet) ou contacts (coordonnées admin).';
