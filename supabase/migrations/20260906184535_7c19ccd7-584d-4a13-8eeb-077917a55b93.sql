CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
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

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated;

DROP POLICY "Clients can read own onboarding" ON public.onboardings;
DROP POLICY "Clients can update own onboarding" ON public.onboardings;
DROP POLICY "Clients can delete own draft" ON public.onboardings;

CREATE POLICY "Clients can read own onboarding"
ON public.onboardings FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can update own onboarding"
ON public.onboardings FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'))
WITH CHECK (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Clients can delete own draft"
ON public.onboardings FOR DELETE TO authenticated
USING ((user_id = auth.uid() AND submitted_at IS NULL) OR private.has_role(auth.uid(), 'admin'));

DROP FUNCTION public.has_role(uuid, public.app_role);