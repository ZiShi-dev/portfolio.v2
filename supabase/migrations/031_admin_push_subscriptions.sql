-- Abonnements Web Push admin (notifications desktop + mobile).
-- Accès service_role uniquement — jamais exposé au client public.

CREATE TABLE IF NOT EXISTS public.admin_push_subscriptions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  admin_email   text NOT NULL
                CHECK (char_length(admin_email) BETWEEN 3 AND 254),
  endpoint      text NOT NULL UNIQUE
                CHECK (char_length(endpoint) BETWEEN 12 AND 2048),
  p256dh        text NOT NULL
                CHECK (char_length(p256dh) BETWEEN 16 AND 256),
  auth          text NOT NULL
                CHECK (char_length(auth) BETWEEN 8 AND 256),
  user_agent    text
                CHECK (user_agent IS NULL OR char_length(user_agent) <= 400)
);

CREATE INDEX IF NOT EXISTS admin_push_subscriptions_email_idx
  ON public.admin_push_subscriptions (admin_email);

ALTER TABLE public.admin_push_subscriptions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.admin_push_subscriptions FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_push_subscriptions TO service_role;

COMMENT ON TABLE public.admin_push_subscriptions IS
  'Endpoints Web Push des sessions admin. Service role uniquement.';

NOTIFY pgrst, 'reload schema';
