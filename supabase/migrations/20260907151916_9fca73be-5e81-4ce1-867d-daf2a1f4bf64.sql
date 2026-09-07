CREATE TABLE IF NOT EXISTS public.onboarding_submissions (
  id uuid primary key default gen_random_uuid(),
  company_name text,
  company_data jsonb not null default '{}'::jsonb,
  address_data jsonb not null default '{}'::jsonb,
  contact_data jsonb not null default '{}'::jsonb,
  selected_services text[] not null default '{}',
  service_data jsonb not null default '{}'::jsonb,
  status public.onboarding_status not null default 'submitted',
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT INSERT ON public.onboarding_submissions TO anon;
GRANT INSERT, SELECT, UPDATE ON public.onboarding_submissions TO authenticated;
GRANT ALL ON public.onboarding_submissions TO service_role;

ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit an onboarding" ON public.onboarding_submissions;
CREATE POLICY "Anyone can submit an onboarding"
ON public.onboarding_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view submissions" ON public.onboarding_submissions;
CREATE POLICY "Admins can view submissions"
ON public.onboarding_submissions FOR SELECT TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update submissions" ON public.onboarding_submissions;
CREATE POLICY "Admins can update submissions"
ON public.onboarding_submissions FOR UPDATE TO authenticated
USING (private.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS update_onboarding_submissions_updated_at ON public.onboarding_submissions;
CREATE TRIGGER update_onboarding_submissions_updated_at
BEFORE UPDATE ON public.onboarding_submissions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();