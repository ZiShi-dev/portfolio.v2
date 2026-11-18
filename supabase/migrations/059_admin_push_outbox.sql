-- File d'attente des notifications push (transactional outbox).
-- L'insertion de la demande et celle de la file sont la même transaction :
-- le trigger s'exécute dans l'INSERT de project_inquiries.
-- Aucune donnée personnelle : seulement l'identifiant de la demande.

CREATE TABLE IF NOT EXISTS public.admin_push_outbox (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  inquiry_id      uuid NOT NULL UNIQUE
                  REFERENCES public.project_inquiries(id) ON DELETE CASCADE,
  status          text NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'sent', 'dead')),
  attempts        integer NOT NULL DEFAULT 0
                  CHECK (attempts >= 0 AND attempts <= 20),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  locked_at       timestamptz,
  last_error      text
                  CHECK (last_error IS NULL OR char_length(last_error) <= 200),
  sent_at         timestamptz
);

CREATE INDEX IF NOT EXISTS admin_push_outbox_pending_idx
  ON public.admin_push_outbox (next_attempt_at)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS admin_push_outbox_processing_idx
  ON public.admin_push_outbox (locked_at)
  WHERE status = 'processing';

ALTER TABLE public.admin_push_outbox ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_push_outbox FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_push_outbox TO service_role;

CREATE OR REPLACE FUNCTION public.enqueue_admin_push_outbox()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_push_outbox (inquiry_id)
  VALUES (NEW.id)
  ON CONFLICT (inquiry_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS project_inquiries_enqueue_push ON public.project_inquiries;

CREATE TRIGGER project_inquiries_enqueue_push
  AFTER INSERT ON public.project_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.enqueue_admin_push_outbox();

-- Réserve un lot sans que deux workers prennent la même ligne.
CREATE OR REPLACE FUNCTION public.claim_admin_push_outbox(
  batch_size integer,
  lock_seconds integer
)
RETURNS SETOF public.admin_push_outbox
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH due AS (
    SELECT o.id
    FROM public.admin_push_outbox AS o
    WHERE (
      o.status = 'pending'
      AND o.next_attempt_at <= now()
    ) OR (
      o.status = 'processing'
      AND o.locked_at IS NOT NULL
      AND o.locked_at < now() - make_interval(secs => GREATEST(lock_seconds, 30))
    )
    ORDER BY o.next_attempt_at
    LIMIT GREATEST(1, LEAST(batch_size, 10))
    FOR UPDATE SKIP LOCKED
  )
  UPDATE public.admin_push_outbox AS target
  SET status = 'processing',
      locked_at = now()
  FROM due
  WHERE target.id = due.id
  RETURNING target.*;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_admin_push_outbox() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_admin_push_outbox(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_admin_push_outbox(integer, integer) TO service_role;

COMMENT ON TABLE public.admin_push_outbox IS
  'File durable des notifications push admin. Une ligne par demande, sans donnée personnelle.';

NOTIFY pgrst, 'reload schema';
