-- Remplace les offres « commerciales » par 8 offres de création de sites.
-- Appliquer via : npm run db:migrate

-- ---------------------------------------------------------------------------
-- 1. Archiver les anciennes offres (références libérées)
-- ---------------------------------------------------------------------------
UPDATE public.services
SET
  status = 'archived',
  featured = false,
  sort_order = 900,
  reference = 'ARCH' || substr(replace(id::text, '-', ''), 1, 8)
WHERE slug NOT IN (
  'vitrine', 'ecommerce', 'reservation', 'plateforme',
  'blog', 'portfolio', 'landing', 'sur-mesure'
);

DELETE FROM public.service_case_studies
WHERE service_id IN (
  SELECT id FROM public.services WHERE status = 'archived'
);

-- ---------------------------------------------------------------------------
-- 2. Huit offres de création de sites
-- ---------------------------------------------------------------------------
INSERT INTO public.services (
  reference, slug, icon, status, featured, sort_order,
  title, short_description, description, ideal_for, included_features, cta_label,
  offer_kind, show_cta_buy, show_cta_start, pricing_mode, currency,
  inquiry_project_type, seo_title, seo_description, published_at
) VALUES
(
  'VZ—01', 'vitrine', 'globe', 'published', true, 10,
  jsonb_build_object('fr', $$Site vitrine$$, 'en', $$Showcase website$$, 'ar', $$موقع تعريفي$$),
  jsonb_build_object(
    'fr', $$Présenter une entreprise, une activité ou une marque — services, réalisations et contact.$$,
    'en', $$Present a company, an activity or a brand — services, work and contact.$$,
    'ar', $$عرض شركة أو نشاط أو علامة — خدمات وإنجازات وتواصل.$$
  ),
  jsonb_build_object(
    'fr', $$Un site vitrine présente qui vous êtes, ce que vous faites, et comment vous joindre. Pages claires, réalisations, témoignages et formulaire de contact — pour qu’un visiteur comprenne votre activité et vous écrive.$$,
    'en', $$A showcase site presents who you are, what you do, and how to reach you. Clear pages, work, testimonials and a contact form — so a visitor understands your activity and writes to you.$$,
    'ar', $$الموقع التعريفي يعرض من أنتم وماذا تفعلون وكيف يُتواصل معكم. صفحات واضحة وإنجازات وشهادات ونموذج تواصل — ليفهم الزائر نشاطكم ويكتب لكم.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour artisans, PME, indépendants et agences.$$,
    'en', $$Ideal for tradespeople, SMEs, freelancers and agencies.$$,
    'ar', $$مناسب للحرفيين والشركات الصغيرة والمستقلين والوكالات.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Présentation de l’activité et des services$$, 'en', $$Presentation of the activity and services$$, 'ar', $$عرض النشاط والخدمات$$),
    jsonb_build_object('fr', $$Réalisations et témoignages$$, 'en', $$Work and testimonials$$, 'ar', $$إنجازات وشهادات$$),
    jsonb_build_object('fr', $$Page contact$$, 'en', $$Contact page$$, 'ar', $$صفحة تواصل$$),
    jsonb_build_object('fr', $$Affichage soigné sur téléphone$$, 'en', $$Careful display on phone$$, 'ar', $$عرض متقن على الهاتف$$),
    jsonb_build_object('fr', $$Mise en ligne$$, 'en', $$Go-live$$, 'ar', $$النشر على الإنترنت$$)
  ),
  jsonb_build_object('fr', $$Parler d’un site vitrine$$, 'en', $$Talk about a showcase site$$, 'ar', $$لنتحدث عن موقع تعريفي$$),
  'service', false, true, 'contact', 'EUR', 'showcase',
  jsonb_build_object('fr', $$Site vitrine — VORZIX$$, 'en', $$Showcase website — VORZIX$$, 'ar', $$موقع تعريفي — VORZIX$$),
  jsonb_build_object(
    'fr', $$Site vitrine pour présenter une entreprise, une activité ou une marque.$$,
    'en', $$Showcase website to present a company, an activity or a brand.$$,
    'ar', $$موقع تعريفي لعرض شركة أو نشاط أو علامة.$$
  ),
  now()
),
(
  'VZ—02', 'ecommerce', 'shopping-bag', 'published', false, 20,
  jsonb_build_object('fr', $$Site e-commerce$$, 'en', $$E-commerce website$$, 'ar', $$موقع تجارة إلكترونية$$),
  jsonb_build_object(
    'fr', $$Vente de produits en ligne : catalogue, panier, commandes, paiement et espace client.$$,
    'en', $$Sell products online: catalog, cart, orders, payment and customer area.$$,
    'ar', $$بيع المنتجات عبر الإنترنت: فهرس وسلة وطلبات ودفع ومساحة عميل.$$
  ),
  jsonb_build_object(
    'fr', $$Un site e-commerce permet de vendre vos produits en ligne. Catalogue et catégories, fiches produits, panier, commandes, paiement et un espace pour vos clients — simple à utiliser pour eux, simple à gérer pour vous.$$,
    'en', $$An e-commerce site lets you sell products online. Catalog and categories, product pages, cart, orders, payment and a customer area — simple for them to use, simple for you to run.$$,
    'ar', $$موقع التجارة الإلكترونية يتيح بيع منتجاتكم عبر الإنترنت. فهرس وأقسام وصفحات منتج وسلة وطلبات ودفع ومساحة للعملاء — سهل لهم وسهل عليكم إدارته.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour boutiques, marques et commerçants.$$,
    'en', $$Ideal for shops, brands and retailers.$$,
    'ar', $$مناسب للمتاجر والعلامات والتجار.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Catalogue et catégories$$, 'en', $$Catalog and categories$$, 'ar', $$فهرس وأقسام$$),
    jsonb_build_object('fr', $$Fiches produits$$, 'en', $$Product pages$$, 'ar', $$صفحات المنتجات$$),
    jsonb_build_object('fr', $$Panier et paiement$$, 'en', $$Cart and payment$$, 'ar', $$سلة ودفع$$),
    jsonb_build_object('fr', $$Suivi des commandes$$, 'en', $$Order tracking$$, 'ar', $$متابعة الطلبات$$),
    jsonb_build_object('fr', $$Espace client$$, 'en', $$Customer area$$, 'ar', $$مساحة العميل$$),
    jsonb_build_object('fr', $$Affichage soigné sur téléphone$$, 'en', $$Careful display on phone$$, 'ar', $$عرض متقن على الهاتف$$)
  ),
  jsonb_build_object('fr', $$Parler d’une boutique en ligne$$, 'en', $$Talk about an online shop$$, 'ar', $$لنتحدث عن متجر إلكتروني$$),
  'service', false, true, 'contact', 'EUR', 'ecommerce',
  jsonb_build_object('fr', $$Site e-commerce — VORZIX$$, 'en', $$E-commerce website — VORZIX$$, 'ar', $$موقع تجارة إلكترونية — VORZIX$$),
  jsonb_build_object(
    'fr', $$Site e-commerce : catalogue, panier, commandes et paiement.$$,
    'en', $$E-commerce website: catalog, cart, orders and payment.$$,
    'ar', $$موقع تجارة إلكترونية: فهرس وسلة وطلبات ودفع.$$
  ),
  now()
),
(
  'VZ—03', 'reservation', 'calendar', 'published', false, 30,
  jsonb_build_object('fr', $$Site de réservation$$, 'en', $$Booking website$$, 'ar', $$موقع حجز$$),
  jsonb_build_object(
    'fr', $$Présentation des services avec prise de rendez-vous ou réservation.$$,
    'en', $$Present your services with appointments or reservations.$$,
    'ar', $$عرض الخدمات مع أخذ مواعيد أو حجوزات.$$
  ),
  jsonb_build_object(
    'fr', $$Un site de réservation présente vos services et permet de prendre rendez-vous en ligne. Calendrier, disponibilités, confirmations et un espace pour gérer les réservations — moins d’allers-retours par message.$$,
    'en', $$A booking site presents your services and lets people book online. Calendar, availability, confirmations and a space to manage reservations — fewer back-and-forth messages.$$,
    'ar', $$موقع الحجز يعرض خدماتكم ويتيح أخذ موعد عبر الإنترنت. تقويم وتوفر وتأكيدات ومساحة لإدارة الحجوزات — مراسلات أقل.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour salons, coachs, consultants, restaurants et professionnels.$$,
    'en', $$Ideal for salons, coaches, consultants, restaurants and professionals.$$,
    'ar', $$مناسب للصالونات والمدربين والمستشارين والمطاعم وأصحاب المهن.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Présentation des services$$, 'en', $$Service presentation$$, 'ar', $$عرض الخدمات$$),
    jsonb_build_object('fr', $$Prise de rendez-vous ou réservation$$, 'en', $$Appointments or reservations$$, 'ar', $$أخذ موعد أو حجز$$),
    jsonb_build_object('fr', $$Calendrier et disponibilités$$, 'en', $$Calendar and availability$$, 'ar', $$تقويم وتوفر$$),
    jsonb_build_object('fr', $$Confirmations$$, 'en', $$Confirmations$$, 'ar', $$تأكيدات$$),
    jsonb_build_object('fr', $$Gestion des réservations$$, 'en', $$Reservation management$$, 'ar', $$إدارة الحجوزات$$)
  ),
  jsonb_build_object('fr', $$Parler d’un site de réservation$$, 'en', $$Talk about a booking site$$, 'ar', $$لنتحدث عن موقع حجز$$),
  'service', false, true, 'contact', 'EUR', 'web_app',
  jsonb_build_object('fr', $$Site de réservation — VORZIX$$, 'en', $$Booking website — VORZIX$$, 'ar', $$موقع حجز — VORZIX$$),
  jsonb_build_object(
    'fr', $$Site de réservation : rendez-vous, calendrier et confirmations.$$,
    'en', $$Booking website: appointments, calendar and confirmations.$$,
    'ar', $$موقع حجز: مواعيد وتقويم وتأكيدات.$$
  ),
  now()
),
(
  'VZ—04', 'plateforme', 'app-window', 'published', false, 40,
  jsonb_build_object('fr', $$Plateforme / Application web$$, 'en', $$Platform / web app$$, 'ar', $$منصة / تطبيق ويب$$),
  jsonb_build_object(
    'fr', $$Site avec fonctionnalités avancées et comptes utilisateurs.$$,
    'en', $$A site with advanced features and user accounts.$$,
    'ar', $$موقع بوظائف متقدمة وحسابات مستخدمين.$$
  ),
  jsonb_build_object(
    'fr', $$Une plateforme ou une application web va plus loin qu’un site de présentation : comptes, tableau de bord, rôles, données, notifications et automatisations. Conçue pour un usage régulier, pas seulement pour être vue.$$,
    'en', $$A platform or web app goes further than a presentation site: accounts, dashboard, roles, data, notifications and automations. Built for regular use, not only to be looked at.$$,
    'ar', $$المنصة أو تطبيق الويب يتجاوز موقع العرض: حسابات ولوحة تحكم وأدوار وبيانات وتنبيهات ومهام آلية. مصمَّم للاستخدام المنتظم لا للمشاهدة فقط.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour plateformes, espaces membres et projets sur mesure.$$,
    'en', $$Ideal for platforms, member areas and custom projects.$$,
    'ar', $$مناسب للمنصات ومساحات الأعضاء والمشاريع حسب الطلب.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Comptes utilisateurs$$, 'en', $$User accounts$$, 'ar', $$حسابات المستخدمين$$),
    jsonb_build_object('fr', $$Tableau de bord$$, 'en', $$Dashboard$$, 'ar', $$لوحة تحكم$$),
    jsonb_build_object('fr', $$Rôles et accès$$, 'en', $$Roles and access$$, 'ar', $$أدوار وصلاحيات$$),
    jsonb_build_object('fr', $$Données et listes de travail$$, 'en', $$Data and working lists$$, 'ar', $$بيانات وقوائم عمل$$),
    jsonb_build_object('fr', $$Notifications et automatisations$$, 'en', $$Notifications and automations$$, 'ar', $$تنبيهات ومهام آلية$$)
  ),
  jsonb_build_object('fr', $$Parler d’une plateforme$$, 'en', $$Talk about a platform$$, 'ar', $$لنتحدث عن منصة$$),
  'service', false, true, 'contact', 'EUR', 'saas',
  jsonb_build_object('fr', $$Plateforme / application web — VORZIX$$, 'en', $$Platform / web app — VORZIX$$, 'ar', $$منصة / تطبيق ويب — VORZIX$$),
  jsonb_build_object(
    'fr', $$Plateforme ou application web : comptes, tableau de bord et fonctionnalités avancées.$$,
    'en', $$Platform or web app: accounts, dashboard and advanced features.$$,
    'ar', $$منصة أو تطبيق ويب: حسابات ولوحة تحكم ووظائف متقدمة.$$
  ),
  now()
),
(
  'VZ—05', 'blog', 'newspaper', 'published', false, 50,
  jsonb_build_object('fr', $$Blog / Site de contenu$$, 'en', $$Blog / content site$$, 'ar', $$مدونة / موقع محتوى$$),
  jsonb_build_object(
    'fr', $$Publication et organisation régulière de contenu.$$,
    'en', $$Publish and organise content on a regular basis.$$,
    'ar', $$نشر المحتوى وتنظيمه بشكل منتظم.$$
  ),
  jsonb_build_object(
    'fr', $$Un blog ou un site de contenu sert à publier souvent : articles, catégories, recherche, auteurs et un espace pour administrer le contenu sans passer par un développeur à chaque texte.$$,
    'en', $$A blog or content site is for publishing often: articles, categories, search, authors and a space to manage content without a developer for every text.$$,
    'ar', $$المدونة أو موقع المحتوى للنشر المنتظم: مقالات وأقسام وبحث وكُتّاب ومساحة لإدارة المحتوى دون مطوّر عند كل نص.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour médias, créateurs, associations et sites éducatifs.$$,
    'en', $$Ideal for media, creators, associations and educational sites.$$,
    'ar', $$مناسب للوسائط وصنّاع المحتوى والجمعيات والمواقع التعليمية.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Articles et pages de contenu$$, 'en', $$Articles and content pages$$, 'ar', $$مقالات وصفحات محتوى$$),
    jsonb_build_object('fr', $$Catégories$$, 'en', $$Categories$$, 'ar', $$أقسام$$),
    jsonb_build_object('fr', $$Recherche$$, 'en', $$Search$$, 'ar', $$بحث$$),
    jsonb_build_object('fr', $$Auteurs$$, 'en', $$Authors$$, 'ar', $$كُتّاب$$),
    jsonb_build_object('fr', $$Administration du contenu$$, 'en', $$Content administration$$, 'ar', $$إدارة المحتوى$$)
  ),
  jsonb_build_object('fr', $$Parler d’un blog$$, 'en', $$Talk about a blog$$, 'ar', $$لنتحدث عن مدونة$$),
  'service', false, true, 'contact', 'EUR', 'showcase',
  jsonb_build_object('fr', $$Blog / site de contenu — VORZIX$$, 'en', $$Blog / content site — VORZIX$$, 'ar', $$مدونة / موقع محتوى — VORZIX$$),
  jsonb_build_object(
    'fr', $$Blog ou site de contenu : articles, catégories, recherche et administration.$$,
    'en', $$Blog or content site: articles, categories, search and administration.$$,
    'ar', $$مدونة أو موقع محتوى: مقالات وأقسام وبحث وإدارة.$$
  ),
  now()
),
(
  'VZ—06', 'portfolio', 'palette', 'published', false, 60,
  jsonb_build_object('fr', $$Portfolio$$, 'en', $$Portfolio$$, 'ar', $$معرض أعمال$$),
  jsonb_build_object(
    'fr', $$Présentation d’un professionnel et de ses réalisations.$$,
    'en', $$Present a professional and their work.$$,
    'ar', $$عرض محترف وإنجازاته.$$
  ),
  jsonb_build_object(
    'fr', $$Un portfolio présente un professionnel et son travail : projets, compétences, parcours, témoignages et contact. Pour qu’un client potentiel voie ce que vous savez faire, puis vous écrive.$$,
    'en', $$A portfolio presents a professional and their work: projects, skills, background, testimonials and contact. So a potential client sees what you can do, then writes to you.$$,
    'ar', $$معرض الأعمال يعرض محترفاً وعمله: مشاريع ومهارات ومسار وشهادات وتواصل. ليرى العميل المحتمل ماذا تُحسنون ثم يكتب لكم.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour freelances, développeurs, designers, photographes et artistes.$$,
    'en', $$Ideal for freelancers, developers, designers, photographers and artists.$$,
    'ar', $$مناسب للمستقلين والمطوّرين والمصممين والمصوّرين والفنانين.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Projets et réalisations$$, 'en', $$Projects and work$$, 'ar', $$مشاريع وإنجازات$$),
    jsonb_build_object('fr', $$Compétences$$, 'en', $$Skills$$, 'ar', $$مهارات$$),
    jsonb_build_object('fr', $$Parcours$$, 'en', $$Background$$, 'ar', $$المسار$$),
    jsonb_build_object('fr', $$Témoignages$$, 'en', $$Testimonials$$, 'ar', $$شهادات$$),
    jsonb_build_object('fr', $$Contact$$, 'en', $$Contact$$, 'ar', $$تواصل$$)
  ),
  jsonb_build_object('fr', $$Parler d’un portfolio$$, 'en', $$Talk about a portfolio$$, 'ar', $$لنتحدث عن معرض أعمال$$),
  'service', false, true, 'contact', 'EUR', 'showcase',
  jsonb_build_object('fr', $$Portfolio — VORZIX$$, 'en', $$Portfolio — VORZIX$$, 'ar', $$معرض أعمال — VORZIX$$),
  jsonb_build_object(
    'fr', $$Portfolio : projets, compétences, parcours et contact.$$,
    'en', $$Portfolio: projects, skills, background and contact.$$,
    'ar', $$معرض أعمال: مشاريع ومهارات ومسار وتواصل.$$
  ),
  now()
),
(
  'VZ—07', 'landing', 'layout', 'published', false, 70,
  jsonb_build_object('fr', $$Landing page$$, 'en', $$Landing page$$, 'ar', $$صفحة هبوط$$),
  jsonb_build_object(
    'fr', $$Page conçue autour d’une offre ou d’un objectif précis.$$,
    'en', $$A page built around one offer or one clear goal.$$,
    'ar', $$صفحة مبنية حول عرض أو هدف واحد واضح.$$
  ),
  jsonb_build_object(
    'fr', $$Une landing page a un seul but : présenter une offre, ses avantages, des preuves (avis, chiffres, exemples) et un appel à l’action. Idéale pour une campagne, un lancement ou pour récupérer des demandes.$$,
    'en', $$A landing page has one job: present an offer, its benefits, proof (reviews, figures, examples) and a call to action. Ideal for a campaign, a launch or collecting inquiries.$$,
    'ar', $$صفحة الهبوط لها هدف واحد: عرض عرضكم ومزاياه وأدلة (آراء وأرقام وأمثلة) ودعوة للفعل. مناسبة لحملة أو إطلاق أو جمع الطلبات.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour campagnes, lancements et acquisition de prospects.$$,
    'en', $$Ideal for campaigns, launches and lead generation.$$,
    'ar', $$مناسب للحملات والإطلاق وجمع المهتمين.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Présentation de l’offre$$, 'en', $$Offer presentation$$, 'ar', $$عرض العرض$$),
    jsonb_build_object('fr', $$Avantages$$, 'en', $$Benefits$$, 'ar', $$مزايا$$),
    jsonb_build_object('fr', $$Preuves (avis, exemples)$$, 'en', $$Proof (reviews, examples)$$, 'ar', $$أدلة (آراء وأمثلة)$$),
    jsonb_build_object('fr', $$Appel à l’action$$, 'en', $$Call to action$$, 'ar', $$دعوة للفعل$$),
    jsonb_build_object('fr', $$Formulaire ou prise de contact$$, 'en', $$Form or contact capture$$, 'ar', $$نموذج أو التقاط تواصل$$)
  ),
  jsonb_build_object('fr', $$Parler d’une landing page$$, 'en', $$Talk about a landing page$$, 'ar', $$لنتحدث عن صفحة هبوط$$),
  'service', false, true, 'contact', 'EUR', 'showcase',
  jsonb_build_object('fr', $$Landing page — VORZIX$$, 'en', $$Landing page — VORZIX$$, 'ar', $$صفحة هبوط — VORZIX$$),
  jsonb_build_object(
    'fr', $$Landing page : une offre, des preuves, un appel à l’action.$$,
    'en', $$Landing page: one offer, proof, a call to action.$$,
    'ar', $$صفحة هبوط: عرض واحد وأدلة ودعوة للفعل.$$
  ),
  now()
),
(
  'VZ—08', 'sur-mesure', 'wrench', 'published', false, 80,
  jsonb_build_object('fr', $$Site sur mesure$$, 'en', $$Custom website$$, 'ar', $$موقع حسب الطلب$$),
  jsonb_build_object(
    'fr', $$Conception adaptée à un besoin qui ne correspond pas aux offres standards.$$,
    'en', $$Built for a need that does not fit the standard offers.$$,
    'ar', $$تصميم يناسب احتياجاً لا تغطيه العروض القياسية.$$
  ),
  jsonb_build_object(
    'fr', $$Quand le besoin ne rentre dans aucune offre ci-dessus, nous concevons un site sur mesure : fonctionnalités, design, administration et intégrations adaptées à votre cas. Nous précisons ensemble le périmètre avant de commencer.$$,
    'en', $$When the need does not fit any offer above, we design a custom site: features, design, administration and integrations that match your case. We agree on the scope together before we start.$$,
    'ar', $$عندما لا يندرج الاحتياج تحت أي عرض أعلاه، نصمّم موقعاً حسب الطلب: وظائف وتصميم وإدارة وربط يناسب حالتكم. نحدّد النطاق معاً قبل البدء.$$
  ),
  jsonb_build_object(
    'fr', $$Idéal pour les projets ayant des exigences spécifiques.$$,
    'en', $$Ideal for projects with specific requirements.$$,
    'ar', $$مناسب للمشاريع ذات متطلبات خاصة.$$
  ),
  jsonb_build_array(
    jsonb_build_object('fr', $$Fonctionnalités adaptées à votre cas$$, 'en', $$Features that match your case$$, 'ar', $$وظائف تناسب حالتكم$$),
    jsonb_build_object('fr', $$Design sur mesure$$, 'en', $$Custom design$$, 'ar', $$تصميم حسب الطلب$$),
    jsonb_build_object('fr', $$Administration si besoin$$, 'en', $$Administration if needed$$, 'ar', $$إدارة إن لزم$$),
    jsonb_build_object('fr', $$Intégrations personnalisées$$, 'en', $$Custom integrations$$, 'ar', $$ربط مخصّص$$),
    jsonb_build_object('fr', $$Périmètre clarifié avant le développement$$, 'en', $$Scope clarified before development$$, 'ar', $$نطاق واضح قبل التطوير$$)
  ),
  jsonb_build_object('fr', $$Parler d’un site sur mesure$$, 'en', $$Talk about a custom site$$, 'ar', $$لنتحدث عن موقع حسب الطلب$$),
  'service', false, true, 'contact', 'EUR', 'other',
  jsonb_build_object('fr', $$Site sur mesure — VORZIX$$, 'en', $$Custom website — VORZIX$$, 'ar', $$موقع حسب الطلب — VORZIX$$),
  jsonb_build_object(
    'fr', $$Site sur mesure pour un besoin qui ne correspond pas aux offres standards.$$,
    'en', $$Custom website for a need that does not fit the standard offers.$$,
    'ar', $$موقع حسب الطلب لاحتياج لا تغطيه العروض القياسية.$$
  ),
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  reference = EXCLUDED.reference,
  icon = EXCLUDED.icon,
  status = 'published',
  featured = EXCLUDED.featured,
  sort_order = EXCLUDED.sort_order,
  title = EXCLUDED.title,
  short_description = EXCLUDED.short_description,
  description = EXCLUDED.description,
  ideal_for = EXCLUDED.ideal_for,
  included_features = EXCLUDED.included_features,
  cta_label = EXCLUDED.cta_label,
  offer_kind = 'service',
  show_cta_buy = false,
  show_cta_start = true,
  pricing_mode = 'contact',
  inquiry_project_type = EXCLUDED.inquiry_project_type,
  seo_title = EXCLUDED.seo_title,
  seo_description = EXCLUDED.seo_description,
  published_at = COALESCE(public.services.published_at, now());

-- ---------------------------------------------------------------------------
-- 3. Quotishop → e-commerce uniquement (projet réel)
-- ---------------------------------------------------------------------------
DELETE FROM public.service_case_studies
WHERE service_id IN (SELECT id FROM public.services WHERE slug = 'ecommerce');

INSERT INTO public.service_case_studies (service_id, project_id, sort_order, blurb)
SELECT s.id, p.id, 10, jsonb_build_object(
  'fr', $$Boutique déjà en ligne : catalogue, commandes et espace d’administration.$$,
  'en', $$A live shop: catalog, orders and an admin space.$$,
  'ar', $$متجر منشور: فهرس وطلبات ومساحة إدارة.$$
)
FROM public.services s
JOIN public.projects p ON p.slug = 'quotishop'
WHERE s.slug = 'ecommerce'
ON CONFLICT (service_id, project_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    blurb = EXCLUDED.blurb;

-- ---------------------------------------------------------------------------
-- 4. FAQ liées aux nouvelles offres
-- ---------------------------------------------------------------------------
DELETE FROM public.faq_services;

INSERT INTO public.faq_services (faq_id, service_id, sort_order)
SELECT f.id, s.id, v.sort_order
FROM (
  VALUES
    ('VZ—Q01', 'vitrine', 10), ('VZ—Q02', 'vitrine', 20), ('VZ—Q08', 'vitrine', 30),
    ('VZ—Q01', 'ecommerce', 10), ('VZ—Q02', 'ecommerce', 20), ('VZ—Q03', 'ecommerce', 30), ('VZ—Q08', 'ecommerce', 40),
    ('VZ—Q01', 'reservation', 10), ('VZ—Q02', 'reservation', 20), ('VZ—Q08', 'reservation', 30),
    ('VZ—Q01', 'plateforme', 10), ('VZ—Q02', 'plateforme', 20), ('VZ—Q03', 'plateforme', 30), ('VZ—Q08', 'plateforme', 40),
    ('VZ—Q01', 'blog', 10), ('VZ—Q03', 'blog', 20), ('VZ—Q08', 'blog', 30),
    ('VZ—Q01', 'portfolio', 10), ('VZ—Q08', 'portfolio', 20),
    ('VZ—Q01', 'landing', 10), ('VZ—Q02', 'landing', 20), ('VZ—Q08', 'landing', 30),
    ('VZ—Q01', 'sur-mesure', 10), ('VZ—Q02', 'sur-mesure', 20), ('VZ—Q08', 'sur-mesure', 30)
) AS v(faq_ref, service_slug, sort_order)
JOIN public.faqs f ON f.reference = v.faq_ref
JOIN public.services s ON s.slug = v.service_slug
ON CONFLICT (faq_id, service_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order;

NOTIFY pgrst, 'reload schema';
