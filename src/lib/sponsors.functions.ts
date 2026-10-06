import { createServerFn } from "@tanstack/react-start";

// Elenco pubblico dei sponsor con URL firmati dei loghi (generati sul server)
export const listSponsorsWithLogos = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("sponsors")
    .select("id, name, website_url, logo_path, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) throw new Error("Impossibile caricare i sponsor");
  const rows = data ?? [];
  if (rows.length === 0) return [];
  const { data: urls } = await supabaseAdmin.storage
    .from("sponsors")
    .createSignedUrls(rows.map((r) => r.logo_path), 60 * 60 * 24);
  return rows.map((r, i) => ({ ...r, logo_url: urls?.[i]?.signedUrl ?? undefined }));
});
