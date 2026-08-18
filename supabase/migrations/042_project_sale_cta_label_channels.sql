-- CTA page de vente : libellé admin + réseaux choisis (plus de parcours /demarrer-un-projet).

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS sale_cta_label jsonb NOT NULL DEFAULT '{"fr":"","en":"","ar":""}'::jsonb;

ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS sale_cta_channels text[] NOT NULL DEFAULT '{}';

UPDATE public.projects
SET sale_cta_mode = 'contacts'
WHERE kind = 'for_sale' AND sale_cta_mode IS DISTINCT FROM 'contacts';

UPDATE public.projects
SET sale_cta_channels = ARRAY['whatsapp', 'email', 'discord', 'instagram', 'tiktok']
WHERE kind = 'for_sale'
  AND (sale_cta_channels IS NULL OR sale_cta_channels = '{}');

COMMENT ON COLUMN public.projects.sale_cta_label IS
  'Libellé du bouton principal de la page de vente (fr / en / ar).';

COMMENT ON COLUMN public.projects.sale_cta_channels IS
  'Réseaux / email affichés sur la page de vente (email, whatsapp, discord, instagram, tiktok).';
