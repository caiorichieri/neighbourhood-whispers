DROP POLICY IF EXISTS "Sponsor logos readable" ON storage.objects;
CREATE POLICY "Sponsor logos readable"
ON storage.objects FOR SELECT TO anon, authenticated
USING (
  bucket_id = 'sponsors'
  AND EXISTS (SELECT 1 FROM public.sponsors s WHERE s.logo_path = storage.objects.name)
);

DROP POLICY IF EXISTS "Anyone can upload response photos" ON storage.objects;
CREATE POLICY "Anyone can upload response photos"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'response-photos'
  AND (storage.foldername(name))[1] = 'uploads'
  AND lower(storage.extension(name)) IN ('jpg','jpeg','png','webp','heic','heif','gif')
  AND EXISTS (
    SELECT 1 FROM public.surveys s
    WHERE s.id::text = (storage.foldername(name))[2] AND s.status = 'active'
  )
);