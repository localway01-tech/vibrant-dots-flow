CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.onboarding_status AS ENUM ('not_started', 'in_progress', 'awaiting_client', 'submitted', 'under_review', 'complete');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can read own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE TABLE public.onboardings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  company_name text,
  company_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  contact_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  selected_services text[] NOT NULL DEFAULT '{}',
  service_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_step integer NOT NULL DEFAULT 0,
  status public.onboarding_status NOT NULL DEFAULT 'not_started',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.onboardings TO authenticated;
GRANT ALL ON public.onboardings TO service_role;
ALTER TABLE public.onboardings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can read own onboarding"
ON public.onboardings FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can create own onboarding"
ON public.onboardings FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());
CREATE POLICY "Clients can update own onboarding"
ON public.onboardings FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can delete own draft"
ON public.onboardings FOR DELETE TO authenticated
USING ((user_id = auth.uid() AND submitted_at IS NULL) OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_onboardings_updated_at
BEFORE UPDATE ON public.onboardings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX onboardings_status_idx ON public.onboardings(status);
CREATE INDEX onboardings_updated_at_idx ON public.onboardings(updated_at DESC);