-- 1. Owner-facing read path for responses
CREATE POLICY "Survey owners can read their survey responses"
ON public.responses FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.surveys s WHERE s.id = responses.survey_id AND s.owner_id = auth.uid()));

-- 2. Server-side validation of anonymous submissions
CREATE OR REPLACE FUNCTION public.validate_response()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.body := btrim(NEW.body);
  IF NEW.body IS NULL OR length(NEW.body) = 0 THEN
    RAISE EXCEPTION 'Response body is required';
  END IF;
  IF length(NEW.body) > 5000 THEN
    RAISE EXCEPTION 'Response body is too long';
  END IF;

  NEW.author_name := nullif(btrim(coalesce(NEW.author_name, '')), '');
  IF NEW.author_name IS NOT NULL AND length(NEW.author_name) > 100 THEN
    RAISE EXCEPTION 'Author name is too long';
  END IF;

  NEW.phone := nullif(btrim(coalesce(NEW.phone, '')), '');
  IF NEW.phone IS NOT NULL AND (length(NEW.phone) > 40 OR NEW.phone !~ '^[0-9 ()+.\-]{5,40}$') THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;

  IF (NEW.lat IS NULL) <> (NEW.lng IS NULL) THEN
    RAISE EXCEPTION 'Both coordinates are required';
  END IF;
  IF NEW.lat IS NOT NULL AND (NEW.lat < -90 OR NEW.lat > 90 OR NEW.lng < -180 OR NEW.lng > 180) THEN
    RAISE EXCEPTION 'Invalid coordinates';
  END IF;

  NEW.created_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_response_trigger ON public.responses;
CREATE TRIGGER validate_response_trigger
BEFORE INSERT ON public.responses
FOR EACH ROW EXECUTE FUNCTION public.validate_response();

-- 3. has_role no longer needs elevated privileges: it only reads the caller's own roles,
-- which the "Users can read their own roles" policy already allows.
GRANT SELECT ON public.user_roles TO authenticated;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  )
$$;