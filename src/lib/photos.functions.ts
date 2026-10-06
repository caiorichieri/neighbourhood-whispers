import { createServerFn } from "@tanstack/react-start";

const MAX_BYTES = 8 * 1024 * 1024;
const TIPI: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

// Caricamento foto anonimo: validato sul server, scritto con privilegi di servizio
export const uploadResponsePhoto = createServerFn({ method: "POST" })
  .inputValidator((data: FormData) => {
    if (!(data instanceof FormData)) throw new Error("Dati non validi");
    const surveyId = data.get("surveyId");
    const file = data.get("file");
    if (typeof surveyId !== "string" || !/^[0-9a-f-]{36}$/i.test(surveyId)) {
      throw new Error("Indagine non valida");
    }
    if (!(file instanceof File)) throw new Error("File mancante");
    if (!TIPI[file.type]) throw new Error("Formato non supportato");
    if (file.size === 0 || file.size > MAX_BYTES) throw new Error("Dimensione non valida");
    return { surveyId, file };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: survey } = await supabaseAdmin
      .from("surveys")
      .select("id")
      .eq("id", data.surveyId)
      .eq("status", "active")
      .maybeSingle();
    if (!survey) throw new Error("Indagine non attiva");
    const path = `uploads/${data.surveyId}/${crypto.randomUUID()}.${TIPI[data.file.type]}`;
    const { error } = await supabaseAdmin.storage
      .from("response-photos")
      .upload(path, await data.file.arrayBuffer(), { contentType: data.file.type });
    if (error) throw new Error("Caricamento non riuscito");
    return { path };
  });
