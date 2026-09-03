-- Quotishop : UPSERT du projet à vendre (absent si jamais créé via l’admin).
-- Les migrations 030–051 ne faisaient que UPDATE — sans ligne existante, rien n’apparaissait.
-- Idempotent : UPSERT sur slug. Appliquer via : npm run db:migrate

INSERT INTO public.projects (
  slug, reference, title, description, kind, business_type_ids, images, cover_image,
  link, sort_order, published, featured, published_at, technologies, features,
  client_need, objective, solution, result, seo_title, seo_description,
  listing_price_cents, listing_intent, sale_cta_mode, sale_cta_label, sale_cta_channels
)
SELECT
  'quotishop',
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
    'fr', $$Quotishop$$,
    'en', $$Quotishop$$,
    'ar', $$Quotishop$$
  ),
  jsonb_build_object(
    'fr', $$Une boutique en ligne déjà prête, en trois langues, à votre nom et vos couleurs — sans tout construire depuis zéro.$$,
    'en', $$A ready online shop, in three languages, with your name and colors — without building from scratch.$$,
    'ar', $$متجر إلكتروني جاهز، بثلاث لغات، يحمل اسمك وألوانك — دون البناء من الصفر.$$
  ),
  'for_sale',
  ARRAY['ecommerce'],
  '[]'::jsonb,
  NULL,
  'https://quotishop-five.vercel.app/',
  10, true, true, COALESCE(existing.published_at, now()),
  ARRAY[]::text[],
  jsonb_build_array(
    jsonb_build_object('fr', $$Fiches produits claires$$, 'en', $$Clear product pages$$, 'ar', $$صفحات منتجات واضحة$$),
    jsonb_build_object('fr', $$Panier et passage de commande$$, 'en', $$Cart and checkout$$, 'ar', $$سلة وإتمام الطلب$$),
    jsonb_build_object('fr', $$Suivi des commandes et des factures$$, 'en', $$Order and invoice tracking$$, 'ar', $$متابعة الطلبات والفواتير$$),
    jsonb_build_object('fr', $$Comptes clients et avis$$, 'en', $$Customer accounts and reviews$$, 'ar', $$حسابات الزبائن وتقييماتهم$$),
    jsonb_build_object(
      'fr', $$Back-office complet — produits, commandes, clients et avis depuis un seul endroit$$,
      'en', $$Full admin dashboard — products, orders, customers and reviews in one place$$,
      'ar', $$لوحة إدارة كاملة — إدارة المنتجات والطلبات والعملاء والتقييمات من مكان واحد$$
    ),
    jsonb_build_object('fr', $$Français, anglais et arabe$$, 'en', $$French, English and Arabic$$, 'ar', $$الفرنسية والإنجليزية والعربية$$),
    jsonb_build_object(
      'fr', $$Identité visuelle : nom, couleurs, polices et pages convenus avant le travail$$,
      'en', $$Visual identity: name, colours, fonts and pages agreed before work starts$$,
      'ar', $$هوية بصرية: الاسم والألوان والخطوط والصفحات المتفق عليها قبل بدء العمل$$
    ),
    jsonb_build_object('fr', $$Code source complet de votre copie$$, 'en', $$Complete source code of your copy$$, 'ar', $$الكود المصدري الكامل لنسختك$$),
    jsonb_build_object(
      'fr', $$Ajout et configuration d'un moyen de paiement inclus dans les 600 €$$,
      'en', $$Payment method setup included in the €600$$,
      'ar', $$إضافة وإعداد وسيلة دفع مشمولان في 600€$$
    ),
    jsonb_build_object(
      'fr', $$Préparation, déploiement technique et sauvegarde adaptée à l'hébergement — inclus dans les 600 €$$,
      'en', $$Technical preparation, deployment and hosting-suited backup setup — included in the €600$$,
      'ar', $$إعداد ونشر تقني ونسخ احتياطي مناسب للاستضافة — مشمولان في 600€$$
    ),
    jsonb_build_object('fr', $$Personnalisation en 7 à 14 jours$$, 'en', $$Customisation in 7 to 14 days$$, 'ar', $$تخصيص خلال 7 إلى 14 يومًا$$),
    jsonb_build_object(
      'fr', $$Saisie du catalogue produits à votre charge$$,
      'en', $$Product catalogue entry is your responsibility$$,
      'ar', $$إدخال المنتجات مسؤولية الزبون$$
    )
  ),
  jsonb_build_object(
    'fr', $$Ouvrir une vraie boutique : montrer les produits, recevoir les commandes, suivre les ventes — et gérer le tout depuis un back-office clair, sans jargon technique.$$,
    'en', $$Open a real shop: show products, take orders, follow sales — and run everything from a clear admin dashboard, with no technical jargon.$$,
    'ar', $$فتح متجر حقيقي: عرض المنتجات، استقبال الطلبات، متابعة المبيعات — وإدارته كلّه من لوحة إدارة واضحة، بلا مصطلحات تقنية.$$
  ),
  jsonb_build_object(
    'fr', $$Pour démarrer, nous avons besoin de : le nom de votre boutique, votre logo si vous en avez un, les couleurs souhaitées, vos coordonnées de contact, et votre nom de domaine si vous en possédez déjà un.$$,
    'en', $$To get started, we need: your shop name, your logo if you have one, your preferred colours, your contact details, and your domain name if you already own one.$$,
    'ar', $$للبدء نحتاج منك: اسم المتجر، الشعار إن وجد، الألوان المرغوبة، بيانات التواصل، والنطاق إن كان لديك واحد.$$
  ),
  jsonb_build_object(
    'fr', $$Une boutique qui marche sur téléphone et ordinateur, avec un back-office complet pour gérer produits, commandes, clients et avis depuis un seul endroit. VORZIX adapte l'identité, les rayons et les contenus à votre marque — vous recevez le code source complet de votre copie.$$,
    'en', $$A shop that works on phone and desktop, with a full admin dashboard to manage products, orders, customers and reviews from one place. VORZIX adapts identity, sections and content to your brand — you receive the complete source code of your copy.$$,
    'ar', $$متجر يعمل على الهاتف والحاسوب، مع لوحة إدارة كاملة لإدارة المنتجات والطلبات والعملاء والتقييمات من مكان واحد. VORZIX تكيّف الهوية والأقسام والمحتوى مع علامتك — وتستلم الكود المصدري الكامل لنسختك.$$
  ),
  jsonb_build_object(
    'fr', $$Une boutique en ligne, prête pour la première commande — ni modèle vide, ni projet en suspens.$$,
    'en', $$A live shop, ready for the first order — not an empty template, not a stalled project.$$,
    'ar', $$متجر منشور، جاهز لأول طلب — لا قالب فارغ، ولا مشروع معلّق.$$
  ),
  jsonb_build_object(
    'fr', $$Quotishop — boutique en ligne à vendre | VORZIX$$,
    'en', $$Quotishop — online shop for sale | VORZIX$$,
    'ar', $$Quotishop — متجر إلكتروني للبيع | VORZIX$$
  ),
  jsonb_build_object(
    'fr', $$Boutique en ligne prête, 600 € : trois langues, votre nom et vos couleurs. Adaptation, mise en ligne, un mois de suivi.$$,
    'en', $$Ready online shop, €600: three languages, your name and colors. Adaptation, go-live, one month of follow-up.$$,
    'ar', $$متجر إلكتروني جاهز بـ 600 €: ثلاث لغات، اسمك وألوانك. تكييف ونشر وشهر متابعة.$$
  ),
  60000,
  jsonb_build_object(
    'fr', $$Code source & droits d'utilisation

Le prix de 600 € comprend la livraison du code source complet de votre version de la boutique, ainsi que sa personnalisation et sa préparation au déploiement.

Vous pouvez utiliser, héberger et modifier votre copie pour les besoins de votre boutique.

L'achat ne transfère toutefois pas les droits exclusifs sur Quotishop : la base technique ne peut pas être revendue, redistribuée ou proposée comme produit ou modèle indépendant.

VORZIX conserve les droits sur la base technique de Quotishop et peut continuer à l'utiliser, la développer, la personnaliser et la proposer à d'autres clients.

Le prix inclut la personnalisation du nom, des couleurs, des polices, de l'identité visuelle, du contenu et des pages convenues avant le début du travail.

Délai de personnalisation et de mise en ligne : 7 à 14 jours, selon le contenu et les ajustements demandés.

Moyen de paiement

Nous pouvons ajouter et configurer un moyen de paiement sur votre boutique, sans supplément de notre part — c'est inclus dans les 600 €. Les éventuels frais du prestataire de paiement restent à votre charge.

Sauvegardes

Nous mettons en place un système de sauvegarde adapté à l'hébergement retenu, afin de faciliter la restauration des données de la boutique en cas de problème. La configuration initiale est incluse dans les 600 € ; les éventuels frais de stockage ou de service de sauvegarde restent à votre charge.

La saisie des produits est à la charge du client.

Après la mise en ligne, un mois de corrections et d'ajustements visuels simples est offert. Toute nouvelle fonctionnalité ou page supplémentaire fera l'objet d'un devis séparé.$$,
    'en', $$Source code & usage rights

The €600 price includes the complete source code of your version of the store, as well as its customization and preparation for deployment.

You may use, host and modify your copy according to the needs of your store.

However, the purchase does not transfer exclusive rights to Quotishop. The technical foundation may not be resold, redistributed or offered as a standalone product or template.

VORZIX retains the rights to Quotishop's technical foundation and may continue to reuse, develop, customize and offer it to other clients.

The price covers customising the name, colours, fonts, visual identity, content and the pages agreed before work starts.

Customisation and launch: 7 to 14 days, depending on the content and requested changes.

Payment method

We can add and configure a payment method on your store at no extra charge from us — it is included in the €600. Any payment provider fees remain the client's responsibility.

Backups

We set up a backup system suited to the chosen hosting, to help restore your store data if something goes wrong. The initial setup is included in the €600; any storage or backup service fees remain the client's responsibility.

Entering products is the client's responsibility.

After launch, one month of simple visual adjustments is included. Any new feature or extra page requires a separate quote.$$,
    'ar', $$الكود المصدري وحقوق الاستخدام

يشمل سعر 600€ تسليم الكود المصدري الكامل لنسخة متجرك، بالإضافة إلى تخصيصها وإعدادها للنشر.

يمكنك استخدام نسختك واستضافتها وتعديلها بما يتناسب مع احتياجات متجرك.

لكن الشراء لا ينقل الحقوق الحصرية في Quotishop، ولا يجوز إعادة بيع القاعدة التقنية أو توزيعها أو تقديمها كمنتج أو قالب مستقل.

تحتفظ VORZIX بحقوق القاعدة التقنية لـQuotishop، وبحق إعادة استخدامها وتطويرها وتخصيصها وتقديمها لعملاء آخرين.

يشمل السعر تخصيص الاسم والألوان والخطوط والهوية البصرية والمحتوى والصفحات المتفق عليها قبل بدء العمل.

مدة التخصيص والإطلاق: من 7 إلى 14 يومًا، حسب المحتوى والتعديلات المطلوبة.

وسيلة الدفع

يمكننا إضافة وسيلة دفع وإعدادها على متجرك دون تكلفة إضافية من طرفنا — وهذا مشمول في 600€. أما رسوم مزود الدفع المحتملة فتبقى على عاتق العميل.

النسخ الاحتياطية

نُعدّ نظام نسخ احتياطي مناسبًا للاستضافة المختارة، للمساعدة على استعادة بيانات المتجر في حالة حدوث مشكلة. الإعداد الأولي مشمول في 600€؛ أما تكاليف التخزين أو خدمة النسخ الاحتياطي فتبقى على عاتق العميل.

إدخال المنتجات مسؤولية الزبون.

بعد إطلاق المتجر، تحصلون على شهر من التصحيحات والتعديلات البصرية البسيطة دون مقابل. أما إضافة وظائف أو صفحات جديدة فتُحسب بشكل منفصل حسب الطلب.$$
  ),
  'contacts',
  jsonb_build_object(
    'fr', $$Je veux un projet similaire$$,
    'en', $$I want a similar project$$,
    'ar', $$أريد مشروعًا مشابهًا$$
  ),
  ARRAY['whatsapp', 'email', 'discord', 'instagram', 'tiktok']
FROM (SELECT 1) AS _
LEFT JOIN public.projects existing ON existing.slug = 'quotishop'
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  kind = 'for_sale',
  business_type_ids = EXCLUDED.business_type_ids,
  images = CASE
    WHEN jsonb_array_length(COALESCE(public.projects.images, '[]'::jsonb)) > 0
      THEN public.projects.images
    ELSE EXCLUDED.images
  END,
  cover_image = COALESCE(public.projects.cover_image, EXCLUDED.cover_image),
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
  listing_price_cents = EXCLUDED.listing_price_cents,
  listing_intent = EXCLUDED.listing_intent,
  sale_cta_mode = EXCLUDED.sale_cta_mode,
  sale_cta_label = EXCLUDED.sale_cta_label,
  sale_cta_channels = EXCLUDED.sale_cta_channels,
  reference = COALESCE(public.projects.reference, EXCLUDED.reference);

DELETE FROM public.service_case_studies scs
USING public.projects p, public.services s
WHERE scs.project_id = p.id
  AND scs.service_id = s.id
  AND p.slug = 'quotishop'
  AND s.slug <> 'ecommerce';

INSERT INTO public.service_case_studies (service_id, project_id, sort_order, blurb)
SELECT s.id, p.id, 10, jsonb_build_object(
  'fr', $$Boutique en ligne : catalogue, panier, commandes et paiement — déjà publiée.$$,
  'en', $$Online shop: catalog, cart, orders and payment — already live.$$,
  'ar', $$متجر إلكتروني: فهرس وسلة وطلبات ودفع — منشور فعلاً.$$
)
FROM public.services s
JOIN public.projects p ON p.slug = 'quotishop'
WHERE s.slug = 'ecommerce'
ON CONFLICT (service_id, project_id) DO UPDATE
SET sort_order = EXCLUDED.sort_order,
    blurb = EXCLUDED.blurb;

NOTIFY pgrst, 'reload schema';
