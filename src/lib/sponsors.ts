import { supabase } from "@/integrations/supabase/client";
import { listSponsorsWithLogos } from "@/lib/sponsors.functions";

export interface Sponsor {
  id: string;
  name: string;
  website_url: string | null;
  logo_path: string;
  sort_order: number;
  created_at: string;
  logo_url?: string | undefined;
}

const BUCKET = "sponsors";

export async function fetchSponsors(): Promise<Sponsor[]> {
  return (await listSponsorsWithLogos()) as Sponsor[];
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
