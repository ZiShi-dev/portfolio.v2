-- Langue du texte de notification pour chaque appareil admin.
-- Aucune donnée du client : uniquement fr, en ou ar.

ALTER TABLE public.admin_push_subscriptions
  ADD COLUMN IF NOT EXISTS locale text NOT NULL DEFAULT 'fr';

ALTER TABLE public.admin_push_subscriptions
  DROP CONSTRAINT IF EXISTS admin_push_subscriptions_locale_check;

ALTER TABLE public.admin_push_subscriptions
  ADD CONSTRAINT admin_push_subscriptions_locale_check
  CHECK (locale IN ('fr', 'en', 'ar'));

COMMENT ON COLUMN public.admin_push_subscriptions.locale IS
  'Langue du texte de notification push pour cet appareil (fr, en, ar).';

NOTIFY pgrst, 'reload schema';
