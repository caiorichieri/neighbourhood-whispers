CREATE TABLE public.sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  website_url TEXT,
  logo_path TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sponsors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT ALL ON public.sponsors TO service_role;
ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sponsors are public" ON public.sponsors FOR SELECT USING (true);
CREATE POLICY "Admins manage sponsors" ON public.sponsors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sponsor logos readable" ON storage.objects FOR SELECT USING (bucket_id = 'sponsors');
CREATE POLICY "Admins upload sponsor logos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update sponsor logos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete sponsor logos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'sponsors' AND public.has_role(auth.uid(), 'admin'));