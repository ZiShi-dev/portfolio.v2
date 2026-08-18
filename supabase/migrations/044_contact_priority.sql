-- Priorité des moyens de contact (réglable dans /admin/settings) + email retiré
-- des pages de vente : l'email reste affiché uniquement dans le footer.
-- Appliquer via : npm run db:migrate

ALTER TABLE public.site_social_links
  ADD COLUMN IF NOT EXISTS contact_priority text[] NOT NULL
  DEFAULT ARRAY['whatsapp', 'discord', 'instagram', 'tiktok'];

ALTER TABLE public.site_social_links
  DROP CONSTRAINT IF EXISTS site_social_contact_priority_values;

ALTER TABLE public.site_social_links
  ADD CONSTRAINT site_social_contact_priority_values
  CHECK (
    contact_priority <@ ARRAY['whatsapp', 'discord', 'instagram', 'tiktok']
    AND array_length(contact_priority, 1) <= 4
  );

COMMENT ON COLUMN public.site_social_links.contact_priority IS
  'Ordre de priorité des réseaux de contact (CTA fiches à vendre, footer). L''email en est exclu : footer uniquement.';

-- Les fiches à vendre n'affichent plus de lien email.
UPDATE public.projects
SET sale_cta_channels = array_remove(sale_cta_channels, 'email')
WHERE 'email' = ANY (sale_cta_channels);

COMMENT ON COLUMN public.projects.sale_cta_channels IS
  'Réseaux affichés sur la page de vente (whatsapp, discord, instagram, tiktok). Ordre d''affichage : site_social_links.contact_priority.';

NOTIFY pgrst, 'reload schema';
