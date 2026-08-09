-- Offres commerciales / Services (CMS admin + section publique)
-- Appliquer via : npm run db:migrate
--
-- Contenu i18n JSONB {fr,en,ar}. Prix en unités mineures (centimes).
-- Relation M2M avec Case Studies (projects) via service_case_studies.
-- Seed : 6 offres actuelles (messages) — sans inventer de prix ni de features.

CREATE TABLE IF NOT EXISTS public.services (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),

  reference               text NOT NULL
                          CHECK (char_length(reference) BETWEEN 2 AND 32),
  slug                    text NOT NULL
                          CHECK (char_length(slug) BETWEEN 2 AND 80),
  icon                    text NOT NULL DEFAULT 'sparkles'
                          CHECK (char_length(icon) BETWEEN 1 AND 48),

  status                  text NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'published', 'archived')),
  featured                boolean NOT NULL DEFAULT false,
  sort_order              integer NOT NULL DEFAULT 0,

  title                   jsonb NOT NULL DEFAULT '{}'::jsonb,
  short_description       jsonb NOT NULL DEFAULT '{}'::jsonb,
  description             jsonb NOT NULL DEFAULT '{}'::jsonb,
  ideal_for               jsonb NOT NULL DEFAULT '{}'::jsonb,
  included_features       jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_label               jsonb NOT NULL DEFAULT '{}'::jsonb,

  pricing_mode            text NOT NULL DEFAULT 'quote_only'
                          CHECK (pricing_mode IN ('starting_at', 'quote_only', 'contact')),
  starting_price_cents    integer
                          CHECK (starting_price_cents IS NULL OR starting_price_cents >= 0),
  currency                text NOT NULL DEFAULT 'EUR'
                          CHECK (char_length(currency) = 3),

  -- Mapping optionnel vers le parcours « Démarrer un projet »
  inquiry_project_type    text
                          CHECK (
                            inquiry_project_type IS NULL
                            OR inquiry_project_type IN (
                              'showcase', 'ecommerce', 'web_app', 'saas',
                              'redesign', 'automation', 'other'
                            )
                          ),

  seo_title               jsonb NOT NULL DEFAULT '{}'::jsonb,
  seo_description         jsonb NOT NULL DEFAULT '{}'::jsonb,

  published_at            timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS services_slug_uidx ON public.services (slug);
CREATE UNIQUE INDEX IF NOT EXISTS services_reference_uidx ON public.services (reference);
CREATE INDEX IF NOT EXISTS services_status_sort_idx
  ON public.services (status, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS services_published_sort_idx
  ON public.services (sort_order ASC)
  WHERE status = 'published';

CREATE OR REPLACE FUNCTION public.set_services_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS services_set_updated_at ON public.services;
CREATE TRIGGER services_set_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_services_updated_at();

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.services FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO service_role;

COMMENT ON TABLE public.services IS
  'Offres commerciales VORZIX. Contenu i18n JSONB. Admin MFA + service_role.';
COMMENT ON COLUMN public.services.starting_price_cents IS
  'Montant de départ en unités mineures (ex. 90000 = 900,00 EUR). NULL si hors starting_at.';
COMMENT ON COLUMN public.services.included_features IS
  'Liste i18n : [{fr,en,ar}, ...]';
COMMENT ON COLUMN public.services.inquiry_project_type IS
  'Pré-sélection optionnelle du type dans le parcours Démarrer un projet.';

-- Liaison Service ↔ Case Study (projects)
CREATE TABLE IF NOT EXISTS public.service_case_studies (
  service_id   uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  project_id   uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  sort_order   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (service_id, project_id)
);

CREATE INDEX IF NOT EXISTS service_case_studies_project_idx
  ON public.service_case_studies (project_id);

ALTER TABLE public.service_case_studies ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.service_case_studies FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_case_studies TO service_role;

COMMENT ON TABLE public.service_case_studies IS
  'Association M2M offre ↔ Case Study. Pas de duplication de contenu.';

-- Tracking lead → offre (compatible leads existants)
ALTER TABLE public.project_inquiries
  ADD COLUMN IF NOT EXISTS service_id uuid
    REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS service_reference text
    CHECK (
      service_reference IS NULL
      OR char_length(service_reference) BETWEEN 1 AND 32
    );

CREATE INDEX IF NOT EXISTS project_inquiries_service_id_idx
  ON public.project_inquiries (service_id)
  WHERE service_id IS NOT NULL;

COMMENT ON COLUMN public.project_inquiries.service_id IS
  'Offre d’origine si le prospect a démarré depuis une page/carte service.';
COMMENT ON COLUMN public.project_inquiries.service_reference IS
  'Référence catalogue figée au moment du lead (ex. VZ—APP).';

-- Seed : offres actuelles (titres/descriptions uniquement — pas de prix inventés)
INSERT INTO public.services (
  reference, slug, icon, status, featured, sort_order,
  title, short_description, description,
  pricing_mode, currency, inquiry_project_type, published_at
)
VALUES
(
  'VZ—01', 'web', 'code-2', 'published', true, 10,
  '{"fr":"Site ou application web","en":"Website or web app","ar":"موقع أو تطبيق ويب"}'::jsonb,
  '{"fr":"Une présence en ligne claire et rapide, conçue pour présenter votre offre et générer des demandes de contact.","en":"A clear, fast online presence built to present your offer and generate contact requests.","ar":"حضور واضح وسريع على الإنترنت، مصمم لعرض خدمتك وتوليد طلبات التواصل."}'::jsonb,
  '{"fr":"Une présence en ligne claire et rapide, conçue pour présenter votre offre et générer des demandes de contact.","en":"A clear, fast online presence built to present your offer and generate contact requests.","ar":"حضور واضح وسريع على الإنترنت، مصمم لعرض خدمتك وتوليد طلبات التواصل."}'::jsonb,
  'contact', 'EUR', 'showcase', now()
),
(
  'VZ—02', 'backend', 'server', 'published', false, 20,
  '{"fr":"Back-office & automatisation","en":"Back-office & automation","ar":"لوحة تحكم وأتمتة"}'::jsonb,
  '{"fr":"Comptes, formulaires, données et outils métier fiables — pour que votre site travaille vraiment pour vous.","en":"Accounts, forms, data and business tools that work reliably — so your site actually works for you.","ar":"حسابات ونماذج وبيانات وأدوات عمل موثوقة — ليخدمك موقعك فعلياً."}'::jsonb,
  '{"fr":"Comptes, formulaires, données et outils métier fiables — pour que votre site travaille vraiment pour vous.","en":"Accounts, forms, data and business tools that work reliably — so your site actually works for you.","ar":"حسابات ونماذج وبيانات وأدوات عمل موثوقة — ليخدمك موقعك فعلياً."}'::jsonb,
  'contact', 'EUR', 'automation', now()
),
(
  'VZ—03', 'design', 'palette', 'published', false, 30,
  '{"fr":"Design UX/UI","en":"UX/UI design","ar":"تصميم تجربة وواجهة"}'::jsonb,
  '{"fr":"Une interface élégante et lisible : vos visiteurs comprennent vite qui vous êtes et quoi faire ensuite.","en":"An elegant, readable interface: visitors quickly understand who you are and what to do next.","ar":"واجهة أنيقة وواضحة: يفهم زوارك بسرعة من أنت وماذا يفعلون لاحقاً."}'::jsonb,
  '{"fr":"Une interface élégante et lisible : vos visiteurs comprennent vite qui vous êtes et quoi faire ensuite.","en":"An elegant, readable interface: visitors quickly understand who you are and what to do next.","ar":"واجهة أنيقة وواضحة: يفهم زوارك بسرعة من أنت وماذا يفعلون لاحقاً."}'::jsonb,
  'contact', 'EUR', 'redesign', now()
),
(
  'VZ—04', 'mobile', 'smartphone', 'published', false, 40,
  '{"fr":"Expérience mobile-first","en":"Mobile-first experience","ar":"تجربة للجوال أولاً"}'::jsonb,
  '{"fr":"Un rendu impeccable sur téléphone — là où la majorité de vos clients vous découvrent.","en":"Impeccable on phone — where most of your clients discover you.","ar":"عرض مثالي على الهاتف — حيث يكتشفك معظم عملائك."}'::jsonb,
  '{"fr":"Un rendu impeccable sur téléphone — là où la majorité de vos clients vous découvrent.","en":"Impeccable on phone — where most of your clients discover you.","ar":"عرض مثالي على الهاتف — حيث يكتشفك معظم عملائك."}'::jsonb,
  'contact', 'EUR', 'web_app', now()
),
(
  'VZ—05', 'seo', 'search', 'published', false, 50,
  '{"fr":"Référencement de base","en":"Foundational SEO","ar":"أساسيات الظهور في البحث"}'::jsonb,
  '{"fr":"Structure, perf et balises prêtes pour Google : plus de chances d’être trouvé sur les bonnes recherches.","en":"Structure, performance and tags ready for Google: better odds of being found on the right searches.","ar":"بنية وأداء ووسوم جاهزة لـ Google: فرص أفضل للظهور في عمليات البحث المناسبة."}'::jsonb,
  '{"fr":"Structure, perf et balises prêtes pour Google : plus de chances d’être trouvé sur les bonnes recherches.","en":"Structure, performance and tags ready for Google: better odds of being found on the right searches.","ar":"بنية وأداء ووسوم جاهزة لـ Google: فرص أفضل للظهور في عمليات البحث المناسبة."}'::jsonb,
  'contact', 'EUR', 'showcase', now()
),
(
  'VZ—06', 'maintenance', 'rocket', 'published', false, 60,
  '{"fr":"Suivi après lancement","en":"Post-launch support","ar":"متابعة بعد الإطلاق"}'::jsonb,
  '{"fr":"Corrections, améliorations et conseils après mise en ligne — votre site reste stable et évolutif.","en":"Fixes, improvements and advice after go-live — your site stays stable and ready to evolve.","ar":"إصلاحات وتحسينات ونصائح بعد النشر — يبقى موقعك مستقراً وقابلاً للتطور."}'::jsonb,
  '{"fr":"Corrections, améliorations et conseils après mise en ligne — votre site reste stable et évolutif.","en":"Fixes, improvements and advice after go-live — your site stays stable and ready to evolve.","ar":"إصلاحات وتحسينات ونصائح بعد النشر — يبقى موقعك مستقراً وقابلاً للتطور."}'::jsonb,
  'contact', 'EUR', 'other', now()
)
ON CONFLICT (slug) DO NOTHING;

NOTIFY pgrst, 'reload schema';
