CREATE TABLE public.page_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  path text NOT NULL,
  survey_id uuid,
  session_id text,
  is_mobile boolean,
  referrer text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX page_views_created_at_idx ON public.page_views (created_at DESC);
GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
GRANT ALL ON public.page_views TO service_role;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record a page view" ON public.page_views FOR INSERT TO anon, authenticated WITH CHECK (length(path) <= 300 AND (session_id IS NULL OR length(session_id) <= 64) AND (referrer IS NULL OR length(referrer) <= 300));
CREATE POLICY "Admins can read page views" ON public.page_views FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));