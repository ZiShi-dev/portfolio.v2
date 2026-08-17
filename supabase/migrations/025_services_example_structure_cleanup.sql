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

-- Produits « à vendre » sans exemple : repasser en service (catalogue cohérent)
UPDATE public.services
SET
  offer_kind = 'service',
  show_cta_buy = false,
  show_cta_start = true
WHERE offer_kind = 'product'
  AND linked_project_id IS NULL;

-- Produits avec exemple : garder Acheter, pas d’image service
UPDATE public.services
SET
  cover_image = NULL,
  show_cta_buy = true
WHERE offer_kind = 'product'
  AND linked_project_id IS NOT NULL;

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
  '{"fr":"Site ou application web","en":"Website or web app","ar":"موقع أو تطبيق ويب"}'::jsonb,
  '{"fr":"Une présence en ligne claire et rapide, conçue pour présenter votre offre et générer des demandes de contact.","en":"A clear, fast online presence built to present your offer and generate contact requests.","ar":"حضور واضح وسريع على الإنترنت، مصمم لعرض خدمتك وتوليد طلبات التواصل."}'::jsonb,
  '{"fr":"Une présence en ligne claire et rapide, conçue pour présenter votre offre et générer des demandes de contact.","en":"A clear, fast online presence built to present your offer and generate contact requests.","ar":"حضور واضح وسريع على الإنترنت، مصمم لعرض خدمتك وتوليد طلبات التواصل."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'showcase', now()
),
(
  'VZ—02', 'backend', 'server', 'published', false, 20,
  '{"fr":"Back-office & automatisation","en":"Back-office & automation","ar":"لوحة تحكم وأتمتة"}'::jsonb,
  '{"fr":"Comptes, formulaires, données et outils métier fiables — pour que votre site travaille vraiment pour vous.","en":"Accounts, forms, data and business tools that work reliably — so your site actually works for you.","ar":"حسابات ونماذج وبيانات وأدوات عمل موثوقة — ليخدمك موقعك فعلياً."}'::jsonb,
  '{"fr":"Comptes, formulaires, données et outils métier fiables — pour que votre site travaille vraiment pour vous.","en":"Accounts, forms, data and business tools that work reliably — so your site actually works for you.","ar":"حسابات ونماذج وبيانات وأدوات عمل موثوقة — ليخدمك موقعك فعلياً."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'automation', now()
),
(
  'VZ—03', 'design', 'palette', 'published', false, 30,
  '{"fr":"Design UX/UI","en":"UX/UI design","ar":"تصميم تجربة وواجهة"}'::jsonb,
  '{"fr":"Une interface élégante et lisible : vos visiteurs comprennent vite qui vous êtes et quoi faire ensuite.","en":"An elegant, readable interface: visitors quickly understand who you are and what to do next.","ar":"واجهة أنيقة وواضحة: يفهم زوارك بسرعة من أنت وماذا يفعلون لاحقاً."}'::jsonb,
  '{"fr":"Une interface élégante et lisible : vos visiteurs comprennent vite qui vous êtes et quoi faire ensuite.","en":"An elegant, readable interface: visitors quickly understand who you are and what to do next.","ar":"واجهة أنيقة وواضحة: يفهم زوارك بسرعة من أنت وماذا يفعلون لاحقاً."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'redesign', now()
),
(
  'VZ—04', 'mobile', 'smartphone', 'published', false, 40,
  '{"fr":"Expérience mobile-first","en":"Mobile-first experience","ar":"تجربة للجوال أولاً"}'::jsonb,
  '{"fr":"Un rendu impeccable sur téléphone — là où la majorité de vos clients vous découvrent.","en":"Impeccable on phone — where most of your clients discover you.","ar":"عرض مثالي على الهاتف — حيث يكتشفك معظم عملائك."}'::jsonb,
  '{"fr":"Un rendu impeccable sur téléphone — là où la majorité de vos clients vous découvrent.","en":"Impeccable on phone — where most of your clients discover you.","ar":"عرض مثالي على الهاتف — حيث يكتشفك معظم عملائك."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'web_app', now()
),
(
  'VZ—05', 'seo', 'search', 'published', false, 50,
  '{"fr":"Référencement de base","en":"Foundational SEO","ar":"أساسيات الظهور في البحث"}'::jsonb,
  '{"fr":"Structure, perf et balises prêtes pour Google : plus de chances d’être trouvé sur les bonnes recherches.","en":"Structure, performance and tags ready for Google: better odds of being found on the right searches.","ar":"بنية وأداء ووسوم جاهزة لـ Google: فرص أفضل للظهور في عمليات البحث المناسبة."}'::jsonb,
  '{"fr":"Structure, perf et balises prêtes pour Google : plus de chances d’être trouvé sur les bonnes recherches.","en":"Structure, performance and tags ready for Google: better odds of being found on the right searches.","ar":"بنية وأداء ووسوم جاهزة لـ Google: فرص أفضل للظهور في عمليات البحث المناسبة."}'::jsonb,
  'service', false, true, NULL,
  'contact', 'EUR', 'showcase', now()
),
(
  'VZ—06', 'maintenance', 'rocket', 'published', false, 60,
  '{"fr":"Suivi après lancement","en":"Post-launch support","ar":"متابعة بعد الإطلاق"}'::jsonb,
  '{"fr":"Corrections, améliorations et conseils après mise en ligne — votre site reste stable et évolutif.","en":"Fixes, improvements and advice after go-live — your site stays stable and ready to evolve.","ar":"إصلاحات وتحسينات ونصائح بعد النشر — يبقى موقعك مستقراً وقابلاً للتطور."}'::jsonb,
  '{"fr":"Corrections, améliorations et conseils après mise en ligne — votre site reste stable et évolutif.","en":"Fixes, improvements and advice after go-live — your site stays stable and ready to evolve.","ar":"إصلاحات وتحسينات ونصائح بعد النشر — يبقى موقعك مستقراً وقابلاً للتطور."}'::jsonb,
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

-- ---------------------------------------------------------------------------
-- 4. Exemple principal : lier le 1er projet publié aux offres sans exemple
--    (round-robin) pour que la zone Exemple soit remplie côté détail.
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  project_ids uuid[];
  svc RECORD;
  idx integer := 0;
  n integer;
BEGIN
  SELECT array_agg(id ORDER BY sort_order ASC, created_at ASC)
  INTO project_ids
  FROM public.projects
  WHERE published = true;

  IF project_ids IS NULL THEN
    RETURN;
  END IF;

  n := array_length(project_ids, 1);
  IF n IS NULL OR n < 1 THEN
    RETURN;
  END IF;

  FOR svc IN
    SELECT id
    FROM public.services
    WHERE status = 'published'
      AND linked_project_id IS NULL
    ORDER BY sort_order ASC, created_at ASC
  LOOP
    UPDATE public.services
    SET linked_project_id = project_ids[(idx % n) + 1]
    WHERE id = svc.id;

    -- Retirer ce projet des « autres exemples » s’il y était
    DELETE FROM public.service_case_studies
    WHERE service_id = svc.id
      AND project_id = project_ids[(idx % n) + 1];

    idx := idx + 1;
  END LOOP;
END $$;

NOTIFY pgrst, 'reload schema';
