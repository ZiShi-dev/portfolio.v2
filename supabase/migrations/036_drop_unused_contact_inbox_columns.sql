-- Inbox contact admin jamais branchée : statut / note / lien email ne servent plus.
-- La table contact_messages reste (formulaire + anti-doublon + quota).
-- Appliquer via : npm run db:migrate

DROP INDEX IF EXISTS public.contact_messages_status_idx;

ALTER TABLE public.contact_messages
  DROP COLUMN IF EXISTS archive_note,
  DROP COLUMN IF EXISTS conversation_url,
  DROP COLUMN IF EXISTS status;

NOTIFY pgrst, 'reload schema';
