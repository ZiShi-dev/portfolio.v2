-- Quotishop : copie publique (visiteur), plus de fiche technique.
-- Appliquer via : npm run db:migrate

UPDATE public.projects
SET
  kind = 'sold',
  business_type_ids = ARRAY['ecommerce'],
  title = jsonb_build_object(
    'fr', $$Quotishop$$,
    'en', $$Quotishop$$,
    'ar', $$Quotishop$$
  ),
  description = jsonb_build_object(
    'fr', $$Une boutique en ligne claire, en français, anglais et arabe : le catalogue, le panier et les commandes — sans jargon, pensée pour vendre.$$,
    'en', $$A clear online shop in French, English and Arabic: catalog, cart and orders — no jargon, built to sell.$$,
    'ar', $$متجر إلكتروني واضح بالفرنسية والإنجليزية والعربية: الفهرس والسلة والطلبات — بلا مصطلحات تقنية، مصمم للبيع.$$
  ),
  client_need = jsonb_build_object(
    'fr', $$Ouvrir une vraie boutique en ligne sans tout reconstruire : présenter les produits, encaisser, suivre les commandes, et rester maître des textes et des visuels.$$,
    'en', $$Open a real online shop without starting from scratch: show products, take orders, follow sales, and stay in control of copy and visuals.$$,
    'ar', $$فتح متجر إلكتروني حقيقي دون البناء من الصفر: عرض المنتجات، استقبال الطلبات، متابعة المبيعات، والبقاء سيد النصوص والصور.$$
  ),
  objective = jsonb_build_object(
    'fr', $$Une boutique qui inspire confiance sur téléphone comme sur ordinateur, simple à faire vivre au quotidien — VORZIX l’adapte à la marque.$$,
    'en', $$A shop that feels trustworthy on phone and desktop, simple to run day to day — VORZIX adapts it to the brand.$$,
    'ar', $$متجر يوحي بالثقة على الهاتف والحاسوب، سهل الإدامة يومياً — وتكيّفه VORZIX مع العلامة.$$
  ),
  solution = jsonb_build_object(
    'fr', $$VORZIX a conçu Quotishop comme une boutique complète, puis la personnalise : couleurs, rayons, contenus, identité. Le marchand gère ses produits et ses commandes ; l’équipe s’occupe de l’allure et de la structure.$$,
    'en', $$VORZIX designed Quotishop as a complete shop, then customizes it: colors, aisles, content, identity. The merchant runs products and orders; the team handles look and structure.$$,
    'ar', $$صممت VORZIX متجر Quotishop كاملاً ثم تُخصّصه: الألوان والأقسام والمحتوى والهوية. التاجر يدير منتجاته وطلباته؛ والفريق يتولى المظهر والبنية.$$
  ),
  result = jsonb_build_object(
    'fr', $$Une boutique déjà en ligne, prête à recevoir les premiers clients — et à porter le nom, les couleurs et les produits de la marque.$$,
    'en', $$A shop already live, ready for the first customers — and ready to carry the brand’s name, colors and products.$$,
    'ar', $$متجر منشور فعلاً، جاهز لاستقبال أولى الزبائن — ولحمل اسم العلامة وألوانها ومنتجاتها.$$
  ),
  features = jsonb_build_array(
    jsonb_build_object(
      'fr', $$Catalogue et fiches produits lisibles$$,
      'en', $$A readable catalog and product pages$$,
      'ar', $$فهرس وصفحات منتجات واضحة$$
    ),
    jsonb_build_object(
      'fr', $$Panier et passage de commande$$,
      'en', $$Cart and checkout$$,
      'ar', $$سلة وإتمام الطلب$$
    ),
    jsonb_build_object(
      'fr', $$Suivi des commandes$$,
      'en', $$Order tracking$$,
      'ar', $$متابعة الطلبات$$
    ),
    jsonb_build_object(
      'fr', $$Espace client$$,
      'en', $$Customer accounts$$,
      'ar', $$حسابات الزبائن$$
    ),
    jsonb_build_object(
      'fr', $$Avis des acheteurs$$,
      'en', $$Customer reviews$$,
      'ar', $$تقييمات المشترين$$
    ),
    jsonb_build_object(
      'fr', $$Français, anglais et arabe$$,
      'en', $$French, English and Arabic$$,
      'ar', $$الفرنسية والإنجليزية والعربية$$
    ),
    jsonb_build_object(
      'fr', $$Identité visuelle adaptée à la marque$$,
      'en', $$Visual identity adapted to the brand$$,
      'ar', $$هوية بصرية مكيّفة مع العلامة$$
    )
  ),
  seo_title = jsonb_build_object(
    'fr', $$Quotishop — boutique en ligne | VORZIX$$,
    'en', $$Quotishop — online shop | VORZIX$$,
    'ar', $$Quotishop — متجر إلكتروني | VORZIX$$
  ),
  seo_description = jsonb_build_object(
    'fr', $$Boutique en ligne trilingue : catalogue, panier, commandes et avis. Un projet VORZIX pensé pour vendre.$$,
    'en', $$Trilingual online shop: catalog, cart, orders and reviews. A VORZIX project built to sell.$$,
    'ar', $$متجر إلكتروني بثلاث لغات: فهرس وسلة وطلبات وتقييمات. مشروع VORZIX مصمم للبيع.$$
  ),
  updated_at = now()
WHERE slug = 'quotishop';

NOTIFY pgrst, 'reload schema';
