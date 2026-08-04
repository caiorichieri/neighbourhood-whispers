import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";
import { MapView } from "@/components/MapView";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toCsv, type LatLng } from "@/lib/geo";
import { deleteSurvey, fetchResponses, fetchSurvey } from "@/lib/surveys";

export const Route = createFileRoute("/_authenticated/gestione/$surveyId")({
  head: () => ({
    meta: [
      { title: "Risposte all'indagine | Dimmi, ti ascolto" },
      {
        name: "description",
        content: "Leggi le opinioni raccolte, vedi i punti segnalati sulla mappa ed esportale.",
      },
      { property: "og:title", content: "Risposte all'indagine" },
      { property: "og:description", content: "Le opinioni raccolte per questa area." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SurveyResponses,
});

function SurveyResponses() {
  const { surveyId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: survey } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => fetchSurvey(surveyId),
  });
  const { data: responses } = useQuery({
    queryKey: ["responses", surveyId],
    queryFn: () => fetchResponses(surveyId),
  });

  const points: LatLng[] =
    responses?.flatMap((r) =>
      r.lat != null && r.lng != null ? [[r.lat, r.lng] as LatLng] : [],
    ) ?? [];

  const toggleStatus = async () => {
    if (!survey) return;
    const next = survey.status === "active" ? "closed" : "active";
    const { error } = await supabase
      .from("surveys")
      .update({ status: next })
      .eq("id", survey.id);
    if (error) {
      toast.error("Aggiornamento non riuscito.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["survey", surveyId] });
    await queryClient.invalidateQueries({ queryKey: ["my-surveys"] });
    toast.success(next === "active" ? "Indagine riaperta." : "Indagine chiusa.");
  };

  const removeSurvey = async () => {
    if (!survey) return;
    if (!window.confirm("Eliminare l'indagine e tutte le risposte?")) return;
    try {
      await deleteSurvey(survey.id);
    } catch {
      toast.error("Eliminazione non riuscita.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["all-surveys"] });
    await queryClient.invalidateQueries({ queryKey: ["all-responses"] });
    navigate({ to: "/gestione" });
  };


  const exportCsv = () => {
    const rows = [
      ["data", "nome", "telefono", "testo", "lat", "lng"],
      ...(responses ?? []).map((r) => [
        new Date(r.created_at).toLocaleString("it-IT"),
        r.author_name ?? "",
        r.phone ?? "",
        r.body,
        r.lat != null ? String(r.lat) : "",
        r.lng != null ? String(r.lng) : "",
      ]),
    ];

    const blob = new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `risposte-${surveyId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link to="/gestione" className="flex items-center gap-1 text-sm text-primary underline">
          <ArrowLeft className="size-4" /> Tutte le indagini
        </Link>

        <h1 className="mt-3 font-display text-3xl text-primary">
          {survey?.title ?? "Indagine"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {responses?.length ?? 0} risposte raccolte
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={exportCsv}>
            <Download className="size-4" /> Esporta CSV
          </Button>
          <Button size="sm" variant="outline" onClick={toggleStatus}>
            {survey?.status === "active" ? "Chiudi indagine" : "Riapri indagine"}
          </Button>
          <Button size="sm" variant="destructive" onClick={removeSurvey}>
            Elimina
          </Button>
        </div>

        {survey && (
          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            <MapView
              mode="view"
              polygon={survey.polygon}
              points={points}
              className="h-64 w-full"
            />
          </div>
        )}

        <div className="mt-6 space-y-3">
          {responses?.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Ancora nessuna risposta.
            </p>
          )}
          {responses?.map((r) => (
            <article key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {r.author_name || "Anonimo"}
                </span>
                <span>{new Date(r.created_at).toLocaleString("it-IT")}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-card-foreground">{r.body}</p>
              {r.phone && (
                <p className="mt-2 text-xs text-muted-foreground">Telefono: {r.phone}</p>
              )}
              {r.lat != null && r.lng != null && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Punto segnalato: {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                </p>
              )}

            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
