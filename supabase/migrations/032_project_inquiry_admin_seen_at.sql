-- Notifications admin : une demande « new » n'est plus non-lue
-- après ouverture de /admin/inquiries (le statut pipeline reste « new »).

ALTER TABLE public.project_inquiries
  ADD COLUMN IF NOT EXISTS admin_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS project_inquiries_unseen_new_idx
  ON public.project_inquiries (created_at DESC)
  WHERE status = 'new' AND admin_seen_at IS NULL;

COMMENT ON COLUMN public.project_inquiries.admin_seen_at IS
  'Horodatage de lecture admin (cloche). Indépendant du statut pipeline.';

NOTIFY pgrst, 'reload schema';
