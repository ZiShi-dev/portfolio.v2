-- Savoraille : visuel de couverture (aperçu du site).
-- Idempotent : n’écrase pas des photos déjà ajoutées dans l’admin.
-- Appliquer via : npm run db:migrate

UPDATE public.projects
SET
  images = CASE
    WHEN jsonb_array_length(COALESCE(images, '[]'::jsonb)) = 0
      THEN jsonb_build_array(
        jsonb_build_object(
          'url', '/projects/savoraille-hero.png',
          'label', jsonb_build_object(
            'fr', $$Aperçu du site Savoraille$$,
            'en', $$Savoraille site preview$$,
            'ar', $$معاينة موقع Savoraille$$
          )
        )
      )
    ELSE images
  END,
  cover_image = COALESCE(
    cover_image,
    '/projects/savoraille-hero.png'
  ),
  updated_at = now()
WHERE slug = 'savoraille';

NOTIFY pgrst, 'reload schema';
