ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS photo_path text;

CREATE POLICY "Anyone can upload response photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'response-photos' AND (storage.foldername(name))[1] = 'uploads');

CREATE POLICY "Admins can read response photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'response-photos' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete response photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'response-photos' AND public.has_role(auth.uid(), 'admin'::app_role));