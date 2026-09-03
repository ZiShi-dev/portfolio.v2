-- Savoraille : projet personnel (restaurant) + exemple de l’offre réservation.
-- Idempotent : UPSERT sur slug. Appliquer via : npm run db:migrate

INSERT INTO public.projects (
  slug, reference, title, description, kind, business_type_ids, images, cover_image,
  link, sort_order, published, featured, published_at, technologies, features,
  client_need, objective, solution, result, seo_title, seo_description
)
SELECT
  'savoraille',
  COALESCE(
    existing.reference,
    'VZ—CASE ' || lpad(
      (
        COALESCE(
          (
            SELECT MAX(substring(p.reference from '([0-9]+)$')::int)
            FROM public.projects p
            WHERE p.reference ~ '^VZ[—-]CASE'
          ),
          0
        ) + 1
      )::text,
      3,
      '0'
    )
  ),
  jsonb_build_object(
    'fr', $$Savoraille — Restaurant$$,
    'en', $$Savoraille — Restaurant$$,
    'ar', $$Savoraille — مطعم$$
  ),
  jsonb_build_object(
    'fr', $$Site restaurant déjà en ligne : réservation de table, carte de saison interactive, commande à emporter et livraison.$$,
    'en', $$A live restaurant site: table booking, an interactive seasonal menu, takeaway and delivery.$$,
    'ar', $$موقع مطعم منشور: حجز طاولة وقائمة موسمية تفاعلية وطلب للأخذ والتوصيل.$$
  ),
  'personal',
  ARRAY['showcase', 'booking'],
  jsonb_build_array(
    jsonb_build_object(
      'url', '/projects/savoraille.jpg',
      'label', jsonb_build_object('fr', $$Accueil$$, 'en', $$Home$$, 'ar', $$الرئيسية$$)
    ),
    jsonb_build_object(
      'url', '/projects/savoraille-carte.jpg',
      'label', jsonb_build_object('fr', $$La carte$$, 'en', $$The menu$$, 'ar', $$القائمة$$)
    ),
    jsonb_build_object(
      'url', '/projects/savoraille-reservation.jpg',
      'label', jsonb_build_object('fr', $$Réservation$$, 'en', $$Booking$$, 'ar', $$الحجز$$)
    ),
    jsonb_build_object(
      'url', '/projects/savoraille-histoire.jpg',
      'label', jsonb_build_object('fr', $$Notre histoire$$, 'en', $$Our story$$, 'ar', $$قصتنا$$)
    )
  ),
  '/projects/savoraille.jpg',
  'https://savoraille.vorzix.com/fr',
  15, true, true, COALESCE(existing.published_at, now()),
  ARRAY[]::text[],
  jsonb_build_array(
    jsonb_build_object(
      'fr', $$Réservation de table en étapes (occasion, puis créneau)$$,
      'en', $$Step-by-step table booking (occasion, then time slot)$$,
      'ar', $$حجز طاولة على مراحل (المناسبة ثم الموعد)$$
    ),
    jsonb_build_object(
      'fr', $$Carte de saison interactive : apéritifs, entrées, plats, desserts, boissons$$,
      'en', $$Interactive seasonal menu: starters, mains, desserts and drinks$$,
      'ar', $$قائمة موسمية تفاعلية: مقبلات وأطباق وحلويات ومشروبات$$
    ),
    jsonb_build_object(
      'fr', $$Commande à emporter et livraison$$,
      'en', $$Takeaway and delivery$$,
      'ar', $$طلب للأخذ والتوصيل$$
    ),
    jsonb_build_object(
      'fr', $$Fiches plats avec visuel, description et prix$$,
      'en', $$Dish pages with photo, description and price$$,
      'ar', $$صفحات أطباق بصورة ووصف وسعر$$
    ),
    jsonb_build_object(
      'fr', $$Pages histoire et contact, sélecteur de langue$$,
      'en', $$Story and contact pages, language switcher$$,
      'ar', $$صفحتا القصة والتواصل ومبدّل اللغة$$
    )
  ),
  jsonb_build_object(
    'fr', $$Un restaurant a besoin d’un site qui présente la carte et permet de réserver une table, commander à emporter ou se faire livrer — sans multiplier les messages.$$,
    'en', $$A restaurant needs a site that shows the menu and lets guests book a table, order takeaway or get delivery — without back-and-forth messages.$$,
    'ar', $$المطعم يحتاج موقعاً يعرض القائمة ويتيح حجز طاولة أو الطلب للأخذ أو التوصيل — دون مراسلات متكررة.$$
  ),
  jsonb_build_object(
    'fr', $$Trois chemins clairs — table, emporter, livrer — et une carte de saison qui donne envie de commander.$$,
    'en', $$Three clear paths — table, takeaway, delivery — and a seasonal menu that invites an order.$$,
    'ar', $$ثلاثة مسارات واضحة — طاولة، أخذ، توصيل — وقائمة موسمية تدعو إلى الطلب.$$
  ),
  jsonb_build_object(
    'fr', $$Accueil avec les trois services, carte interactive, réservation en étapes, commandes, pages histoire et contact.$$,
    'en', $$Home with the three services, an interactive menu, step-by-step booking, orders, story and contact pages.$$,
    'ar', $$رئيسية بالخدمات الثلاث، قائمة تفاعلية، حجز على مراحل، طلبات، وصفحتا القصة والتواصل.$$
  ),
  jsonb_build_object(
    'fr', $$Démo restaurant déjà en ligne : réservation, carte et commandes, sur savoraille.vorzix.com.$$,
    'en', $$A live restaurant demo: booking, menu and orders, at savoraille.vorzix.com.$$,
    'ar', $$عرض مطعم منشور: حجز وقائمة وطلبات على savoraille.vorzix.com.$$
  ),
  jsonb_build_object(
    'fr', $$Savoraille — Site restaurant et réservation — VORZIX$$,
    'en', $$Savoraille — Restaurant website and booking — VORZIX$$,
    'ar', $$Savoraille — موقع مطعم وحجز — VORZIX$$
  ),
  jsonb_build_object(
    'fr', $$Site restaurant VORZIX : réservation de table, carte de saison et commandes — un exemple de projet personnel.$$,
    'en', $$VORZIX restaurant site: table booking, seasonal menu and orders — a personal project example.$$,
    'ar', $$موقع مطعم VORZIX: حجز طاولة وقائمة موسمية وطلبات — مثال لمشروع شخصي.$$
  )
FROM (SELECT 1) AS _
LEFT JOIN public.projects existing ON existing.slug = 'savoraille'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  kind = 'personal',
  business_type_ids = EXCLUDED.business_type_ids,
  images = EXCLUDED.images,
  cover_image = EXCLUDED.cover_image,
  link = EXCLUDED.link,
  sort_order = EXCLUDED.sort_order,
  published = true,
  featured = true,
  published_at = COALESCE(public.projects.published_at, now()),
  technologies = EXCLUDED.technologies,
  features = EXCLUDED.features,
  client_need = EXCLUDED.client_need,
  objective = EXCLUDED.objective,
  solution = EXCLUDED.solution,
  result = EXCLUDED.result,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  reference = COALESCE(public.projects.reference, EXCLUDED.reference);

-- Uniquement l’offre qui correspond : site de réservation (restaurants).
DELETE FROM public.service_case_studies scs
USING public.projects p, public.services s
WHERE scs.project_id = p.id
  AND scs.service_id = s.id
  AND p.slug = 'savoraille'
  AND s.slug <> 'reservation';

INSERT INTO public.service_case_studies (service_id, project_id, sort_order, blurb)
SELECT s.id, p.id, 10, jsonb_build_object(
  'fr', $$Site restaurant déjà en ligne : réservation de table, carte de saison et commandes.$$,
  'en', $$A live restaurant site: table booking, seasonal menu and orders.$$,
  'ar', $$موقع مطعم منشور: حجز طاولة وقائمة موسمية وطلبات.$$
)
FROM public.services s
JOIN public.projects p ON p.slug = 'savoraille'
WHERE s.slug = 'reservation'
ON CONFLICT (service_id, project_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    blurb = EXCLUDED.blurb;

NOTIFY pgrst, 'reload schema';
