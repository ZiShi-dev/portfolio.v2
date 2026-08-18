-- Quotishop : préciser le mois offert (corrections / ajustements visuels,
-- hors nouvelles fonctionnalités ou pages).
-- Ciblé : slug = quotishop, colonne listing_intent uniquement.
-- Réversible : restaurer le texte précédent depuis 038_quotishop_for_sale_copy.sql

UPDATE public.projects
SET
  listing_intent = jsonb_build_object(
    'fr', $$Les 600 € comprennent l’adaptation du site à ce que vous voulez : nom, couleurs, style, et les pages. Un moyen de paiement peut être ajouté si vous le souhaitez. Nous vous aidons à héberger le site et à le mettre en ligne.

Après la mise en ligne, un mois de corrections et d’ajustements visuels simples est offert : couleurs, typographies et certains éléments de l’identité graphique. Toute nouvelle fonctionnalité ou page supplémentaire fera l’objet d’un devis séparé.$$,
    'en', $$The €600 includes adapting the site to what you want: name, colors, style, and the pages. A payment method can be added if you wish. We help you host the site and put it online.

After launch, one month of corrections and simple visual adjustments is included, covering colors, typography, and selected elements of the brand identity. Any new feature or additional page will require a separate quote.$$,
    'ar', $$الـ 600 € تشمل تكييف الموقع حسب ما تريدون: الاسم والألوان والأسلوب والصفحات. يمكن إضافة وسيلة دفع إن رغبتم. نساعدكم على استضافة الموقع ونشره.

بعد إطلاق المتجر، تحصلون على شهر من التصحيحات والتعديلات البصرية البسيطة دون مقابل، مثل ضبط الألوان والخطوط وبعض عناصر الهوية البصرية. أما إضافة وظائف أو صفحات جديدة فتُحسب بشكل منفصل حسب الطلب.$$
  ),
  updated_at = now()
WHERE slug = 'quotishop'
  AND listing_price_cents = 60000;
