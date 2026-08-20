-- Quotishop : déploiement technique inclus dans le prix + services externes à la charge du client.
-- Ciblé : slug = quotishop. Réversible : 043_quotishop_listing_scope.sql

UPDATE public.projects
SET
  solution = jsonb_build_object(
    'fr', $$Une boutique qui marche sur téléphone et ordinateur, simple à gérer au quotidien. VORZIX adapte l’identité, les rayons et les contenus à votre marque, puis prend en charge la mise en ligne technique : analyse de vos besoins, recommandation d’hébergement, configuration et déploiement de Quotishop.$$,
    'en', $$A shop that works on phone and desktop, simple to run day to day. VORZIX adapts identity, sections and content to your brand, then handles technical go-live: needs review, hosting recommendation, configuration and Quotishop deployment.$$,
    'ar', $$متجر يعمل على الهاتف والحاسوب، سهل الإدارة يومياً. VORZIX تكيّف الهوية والأقسام والمحتوى مع علامتك، ثم تتولى الإطلاق التقني: تحليل الاحتياجات، التوصية بالاستضافة، الإعداد ونشر Quotishop.$$
  ),
  result = jsonb_build_object(
    'fr', $$Une boutique en ligne déployée et prête pour la première commande — avec un accompagnement technique complet pour la mettre en ligne, sans modèle vide ni projet en suspens.$$,
    'en', $$A deployed online shop, ready for the first order — with full technical support to go live, not an empty template or a stalled project.$$,
    'ar', $$متجر إلكتروني منشور وجاهز لأول طلب — مع مرافقة تقنية كاملة للإطلاق، لا قالب فارغ ولا مشروع معلّق.$$
  ),
  listing_intent = jsonb_build_object(
    'fr', $$Les 600 € comprennent la remise du code source complet de la boutique, sa personnalisation et sa mise en ligne technique. Vous utilisez et modifiez votre copie pour votre magasin ; VORZIX conserve le droit de réutiliser, développer et vendre la base technique à d’autres clients.

Le prix inclut la personnalisation du nom, des couleurs, des polices, de l’identité visuelle, du contenu et des pages convenues avant le début du travail.

Délai de personnalisation et de mise en ligne : 7 à 14 jours, selon le contenu et les ajustements demandés.

La mise en ligne technique est incluse dans le prix : analyse de vos besoins, recommandation d’un hébergement et d’une infrastructure adaptés à votre trafic, configuration de l’hébergement, de la base de données, du stockage des images, du nom de domaine et des services nécessaires, déploiement de Quotishop et vérification du bon fonctionnement. Vous n’avez pas à choisir seul votre hébergement — nous recommandons les solutions adaptées et réalisons toute la configuration. Les services externes (nom de domaine, hébergement, base de données payante, stockage, e-mails et autres services tiers) restent au nom et à la charge du client ; les comptes et abonnements restent les vôtres.

La saisie des produits est à la charge du client.

Après la mise en ligne, un mois de corrections et d’ajustements visuels simples est offert. Toute nouvelle fonctionnalité ou page supplémentaire fera l’objet d’un devis séparé.$$,
    'en', $$The €600 includes delivery of the shop’s full source code, its customisation and full technical go-live. You may use and modify your copy for your store; VORZIX retains the right to reuse, develop and sell the technical base to other clients.

The price covers customising the name, colours, fonts, visual identity, content and the pages agreed before work starts.

Customisation and launch: 7 to 14 days, depending on the content and requested changes.

Technical go-live is included in the price: we analyse your shop’s needs, recommend hosting and infrastructure suited to your traffic, configure hosting, the database, image storage, your domain and the services the shop needs, deploy Quotishop and verify everything works. You do not have to choose hosting on your own — we recommend suitable options and handle the full setup. External services (domain name, hosting, paid database plans, storage, email and other third-party services) remain in the client’s name and at the client’s expense; accounts and subscriptions stay theirs.

Entering products is the client’s responsibility.

After launch, one month of simple visual adjustments is included. Any new feature or extra page requires a separate quote.$$,
    'ar', $$يشمل سعر 600€ تسليم الكود المصدري الكامل للمتجر، وتخصيصه، والإطلاق التقني الكامل. يستطيع الزبون استعمال نسخته وتعديلها لمتجره، مع احتفاظ VORZIX بحق إعادة استعمال القاعدة التقنية وتطويرها وبيعها لزبائن آخرين.

يشمل السعر تخصيص الاسم والألوان والخطوط والهوية البصرية والمحتوى والصفحات المتفق عليها قبل بدء العمل.

مدة التخصيص والإطلاق: من 7 إلى 14 يومًا، حسب المحتوى والتعديلات المطلوبة.

الإطلاق التقني مشمول في السعر: نحلّل احتياجات متجرك، نوصي باستضافة وبنية مناسبة لحركة المرور، نُعدّ الاستضافة وقاعدة البيانات وتخزين الصور واسم النطاق والخدمات اللازمة، ننشر Quotishop ونتحقق من عمله. لا تحتاج لاختيار الاستضافة وحدك — نوصي بالحلول المناسبة ونجري كل الإعداد. تبقى الخدمات الخارجية (اسم النطاق، الاستضافة، قاعدة البيانات المدفوعة، التخزين، البريد الإلكتروني وغيرها) باسم الزبون وعلى نفقته؛ الحسابات والاشتراكات تبقى له.

إدخال المنتجات مسؤولية الزبون.

بعد إطلاق المتجر، تحصلون على شهر من التصحيحات والتعديلات البصرية البسيطة دون مقابل. أما إضافة وظائف أو صفحات جديدة فتُحسب بشكل منفصل حسب الطلب.$$
  ),
  features = jsonb_build_array(
    jsonb_build_object(
      'fr', $$Fiches produits claires$$,
      'en', $$Clear product pages$$,
      'ar', $$صفحات منتجات واضحة$$
    ),
    jsonb_build_object(
      'fr', $$Panier et passage de commande$$,
      'en', $$Cart and checkout$$,
      'ar', $$سلة وإتمام الطلب$$
    ),
    jsonb_build_object(
      'fr', $$Suivi des commandes et des factures$$,
      'en', $$Order and invoice tracking$$,
      'ar', $$متابعة الطلبات والفواتير$$
    ),
    jsonb_build_object(
      'fr', $$Comptes clients et avis$$,
      'en', $$Customer accounts and reviews$$,
      'ar', $$حسابات الزبائن وتقييماتهم$$
    ),
    jsonb_build_object(
      'fr', $$Français, anglais et arabe$$,
      'en', $$French, English and Arabic$$,
      'ar', $$الفرنسية والإنجليزية والعربية$$
    ),
    jsonb_build_object(
      'fr', $$Identité visuelle : nom, couleurs, polices et pages convenus avant le travail$$,
      'en', $$Visual identity: name, colours, fonts and pages agreed before work starts$$,
      'ar', $$هوية بصرية: الاسم والألوان والخطوط والصفحات المتفق عليها قبل بدء العمل$$
    ),
    jsonb_build_object(
      'fr', $$Code source complet remis$$,
      'en', $$Full source code delivered$$,
      'ar', $$تسليم الكود المصدري الكامل$$
    ),
    jsonb_build_object(
      'fr', $$Mise en ligne technique incluse : hébergement, base de données, domaine et déploiement$$,
      'en', $$Full technical go-live included: hosting, database, domain and deployment$$,
      'ar', $$إطلاق تقني مشمول: استضافة، قاعدة بيانات، نطاق ونشر$$
    ),
    jsonb_build_object(
      'fr', $$Personnalisation en 7 à 14 jours$$,
      'en', $$Customisation in 7 to 14 days$$,
      'ar', $$تخصيص خلال 7 إلى 14 يومًا$$
    ),
    jsonb_build_object(
      'fr', $$Saisie du catalogue produits à votre charge$$,
      'en', $$Product catalogue entry is your responsibility$$,
      'ar', $$إدخال المنتجات مسؤولية الزبون$$
    )
  ),
  seo_description = jsonb_build_object(
    'fr', $$Boutique en ligne prête, 600 € : trois langues, personnalisation et mise en ligne technique incluse (hébergement, domaine, déploiement). Un mois de suivi visuel.$$,
    'en', $$Ready online shop, €600: three languages, customisation and full technical go-live included (hosting, domain, deployment). One month of visual follow-up.$$,
    'ar', $$متجر إلكتروني جاهز بـ 600 €: ثلاث لغات، تخصيص وإطلاق تقني مشمول (استضافة، نطاق، نشر). شهر متابعة بصرية.$$
  ),
  updated_at = now()
WHERE slug = 'quotishop'
  AND listing_price_cents = 60000;

NOTIFY pgrst, 'reload schema';
