import { supabase } from "@/integrations/supabase/client";

export interface Sponsor {
  id: string;
  name: string;
  website_url: string | null;
  logo_path: string;
  sort_order: number;
  created_at: string;
  logo_url?: string;
}

const BUCKET = "sponsors";

async function withSignedUrls(rows: Sponsor[]): Promise<Sponsor[]> {
  if (rows.length === 0) return rows;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(rows.map((r) => r.logo_path), 60 * 60 * 24);
  return rows.map((r, i) => ({ ...r, logo_url: data?.[i]?.signedUrl ?? undefined }));
}

export async function fetchSponsors(): Promise<Sponsor[]> {
  const { data, error } = await supabase
    .from("sponsors")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw error;
  return withSignedUrls(data as Sponsor[]);
}

export async function createSponsor(input: {
  name: string;
  website_url: string | null;
  file: File;
}): Promise<void> {
  const ext = input.file.name.split(".").pop() ?? "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, input.file, { contentType: input.file.type, upsert: false });
  if (upErr) throw upErr;
  const { error } = await supabase.from("sponsors").insert({
    name: input.name,
    website_url: input.website_url,
    logo_path: path,
  });
  if (error) throw error;
}

export async function deleteSponsor(sponsor: Sponsor): Promise<void> {
  const { error } = await supabase.from("sponsors").delete().eq("id", sponsor.id);
  if (error) throw error;
  await supabase.storage.from(BUCKET).remove([sponsor.logo_path]);
}
