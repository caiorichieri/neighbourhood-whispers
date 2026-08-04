REVOKE SELECT, UPDATE, DELETE ON public.responses FROM anon;
GRANT INSERT ON public.responses TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.responses TO authenticated;
GRANT ALL ON public.responses TO service_role;