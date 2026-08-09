-- Demandes de projet (parcours « Démarrer un projet »)
-- Appliquer via : npm run db:migrate
--
-- Source de vérité = cette table. Email optionnel après insert.

CREATE TABLE IF NOT EXISTS public.project_inquiries (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  reference           text NOT NULL,
  status              text NOT NULL DEFAULT 'new'
                      CHECK (status IN (
                        'new', 'contacted', 'qualified', 'won', 'lost', 'spam'
                      )),

  project_type        text NOT NULL,
  objective           text NOT NULL,
  budget_range        text NOT NULL,
  timeline            text NOT NULL,
  target_launch_date  date,

  description         text NOT NULL
                      CHECK (char_length(description) BETWEEN 10 AND 5000),

  name                text NOT NULL
                      CHECK (char_length(name) BETWEEN 2 AND 100),
  email               text NOT NULL
                      CHECK (char_length(email) BETWEEN 3 AND 254),
  phone               text
                      CHECK (phone IS NULL OR char_length(phone) BETWEEN 6 AND 40),
  whatsapp            text
                      CHECK (whatsapp IS NULL OR char_length(whatsapp) BETWEEN 6 AND 40),
  company             text
                      CHECK (company IS NULL OR char_length(company) BETWEEN 1 AND 120),
  current_website     text
                      CHECK (current_website IS NULL OR char_length(current_website) BETWEEN 4 AND 500),

  locale              text NOT NULL DEFAULT 'fr'
                      CHECK (locale IN ('fr', 'en', 'ar')),
  source              text
                      CHECK (source IS NULL OR char_length(source) BETWEEN 1 AND 80),

  admin_notes         text
                      CHECK (admin_notes IS NULL OR char_length(admin_notes) <= 4000),

  fingerprint         text,
  ip_hash             text,
  user_agent_hash     text
);

CREATE UNIQUE INDEX IF NOT EXISTS project_inquiries_reference_uidx
  ON public.project_inquiries (reference);

CREATE INDEX IF NOT EXISTS project_inquiries_created_at_idx
  ON public.project_inquiries (created_at DESC);

CREATE INDEX IF NOT EXISTS project_inquiries_status_idx
  ON public.project_inquiries (status);

CREATE UNIQUE INDEX IF NOT EXISTS project_inquiries_fingerprint_uidx
  ON public.project_inquiries (fingerprint)
  WHERE fingerprint IS NOT NULL;

CREATE OR REPLACE FUNCTION public.set_project_inquiries_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS project_inquiries_set_updated_at ON public.project_inquiries;
CREATE TRIGGER project_inquiries_set_updated_at
  BEFORE UPDATE ON public.project_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_project_inquiries_updated_at();

ALTER TABLE public.project_inquiries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.project_inquiries FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_inquiries TO service_role;

COMMENT ON TABLE public.project_inquiries IS
  'Leads parcours Démarrer un projet. Accès service_role uniquement (API Next.js).';
COMMENT ON COLUMN public.project_inquiries.reference IS
  'Référence stable VZ—LEAD 001.';
COMMENT ON COLUMN public.project_inquiries.admin_notes IS
  'Notes internes — jamais exposées publiquement.';

NOTIFY pgrst, 'reload schema';
