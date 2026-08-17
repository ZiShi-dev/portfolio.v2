-- Quotishop : préciser le mois offert après mise en ligne (corrections /
-- ajustements visuels simples uniquement — pas de nouvelles fonctionnalités
-- ou pages). Ne touche que public.projects.listing_intent pour slug=quotishop.
-- Appliquer via : npm run db:migrate

UPDATE public.projects
SET
  listing_intent = jsonb_build_object(
    'fr', $$Les 600 € comprennent l’adaptation du site à ce que vous voulez : nom, couleurs, style, et les pages. Le paiement à la livraison est disponible ; une passerelle de paiement en ligne peut être ajoutée séparément à la demande. Nous vous aidons à héberger le site et à le mettre en ligne.

Après la mise en ligne, un mois de corrections et d’ajustements visuels simples est offert : couleurs, typographies et certains éléments de l’identité graphique. Toute nouvelle fonctionnalité ou page supplémentaire fera l’objet d’un devis séparé.$$,
    'en', $$The €600 includes adapting the site to what you want: name, colors, style, and the pages. Cash on delivery is available; an online payment gateway can be added separately on request. We help you host the site and put it online.

After launch, one month of corrections and simple visual adjustments is included, covering colors, typography, and selected elements of the brand identity. Any new feature or additional page will require a separate quote.$$,
    'ar', $$الـ 600 € تشمل تكييف الموقع حسب ما تريدون: الاسم والألوان والأسلوب والصفحات. الدفع عند الاستلام متاح؛ ويمكن إضافة بوابة دفع إلكتروني بشكل منفصل عند الطلب. نساعدكم على استضافة الموقع ونشره.

بعد إطلاق المتجر، تحصلون على شهر من التصحيحات والتعديلات البصرية البسيطة دون مقابل، مثل ضبط الألوان والخطوط وبعض عناصر الهوية البصرية. أما إضافة وظائف أو صفحات جديدة فتُحسب بشكل منفصل حسب الطلب.$$
  ),
  updated_at = now()
WHERE slug = 'quotishop'
  AND listing_price_cents = 60000;

NOTIFY pgrst, 'reload schema';
