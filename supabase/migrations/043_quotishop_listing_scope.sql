-- Quotishop : périmètre du prix (code source, personnalisation limitée,
-- délai 7–14 j, catalogue à la charge du client).
-- Ciblé : slug = quotishop. Réversible : 040_quotishop_listing_intent_visual_fixes.sql

UPDATE public.projects
SET
  listing_intent = jsonb_build_object(
    'fr', $$Les 600 € comprennent la remise du code source complet de la boutique, sa personnalisation et sa préparation à la mise en ligne. Vous utilisez et modifiez votre copie pour votre magasin ; VORZIX conserve le droit de réutiliser, développer et vendre la base technique à d’autres clients.

Le prix inclut la personnalisation du nom, des couleurs, des polices, de l’identité visuelle, du contenu et des pages convenues avant le début du travail.

Délai de personnalisation et de mise en ligne : 7 à 14 jours, selon le contenu et les ajustements demandés.

La saisie des produits est à la charge du client.

Après la mise en ligne, un mois de corrections et d’ajustements visuels simples est offert. Toute nouvelle fonctionnalité ou page supplémentaire fera l’objet d’un devis séparé.$$,
    'en', $$The €600 includes delivery of the shop’s full source code, its customisation, and preparation for go-live. You may use and modify your copy for your store; VORZIX retains the right to reuse, develop and sell the technical base to other clients.

The price covers customising the name, colours, fonts, visual identity, content and the pages agreed before work starts.

Customisation and launch: 7 to 14 days, depending on the content and requested changes.

Entering products is the client’s responsibility.

After launch, one month of simple visual adjustments is included. Any new feature or extra page requires a separate quote.$$,
    'ar', $$يشمل سعر 600€ تسليم الكود المصدري الكامل للمتجر، بالإضافة إلى تخصيصه وإعداده للنشر. يستطيع الزبون استعمال نسخته وتعديلها لمتجره، مع احتفاظ VORZIX بحق إعادة استعمال القاعدة التقنية وتطويرها وبيعها لزبائن آخرين.

يشمل السعر تخصيص الاسم والألوان والخطوط والهوية البصرية والمحتوى والصفحات المتفق عليها قبل بدء العمل.

مدة التخصيص والإطلاق: من 7 إلى 14 يومًا، حسب المحتوى والتعديلات المطلوبة.

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
      'fr', $$Personnalisation et mise en ligne en 7 à 14 jours$$,
      'en', $$Customisation and launch in 7 to 14 days$$,
      'ar', $$التخصيص والإطلاق خلال 7 إلى 14 يومًا$$
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
