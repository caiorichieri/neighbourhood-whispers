CREATE TABLE public.surveys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  neighborhood text,
  polygon jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  survey_id uuid NOT NULL REFERENCES public.surveys(id) ON DELETE CASCADE,
  body text NOT NULL,
  author_name text,
  lat double precision,
  lng double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX responses_survey_id_idx ON public.responses(survey_id);

GRANT SELECT ON public.surveys TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.surveys TO authenticated;
GRANT ALL ON public.surveys TO service_role;

GRANT INSERT ON public.responses TO anon;
GRANT SELECT, INSERT, DELETE ON public.responses TO authenticated;
GRANT ALL ON public.responses TO service_role;

ALTER TABLE public.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active surveys"
  ON public.surveys FOR SELECT
  TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "Owners can view their surveys"
  ON public.surveys FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create surveys"
  ON public.surveys FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their surveys"
  ON public.surveys FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their surveys"
  ON public.surveys FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Anyone can respond to active surveys"
  ON public.responses FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.surveys s
      WHERE s.id = survey_id AND s.status = 'active'
    )
  );

CREATE POLICY "Survey owners can read responses"
  ON public.responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      WHERE s.id = survey_id AND s.owner_id = auth.uid()
    )
  );

CREATE POLICY "Survey owners can delete responses"
  ON public.responses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.surveys s
      WHERE s.id = survey_id AND s.owner_id = auth.uid()
    )
  );