-- Montant libre pour budget_range = 'custom'
ALTER TABLE public.project_inquiries
  ADD COLUMN IF NOT EXISTS budget_custom_amount integer
  CHECK (
    budget_custom_amount IS NULL
    OR (budget_custom_amount >= 50 AND budget_custom_amount <= 500000)
  );

COMMENT ON COLUMN public.project_inquiries.budget_custom_amount IS
  'Montant € saisi librement lorsque budget_range = custom.';

NOTIFY pgrst, 'reload schema';
