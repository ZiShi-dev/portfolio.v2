-- Engagements VORZIX (CMS admin + section publique)
-- Appliquer via : npm run db:migrate
-- Seed idempotent : ON CONFLICT (reference) DO NOTHING

CREATE TABLE IF NOT EXISTS public.engagements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  reference       text NOT NULL
                  CHECK (char_length(reference) BETWEEN 2 AND 32),
  icon            text NOT NULL DEFAULT 'file-check'
                  CHECK (char_length(icon) BETWEEN 1 AND 48),

  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'archived')),
  sort_order      integer NOT NULL DEFAULT 0,

  title           jsonb NOT NULL DEFAULT '{}'::jsonb,
  description     jsonb NOT NULL DEFAULT '{}'::jsonb,

  published_at    timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS engagements_reference_uidx
  ON public.engagements (reference);
CREATE INDEX IF NOT EXISTS engagements_status_sort_idx
  ON public.engagements (status, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS engagements_published_sort_idx
  ON public.engagements (sort_order ASC)
  WHERE status = 'published';

CREATE OR REPLACE FUNCTION public.set_engagements_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS engagements_set_updated_at ON public.engagements;
CREATE TRIGGER engagements_set_updated_at
  BEFORE UPDATE ON public.engagements
  FOR EACH ROW
  EXECUTE FUNCTION public.set_engagements_updated_at();

ALTER TABLE public.engagements ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.engagements FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.engagements TO service_role;

COMMENT ON TABLE public.engagements IS
  'Engagements VORZIX (CMS). Contenu i18n JSONB. Admin MFA + service_role.';

-- Seed initial (idempotent)
INSERT INTO public.engagements (
  reference, icon, status, sort_order, title, description, published_at
) VALUES
(
  'VZ—C01',
  'file-check',
  'published',
  10,
  jsonb_build_object(
    'fr', 'Un cadre clair avant de commencer',
    'en', 'A clear scope from the start',
    'ar', 'إطار واضح قبل البدء'
  ),
  jsonb_build_object(
    'fr', 'Nous définissons avec vous le périmètre du projet, les fonctionnalités attendues et les modalités de réalisation avant de commencer le développement.',
    'en', 'We define the project scope, expected features and delivery terms with you before development begins.',
    'ar', 'نحدد معك نطاق المشروع والوظائف المطلوبة وطريقة التنفيذ قبل البدء في عملية التطوير.'
  ),
  now()
),
(
  'VZ—C02',
  'monitor-smartphone',
  'published',
  20,
  jsonb_build_object(
    'fr', 'Conçu pour tous les écrans',
    'en', 'Designed for every screen',
    'ar', 'مصمم لجميع الشاشات'
  ),
  jsonb_build_object(
    'fr', 'Chaque interface est pensée pour offrir une expérience cohérente et soignée sur mobile, tablette et ordinateur.',
    'en', 'Every interface is designed to provide a consistent and polished experience across mobile, tablet and desktop.',
    'ar', 'نصمم كل واجهة لتقدم تجربة متناسقة واحترافية على الهاتف والجهاز اللوحي والكمبيوتر.'
  ),
  now()
),
(
  'VZ—C03',
  'layers',
  'published',
  30,
  jsonb_build_object(
    'fr', 'Une solution pensée pour évoluer',
    'en', 'Built to evolve',
    'ar', 'حل قابل للتطور'
  ),
  jsonb_build_object(
    'fr', 'Nous privilégions des fondations techniques propres et maintenables afin de faciliter les évolutions futures de votre produit.',
    'en', 'We prioritize clean and maintainable technical foundations to make future product evolution easier.',
    'ar', 'نعتمد على أسس تقنية منظمة وقابلة للصيانة لتسهيل تطوير منتجك وإضافة وظائف جديدة مستقبلاً.'
  ),
  now()
),
(
  'VZ—C04',
  'life-buoy',
  'published',
  40,
  jsonb_build_object(
    'fr', 'Un accompagnement après le lancement',
    'en', 'Support beyond launch',
    'ar', 'دعم بعد الإطلاق'
  ),
  jsonb_build_object(
    'fr', 'Selon les besoins du projet et l''offre convenue, VORZIX peut continuer à assurer la maintenance, les corrections et les évolutions après la mise en ligne.',
    'en', 'Depending on the project and agreed service, VORZIX can continue to provide maintenance, fixes and improvements after launch.',
    'ar', 'حسب احتياجات المشروع والخدمة المتفق عليها، يمكن لـ VORZIX الاستمرار في تقديم الصيانة والإصلاحات والتطويرات بعد الإطلاق.'
  ),
  now()
)
ON CONFLICT (reference) DO NOTHING;
