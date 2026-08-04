import { supabase } from "@/integrations/supabase/client";
import { parsePolygon, type LatLng } from "@/lib/geo";

export interface Survey {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  neighborhood: string | null;
  polygon: LatLng[];
  status: string;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  survey_id: string;
  body: string;
  author_name: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  created_at: string;
}

type Row = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  neighborhood: string | null;
  polygon: unknown;
  status: string;
  created_at: string;
};

function mapSurvey(row: Row): Survey {
  return { ...row, polygon: parsePolygon(row.polygon) };
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) return false;
  return data === true;
}

export async function fetchActiveSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapSurvey);
}

export async function fetchSurvey(id: string): Promise<Survey | null> {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapSurvey(data as Row) : null;
}

/** Admin master: vede tutte le indagini. */
export async function fetchAllSurveys(): Promise<Survey[]> {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapSurvey);
}

export async function fetchMySurveys(userId: string): Promise<Survey[]> {
  const { data, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Row[]).map(mapSurvey);
}

export async function fetchResponses(surveyId: string): Promise<SurveyResponse[]> {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .eq("survey_id", surveyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SurveyResponse[];
}

/** Tutte le risposte (dashboard admin). */
export async function fetchAllResponses(): Promise<SurveyResponse[]> {
  const { data, error } = await supabase
    .from("responses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as SurveyResponse[];
}

export async function countResponses(surveyIds: string[]): Promise<Record<string, number>> {
  if (surveyIds.length === 0) return {};
  const { data, error } = await supabase
    .from("responses")
    .select("survey_id")
    .in("survey_id", surveyIds);
  if (error) throw error;
  const counts: Record<string, number> = {};
  for (const row of data as { survey_id: string }[]) {
    counts[row.survey_id] = (counts[row.survey_id] ?? 0) + 1;
  }
  return counts;
}

/** Elimina un'indagine e tutte le sue risposte. */
export async function deleteSurvey(surveyId: string): Promise<void> {
  const { error: respError } = await supabase
    .from("responses")
    .delete()
    .eq("survey_id", surveyId);
  if (respError) throw respError;
  const { error } = await supabase.from("surveys").delete().eq("id", surveyId);
  if (error) throw error;
}

