-- Quotishop : projet à vendre (600 €) + copie visiteur + conditions.
-- Appliquer via : npm run db:migrate

UPDATE public.projects
SET
  kind = 'for_sale',
  listing_price_cents = 60000,
  provided_service_id = NULL,
  business_type_ids = ARRAY['ecommerce'],
  title = jsonb_build_object(
    'fr', $$Quotishop$$,
    'en', $$Quotishop$$,
    'ar', $$Quotishop$$
  ),
  description = jsonb_build_object(
    'fr', $$Une boutique en ligne déjà prête, en trois langues, à votre nom et vos couleurs — sans tout construire depuis zéro.$$,
    'en', $$A ready online shop, in three languages, with your name and colors — without building from scratch.$$,
    'ar', $$متجر إلكتروني جاهز، بثلاث لغات، يحمل اسمك وألوانك — دون البناء من الصفر.$$
  ),
  client_need = jsonb_build_object(
    'fr', $$Ouvrir une vraie boutique : montrer les produits, recevoir les commandes, suivre les ventes — et rester maître des textes et des images.$$,
    'en', $$Open a real shop: show products, take orders, follow sales — and stay in control of the copy and the pictures.$$,
    'ar', $$فتح متجر حقيقي: عرض المنتجات، استقبال الطلبات، متابعة المبيعات — والبقاء سيد النصوص والصور.$$
  ),
  objective = jsonb_build_object('fr', '', 'en', '', 'ar', ''),
  solution = jsonb_build_object(
    'fr', $$Une boutique qui marche sur téléphone et ordinateur, simple à gérer au quotidien. Vous pilotez produits et commandes ; VORZIX adapte l’identité, les rayons et les contenus à votre marque.$$,
    'en', $$A shop that works on phone and desktop, simple to run day to day. You manage products and orders; VORZIX adapts identity, sections and content to your brand.$$,
    'ar', $$متجر يعمل على الهاتف والحاسوب، سهل الإدارة يومياً. أنت تدير المنتجات والطلبات؛ VORZIX تكيّف الهوية والأقسام والمحتوى مع علامتك.$$
  ),
  result = jsonb_build_object(
    'fr', $$Une boutique en ligne, prête pour la première commande — ni modèle vide, ni projet en suspens.$$,
    'en', $$A live shop, ready for the first order — not an empty template, not a stalled project.$$,
    'ar', $$متجر منشور، جاهز لأول طلب — لا قالب فارغ، ولا مشروع معلّق.$$
  ),
  listing_intent = jsonb_build_object(
    'fr', $$Les 600 € comprennent l’adaptation du site à ce que vous voulez : nom, couleurs, style, et les pages. Un moyen de paiement peut être ajouté si vous le souhaitez. Nous vous aidons à héberger le site et à le mettre en ligne.

Après la mise en ligne, un mois de corrections est offert. Un problème, ou une envie d’ajouter quelque chose ? Contactez-nous sur WhatsApp. Passé ce mois, toute intervention est facturée selon la demande — une fonction en plus n’est jamais comprise d’office.$$,
    'en', $$The €600 includes adapting the site to what you want: name, colors, style, and the pages. A payment method can be added if you wish. We help you host the site and put it online.

After launch, one month of fixes is included. A problem, or something to add? Contact us on WhatsApp. After that month, any work is billed according to the request — an extra feature is never included by default.$$,
    'ar', $$الـ 600 € تشمل تكييف الموقع حسب ما تريدون: الاسم والألوان والأسلوب والصفحات. يمكن إضافة وسيلة دفع إن رغبتم. نساعدكم على استضافة الموقع ونشره.

بعد الإطلاق: شهر من التصحيحات دون مقابل. مشكلة أو رغبة في إضافة شيء؟ راسلونا على واتساب. بعد هذا الشهر، كل تدخل يُفوتر حسب الطلب — أي وظيفة إضافية ليست مشمولة تلقائياً.$$
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
      'fr', $$Identité visuelle à votre nom et vos couleurs$$,
      'en', $$Visual identity with your name and colors$$,
      'ar', $$هوية بصرية باسمك وألوانك$$
    )
  ),
  seo_title = jsonb_build_object(
    'fr', $$Quotishop — boutique en ligne à vendre | VORZIX$$,
    'en', $$Quotishop — online shop for sale | VORZIX$$,
    'ar', $$Quotishop — متجر إلكتروني للبيع | VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Boutique en ligne prête, 600 € : trois langues, votre nom et vos couleurs. Adaptation, mise en ligne, un mois de suivi.$$,
    'en', $$Ready online shop, €600: three languages, your name and colors. Adaptation, go-live, one month of follow-up.$$,
    'ar', $$متجر إلكتروني جاهز بـ 600 €: ثلاث لغات، اسمك وألوانك. تكييف ونشر وشهر متابعة.$$
  ),
  updated_at = now()
WHERE slug = 'quotishop';

NOTIFY pgrst, 'reload schema';
