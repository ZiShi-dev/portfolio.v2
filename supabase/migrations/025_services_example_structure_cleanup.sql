-- Migration: 025_services_example_structure_cleanup.sql
-- Date: 2026-08-17
--
-- Aligne la BDD sur la structure publique actuelle :
-- - Catalogue / accueil = services seuls (pas d’images projet)
-- - Page détail = zone « Exemple » via linked_project_id + service_case_studies
--
-- Nettoie l’ancienne version (cover_image service affichée au catalogue).

-- ---------------------------------------------------------------------------
-- 1. Commentaires schéma
-- ---------------------------------------------------------------------------
COMMENT ON COLUMN public.services.cover_image IS
  'Obsolète côté public : le catalogue n’affiche plus d’image d’offre. '
  'Les images viennent du projet exemple (linked_project_id) sur /offres/[slug].';

COMMENT ON COLUMN public.services.linked_project_id IS
  'Exemple principal : projet publié dont les images et le lien s’affichent '
  'dans la zone Exemple de /offres/[slug].';

COMMENT ON TABLE public.service_case_studies IS
  'Autres exemples (projets) liés à une offre — affichés sous l’exemple principal.';

COMMENT ON COLUMN public.services.offer_kind IS
  'service = prestation ; product = offre commerciale à vendre '
  '(sans photo catalogue : images via projet exemple).';

-- ---------------------------------------------------------------------------
-- 2. Nettoyage données héritées
-- ---------------------------------------------------------------------------

-- Plus aucune photo d’offre en BDD : le front ne les lit plus.
UPDATE public.services
SET cover_image = NULL
WHERE cover_image IS NOT NULL;

-- Liens vers des projets non publiés / absents
UPDATE public.services s
SET linked_project_id = NULL
WHERE linked_project_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.projects p
    WHERE p.id = s.linked_project_id
      AND p.published = true
  );

-- Exemples secondaires : uniquement projets publiés
DELETE FROM public.service_case_studies scs
WHERE NOT EXISTS (
  SELECT 1
  FROM public.projects p
  WHERE p.id = scs.project_id
    AND p.published = true
);

-- Éviter le doublon exemple principal / autres exemples
DELETE FROM public.service_case_studies scs
USING public.services s
WHERE scs.service_id = s.id
  AND s.linked_project_id IS NOT NULL
  AND scs.project_id = s.linked_project_id;

-- Le catalogue public ne contient plus de projets / produits à vendre :
-- toutes les anciennes lignes sont ramenées vers un service.
UPDATE public.services
SET
  offer_kind = 'service',
  show_cta_buy = false,
  show_cta_start = true
WHERE offer_kind = 'product';

-- ---------------------------------------------------------------------------
-- 3. Réaligner le seed des 6 offres (contenu service, sans cover)
-- ---------------------------------------------------------------------------
INSERT INTO public.services (
  reference, slug, icon, status, featured, sort_order,
  title, short_description, description,
  offer_kind, show_cta_buy, show_cta_start, cover_image,
  pricing_mode, currency, inquiry_project_type, published_at
)
VALUES
(
  'VZ—01', 'web', 'code-2', 'published', true, 10,
  '{"fr":"Un site qui attire vos clients","en":"A website that wins customers","ar":"موقع يجذب عملاءك"}'::jsonb,
  '{"fr":"Présentez clairement votre activité, inspirez confiance et transformez davantage de visiteurs en demandes.","en":"Present your business clearly, build trust and turn more visitors into enquiries.","ar":"قدّم نشاطك بوضوح، وابنِ الثقة، وحوّل مزيداً من الزوار إلى عملاء محتملين."}'::jsonb,
  '{"fr":"Nous créons une présence en ligne qui explique votre valeur en quelques secondes et guide naturellement vos visiteurs vers la prise de contact.","en":"We create an online presence that explains your value in seconds and naturally guides visitors towards getting in touch.","ar":"ننشئ حضوراً واضحاً يشرح قيمة نشاطك خلال ثوانٍ ويوجّه الزوار بسهولة إلى التواصل معك."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'showcase', now()
),
(
  'VZ—02', 'backend', 'server', 'published', false, 20,
  '{"fr":"Gagnez du temps au quotidien","en":"Save time every day","ar":"وفّر وقتك كل يوم"}'::jsonb,
  '{"fr":"Simplifiez les tâches répétitives et retrouvez toutes les informations utiles au même endroit.","en":"Simplify repetitive tasks and keep all the information you need in one place.","ar":"بسّط المهام المتكررة واجمع كل المعلومات المهمة في مكان واحد."}'::jsonb,
  '{"fr":"Nous simplifions votre organisation pour vous permettre de consacrer plus de temps à vos clients et au développement de votre activité.","en":"We simplify your day-to-day organisation so you can spend more time on customers and growing your business.","ar":"نبسّط طريقة عملك اليومية لتمنح وقتاً أكبر لعملائك ولنمو نشاطك."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'automation', now()
),
(
  'VZ—03', 'design', 'palette', 'published', false, 30,
  '{"fr":"Une image qui inspire confiance","en":"An image that inspires trust","ar":"صورة تمنح عملاءك الثقة"}'::jsonb,
  '{"fr":"Offrez à vos clients une présentation élégante, claire et fidèle à la qualité de votre entreprise.","en":"Give customers an elegant, clear presentation that reflects the quality of your business.","ar":"قدّم لعملائك صورة أنيقة وواضحة تعكس جودة نشاطك."}'::jsonb,
  '{"fr":"Nous construisons une image cohérente et mémorable qui rassure vos visiteurs et donne envie de choisir votre entreprise.","en":"We build a consistent, memorable image that reassures visitors and makes them want to choose your business.","ar":"نبني صورة متناسقة ولا تُنسى تطمئن زوارك وتشجعهم على اختيار نشاطك."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'redesign', now()
),
(
  'VZ—04', 'mobile', 'smartphone', 'published', false, 40,
  '{"fr":"Une expérience parfaite sur téléphone","en":"A perfect experience on every phone","ar":"تجربة ممتازة على الهاتف"}'::jsonb,
  '{"fr":"Vos clients profitent d’un parcours simple et agréable, où qu’ils soient.","en":"Give customers a simple, pleasant journey wherever they are.","ar":"امنح عملاءك تجربة بسيطة ومريحة أينما كانوا."}'::jsonb,
  '{"fr":"Nous veillons à ce que chaque visite soit fluide et convaincante sur téléphone, là où vos clients vous découvrent le plus souvent.","en":"We make every visit smooth and convincing on mobile, where customers are most likely to discover you.","ar":"نحرص على أن تكون كل زيارة سهلة ومقنعة على الهاتف، حيث يكتشفك معظم عملائك."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'web_app', now()
),
(
  'VZ—05', 'seo', 'search', 'published', false, 50,
  '{"fr":"Soyez trouvé par les bons clients","en":"Be found by the right customers","ar":"اجعل العملاء المناسبين يجدونك"}'::jsonb,
  '{"fr":"Améliorez votre présence sur Google pour toucher les personnes qui recherchent déjà vos services.","en":"Improve your presence on Google and reach people already looking for your services.","ar":"حسّن ظهورك على Google للوصول إلى أشخاص يبحثون بالفعل عن خدماتك."}'::jsonb,
  '{"fr":"Nous rendons votre activité plus facile à trouver afin que les bonnes personnes puissent vous découvrir au bon moment.","en":"We make your business easier to find so the right people can discover you at the right time.","ar":"نجعل نشاطك أسهل في الوصول إليه ليكتشفك الأشخاص المناسبون في الوقت المناسب."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'showcase', now()
),
(
  'VZ—06', 'maintenance', 'rocket', 'published', false, 60,
  '{"fr":"Restez serein après le lancement","en":"Enjoy peace of mind after launch","ar":"راحة بال بعد الإطلاق"}'::jsonb,
  '{"fr":"Nous restons à vos côtés pour les améliorations, les ajustements et les questions.","en":"We stay by your side for improvements, adjustments and questions.","ar":"نبقى إلى جانبك للتحسينات والتعديلات والإجابة عن أسئلتك."}'::jsonb,
  '{"fr":"Vous n’êtes pas seul après la mise en ligne : nous vous accompagnons pour garder une présence fiable et adaptée à l’évolution de votre activité.","en":"You are not alone after launch: we stay with you to keep your online presence reliable and suited to your growing business.","ar":"لن تكون وحدك بعد الإطلاق: نبقى معك للحفاظ على حضور موثوق يواكب نمو نشاطك."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'other', now()
)
ON CONFLICT (slug) DO UPDATE SET
  reference = EXCLUDED.reference,
  icon = EXCLUDED.icon,
  status = EXCLUDED.status,
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  offer_kind = EXCLUDED.offer_kind,
  show_cta_buy = EXCLUDED.show_cta_buy,
  show_cta_start = EXCLUDED.show_cta_start,
  cover_image = NULL,
  pricing_mode = EXCLUDED.pricing_mode,
  currency = EXCLUDED.currency,
  inquiry_project_type = EXCLUDED.inquiry_project_type,
  published_at = COALESCE(public.services.published_at, EXCLUDED.published_at),
  updated_at = now();

-- Aucun projet n’est créé ou associé automatiquement.
-- Les exemples réels sont choisis manuellement depuis l’administration.

NOTIFY pgrst, 'reload schema';
