-- FAQ commerciale VORZIX (CMS admin + Home + pages offres)
-- Appliquer via : npm run db:migrate
-- Seed idempotent : ON CONFLICT (reference) DO NOTHING

CREATE TABLE IF NOT EXISTS public.faqs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  reference       text NOT NULL
                  CHECK (char_length(reference) BETWEEN 2 AND 32),

  status          text NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'archived')),
  featured        boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,

  -- general = Home ; service = liée à des offres (peut aussi être general + liens)
  scope           text NOT NULL DEFAULT 'general'
                  CHECK (scope IN ('general', 'service')),

  question        jsonb NOT NULL DEFAULT '{}'::jsonb,
  answer          jsonb NOT NULL DEFAULT '{}'::jsonb,

  published_at    timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS faqs_reference_uidx ON public.faqs (reference);
CREATE INDEX IF NOT EXISTS faqs_status_sort_idx
  ON public.faqs (status, sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS faqs_published_sort_idx
  ON public.faqs (sort_order ASC)
  WHERE status = 'published';
CREATE INDEX IF NOT EXISTS faqs_scope_status_idx
  ON public.faqs (scope, status);

CREATE OR REPLACE FUNCTION public.set_faqs_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS faqs_set_updated_at ON public.faqs;
CREATE TRIGGER faqs_set_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_faqs_updated_at();

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.faqs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO service_role;

COMMENT ON TABLE public.faqs IS
  'FAQ commerciale VORZIX (CMS). Contenu i18n JSONB. Admin MFA + service_role.';

-- Liaison FAQ ↔ Service (M2M)
CREATE TABLE IF NOT EXISTS public.faq_services (
  faq_id       uuid NOT NULL REFERENCES public.faqs(id) ON DELETE CASCADE,
  service_id   uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  sort_order   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (faq_id, service_id)
);

CREATE INDEX IF NOT EXISTS faq_services_service_idx
  ON public.faq_services (service_id, sort_order ASC);

ALTER TABLE public.faq_services ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.faq_services FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faq_services TO service_role;

-- Seed initial (idempotent) — VZ—Q01 … VZ—Q08
INSERT INTO public.faqs (
  reference, status, featured, sort_order, scope, question, answer, published_at
) VALUES
(
  'VZ—Q01', 'published', false, 10, 'general',
  jsonb_build_object(
    'fr', 'Combien coûte la création d''un site ou d''une application ?',
    'en', 'How much does a website or application cost?',
    'ar', 'كم تبلغ تكلفة إنشاء موقع أو تطبيق؟'
  ),
  jsonb_build_object(
    'fr', 'Le tarif dépend du périmètre du projet, du design, des fonctionnalités et des besoins techniques. Lorsque cela est pertinent, certaines offres affichent un tarif de départ. Après étude de votre demande, le périmètre et le tarif du projet sont précisés avant le début du développement.',
    'en', 'Pricing depends on the project scope, design, features and technical requirements. Where appropriate, some services display a starting price. After reviewing your request, the project scope and pricing are clarified before development begins.',
    'ar', 'تعتمد التكلفة على نطاق المشروع والتصميم والوظائف والمتطلبات التقنية. قد تعرض بعض الخدمات سعراً ابتدائياً عندما يكون ذلك مناسباً، وبعد دراسة طلبك يتم توضيح نطاق المشروع وتكلفته قبل بدء التطوير.'
  ),
  now()
),
(
  'VZ—Q02', 'published', false, 20, 'general',
  jsonb_build_object(
    'fr', 'Combien de temps faut-il pour réaliser un projet ?',
    'en', 'How long does a project take?',
    'ar', 'كم يستغرق تنفيذ المشروع؟'
  ),
  jsonb_build_object(
    'fr', 'La durée dépend de la taille et de la complexité du projet. Le calendrier est défini en fonction du périmètre convenu avant le lancement du développement.',
    'en', 'The timeline depends on the size and complexity of the project. A schedule is defined based on the agreed scope before development begins.',
    'ar', 'تعتمد مدة التنفيذ على حجم المشروع ومدى تعقيده، ويتم تحديد الجدول الزمني وفق نطاق العمل المتفق عليه قبل بدء التطوير.'
  ),
  now()
),
(
  'VZ—Q03', 'published', false, 30, 'general',
  jsonb_build_object(
    'fr', 'Puis-je modifier mon site après sa mise en ligne ?',
    'en', 'Can I update my website after launch?',
    'ar', 'هل يمكنني تعديل موقعي بعد إطلاقه؟'
  ),
  jsonb_build_object(
    'fr', 'Cela dépend du type de projet et des fonctionnalités prévues. Lorsque le projet comprend une interface d''administration, certains contenus peuvent être gérés directement par le client. Des évolutions supplémentaires peuvent également être réalisées après le lancement.',
    'en', 'It depends on the project and the features included. When an administration interface is part of the project, certain content can be managed directly by the client. Additional improvements can also be developed after launch.',
    'ar', 'يعتمد ذلك على نوع المشروع والوظائف المتفق عليها. إذا كان المشروع يتضمن لوحة إدارة، فيمكن للعميل إدارة بعض المحتويات بنفسه، كما يمكن تنفيذ تطويرات إضافية بعد الإطلاق.'
  ),
  now()
),
(
  'VZ—Q04', 'published', false, 40, 'general',
  jsonb_build_object(
    'fr', 'Est-ce que VORZIX peut gérer la mise en ligne et l''hébergement ?',
    'en', 'Can VORZIX handle deployment and hosting?',
    'ar', 'هل يمكن لـ VORZIX تولي نشر الموقع والاستضافة؟'
  ),
  jsonb_build_object(
    'fr', 'VORZIX peut accompagner la configuration et la mise en ligne de l''infrastructure nécessaire selon les besoins du projet. Les services tiers, noms de domaine et coûts d''hébergement éventuels sont précisés dans le cadre du projet.',
    'en', 'VORZIX can assist with configuring and deploying the required infrastructure depending on the project. Any third-party services, domain names and hosting costs are clarified as part of the project scope.',
    'ar', 'يمكن لـ VORZIX المساعدة في إعداد ونشر البنية التحتية اللازمة وفق احتياجات المشروع، ويتم توضيح خدمات الأطراف الخارجية واسم النطاق وتكاليف الاستضافة عند تحديد نطاق المشروع.'
  ),
  now()
),
(
  'VZ—Q05', 'published', false, 50, 'general',
  jsonb_build_object(
    'fr', 'Pouvez-vous reprendre ou moderniser un site existant ?',
    'en', 'Can you redesign or improve an existing website?',
    'ar', 'هل يمكنكم تطوير أو إعادة تصميم موقع موجود بالفعل؟'
  ),
  jsonb_build_object(
    'fr', 'Oui, selon l''état du projet existant. Une analyse permet de déterminer s''il est préférable de faire évoluer l''existant ou de repartir sur une nouvelle base.',
    'en', 'Yes, depending on the condition of the existing project. An initial review helps determine whether it is more appropriate to improve the current solution or rebuild it on a new foundation.',
    'ar', 'نعم، بحسب حالة المشروع الحالي. تساعد المراجعة الأولية على تحديد ما إذا كان من الأفضل تطوير النظام الموجود أو إعادة بنائه على أساس جديد.'
  ),
  now()
),
(
  'VZ—Q06', 'published', false, 60, 'general',
  jsonb_build_object(
    'fr', 'Proposez-vous un accompagnement après le lancement ?',
    'en', 'Do you provide support after launch?',
    'ar', 'هل تقدمون دعماً بعد إطلاق المشروع؟'
  ),
  jsonb_build_object(
    'fr', 'Oui, selon l''offre et les besoins convenus. VORZIX peut continuer à intervenir pour la maintenance, les corrections et les évolutions du produit après sa mise en ligne.',
    'en', 'Yes, depending on the agreed service and project requirements. VORZIX can continue to provide maintenance, fixes and product improvements after launch.',
    'ar', 'نعم، بحسب الخدمة واحتياجات المشروع المتفق عليها. يمكن لـ VORZIX الاستمرار في تقديم الصيانة والإصلاحات والتطويرات بعد الإطلاق.'
  ),
  now()
),
(
  'VZ—Q07', 'published', false, 70, 'general',
  jsonb_build_object(
    'fr', 'Travaillez-vous avec des clients à distance ?',
    'en', 'Do you work with remote clients?',
    'ar', 'هل تعملون مع عملاء عن بُعد؟'
  ),
  jsonb_build_object(
    'fr', 'Oui. Le projet peut être organisé et suivi à distance à l''aide des moyens de communication adaptés au client et au projet.',
    'en', 'Yes. Projects can be organised and managed remotely using communication methods suited to the client and the project.',
    'ar', 'نعم، يمكن تنظيم المشروع ومتابعته عن بُعد باستخدام وسائل التواصل المناسبة للعميل وطبيعة المشروع.'
  ),
  now()
),
(
  'VZ—Q08', 'published', false, 80, 'general',
  jsonb_build_object(
    'fr', 'Que se passe-t-il après l''envoi de ma demande ?',
    'en', 'What happens after I submit my project request?',
    'ar', 'ماذا يحدث بعد إرسال طلب مشروعي؟'
  ),
  jsonb_build_object(
    'fr', 'Votre demande permet à VORZIX de comprendre le type de projet, vos objectifs, votre calendrier et les informations que vous avez fournies. Elle peut ensuite servir de base au premier échange et à la définition plus précise du projet.',
    'en', 'Your request helps VORZIX understand the type of project, your goals, timeline and the information you provided. It can then serve as the basis for the first discussion and a more precise project definition.',
    'ar', 'يساعد طلبك VORZIX على فهم نوع المشروع وأهدافك والجدول الزمني والمعلومات التي قدمتها، ثم تُستخدم هذه البيانات كأساس للتواصل الأول وتحديد المشروع بصورة أكثر دقة.'
  ),
  now()
)
ON CONFLICT (reference) DO NOTHING;
