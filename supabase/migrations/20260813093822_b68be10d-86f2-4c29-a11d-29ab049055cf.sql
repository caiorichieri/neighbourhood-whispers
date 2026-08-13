CREATE TABLE public.analytics_history_daily (
  day date PRIMARY KEY,
  visitors integer NOT NULL DEFAULT 0,
  pageviews integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.analytics_history_daily TO authenticated;
GRANT ALL ON public.analytics_history_daily TO service_role;
ALTER TABLE public.analytics_history_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read history daily" ON public.analytics_history_daily FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.analytics_history_breakdown (
  kind text NOT NULL,
  label text NOT NULL,
  count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (kind, label)
);
GRANT SELECT ON public.analytics_history_breakdown TO authenticated;
GRANT ALL ON public.analytics_history_breakdown TO service_role;
ALTER TABLE public.analytics_history_breakdown ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read history breakdown" ON public.analytics_history_breakdown FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.analytics_history_daily (day, visitors, pageviews) VALUES
 ('2026-08-03',12,35),
 ('2026-08-04',10,16),
 ('2026-08-05',5,12),
 ('2026-08-06',4,13),
 ('2026-08-07',2,3),
 ('2026-08-08',0,0),
 ('2026-08-09',9,16),
 ('2026-08-10',39,116),
 ('2026-08-11',61,119),
 ('2026-08-12',18,31);

INSERT INTO public.analytics_history_breakdown (kind, label, count) VALUES
 ('page','/',148),
 ('page','/s/b45320b7-7f9a-408a-a07e-13e21e5084ff',48),
 ('page','/accesso',18),
 ('page','/gestione',11),
 ('page','/gestione/b45320b7-7f9a-408a-a07e-13e21e5084ff',6),
 ('page','/s/e3cc98c1-0958-4ff8-839a-0b280c26f6ae',4),
 ('page','/gestione/nuova',3),
 ('page','/s/52c1c891-7ba7-4087-ab12-c25f7e3aece9',1),
 ('page','/gestione/statistiche',1),
 ('source','Diretto',153),
 ('source','facebook.com',7),
 ('source','lm.facebook.com',2),
 ('source','com.google.android.gm',1),
 ('source','l.facebook.com',1),
 ('device','mobile',137),
 ('device','desktop',26);