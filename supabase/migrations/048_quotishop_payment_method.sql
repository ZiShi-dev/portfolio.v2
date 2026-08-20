-- Quotishop : ajout et configuration d'un moyen de paiement inclus dans les 600 €.
-- Ciblé : slug = quotishop. Réversible : 047_quotishop_scope_backups.sql

UPDATE public.projects
SET
  listing_intent = jsonb_build_object(
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

Nous configurons un système de sauvegarde des données de la boutique afin de faciliter leur restauration en cas de problème. La mise en place du système est incluse dans le prix du projet ; les éventuels frais externes liés au stockage ou au service de sauvegarde restent à la charge du client.

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

We configure a backup system for your store data to help restore it in case of an issue. The initial backup setup is included in the project price; any external storage or backup service fees remain the client's responsibility.

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

نقوم بإعداد نظام نسخ احتياطي لبيانات المتجر للمساعدة على استعادتها في حالة حدوث مشكلة. إعداد النظام مشمول في سعر المشروع، بينما تبقى أي تكاليف خارجية مرتبطة بالتخزين أو بخدمة النسخ الاحتياطي على عاتق العميل.

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
      'fr', $$Ajout et configuration d'un moyen de paiement inclus dans les 600 €$$,
      'en', $$Payment method setup included in the €600$$,
      'ar', $$إضافة وإعداد وسيلة دفع مشمولان في 600€$$
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
  updated_at = now()
WHERE slug = 'quotishop'
  AND listing_price_cents = 60000;

NOTIFY pgrst, 'reload schema';
