import { supabase } from "@/integrations/supabase/client";

export interface PageView {
  id: string;
  path: string;
  survey_id: string | null;
  session_id: string | null;
  is_mobile: boolean | null;
  referrer: string | null;
  created_at: string;
}

const SESSION_KEY = "dta_session_id";

function getSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return "anon";
  }
}

/** Records a visit for the current page. Silently ignores failures. */
export async function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  const surveyMatch = path.match(
    /^\/s\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
  );
  const referrer = document.referrer ? document.referrer.slice(0, 300) : null;
  try {
    await supabase.from("page_views").insert({
      path: path.slice(0, 300),
      survey_id: surveyMatch ? surveyMatch[1] : null,
      session_id: getSessionId(),
      is_mobile: window.matchMedia("(max-width: 767px)").matches,
      referrer,
    });
  } catch {
    /* ignore */
  }
}

export async function fetchPageViews(days = 30): Promise<PageView[]> {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from("page_views")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data ?? []) as PageView[];
}
