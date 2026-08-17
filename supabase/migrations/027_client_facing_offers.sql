-- Offres VORZIX : 5 offres client (sans jargon), plus vrais projets uniquement.
-- Appliquer via : npm run db:migrate

-- ---------------------------------------------------------------------------
-- 1. Retirer les projets d’exemple (maquettes) du site public
-- ---------------------------------------------------------------------------
UPDATE public.projects
SET published = false,
    featured = false
WHERE slug IN ('nova', 'maison-belle', 'atelier-lumiere', 'fitpro');

DELETE FROM public.service_case_studies
WHERE project_id IN (
  SELECT id FROM public.projects
  WHERE slug IN ('nova', 'maison-belle', 'atelier-lumiere', 'fitpro')
);

-- ---------------------------------------------------------------------------
-- 2. Archiver l’offre « mobile » (incluse dans chaque site, pas un produit)
-- ---------------------------------------------------------------------------
UPDATE public.services
SET status = 'archived',
    featured = false,
    sort_order = 900,
    reference = 'VZ—X04'
WHERE slug = 'mobile';

-- Références temporaires pour éviter les collisions d’unicité
UPDATE public.services SET reference = 'TMP-WEB' WHERE slug = 'web';
UPDATE public.services SET reference = 'TMP-APP' WHERE slug IN ('backend', 'application');
UPDATE public.services SET reference = 'TMP-REF' WHERE slug IN ('design', 'refonte');
UPDATE public.services SET reference = 'TMP-SHOP' WHERE slug IN ('seo', 'boutique');
UPDATE public.services SET reference = 'TMP-MAINT' WHERE slug = 'maintenance';

-- ---------------------------------------------------------------------------
-- 3. Cinq offres principales — slugs stables et lisibles
-- ---------------------------------------------------------------------------
UPDATE public.services
SET slug = 'application',
    reference = 'VZ—03'
WHERE slug = 'backend'
  AND NOT EXISTS (SELECT 1 FROM public.services WHERE slug = 'application');

UPDATE public.services
SET slug = 'refonte',
    reference = 'VZ—04'
WHERE slug = 'design'
  AND NOT EXISTS (SELECT 1 FROM public.services WHERE slug = 'refonte');

UPDATE public.services
SET slug = 'boutique',
    reference = 'VZ—02'
WHERE slug = 'seo'
  AND NOT EXISTS (SELECT 1 FROM public.services WHERE slug = 'boutique');

-- VZ—01  Site internet
UPDATE public.services
SET
  slug = 'web',
  reference = 'VZ—01',
  icon = 'globe',
  status = 'published',
  featured = true,
  sort_order = 10,
  inquiry_project_type = 'showcase',
  offer_kind = 'service',
  show_cta_start = true,
  show_cta_buy = false,
  pricing_mode = 'contact',
  title = jsonb_build_object(
    'fr', $$Votre site internet$$,
    'en', $$Your website$$,
    'ar', $$موقعكم على الإنترنت$$
  ),
  short_description = jsonb_build_object(
    'fr', $$Un site clair pour présenter votre activité et recevoir des demandes — aussi lisible sur téléphone que sur ordinateur.$$,
    'en', $$A clear site to present your work and receive inquiries — as readable on a phone as on a computer.$$,
    'ar', $$موقع واضح لعرض نشاطكم واستقبال الطلبات — يُقرأ جيداً على الهاتف كما على الحاسوب.$$
  ),
  description = jsonb_build_object(
    'fr', $$Vous avez une activité. Les gens doivent comprendre qui vous êtes, ce que vous proposez, et comment vous écrire — en quelques secondes. Nous concevons un site internet à votre image : pages essentielles, textes lisibles, formulaire de contact, et un rendu soigné sur téléphone. Le design, l’affichage mobile et les bases pour être trouvé sur Google font partie de cette offre — ce ne sont pas des options à part.$$,
    'en', $$You have a business. People should understand who you are, what you offer, and how to reach you — in a few seconds. We design a website in your image: the essential pages, readable text, a contact form, and a careful look on the phone. Design, mobile display and the basics to be found on Google are part of this offer — not extras.$$,
    'ar', $$لديكم نشاط. على الزائر أن يفهم من أنتم وماذا تقدّمون وكيف يكتب لكم — في ثوان. نصمّم موقعاً يشبهكم: الصفحات الأساسية، نصوص مقروءة، نموذج تواصل، وعرض متقن على الهاتف. التصميم والعرض على الجوال وأساسيات الظهور في البحث جزء من هذا العرض — ليست إضافات.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Indépendants, commerces, cabinets et associations qui veulent un vrai site — pas une page vide ou un modèle générique.$$,
    'en', $$Freelancers, shops, practices and associations who want a real website — not a blank page or a generic template.$$,
    'ar', $$المستقلون والمتاجر والعيادات والجمعيات الذين يريدون موقعاً حقيقياً — لا صفحة فارغة ولا قالباً عاماً.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Les pages utiles (accueil, à propos, contact…)$$, 'en', $$The useful pages (home, about, contact…)$$, 'ar', $$الصفحات المفيدة (الرئيسية، من نحن، تواصل…)$$),
    jsonb_build_object('fr', $$Un design lisible, à votre image$$, 'en', $$A readable design, in your image$$, 'ar', $$تصميم مقروء يشبهكم$$),
    jsonb_build_object('fr', $$Un affichage soigné sur téléphone$$, 'en', $$A careful look on the phone$$, 'ar', $$عرض متقن على الهاتف$$),
    jsonb_build_object('fr', $$Un formulaire pour recevoir les demandes$$, 'en', $$A form to receive inquiries$$, 'ar', $$نموذج لاستقبال الطلبات$$),
    jsonb_build_object('fr', $$La mise en ligne de votre site$$, 'en', $$Putting your site online$$, 'ar', $$نشر موقعكم على الإنترنت$$),
    jsonb_build_object('fr', $$Les bases pour être trouvé sur Google$$, 'en', $$The basics to be found on Google$$, 'ar', $$الأساسيات للظهور في بحث Google$$)
  ),
  cta_label = jsonb_build_object('fr', $$Parler de mon site$$, 'en', $$Talk about my site$$, 'ar', $$لنتحدث عن موقعي$$),
  seo_title = jsonb_build_object(
    'fr', $$Site internet — VORZIX$$,
    'en', $$Website — VORZIX$$,
    'ar', $$موقع على الإنترنت — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Un site clair pour présenter votre activité et recevoir des demandes. Design, téléphone et mise en ligne inclus.$$,
    'en', $$A clear website to present your work and receive inquiries. Design, phone display and go-live included.$$,
    'ar', $$موقع واضح لعرض نشاطكم واستقبال الطلبات. التصميم والجوال والنشر مشمولة.$$
  )
WHERE slug = 'web';

-- VZ—02  Boutique en ligne
UPDATE public.services
SET
  icon = 'shopping-bag',
  status = 'published',
  featured = false,
  sort_order = 20,
  inquiry_project_type = 'ecommerce',
  offer_kind = 'service',
  show_cta_start = true,
  show_cta_buy = false,
  pricing_mode = 'contact',
  title = jsonb_build_object(
    'fr', $$Votre boutique en ligne$$,
    'en', $$Your online shop$$,
    'ar', $$متجركم الإلكتروني$$
  ),
  short_description = jsonb_build_object(
    'fr', $$Vendez vos produits sur internet : fiches claires, panier simple, et un espace pour suivre les commandes.$$,
    'en', $$Sell your products online: clear product pages, a simple cart, and a place to follow orders.$$,
    'ar', $$بيعوا منتجاتكم عبر الإنترنت: صفحات واضحة، سلة بسيطة، ومساحة لمتابعة الطلبات.$$
  ),
  description = jsonb_build_object(
    'fr', $$Vous vendez déjà — en boutique, sur les réseaux, ou de bouche à oreille. Une boutique en ligne permet à vos clients de choisir, payer et suivre leur commande sans vous écrire à chaque fois. Nous construisons un site marchand simple à utiliser pour eux, et simple à gérer pour vous : produits, commandes, et un espace d’administration clair.$$,
    'en', $$You already sell — in a shop, on social media, or by word of mouth. An online shop lets clients choose, pay and follow their order without messaging you every time. We build a store that is simple for them to use, and simple for you to run: products, orders, and a clear admin space.$$,
    'ar', $$أنتم تبيعون أصلاً — في محل أو عبر الشبكات أو بالمعرفة. المتجر الإلكتروني يتيح لعملائكم الاختيار والدفع ومتابعة الطلب دون مراسلتكم في كل مرة. نبني متجراً سهلاً لهم، وسهلاً عليكم إدارته: منتجات وطلبات ومساحة إدارة واضحة.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Artisans, marques et commerces qui veulent vendre en ligne sans un outil trop compliqué.$$,
    'en', $$Makers, brands and shops who want to sell online without an overly complicated tool.$$,
    'ar', $$الحرفيون والعلامات والمتاجر الذين يريدون البيع عبر الإنترنت دون أداة معقّدة.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Fiches produits claires (photos, prix, options)$$, 'en', $$Clear product pages (photos, price, options)$$, 'ar', $$صفحات منتج واضحة (صور وسعر وخيارات)$$),
    jsonb_build_object('fr', $$Un panier et un paiement simples$$, 'en', $$A simple cart and payment$$, 'ar', $$سلة ودفع بسيطان$$),
    jsonb_build_object('fr', $$Un espace pour suivre les commandes$$, 'en', $$A place to follow orders$$, 'ar', $$مساحة لمتابعة الطلبات$$),
    jsonb_build_object('fr', $$Des comptes clients si vous en avez besoin$$, 'en', $$Customer accounts if you need them$$, 'ar', $$حسابات للعملاء إن احتجتم إليها$$),
    jsonb_build_object('fr', $$Un affichage soigné sur téléphone$$, 'en', $$A careful look on the phone$$, 'ar', $$عرض متقن على الهاتف$$),
    jsonb_build_object('fr', $$La mise en ligne de la boutique$$, 'en', $$Putting the shop online$$, 'ar', $$نشر المتجر على الإنترنت$$)
  ),
  cta_label = jsonb_build_object('fr', $$Parler de ma boutique$$, 'en', $$Talk about my shop$$, 'ar', $$لنتحدث عن متجري$$),
  seo_title = jsonb_build_object(
    'fr', $$Boutique en ligne — VORZIX$$,
    'en', $$Online shop — VORZIX$$,
    'ar', $$متجر إلكتروني — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Une boutique en ligne simple : produits, panier, commandes — conçue pour vendre, pas pour impressionner.$$,
    'en', $$A simple online shop: products, cart, orders — built to sell, not to impress.$$,
    'ar', $$متجر إلكتروني بسيط: منتجات وسلة وطلبات — مصمم ليبيع لا ليبهر.$$
  )
WHERE slug = 'boutique';

-- VZ—03  Outil métier
UPDATE public.services
SET
  icon = 'app-window',
  status = 'published',
  featured = false,
  sort_order = 30,
  inquiry_project_type = 'web_app',
  offer_kind = 'service',
  show_cta_start = true,
  show_cta_buy = false,
  pricing_mode = 'contact',
  title = jsonb_build_object(
    'fr', $$Un outil pour votre activité$$,
    'en', $$A tool for your business$$,
    'ar', $$أداة لإدارة نشاطكم$$
  ),
  short_description = jsonb_build_object(
    'fr', $$Un espace pour gérer vos clients, commandes ou votre quotidien — à la place des tableurs et des messages éparpillés.$$,
    'en', $$A place to manage clients, orders or daily work — instead of spreadsheets and scattered messages.$$,
    'ar', $$مساحة لإدارة عملائكم أو طلباتكم أو يومكم — بدل الجداول والرسائل المتفرقة.$$
  ),
  description = jsonb_build_object(
    'fr', $$Quand l’activité grandit, les tableurs et les conversations ne suffisent plus. Nous concevons un outil à vous : listes, fiches, comptes pour votre équipe, et les actions du quotidien (créer une commande, suivre un dossier, envoyer un message). L’objectif n’est pas « une application ». C’est un instrument simple, qui travaille pour vous.$$,
    'en', $$As the work grows, spreadsheets and chat threads are no longer enough. We design a tool that is yours: lists, records, accounts for your team, and the daily actions (create an order, follow a file, send a message). The goal is not “an app”. It is a simple instrument that works for you.$$,
    'ar', $$عندما يكبر النشاط، لا تعود الجداول والمحادثات كافية. نصمّم أداة لكم: قوائم وبطاقات وحسابات لفريقكم، وأعمال اليوم (إنشاء طلب، متابعة ملف، إرسال رسالة). الهدف ليس «تطبيقاً». بل أداة بسيطة تعمل لأجلكم.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Équipes et indépendants qui gèrent trop de choses à la main, et qui ont besoin d’un outil calme plutôt que d’un logiciel générique.$$,
    'en', $$Teams and freelancers who manage too much by hand, and need a quiet tool rather than generic software.$$,
    'ar', $$الفرق والمستقلون الذين يديرون الكثير يدوياً، ويحتاجون أداة هادئة لا برنامجاً عاماً.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Un espace adapté à votre façon de travailler$$, 'en', $$A space that matches how you work$$, 'ar', $$مساحة توافق طريقة عملكم$$),
    jsonb_build_object('fr', $$Des comptes pour vous et, si besoin, votre équipe$$, 'en', $$Accounts for you and, if needed, your team$$, 'ar', $$حسابات لكم ولفريقكم إن لزم$$),
    jsonb_build_object('fr', $$Des listes et fiches claires (clients, dossiers, commandes)$$, 'en', $$Clear lists and records (clients, files, orders)$$, 'ar', $$قوائم وبطاقات واضحة (عملاء وملفات وطلبات)$$),
    jsonb_build_object('fr', $$Les actions du quotidien, sans étapes inutiles$$, 'en', $$Daily actions, without unused steps$$, 'ar', $$أعمال اليوم بلا خطوات زائدة$$),
    jsonb_build_object('fr', $$Un accès sécurisé, réservé aux bonnes personnes$$, 'en', $$Secure access, limited to the right people$$, 'ar', $$وصول آمن لمن يحق لهم$$),
    jsonb_build_object('fr', $$Une prise en main expliquée simplement$$, 'en', $$A simple walkthrough of how to use it$$, 'ar', $$شرح بسيط لكيفية الاستخدام$$)
  ),
  cta_label = jsonb_build_object('fr', $$Parler de mon outil$$, 'en', $$Talk about my tool$$, 'ar', $$لنتحدث عن أداتي$$),
  seo_title = jsonb_build_object(
    'fr', $$Outil pour votre activité — VORZIX$$,
    'en', $$A tool for your business — VORZIX$$,
    'ar', $$أداة لإدارة نشاطكم — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Un outil simple pour gérer clients, commandes ou le quotidien — à la place des tableurs.$$,
    'en', $$A simple tool to manage clients, orders or daily work — instead of spreadsheets.$$,
    'ar', $$أداة بسيطة لإدارة العملاء أو الطلبات أو اليوم — بدل الجداول.$$
  )
WHERE slug = 'application';

-- VZ—04  Moderniser
UPDATE public.services
SET
  icon = 'layers',
  status = 'published',
  featured = false,
  sort_order = 40,
  inquiry_project_type = 'redesign',
  offer_kind = 'service',
  show_cta_start = true,
  show_cta_buy = false,
  pricing_mode = 'contact',
  title = jsonb_build_object(
    'fr', $$Moderniser votre site actuel$$,
    'en', $$Refresh your current site$$,
    'ar', $$تحديث موقعكم الحالي$$
  ),
  short_description = jsonb_build_object(
    'fr', $$Votre site existe déjà, mais il est lent, confus ou dépassé. Nous le remettons à niveau — sans tout jeter si ce n’est pas nécessaire.$$,
    'en', $$You already have a site, but it is slow, confusing or dated. We bring it up to date — without throwing everything away if we do not need to.$$,
    'ar', $$موقعكم موجود، لكنه بطيء أو مشوّش أو قديم. نرتقي به — دون رمي كل شيء إن لم يلزم.$$
  ),
  description = jsonb_build_object(
    'fr', $$Un site ancien peut encore servir — ou bloquer vos clients. Nous regardons d’abord ce que vous avez : ce qui fonctionne, ce qui gêne, ce qu’il faut garder. Ensuite nous clarifions les pages, le design et le parcours, pour que vos visiteurs comprennent enfin quoi faire. Parfois on améliore l’existant. Parfois on repart plus propre. Nous vous le disons clairement avant de commencer.$$,
    'en', $$An old site can still help — or get in your clients’ way. We first look at what you have: what works, what gets in the way, what to keep. Then we clarify the pages, the design and the path, so visitors finally know what to do. Sometimes we improve what exists. Sometimes we start cleaner. We tell you which, before we begin.$$,
    'ar', $$الموقع القديم قد ينفع — أو يعيق عملاءكم. ننظر أولاً إلى ما لديكم: ما يعمل، ما يزعج، وما يُبقى. ثم نوضّح الصفحات والتصميم والمسار ليعرف الزائر ماذا يفعل. أحياناً نحسّن الموجود. وأحياناً نبدأ أنظف. نقول لكم ذلك بوضوح قبل البدء.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Ceux qui ont déjà un site, mais qui ont honte de l’envoyer, ou qui voient que les visiteurs ne contactent plus.$$,
    'en', $$Anyone who already has a site, but is ashamed to send it, or sees that visitors no longer get in touch.$$,
    'ar', $$من لديهم موقع لكنهم يستحون من إرساله، أو يرون أن الزوار لم يعودوا يتواصلون.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Un regard honnête sur le site actuel$$, 'en', $$An honest look at the current site$$, 'ar', $$نظرة صادقة إلى الموقع الحالي$$),
    jsonb_build_object('fr', $$Des pages plus claires, plus faciles à parcourir$$, 'en', $$Clearer pages, easier to scan$$, 'ar', $$صفحات أوضح وأسهل للتصفح$$),
    jsonb_build_object('fr', $$Un design remis à jour$$, 'en', $$An updated look$$, 'ar', $$مظهر محدَّث$$),
    jsonb_build_object('fr', $$Un meilleur affichage sur téléphone$$, 'en', $$A better look on the phone$$, 'ar', $$عرض أفضل على الهاتف$$),
    jsonb_build_object('fr', $$Les textes et boutons pour que l’on vous écrive$$, 'en', $$The copy and buttons so people write to you$$, 'ar', $$النصوص والأزرار كي يكتبوا لكم$$),
    jsonb_build_object('fr', $$La mise en ligne de la nouvelle version$$, 'en', $$Putting the new version online$$, 'ar', $$نشر النسخة الجديدة$$)
  ),
  cta_label = jsonb_build_object('fr', $$Moderniser mon site$$, 'en', $$Refresh my site$$, 'ar', $$لنحدّث موقعي$$),
  seo_title = jsonb_build_object(
    'fr', $$Moderniser votre site — VORZIX$$,
    'en', $$Refresh your site — VORZIX$$,
    'ar', $$تحديث موقعكم — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Votre site existe déjà : nous le rendons plus clair, plus rapide, plus à jour — sans jargon.$$,
    'en', $$You already have a site: we make it clearer, faster, more up to date — with no jargon.$$,
    'ar', $$موقعكم موجود: نجعله أوضح وأسرع وأكثر مواكبة — بلا مصطلحات.$$
  )
WHERE slug = 'refonte';

-- VZ—05  Après la mise en ligne
UPDATE public.services
SET
  reference = 'VZ—05',
  icon = 'wrench',
  status = 'published',
  featured = false,
  sort_order = 50,
  inquiry_project_type = 'other',
  offer_kind = 'service',
  show_cta_start = true,
  show_cta_buy = false,
  pricing_mode = 'contact',
  title = jsonb_build_object(
    'fr', $$Après la mise en ligne$$,
    'en', $$After launch$$,
    'ar', $$بعد إطلاق الموقع$$
  ),
  short_description = jsonb_build_object(
    'fr', $$Le site est en ligne. Nous restons disponibles pour les corrections, les petites évolutions et les conseils.$$,
    'en', $$The site is live. We stay available for fixes, small changes and advice.$$,
    'ar', $$الموقع منشور. نبقى متاحين للإصلاحات والتعديلات الصغيرة والنصائح.$$
  ),
  description = jsonb_build_object(
    'fr', $$Un site n’est pas fini le jour où il est mis en ligne. Un texte à changer, un bouton qui coince, une page à ajouter : nous restons un interlocuteur clair. Pas un contrat flou. Un suivi simple, pour que votre site continue de servir votre activité.$$,
    'en', $$A site is not finished the day it goes live. A line to change, a button that sticks, a page to add: we stay a clear contact. Not a vague contract. Simple follow-up, so your site keeps serving your work.$$,
    'ar', $$الموقع لا ينتهي يوم نشره. سطر للتعديل، زر يعلق، صفحة تُضاف: نبقى جهة واضحة. لا عقداً غامضاً. متابعة بسيطة كي يبقى موقعكم في خدمة نشاطكم.$$
  ),
  ideal_for = jsonb_build_object(
    'fr', $$Ceux dont le site vient d’être livré, ou qui ont déjà un site VORZIX et veulent un suivi sans surprise.$$,
    'en', $$Anyone whose site was just delivered, or who already has a VORZIX site and wants follow-up without surprises.$$,
    'ar', $$من سُلّم موقعهم للتو، أو لديهم موقع VORZIX ويريدون متابعة بلا مفاجآت.$$
  ),
  included_features = jsonb_build_array(
    jsonb_build_object('fr', $$Corrections quand quelque chose ne va pas$$, 'en', $$Fixes when something is wrong$$, 'ar', $$إصلاحات عندما لا يسير أمر ما$$),
    jsonb_build_object('fr', $$Petites évolutions (textes, pages, détails)$$, 'en', $$Small changes (copy, pages, details)$$, 'ar', $$تعديلات صغيرة (نصوص وصفحات وتفاصيل)$$),
    jsonb_build_object('fr', $$Conseils sur ce qu’il est utile de faire ensuite$$, 'en', $$Advice on what is useful to do next$$, 'ar', $$نصائح عما ينفع فعله لاحقاً$$),
    jsonb_build_object('fr', $$Un point de contact unique$$, 'en', $$A single point of contact$$, 'ar', $$جهة تواصل واحدة$$),
    jsonb_build_object('fr', $$Un compte-rendu simple de ce qui a été fait$$, 'en', $$A simple note of what was done$$, 'ar', $$محضر بسيط بما أُنجز$$)
  ),
  cta_label = jsonb_build_object('fr', $$Prévoir le suivi$$, 'en', $$Plan the follow-up$$, 'ar', $$لنخطط للمتابعة$$),
  seo_title = jsonb_build_object(
    'fr', $$Après la mise en ligne — VORZIX$$,
    'en', $$After launch — VORZIX$$,
    'ar', $$بعد إطلاق الموقع — VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Corrections, petites évolutions et conseils après la mise en ligne — un suivi simple.$$,
    'en', $$Fixes, small changes and advice after launch — simple follow-up.$$,
    'ar', $$إصلاحات وتعديلات صغيرة ونصائح بعد الإطلاق — متابعة بسيطة.$$
  )
WHERE slug = 'maintenance';

-- ---------------------------------------------------------------------------
-- 4. Un seul projet réel lié : Quotishop → boutique en ligne
-- ---------------------------------------------------------------------------
DELETE FROM public.service_case_studies;

INSERT INTO public.service_case_studies (service_id, project_id, sort_order, blurb)
SELECT s.id, p.id, 10, jsonb_build_object(
  'fr', $$Boutique déjà en ligne : produits, commandes et espace d’administration — un vrai site marchand, pas une maquette.$$,
  'en', $$A live shop: products, orders and an admin space — a real store, not a mockup.$$,
  'ar', $$متجر منشور فعلاً: منتجات وطلبات ومساحة إدارة — موقع بيع حقيقي لا نموذجاً.$$
)
FROM public.services s
JOIN public.projects p ON p.slug = 'quotishop'
WHERE s.slug = 'boutique'
ON CONFLICT (service_id, project_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    blurb = EXCLUDED.blurb;

-- ---------------------------------------------------------------------------
-- 5. FAQ : rattacher aux nouveaux slugs
-- ---------------------------------------------------------------------------
DELETE FROM public.faq_services;

INSERT INTO public.faq_services (faq_id, service_id, sort_order)
SELECT f.id, s.id, v.sort_order
FROM (
  VALUES
    ('VZ—Q01', 'web', 10),
    ('VZ—Q02', 'web', 20),
    ('VZ—Q04', 'web', 30),
    ('VZ—Q08', 'web', 40),
    ('VZ—Q01', 'boutique', 10),
    ('VZ—Q02', 'boutique', 20),
    ('VZ—Q03', 'boutique', 30),
    ('VZ—Q08', 'boutique', 40),
    ('VZ—Q01', 'application', 10),
    ('VZ—Q02', 'application', 20),
    ('VZ—Q03', 'application', 30),
    ('VZ—Q08', 'application', 40),
    ('VZ—Q02', 'refonte', 10),
    ('VZ—Q05', 'refonte', 20),
    ('VZ—Q08', 'refonte', 30),
    ('VZ—Q03', 'maintenance', 10),
    ('VZ—Q06', 'maintenance', 20),
    ('VZ—Q08', 'maintenance', 30)
) AS v(faq_ref, service_slug, sort_order)
JOIN public.faqs f ON f.reference = v.faq_ref
JOIN public.services s ON s.slug = v.service_slug
ON CONFLICT (faq_id, service_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order;

NOTIFY pgrst, 'reload schema';
