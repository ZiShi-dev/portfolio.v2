-- Quotishop : code source & droits, lancement inclus, services externes au client.
-- Ciblé : slug = quotishop. Réversible : 045_quotishop_launch_deployment.sql

UPDATE public.projects
SET
  solution = jsonb_build_object(
    'fr', $$Une boutique qui marche sur téléphone et ordinateur, simple à gérer au quotidien. VORZIX adapte l’identité, les rayons et les contenus à votre marque — vous recevez le code source complet de votre copie.$$,
    'en', $$A shop that works on phone and desktop, simple to run day to day. VORZIX adapts identity, sections and content to your brand — you receive the complete source code of your copy.$$,
    'ar', $$متجر يعمل على الهاتف والحاسوب، سهل الإدارة يومياً. VORZIX تكيّف الهوية والأقسام والمحتوى مع علامتك — وتستلم الكود المصدري الكامل لنسختك.$$
  ),
  result = jsonb_build_object(
    'fr', $$Une boutique en ligne déployée et prête pour la première commande — code source, personnalisation convenue et accompagnement technique pour la mettre en ligne, sans modèle vide ni projet en suspens.$$,
    'en', $$A deployed online shop, ready for the first order — source code, agreed customisation and technical support to go live, not an empty template or a stalled project.$$,
    'ar', $$متجر إلكتروني منشور وجاهز لأول طلب — مع الكود المصدري والتخصيص المتفق عليه ومرافقة تقنية للإطلاق، لا قالب فارغ ولا مشروع معلّق.$$
  ),
  listing_intent = jsonb_build_object(
    'fr', $$Code source & droits d'utilisation — Le prix de 600 € comprend la livraison du code source complet de votre version de la boutique, ainsi que sa personnalisation et sa préparation au déploiement. Vous pouvez utiliser, héberger et modifier votre copie pour les besoins de votre boutique. L'achat ne transfère toutefois pas les droits exclusifs sur Quotishop : la base technique ne peut pas être revendue, redistribuée ou proposée comme produit ou modèle indépendant. VORZIX conserve les droits sur la base technique de Quotishop et peut continuer à l'utiliser, la développer, la personnaliser et la proposer à d'autres clients.

Le prix inclut la personnalisation du nom, des couleurs, des polices, de l'identité visuelle, du contenu et des pages convenues avant le début du travail.

Délai de personnalisation et de mise en ligne : 7 à 14 jours, selon le contenu et les ajustements demandés.

La mise en ligne technique est incluse dans les 600 € : analyse de vos besoins, estimation de l'infrastructure selon votre activité et votre trafic, recommandation d'une solution d'hébergement adaptée, configuration de l'hébergement, de la base de données, du stockage des images et fichiers, des services d'e-mail, connexion du nom de domaine, variables d'environnement, déploiement de Quotishop et vérification du bon fonctionnement. Vous n'avez pas à choisir seul votre infrastructure — nous recommandons les solutions adaptées à votre boutique.

La saisie des produits est à la charge du client.

Après la mise en ligne, un mois de corrections et d'ajustements visuels simples est offert. Toute nouvelle fonctionnalité ou page supplémentaire fera l'objet d'un devis séparé.$$,
    'en', $$Source code & usage rights — The €600 price includes the complete source code of your version of the store, as well as its customization and preparation for deployment. You may use, host and modify your copy according to the needs of your store. However, the purchase does not transfer exclusive rights to Quotishop. The technical foundation may not be resold, redistributed or offered as a standalone product or template. VORZIX retains the rights to Quotishop's technical foundation and may continue to reuse, develop, customize and offer it to other clients.

The price covers customising the name, colours, fonts, visual identity, content and the pages agreed before work starts.

Customisation and launch: 7 to 14 days, depending on the content and requested changes.

Technical go-live is included in the €600: we analyse your shop's needs, estimate the infrastructure required for your activity and traffic, recommend a suitable hosting solution, configure hosting, the database, image and file storage, email services, connect your domain name, set environment variables, deploy Quotishop and verify the site works correctly. You do not need to choose infrastructure on your own — we recommend solutions suited to your shop.

Entering products is the client's responsibility.

After launch, one month of simple visual adjustments is included. Any new feature or extra page requires a separate quote.$$,
    'ar', $$الكود المصدري وحقوق الاستخدام — يشمل سعر 600€ تسليم الكود المصدري الكامل لنسخة متجرك، بالإضافة إلى تخصيصها وإعدادها للنشر. يمكنك استخدام نسختك واستضافتها وتعديلها بما يتناسب مع احتياجات متجرك. لكن الشراء لا ينقل الحقوق الحصرية في Quotishop، ولا يجوز إعادة بيع القاعدة التقنية أو توزيعها أو تقديمها كمنتج أو قالب مستقل. تحتفظ VORZIX بحقوق القاعدة التقنية لـQuotishop، وبحق إعادة استخدامها وتطويرها وتخصيصها وتقديمها لعملاء آخرين.

يشمل السعر تخصيص الاسم والألوان والخطوط والهوية البصرية والمحتوى والصفحات المتفق عليها قبل بدء العمل.

مدة التخصيص والإطلاق: من 7 إلى 14 يومًا، حسب المحتوى والتعديلات المطلوبة.

الإطلاق التقني مشمول في 600€: نحلّل احتياجات متجرك، نقدّر البنية التحتية اللازمة حسب نشاطك وحركة المرور، نوصي بحل استضافة مناسب، نُعدّ الاستضافة وقاعدة البيانات وتخزين الصور والملفات وخدمات البريد، نربط اسم النطاق، نضبط متغيرات البيئة، ننشر Quotishop ونتحقق من عمل الموقع. لا تحتاج لاختيار البنية التحتية وحدك — نوصي بالحلول المناسبة لمتجرك.

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
      'fr', $$Code source complet de votre copie$$,
      'en', $$Complete source code of your copy$$,
      'ar', $$الكود المصدري الكامل لنسختك$$
    ),
    jsonb_build_object(
      'fr', $$Préparation et déploiement technique inclus dans les 600 €$$,
      'en', $$Technical preparation and deployment included in the €600$$,
      'ar', $$إعداد ونشر تقني مشمولان في 600€$$
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
    'fr', $$Quotishop — boutique en ligne, 600 € : code source complet, personnalisation et déploiement technique inclus. Un mois de suivi visuel.$$,
    'en', $$Quotishop — online shop, €600: complete source code, customisation and technical deployment included. One month of visual follow-up.$$,
    'ar', $$Quotishop — متجر إلكتروني بـ 600€: كود مصدري كامل، تخصيص ونشر تقني مشمول. شهر متابعة بصرية.$$
  ),
  updated_at = now()
WHERE slug = 'quotishop'
  AND listing_price_cents = 60000;

NOTIFY pgrst, 'reload schema';
