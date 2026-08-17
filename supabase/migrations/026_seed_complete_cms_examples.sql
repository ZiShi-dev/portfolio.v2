-- Exemple de contenu complet : offres, projets liés, blurbs, FAQ.
-- Idempotent : UPSERT / ON CONFLICT. N’invente pas de tarifs.
-- Appliquer via : npm run db:migrate

-- ---------------------------------------------------------------------------
-- 1. Restaurer le slug catalogue de l’offre back-office
-- ---------------------------------------------------------------------------
UPDATE public.services
SET slug = 'backend', reference = 'VZ—02'
WHERE slug = 'backend-copy-x0nn'
  AND NOT EXISTS (SELECT 1 FROM public.services WHERE slug = 'backend');

UPDATE public.services
SET linked_project_id = NULL
WHERE linked_project_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 2. Offres : champs éditoriaux FR / EN / AR
-- ---------------------------------------------------------------------------
UPDATE public.services
SET
  description = jsonb_build_object(
    'fr', $$Nous concevons des sites et applications web sur mesure : architecture claire, pages mesurées, et un parcours qui mène à la prise de contact. Chaque écran est pensé comme une carte — lisible, rapide, sans effets inutiles. Vous repartez avec une base solide, prête à évoluer.$$,
    'en', $$We design custom websites and web apps: a clear architecture, measured pages, and a path that leads to contact. Each screen is treated like a chart — readable, fast, without unused effects. You leave with a solid foundation, ready to grow.$$,
    'ar', $$نصمّم مواقع وتطبيقات ويب حسب الطلب: بنية واضحة، صفحات محسوبة، ومسار يقود إلى التواصل. كل شاشة تُعامل كخريطة — مقروءة وسريعة بلا مؤثرات زائدة. تغادر بأساس متين جاهز للتطوّر.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Indépendants, TPE et studios qui veulent une vitrine ou une application nette, rapide, conçue pour transformer les visites en demandes.$$,
    'en', $$Freelancers, small businesses and studios who need a clear, fast showcase or app designed to turn visits into inquiries.$$,
    'ar', $$المستقلون والشركات الصغيرة والاستوديوهات الذين يريدون واجهة أو تطبيقاً واضحاً وسريعاً يحوّل الزيارات إلى طلبات.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Architecture et maquettes des pages clés$$, 'en', $$Information architecture and key page mockups$$, 'ar', $$بنية المعلومات ونماذج الصفحات الأساسية$$),
    jsonb_build_object('fr', $$Intégration responsive (mobile, tablette, desktop)$$, 'en', $$Responsive build (mobile, tablet, desktop)$$, 'ar', $$تنفيذ متجاوب (جوال، لوحي، حاسوب)$$),
    jsonb_build_object('fr', $$Formulaire de contact et prises de demande$$, 'en', $$Contact form and inquiry capture$$, 'ar', $$نموذج تواصل والتقاط الطلبات$$),
    jsonb_build_object('fr', $$Base de contenu éditable si le projet le prévoit$$, 'en', $$Editable content base when the project includes it$$, 'ar', $$قاعدة محتوى قابلة للتحرير إن شملها المشروع$$),
    jsonb_build_object('fr', $$Mise en ligne et configuration du domaine$$, 'en', $$Go-live and domain configuration$$, 'ar', $$النشر وإعداد النطاق$$),
    jsonb_build_object('fr', $$Structure et performance prêtes pour le référencement$$, 'en', $$Structure and performance ready for search$$, 'ar', $$بنية وأداء جاهزان لمحركات البحث$$)
  ),
  cta_label = jsonb_build_object('fr', $$Démarrer un projet$$, 'en', $$Start a project$$, 'ar', $$ابدأ مشروعاً$$),
  seo_title = jsonb_build_object(
    'fr', $$Site ou application web — VORZIX$$,
    'en', $$Website or web app — VORZIX$$,
    'ar', $$موقع أو تطبيق ويب — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Sites et applications web sur mesure : clairs, rapides, conçus pour présenter votre offre et générer des demandes.$$,
    'en', $$Custom websites and web apps: clear, fast, built to present your offer and generate inquiries.$$,
    'ar', $$مواقع وتطبيقات ويب حسب الطلب: واضحة وسريعة، لعرض عرضك وتوليد طلبات التواصل.$$
  ),
  show_cta_start = true,
  show_cta_buy = false,
  offer_kind = 'service'
WHERE slug = 'web';

UPDATE public.services
SET
  description = jsonb_build_object(
    'fr', $$Back-office, comptes, données et automatisations : nous construisons les outils métier qui font travailler votre site pour vous. Formulaires fiables, rôles, exports, et flux qui évitent la double saisie — un instrument interne, pas un tableur de plus.$$,
    'en', $$Back-office, accounts, data and automation: we build the business tools that make your site work for you. Reliable forms, roles, exports and flows that avoid double entry — an internal instrument, not another spreadsheet.$$,
    'ar', $$لوحة إدارة، حسابات، بيانات وأتمتة: نبني الأدوات المهنية التي تجعل موقعك يعمل لأجلك. نماذج موثوقة وأدوار وتصدير وتدفقات تتجنب الإدخال المزدوج — أداة داخلية لا جدولاً إضافياً.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Activités qui gèrent des commandes, des dossiers clients ou des contenus récurrents, et qui ont besoin d’un outil interne simple.$$,
    'en', $$Businesses that manage orders, client files or recurring content and need a simple internal tool.$$,
    'ar', $$الأنشطة التي تدير طلبات أو ملفات عملاء أو محتوى متكرراً وتحتاج أداة داخلية بسيطة.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Comptes et rôles (admin, équipe, client)$$, 'en', $$Accounts and roles (admin, team, client)$$, 'ar', $$حسابات وأدوار (إدارة، فريق، عميل)$$),
    jsonb_build_object('fr', $$Formulaires et validations métier$$, 'en', $$Business forms and validation$$, 'ar', $$نماذج وتحققات مهنية$$),
    jsonb_build_object('fr', $$Tableaux de bord et listes filtrables$$, 'en', $$Dashboards and filterable lists$$, 'ar', $$لوحات وتحكم وقوائم قابلة للتصفية$$),
    jsonb_build_object('fr', $$Automatisations (e-mails, exports, webhooks)$$, 'en', $$Automation (emails, exports, webhooks)$$, 'ar', $$أتمتة (بريد، تصدير، webhooks)$$),
    jsonb_build_object('fr', $$Modèle de données documenté$$, 'en', $$Documented data model$$, 'ar', $$نموذج بيانات موثّق$$),
    jsonb_build_object('fr', $$Accès sécurisé (sessions, permissions)$$, 'en', $$Secure access (sessions, permissions)$$, 'ar', $$وصول آمن (جلسات وصلاحيات)$$)
  ),
  cta_label = jsonb_build_object('fr', $$Parler de l’outil métier$$, 'en', $$Discuss the internal tool$$, 'ar', $$لنناقش الأداة المهنية$$),
  seo_title = jsonb_build_object(
    'fr', $$Back-office et automatisation — VORZIX$$,
    'en', $$Back-office and automation — VORZIX$$,
    'ar', $$لوحة تحكم وأتمتة — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Comptes, formulaires, données et automatisations fiables — pour que votre site travaille vraiment pour vous.$$,
    'en', $$Reliable accounts, forms, data and automation — so your site actually works for you.$$,
    'ar', $$حسابات ونماذج وبيانات وأتمتة موثوقة — ليخدمك موقعك فعلياً.$$
  ),
  show_cta_start = true,
  show_cta_buy = false,
  offer_kind = 'service'
WHERE slug = 'backend';

UPDATE public.services
SET
  description = jsonb_build_object(
    'fr', $$Design UX/UI : une interface élégante, lisible, hiérarchisée. Nous posons la typographie, les écrans et les micro-interactions pour que vos visiteurs comprennent vite qui vous êtes et quoi faire ensuite — sans bruit visuel.$$,
    'en', $$UX/UI design: an elegant, readable, hierarchical interface. We set type, screens and micro-interactions so visitors quickly understand who you are and what to do next — without visual noise.$$,
    'ar', $$تصميم تجربة وواجهة: واجهة أنيقة ومقروءة ومرتّبة. نضبط الخطوط والشاشات والتفاعلات الدقيقة ليفهم الزائر بسرعة من أنت وماذا يفعل لاحقاً — بلا ضوضاء بصرية.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Marques et produits qui ont déjà une offre claire, mais une interface trop générique, trop dense, ou difficile à parcourir.$$,
    'en', $$Brands and products with a clear offer but a generic, dense, or hard-to-scan interface.$$,
    'ar', $$علامات ومنتجات عرضها واضح لكن واجهتها عامة أو مكتظة أو صعبة التصفح.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Audit de l’existant et des parcours$$, 'en', $$Audit of the current product and flows$$, 'ar', $$مراجعة المنتج الحالي والمسارات$$),
    jsonb_build_object('fr', $$Direction artistique et système visuel$$, 'en', $$Art direction and visual system$$, 'ar', $$اتجاه فني ونظام بصري$$),
    jsonb_build_object('fr', $$Maquettes des écrans clés (desktop et mobile)$$, 'en', $$Key screen mockups (desktop and mobile)$$, 'ar', $$نماذج الشاشات الأساسية (حاسوب وجوال)$$),
    jsonb_build_object('fr', $$Composants réutilisables et états (hover, focus, vide)$$, 'en', $$Reusable components and states (hover, focus, empty)$$, 'ar', $$مكوّنات قابلة لإعادة الاستخدام وحالاتها$$),
    jsonb_build_object('fr', $$Hiérarchie typographique et labels techniques$$, 'en', $$Typographic hierarchy and technical labels$$, 'ar', $$تسلسل طباعي وتسميات تقنية$$),
    jsonb_build_object('fr', $$Livrables prêts pour l’intégration$$, 'en', $$Handoff ready for implementation$$, 'ar', $$تسليم جاهز للتنفيذ$$)
  ),
  cta_label = jsonb_build_object('fr', $$Discuter du design$$, 'en', $$Discuss the design$$, 'ar', $$لنناقش التصميم$$),
  seo_title = jsonb_build_object(
    'fr', $$Design UX/UI — VORZIX$$,
    'en', $$UX/UI design — VORZIX$$,
    'ar', $$تصميم تجربة وواجهة — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Interfaces élégantes et lisibles : vos visiteurs comprennent vite qui vous êtes et quoi faire ensuite.$$,
    'en', $$Elegant, readable interfaces: visitors quickly understand who you are and what to do next.$$,
    'ar', $$واجهات أنيقة وواضحة: يفهم زوارك بسرعة من أنت وماذا يفعلون لاحقاً.$$
  ),
  show_cta_start = true,
  show_cta_buy = false,
  offer_kind = 'service'
WHERE slug = 'design';

UPDATE public.services
SET
  description = jsonb_build_object(
    'fr', $$La majorité de vos clients vous découvrent sur téléphone. Nous concevons d’abord pour l’écran étroit : tap targets, lecture, formulaires, et performance — puis nous élargissons vers tablette et desktop sans casser le rythme.$$,
    'en', $$Most of your clients discover you on a phone. We design for the narrow screen first: tap targets, reading, forms and performance — then we expand to tablet and desktop without breaking the rhythm.$$,
    'ar', $$معظم عملائك يكتشفونك على الهاتف. نصمّم أولاً للشاشة الضيقة: أهداف اللمس والقراءة والنماذج والأداء — ثم نوسّع للوحي والحاسوب دون كسر الإيقاع.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Offres consultées surtout sur mobile : prises de rendez-vous, boutiques, landing pages, espaces membres.$$,
    'en', $$Offers mostly used on mobile: bookings, shops, landing pages, member areas.$$,
    'ar', $$العروض المستخدمة غالباً على الجوال: حجوزات، متاجر، صفحات هبوط، مساحات أعضاء.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Parcours mobile-first des écrans clés$$, 'en', $$Mobile-first flows for key screens$$, 'ar', $$مسارات للجوال أولاً للشاشات الأساسية$$),
    jsonb_build_object('fr', $$Formulaires et CTA utilisables au pouce$$, 'en', $$Thumb-friendly forms and CTAs$$, 'ar', $$نماذج وأزرار سهلة بالإبهام$$),
    jsonb_build_object('fr', $$Typographie et contrastes lisibles en extérieur$$, 'en', $$Type and contrast readable outdoors$$, 'ar', $$خطوط وتباين مقروءان في الخارج$$),
    jsonb_build_object('fr', $$Performance perçue (chargement, images)$$, 'en', $$Perceived performance (loading, images)$$, 'ar', $$أداء محسوس (تحميل وصور)$$),
    jsonb_build_object('fr', $$Adaptation tablette et desktop$$, 'en', $$Tablet and desktop adaptation$$, 'ar', $$تكييف للوحي والحاسوب$$),
    jsonb_build_object('fr', $$Tests sur tailles d’écran réelles$$, 'en', $$Tests on real screen sizes$$, 'ar', $$اختبارات على أحجام شاشات حقيقية$$)
  ),
  cta_label = jsonb_build_object('fr', $$Soigner le mobile$$, 'en', $$Get the mobile right$$, 'ar', $$لنضبط تجربة الجوال$$),
  seo_title = jsonb_build_object(
    'fr', $$Expérience mobile-first — VORZIX$$,
    'en', $$Mobile-first experience — VORZIX$$,
    'ar', $$تجربة للجوال أولاً — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Un rendu impeccable sur téléphone — là où la majorité de vos clients vous découvrent.$$,
    'en', $$Impeccable on phone — where most of your clients discover you.$$,
    'ar', $$عرض مثالي على الهاتف — حيث يكتشفك معظم عملائك.$$
  ),
  show_cta_start = true,
  show_cta_buy = false,
  offer_kind = 'service'
WHERE slug = 'mobile';

UPDATE public.services
SET
  description = jsonb_build_object(
    'fr', $$Référencement de base : structure des pages, balises, performance et maillage interne. Nous posons les fondations pour que Google (et vos visiteurs) comprennent de quoi il s’agit — sans promettre un classement magique.$$,
    'en', $$Foundational SEO: page structure, tags, performance and internal linking. We set the foundations so Google (and your visitors) understand what the site is about — without promising a magic ranking.$$,
    'ar', $$أساسيات الظهور في البحث: بنية الصفحات والوسوم والأداء والربط الداخلي. نضع الأساس ليفهم Google (وزوارك) موضوع الموقع — دون وعد بترتيب سحري.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Nouveaux sites, refontes, ou pages qui existent déjà mais n’ont ni titres clairs, ni structure, ni temps de chargement honnête.$$,
    'en', $$New sites, redesigns, or existing pages that lack clear titles, structure, or honest load times.$$,
    'ar', $$مواقع جديدة أو إعادة تصميم أو صفحات موجودة بلا عناوين واضحة ولا بنية ولا زمن تحميل صادق.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Titres, descriptions et balises essentielles$$, 'en', $$Titles, descriptions and essential tags$$, 'ar', $$عناوين ووصف ووسوم أساسية$$),
    jsonb_build_object('fr', $$Structure de pages et maillage interne$$, 'en', $$Page structure and internal linking$$, 'ar', $$بنية الصفحات والربط الداخلي$$),
    jsonb_build_object('fr', $$Balises Open Graph pour le partage$$, 'en', $$Open Graph tags for sharing$$, 'ar', $$وسوم Open Graph للمشاركة$$),
    jsonb_build_object('fr', $$Plan de site et robots.txt$$, 'en', $$Sitemap and robots.txt$$, 'ar', $$خريطة الموقع وrobots.txt$$),
    jsonb_build_object('fr', $$Performance et images (poids, formats)$$, 'en', $$Performance and images (weight, formats)$$, 'ar', $$الأداء والصور (الحجم والصيغ)$$),
    jsonb_build_object('fr', $$Recommandations de contenu indexable$$, 'en', $$Indexable content recommendations$$, 'ar', $$توصيات لمحتوى قابل للفهرسة$$)
  ),
  cta_label = jsonb_build_object('fr', $$Poser les fondations SEO$$, 'en', $$Set the SEO foundations$$, 'ar', $$لنضع أسس الظهور$$),
  seo_title = jsonb_build_object(
    'fr', $$Référencement de base — VORZIX$$,
    'en', $$Foundational SEO — VORZIX$$,
    'ar', $$أساسيات الظهور في البحث — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Structure, performance et balises prêtes pour Google : plus de chances d’être trouvé sur les bonnes recherches.$$,
    'en', $$Structure, performance and tags ready for Google: better odds of being found on the right searches.$$,
    'ar', $$بنية وأداء ووسوم جاهزة لـ Google: فرص أفضل للظهور في عمليات البحث المناسبة.$$
  ),
  show_cta_start = true,
  show_cta_buy = false,
  offer_kind = 'service'
WHERE slug = 'seo';

UPDATE public.services
SET
  description = jsonb_build_object(
    'fr', $$Après la mise en ligne, le produit doit rester stable. Nous assurons corrections, petites évolutions et conseils — pour que votre site ne se fige pas au jour J, et que les ajustements restent mesurés.$$,
    'en', $$After go-live, the product must stay stable. We handle fixes, small improvements and advice — so your site does not freeze on launch day, and changes stay measured.$$,
    'ar', $$بعد الإطلاق يجب أن يبقى المنتج مستقراً. نتولى الإصلاحات والتحسينات الصغيرة والنصائح — كي لا يتجمّد موقعك يوم الإطلاق، وتبقى التعديلات محسوبة.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Sites déjà en ligne, ou projets VORZIX qui viennent d’être livrés et qui ont besoin d’un suivi clair (bugs, contenus, petites évolutions).$$,
    'en', $$Sites already live, or VORZIX projects just delivered that need clear follow-up (bugs, content, small evolutions).$$,
    'ar', $$مواقع منشورة أو مشاريع VORZIX سُلّمت للتو وتحتاج متابعة واضحة (أخطاء، محتوى، تطويرات صغيرة).$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Corrections de bugs et de régressions$$, 'en', $$Bug and regression fixes$$, 'ar', $$إصلاح الأخطاء والانحدارات$$),
    jsonb_build_object('fr', $$Mises à jour de contenu ciblées$$, 'en', $$Targeted content updates$$, 'ar', $$تحديثات محتوى موجّهة$$),
    jsonb_build_object('fr', $$Petites évolutions fonctionnelles$$, 'en', $$Small functional improvements$$, 'ar', $$تطويرات وظيفية صغيرة$$),
    jsonb_build_object('fr', $$Veille technique (dépendances, sécurité)$$, 'en', $$Technical watch (dependencies, security)$$, 'ar', $$متابعة تقنية (اعتماديات وأمان)$$),
    jsonb_build_object('fr', $$Conseils sur les prochaines priorités$$, 'en', $$Advice on the next priorities$$, 'ar', $$نصائح حول الأولويات التالية$$),
    jsonb_build_object('fr', $$Compte-rendu simple des interventions$$, 'en', $$Simple record of interventions$$, 'ar', $$محضر بسيط للتدخلات$$)
  ),
  cta_label = jsonb_build_object('fr', $$Prévoir le suivi$$, 'en', $$Plan post-launch support$$, 'ar', $$لنخطط للمتابعة$$),
  seo_title = jsonb_build_object(
    'fr', $$Suivi après lancement — VORZIX$$,
    'en', $$Post-launch support — VORZIX$$,
    'ar', $$متابعة بعد الإطلاق — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Corrections, améliorations et conseils après mise en ligne — votre site reste stable et évolutif.$$,
    'en', $$Fixes, improvements and advice after go-live — your site stays stable and ready to evolve.$$,
    'ar', $$إصلاحات وتحسينات ونصائح بعد النشر — يبقى موقعك مستقراً وقابلاً للتطور.$$
  ),
  show_cta_start = true,
  show_cta_buy = false,
  offer_kind = 'service'
WHERE slug = 'maintenance';

-- ---------------------------------------------------------------------------
-- 3. Quotishop : champs encore vides
-- ---------------------------------------------------------------------------
UPDATE public.projects
SET
  cover_image = COALESCE(
    cover_image,
    images -> 0 ->> 'url'
  ),
  technologies = CASE
    WHEN technologies IS NULL OR cardinality(technologies) = 0
      THEN ARRAY['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind CSS']
    ELSE technologies
  END,
  featured = true
WHERE slug = 'quotishop';

-- ---------------------------------------------------------------------------
-- 4. Projets d’exemple (catalogue démo) pour illustrer plusieurs liens
-- ---------------------------------------------------------------------------
INSERT INTO public.projects (
  slug, reference, title, description, kind, business_type_ids, images, cover_image,
  sort_order, published, featured, published_at, technologies, features,
  client_need, objective, solution, result, seo_title, seo_description
)
VALUES
(
  'nova',
  'VZ—CASE 002',
  jsonb_build_object('fr', $$Nova — Dashboard$$, 'en', $$Nova — Dashboard$$, 'ar', $$Nova — لوحة تحكم$$),
  jsonb_build_object(
    'fr', $$Concept d’application analytics : tableau de bord clair, graphiques et navigation pensée pour une lecture rapide.$$,
    'en', $$Analytics app concept: clear dashboard, charts and navigation designed for quick reading.$$,
    'ar', $$مفهوم تطبيق تحليلات: لوحة واضحة، رسوم بيانية وتنقل مصمم للقراءة السريعة.$$
  ),
  'personal',
  ARRAY['dashboard', 'webapp'],
  jsonb_build_array(
    jsonb_build_object('url', '/projects/nova.svg', 'label', jsonb_build_object('fr', $$Page d’accueil$$, 'en', $$Home page$$, 'ar', $$الصفحة الرئيسية$$)),
    jsonb_build_object('url', '/projects/nova-dashboard.svg', 'label', jsonb_build_object('fr', $$Tableau de bord$$, 'en', $$Dashboard$$, 'ar', $$لوحة التحكم$$)),
    jsonb_build_object('url', '/projects/nova-mobile.svg', 'label', jsonb_build_object('fr', $$Version mobile$$, 'en', $$Mobile version$$, 'ar', $$نسخة الجوال$$))
  ),
  '/projects/nova.svg',
  20, true, false, now(),
  ARRAY['Next.js', 'TypeScript', 'Recharts'],
  jsonb_build_array(
    jsonb_build_object('fr', $$Vue d’ensemble des indicateurs$$, 'en', $$KPI overview$$, 'ar', $$نظرة عامة على المؤشرات$$),
    jsonb_build_object('fr', $$Graphiques lisibles, sans surcharge$$, 'en', $$Readable charts, no clutter$$, 'ar', $$رسوم بيانية مقروءة بلا ازدحام$$),
    jsonb_build_object('fr', $$Navigation latérale et filtres$$, 'en', $$Side navigation and filters$$, 'ar', $$تنقل جانبي وفلاتر$$),
    jsonb_build_object('fr', $$Adaptation mobile du tableau$$, 'en', $$Mobile adaptation of the dashboard$$, 'ar', $$تكييف اللوحة للجوال$$)
  ),
  jsonb_build_object(
    'fr', $$Lire des chiffres métier sans se perdre dans un outil trop dense.$$,
    'en', $$Read business numbers without getting lost in a dense tool.$$,
    'ar', $$قراءة أرقام العمل دون الضياع في أداة مكتظة.$$
  ),
  jsonb_build_object(
    'fr', $$Un dashboard qui tient sur un écran : hiérarchie, silence visuel, lecture en quelques secondes.$$,
    'en', $$A dashboard that fits one screen: hierarchy, visual quiet, readable in seconds.$$,
    'ar', $$لوحة تسع شاشة واحدة: تسلسل، هدوء بصري، قراءة في ثوان.$$
  ),
  jsonb_build_object(
    'fr', $$Interface nuit, labels mono, cartes d’indicateurs et graphiques en hairlines.$$,
    'en', $$Night interface, mono labels, metric cards and hairline charts.$$,
    'ar', $$واجهة ليلية، تسميات أحادية، بطاقات مؤشرات ورسوم بخطوط دقيقة.$$
  ),
  jsonb_build_object(
    'fr', $$Concept prêt à servir de base pour un back-office ou un outil interne.$$,
    'en', $$A concept ready to become a back-office or internal tool.$$,
    'ar', $$مفهوم جاهز ليصير لوحة إدارة أو أداة داخلية.$$
  ),
  jsonb_build_object('fr', $$Nova — Dashboard analytics — VORZIX$$, 'en', $$Nova — Analytics dashboard — VORZIX$$, 'ar', $$Nova — لوحة تحليلات — VORZIX$$),
  jsonb_build_object(
    'fr', $$Concept de tableau de bord analytics : lecture rapide, graphiques clairs, navigation mesurée.$$,
    'en', $$Analytics dashboard concept: fast reading, clear charts, measured navigation.$$,
    'ar', $$مفهوم لوحة تحليلات: قراءة سريعة ورسوم واضحة وتنقل محسوب.$$
  )
),
(
  'maison-belle',
  'VZ—CASE 003',
  jsonb_build_object('fr', $$Maison Belle — E-commerce$$, 'en', $$Maison Belle — E-commerce$$, 'ar', $$Maison Belle — تجارة إلكترونية$$),
  jsonb_build_object(
    'fr', $$Maquette de boutique en ligne : catalogue, fiche produit et parcours d’achat simplifié.$$,
    'en', $$Online store mockup: catalog, product page and a simplified checkout flow.$$,
    'ar', $$نموذج متجر إلكتروني: فهرس منتجات، صفحة منتج ومسار شراء مبسّط.$$
  ),
  'personal',
  ARRAY['ecommerce'],
  jsonb_build_array(
    jsonb_build_object('url', '/projects/maison-belle.svg', 'label', jsonb_build_object('fr', $$Boutique$$, 'en', $$Shop$$, 'ar', $$المتجر$$)),
    jsonb_build_object('url', '/projects/maison-belle-product.svg', 'label', jsonb_build_object('fr', $$Fiche produit$$, 'en', $$Product page$$, 'ar', $$صفحة المنتج$$))
  ),
  '/projects/maison-belle.svg',
  30, true, false, now(),
  ARRAY['Next.js', 'Stripe', 'PostgreSQL'],
  jsonb_build_array(
    jsonb_build_object('fr', $$Catalogue et fiches produit$$, 'en', $$Catalog and product pages$$, 'ar', $$فهرس وصفحات منتج$$),
    jsonb_build_object('fr', $$Parcours d’achat simplifié$$, 'en', $$Simplified checkout$$, 'ar', $$مسار شراء مبسّط$$),
    jsonb_build_object('fr', $$Mise en avant des collections$$, 'en', $$Collection highlights$$, 'ar', $$إبراز المجموعات$$),
    jsonb_build_object('fr', $$Fiche claire : prix, options, visuels$$, 'en', $$Clear product sheet: price, options, visuals$$, 'ar', $$بطاقة واضحة: سعر وخيارات وصور$$)
  ),
  jsonb_build_object(
    'fr', $$Vendre en ligne sans un parcours d’achat trop long ni une fiche produit brouillonne.$$,
    'en', $$Sell online without a long checkout or a messy product page.$$,
    'ar', $$البيع عبر الإنترنت دون مسار شراء طويل أو صفحة منتج مشوّشة.$$
  ),
  jsonb_build_object(
    'fr', $$Une boutique lisible : catalogue, fiche, panier — chaque étape a une seule tâche.$$,
    'en', $$A readable shop: catalog, product, cart — each step has one job.$$,
    'ar', $$متجر مقروء: فهرس، منتج، سلة — لكل خطوة مهمة واحدة.$$
  ),
  jsonb_build_object(
    'fr', $$Maquettes vitrine + produit, hiérarchie typographique et CTA unique par écran.$$,
    'en', $$Shop + product mockups, type hierarchy and a single CTA per screen.$$,
    'ar', $$نماذج المتجر والمنتج، تسلسل طباعي وزر وحيد في كل شاشة.$$
  ),
  jsonb_build_object(
    'fr', $$Base visuelle réutilisable pour une boutique réelle (catalogue, fiche, conversion).$$,
    'en', $$A visual base reusable for a real shop (catalog, product, conversion).$$,
    'ar', $$أساس بصري قابل لإعادة الاستخدام لمتجر حقيقي.$$
  ),
  jsonb_build_object('fr', $$Maison Belle — Boutique en ligne — VORZIX$$, 'en', $$Maison Belle — Online store — VORZIX$$, 'ar', $$Maison Belle — متجر إلكتروني — VORZIX$$),
  jsonb_build_object(
    'fr', $$Maquette e-commerce : catalogue, fiche produit et parcours d’achat simplifié.$$,
    'en', $$E-commerce mockup: catalog, product page and simplified checkout.$$,
    'ar', $$نموذج تجارة إلكترونية: فهرس وبطاقة منتج ومسار شراء مبسّط.$$
  )
),
(
  'atelier-lumiere',
  'VZ—CASE 004',
  jsonb_build_object('fr', $$Atelier Lumière — Vitrine$$, 'en', $$Atelier Lumière — Showcase$$, 'ar', $$Atelier Lumière — موقع تعريفي$$),
  jsonb_build_object(
    'fr', $$Site vitrine pour un studio créatif : galerie immersive et formulaire de contact intégré.$$,
    'en', $$Showcase site for a creative studio: immersive gallery and integrated contact form.$$,
    'ar', $$موقع تعريفي لاستوديو إبداعي: معرض غامر ونموذج تواصل مدمج.$$
  ),
  'personal',
  ARRAY['showcase'],
  jsonb_build_array(
    jsonb_build_object('url', '/projects/atelier-lumiere.svg', 'label', jsonb_build_object('fr', $$Accueil$$, 'en', $$Home$$, 'ar', $$الرئيسية$$)),
    jsonb_build_object('url', '/projects/atelier-lumiere-gallery.svg', 'label', jsonb_build_object('fr', $$Galerie$$, 'en', $$Gallery$$, 'ar', $$المعرض$$))
  ),
  '/projects/atelier-lumiere.svg',
  40, true, false, now(),
  ARRAY['Next.js', 'Framer Motion'],
  jsonb_build_array(
    jsonb_build_object('fr', $$Page d’accueil éditoriale$$, 'en', $$Editorial home page$$, 'ar', $$صفحة رئيسية تحريرية$$),
    jsonb_build_object('fr', $$Galerie d’images avec légendes$$, 'en', $$Image gallery with captions$$, 'ar', $$معرض صور مع تعليقات$$),
    jsonb_build_object('fr', $$Formulaire de contact intégré$$, 'en', $$Integrated contact form$$, 'ar', $$نموذج تواصل مدمج$$),
    jsonb_build_object('fr', $$Mise en page aérée, lecture confortable$$, 'en', $$Airy layout, comfortable reading$$, 'ar', $$تخطيط مُهوّى وقراءة مريحة$$)
  ),
  jsonb_build_object(
    'fr', $$Montrer un travail visuel sans transformer le site en portfolio bruyant.$$,
    'en', $$Show visual work without turning the site into a noisy portfolio.$$,
    'ar', $$عرض عمل بصري دون تحويل الموقع إلى معرض صاخب.$$
  ),
  jsonb_build_object(
    'fr', $$Une vitrine calme : images, légendes, et un seul chemin vers le contact.$$,
    'en', $$A quiet showcase: images, captions, and a single path to contact.$$,
    'ar', $$واجهة هادئة: صور وتعليقات ومسار واحد نحو التواصل.$$
  ),
  jsonb_build_object(
    'fr', $$Grille de galerie, typographie display, formulaire discret en pied de page.$$,
    'en', $$Gallery grid, display type, a discreet footer form.$$,
    'ar', $$شبكة معرض، خط عرض، ونموذج تذييل هادئ.$$
  ),
  jsonb_build_object(
    'fr', $$Modèle de vitrine studio, prêt à recevoir un vrai catalogue d’œuvres.$$,
    'en', $$A studio showcase model, ready for a real body of work.$$,
    'ar', $$نموذج واجهة استوديو جاهز لاستقبال أعمال حقيقية.$$
  ),
  jsonb_build_object('fr', $$Atelier Lumière — Site vitrine — VORZIX$$, 'en', $$Atelier Lumière — Showcase site — VORZIX$$, 'ar', $$Atelier Lumière — موقع تعريفي — VORZIX$$),
  jsonb_build_object(
    'fr', $$Vitrine studio : galerie immersive et formulaire de contact intégré.$$,
    'en', $$Studio showcase: immersive gallery and integrated contact form.$$,
    'ar', $$واجهة استوديو: معرض غامر ونموذج تواصل مدمج.$$
  )
),
(
  'fitpro',
  'VZ—CASE 005',
  jsonb_build_object('fr', $$FitPro — Coaching sportif$$, 'en', $$FitPro — Sports coaching$$, 'ar', $$FitPro — تدريب رياضي$$),
  jsonb_build_object(
    'fr', $$Concept de plateforme coaching : landing page, programmes et espace membre.$$,
    'en', $$Coaching platform concept: landing page, programs and member area.$$,
    'ar', $$مفهوم منصة تدريب: صفحة هبوط، برامج ومساحة أعضاء.$$
  ),
  'personal',
  ARRAY['landing', 'booking', 'webapp'],
  jsonb_build_array(
    jsonb_build_object('url', '/projects/fitpro.svg', 'label', jsonb_build_object('fr', $$Landing page$$, 'en', $$Landing page$$, 'ar', $$صفحة الهبوط$$)),
    jsonb_build_object('url', '/projects/fitpro-app.svg', 'label', jsonb_build_object('fr', $$Espace membre$$, 'en', $$Member area$$, 'ar', $$مساحة الأعضاء$$))
  ),
  '/projects/fitpro.svg',
  50, true, false, now(),
  ARRAY['Next.js', 'TypeScript', 'PostgreSQL'],
  jsonb_build_array(
    jsonb_build_object('fr', $$Landing page d’acquisition$$, 'en', $$Acquisition landing page$$, 'ar', $$صفحة هبوط للاستقطاب$$),
    jsonb_build_object('fr', $$Présentation des programmes$$, 'en', $$Program presentation$$, 'ar', $$عرض البرامج$$),
    jsonb_build_object('fr', $$Espace membre (séances, suivi)$$, 'en', $$Member area (sessions, tracking)$$, 'ar', $$مساحة أعضاء (حصص ومتابعة)$$),
    jsonb_build_object('fr', $$Parcours mobile pour la réservation$$, 'en', $$Mobile booking flow$$, 'ar', $$مسار حجز على الجوال$$)
  ),
  jsonb_build_object(
    'fr', $$Passer d’une page d’accroche à un espace membre sans perdre le fil.$$,
    'en', $$Go from a pitch page to a member area without losing the thread.$$,
    'ar', $$الانتقال من صفحة جذب إلى مساحة أعضاء دون فقدان الخيط.$$
  ),
  jsonb_build_object(
    'fr', $$Une plateforme lisible : promettre, inscrire, puis suivre — trois états distincts.$$,
    'en', $$A readable platform: promise, sign up, then track — three distinct states.$$,
    'ar', $$منصة مقروءة: وعد، تسجيل، ثم متابعة — ثلاث حالات واضحة.$$
  ),
  jsonb_build_object(
    'fr', $$Landing + app membre, CTA unique, grilles de programmes, suivi simple.$$,
    'en', $$Landing + member app, single CTA, program grids, simple tracking.$$,
    'ar', $$هبوط + تطبيق أعضاء، زر وحيد، شبكات برامج، متابعة بسيطة.$$
  ),
  jsonb_build_object(
    'fr', $$Base pour un produit coaching : acquisition d’un côté, usage de l’autre.$$,
    'en', $$A base for a coaching product: acquisition on one side, usage on the other.$$,
    'ar', $$أساس لمنتج تدريب: استقطاب من جهة واستخدام من أخرى.$$
  ),
  jsonb_build_object('fr', $$FitPro — Plateforme coaching — VORZIX$$, 'en', $$FitPro — Coaching platform — VORZIX$$, 'ar', $$FitPro — منصة تدريب — VORZIX$$),
  jsonb_build_object(
    'fr', $$Concept coaching : landing page, programmes et espace membre.$$,
    'en', $$Coaching concept: landing page, programs and member area.$$,
    'ar', $$مفهوم تدريب: صفحة هبوط وبرامج ومساحة أعضاء.$$
  )
)
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  kind = EXCLUDED.kind,
  business_type_ids = EXCLUDED.business_type_ids,
  images = EXCLUDED.images,
  cover_image = EXCLUDED.cover_image,
  sort_order = EXCLUDED.sort_order,
  published = true,
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

-- ---------------------------------------------------------------------------
-- 5. Liaisons offre ↔ projets + descriptions courtes
-- ---------------------------------------------------------------------------
INSERT INTO public.service_case_studies (service_id, project_id, sort_order, blurb)
SELECT s.id, p.id, v.sort_order, v.blurb::jsonb
FROM (
  VALUES
    ('web', 'quotishop', 10, '{"fr":"Boutique e-commerce trilingue : catalogue, commandes et back-office. Un site marchand conçu pour vendre et rester simple à administrer.","en":"Trilingual e-commerce shop: catalog, orders and back-office. A store built to sell and stay simple to run.","ar":"متجر إلكتروني بثلاث لغات: فهرس وطلبات ولوحة إدارة. موقع بيع مصمم ليبيع ويبقى سهل الإدارة."}'),
    ('web', 'maison-belle', 20, '{"fr":"Maquette de boutique : catalogue, fiche produit et parcours d’achat — la structure d’un site marchand lisible.","en":"Shop mockup: catalog, product page and checkout — the structure of a readable store.","ar":"نموذج متجر: فهرس وبطاقة منتج ومسار شراء — بنية متجر مقروء."}'),
    ('web', 'atelier-lumiere', 30, '{"fr":"Vitrine studio : galerie, rythme visuel et un seul chemin vers le contact.","en":"Studio showcase: gallery, visual rhythm and a single path to contact.","ar":"واجهة استوديو: معرض وإيقاع بصري ومسار واحد نحو التواصل."}'),
    ('backend', 'quotishop', 10, '{"fr":"Commandes, produits, comptes clients et avis — le back-office qui fait tourner la boutique.","en":"Orders, products, customer accounts and reviews — the back-office that runs the shop.","ar":"طلبات ومنتجات وحسابات عملاء وتقييمات — لوحة الإدارة التي تشغّل المتجر."}'),
    ('backend', 'nova', 20, '{"fr":"Tableau de bord analytics : indicateurs, filtres et lecture rapide pour un outil interne.","en":"Analytics dashboard: metrics, filters and fast reading for an internal tool.","ar":"لوحة تحليلات: مؤشرات وفلاتر وقراءة سريعة لأداة داخلية."}'),
    ('backend', 'fitpro', 30, '{"fr":"Espace membre : programmes, suivi et comptes — un outil métier derrière la landing.","en":"Member area: programs, tracking and accounts — the business tool behind the landing page.","ar":"مساحة أعضاء: برامج ومتابعة وحسابات — الأداة المهنية خلف صفحة الهبوط."}'),
    ('design', 'atelier-lumiere', 10, '{"fr":"Direction visuelle calme : galerie, typographie display et légendes — une vitrine sans bruit.","en":"Quiet art direction: gallery, display type and captions — a showcase without noise.","ar":"اتجاه بصري هادئ: معرض وخط عرض وتعليقات — واجهة بلا ضوضاء."}'),
    ('design', 'maison-belle', 20, '{"fr":"Fiches produit et catalogue : hiérarchie, CTA unique, lecture marchande.","en":"Product sheets and catalog: hierarchy, single CTA, commercial reading.","ar":"بطاقات منتج وفهرس: تسلسل وزر وحيد وقراءة تجارية."}'),
    ('design', 'fitpro', 30, '{"fr":"Landing et espace membre : deux états, une même identité, un CTA clair.","en":"Landing and member area: two states, one identity, a clear CTA.","ar":"هبوط ومساحة أعضاء: حالتان وهوية واحدة وزر واضح."}'),
    ('mobile', 'fitpro', 10, '{"fr":"Landing et réservation pensées pour le pouce — programmes et espace membre sur téléphone.","en":"Landing and booking designed for the thumb — programs and member area on phone.","ar":"هبوط وحجز مصممان للإبهام — برامج ومساحة أعضاء على الهاتف."}'),
    ('mobile', 'quotishop', 20, '{"fr":"Parcours boutique sur mobile : catalogue, fiche et panier utilisables d’une main.","en":"Mobile shop flow: catalog, product and cart usable with one hand.","ar":"مسار المتجر على الجوال: فهرس ومنتج وسلة تُستخدم بيد واحدة."}'),
    ('mobile', 'nova', 30, '{"fr":"Dashboard ramené à l’écran étroit : indicateurs essentiels, navigation simplifiée.","en":"Dashboard brought to the narrow screen: essential metrics, simpler navigation.","ar":"لوحة على الشاشة الضيقة: مؤشرات أساسية وتنقل أبسط."}'),
    ('seo', 'atelier-lumiere', 10, '{"fr":"Vitrine structurée : titres, légendes et pages prêtes à être indexées.","en":"Structured showcase: titles, captions and pages ready to be indexed.","ar":"واجهة منظّمة: عناوين وتعليقات وصفحات جاهزة للفهرسة."}'),
    ('seo', 'maison-belle', 20, '{"fr":"Fiches produit et catalogue : une URL claire par objet, des titres qui décrivent l’offre.","en":"Product pages and catalog: one clear URL per item, titles that describe the offer.","ar":"صفحات منتج وفهرس: رابط واضح لكل عنصر وعناوين تصف العرض."}'),
    ('maintenance', 'quotishop', 10, '{"fr":"Boutique déjà en ligne : corrections, contenus et petites évolutions après lancement.","en":"A live shop: fixes, content and small improvements after launch.","ar":"متجر منشور: إصلاحات ومحتوى وتطويرات صغيرة بعد الإطلاق."}'),
    ('maintenance', 'nova', 20, '{"fr":"Outil interne à faire évoluer : indicateurs, listes, et ajustements au fil de l’usage.","en":"An internal tool to evolve: metrics, lists, and adjustments as it is used.","ar":"أداة داخلية للتطوير: مؤشرات وقوائم وتعديلات مع الاستخدام."}')
) AS v(service_slug, project_slug, sort_order, blurb)
JOIN public.services s ON s.slug = v.service_slug
JOIN public.projects p ON p.slug = v.project_slug
ON CONFLICT (service_id, project_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    blurb = EXCLUDED.blurb;

-- ---------------------------------------------------------------------------
-- 6. FAQ liées aux pages détail d’offre
-- ---------------------------------------------------------------------------
INSERT INTO public.faq_services (faq_id, service_id, sort_order)
SELECT f.id, s.id, v.sort_order
FROM (
  VALUES
    ('VZ—Q01', 'web', 10),
    ('VZ—Q02', 'web', 20),
    ('VZ—Q04', 'web', 30),
    ('VZ—Q08', 'web', 40),
    ('VZ—Q01', 'backend', 10),
    ('VZ—Q02', 'backend', 20),
    ('VZ—Q03', 'backend', 30),
    ('VZ—Q08', 'backend', 40),
    ('VZ—Q02', 'design', 10),
    ('VZ—Q05', 'design', 20),
    ('VZ—Q08', 'design', 30),
    ('VZ—Q02', 'mobile', 10),
    ('VZ—Q03', 'mobile', 20),
    ('VZ—Q08', 'mobile', 30),
    ('VZ—Q01', 'seo', 10),
    ('VZ—Q05', 'seo', 20),
    ('VZ—Q08', 'seo', 30),
    ('VZ—Q03', 'maintenance', 10),
    ('VZ—Q06', 'maintenance', 20),
    ('VZ—Q08', 'maintenance', 30)
) AS v(faq_ref, service_slug, sort_order)
JOIN public.faqs f ON f.reference = v.faq_ref
JOIN public.services s ON s.slug = v.service_slug
ON CONFLICT (faq_id, service_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order;

NOTIFY pgrst, 'reload schema';
