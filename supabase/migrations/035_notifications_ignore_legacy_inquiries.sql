-- Les anciennes demandes (déjà dans l’inbox) ne doivent plus gonfler la cloche.
-- Appliquer via : npm run db:migrate

UPDATE public.project_inquiries
SET admin_seen_at = created_at
WHERE admin_seen_at IS NULL
  AND created_at < TIMESTAMPTZ '2026-08-17 12:00:00+00';

NOTIFY pgrst, 'reload schema';
