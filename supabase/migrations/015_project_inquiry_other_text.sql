-- Textes libres lorsque type/objectif = 'other'
ALTER TABLE public.project_inquiries
  ADD COLUMN IF NOT EXISTS project_type_other text
  CHECK (
    project_type_other IS NULL
    OR (char_length(project_type_other) BETWEEN 2 AND 120)
  );

ALTER TABLE public.project_inquiries
  ADD COLUMN IF NOT EXISTS objective_other text
  CHECK (
    objective_other IS NULL
    OR (char_length(objective_other) BETWEEN 2 AND 120)
  );

COMMENT ON COLUMN public.project_inquiries.project_type_other IS
  'Précision libre lorsque project_type = other.';

COMMENT ON COLUMN public.project_inquiries.objective_other IS
  'Précision libre lorsque objective = other.';

NOTIFY pgrst, 'reload schema';
