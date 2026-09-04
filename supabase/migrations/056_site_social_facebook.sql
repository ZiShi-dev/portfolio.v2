-- Facebook dans les réseaux de contact (admin /admin/settings)
-- Appliquer via : npm run db:migrate

ALTER TABLE public.site_social_links
  ADD COLUMN IF NOT EXISTS facebook text NOT NULL DEFAULT '';

ALTER TABLE public.site_social_links
  DROP CONSTRAINT IF EXISTS site_social_facebook_len;

ALTER TABLE public.site_social_links
  ADD CONSTRAINT site_social_facebook_len CHECK (char_length(facebook) <= 500);

ALTER TABLE public.site_social_links
  DROP CONSTRAINT IF EXISTS site_social_contact_priority_values;

ALTER TABLE public.site_social_links
  ADD CONSTRAINT site_social_contact_priority_values
  CHECK (
    contact_priority <@ ARRAY['whatsapp', 'discord', 'instagram', 'tiktok', 'facebook']
    AND array_length(contact_priority, 1) <= 5
  );

ALTER TABLE public.site_social_links
  ALTER COLUMN contact_priority
  SET DEFAULT ARRAY['whatsapp', 'discord', 'instagram', 'tiktok', 'facebook'];

COMMENT ON COLUMN public.site_social_links.facebook IS
  'Profil ou page Facebook (https://facebook.com ou https://www.facebook.com).';

NOTIFY pgrst, 'reload schema';
