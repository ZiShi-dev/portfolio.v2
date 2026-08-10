-- Références de demandes projet atomiques.
-- Évite les collisions de type MAX(reference) + 1 lors de soumissions concurrentes.

CREATE SEQUENCE IF NOT EXISTS public.project_inquiry_reference_seq;

DO $$
DECLARE
  max_reference bigint;
BEGIN
  SELECT COALESCE(
    MAX(((regexp_match(reference, '([0-9]+)$'))[1])::bigint),
    0
  )
  INTO max_reference
  FROM public.project_inquiries
  WHERE reference ~ '[0-9]+$';

  IF max_reference > 0 THEN
    PERFORM setval(
      'public.project_inquiry_reference_seq',
      max_reference,
      true
    );
  ELSE
    PERFORM setval(
      'public.project_inquiry_reference_seq',
      1,
      false
    );
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.next_project_inquiry_reference()
RETURNS text
LANGUAGE sql
VOLATILE
SECURITY INVOKER
SET search_path = public, pg_catalog
AS $$
  SELECT 'VZ—LEAD ' || lpad(
    nextval('public.project_inquiry_reference_seq')::text,
    3,
    '0'
  );
$$;

ALTER TABLE public.project_inquiries
  ALTER COLUMN reference
  SET DEFAULT public.next_project_inquiry_reference();

REVOKE ALL ON FUNCTION public.next_project_inquiry_reference() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.next_project_inquiry_reference() TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.project_inquiry_reference_seq TO service_role;

COMMENT ON FUNCTION public.next_project_inquiry_reference() IS
  'Alloue une référence VZ—LEAD de façon atomique.';

NOTIFY pgrst, 'reload schema';
