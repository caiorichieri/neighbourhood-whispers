import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Undo2, Trash2 } from "lucide-react";
import { MapView } from "@/components/MapView";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { LatLng } from "@/lib/geo";
import { deleteSurvey, fetchSurvey } from "@/lib/surveys";

export const Route = createFileRoute("/_authenticated/gestione/modifica/$surveyId")({
  head: () => ({
    meta: [
      { title: "Modifica indagine | Dimmi, ti ascolto" },
      {
        name: "description",
        content: "Modifica titolo, quartiere, descrizione e area sulla mappa dell'indagine.",
      },
      { property: "og:title", content: "Modifica indagine" },
      { property: "og:description", content: "Aggiorna i dati e l'area dell'indagine." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditSurvey,
});

function EditSurvey() {
  const { surveyId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: survey, isLoading } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => fetchSurvey(surveyId),
  });

  const [title, setTitle] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [polygon, setPolygon] = useState<LatLng[]>([]);
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!survey || loaded) return;
    setTitle(survey.title);
    setNeighborhood(survey.neighborhood ?? "");
    setDescription(survey.description ?? "");
    setPolygon(survey.polygon);
    setLoaded(true);
  }, [survey, loaded]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length === 0) {
      toast.error("Inserisci un titolo.");
      return;
    }
    if (polygon.length > 0 && polygon.length < 3) {
      toast.error("L'area deve avere almeno 3 punti oppure nessuno.");
      return;
    }

    setBusy(true);
    const { error } = await supabase
      .from("surveys")
      .update({
        title: title.trim().slice(0, 200),
        neighborhood: neighborhood.trim() ? neighborhood.trim().slice(0, 100) : null,
        description: description.trim() ? description.trim().slice(0, 1000) : null,
        polygon,
      })
      .eq("id", surveyId);
    setBusy(false);
    if (error) {
      toast.error("Salvataggio non riuscito.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["survey", surveyId] });
    await queryClient.invalidateQueries({ queryKey: ["all-surveys"] });
    toast.success("Indagine aggiornata.");
    navigate({ to: "/gestione" });
  };

  const remove = async () => {
    if (!window.confirm("Eliminare l'indagine e tutte le risposte? L'azione è definitiva.")) return;
    setBusy(true);
    try {
      await deleteSurvey(surveyId);
    } catch {
      setBusy(false);
      toast.error("Eliminazione non riuscita.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["all-surveys"] });
    await queryClient.invalidateQueries({ queryKey: ["all-responses"] });
    toast.success("Indagine eliminata.");
    navigate({ to: "/gestione" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl text-primary">Modifica indagine</h1>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Caricamento…</p>}
        {!isLoading && !survey && (
          <p className="mt-4 text-sm text-muted-foreground">Indagine non trovata.</p>
        )}

        {survey && (
          <form onSubmit={save} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="neighborhood">Quartiere</Label>
              <Input
                id="neighborhood"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                maxLength={100}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Descrizione (facoltativa)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={1000}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Area dell'indagine</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Tocca la mappa per aggiungere vertici. Puoi cancellare tutto e ridisegnare l'area.
              </p>
              <div className="mt-2 overflow-hidden rounded-xl border border-border">
                <MapView
                  mode="draw"
                  polygon={polygon}
                  onPolygonChange={setPolygon}
                  className="h-72 w-full"
                />
                <div className="flex items-center justify-between gap-2 bg-muted px-3 py-2 text-xs text-muted-foreground">
                  <span>{polygon.length} punti</span>
                  <span className="flex gap-3">
                    <button
                      type="button"
                      className="flex items-center gap-1 font-medium text-foreground underline"
                      onClick={() => setPolygon(polygon.slice(0, -1))}
                    >
                      <Undo2 className="size-3" /> annulla ultimo
                    </button>
                    <button
                      type="button"
                      className="flex items-center gap-1 font-medium text-destructive underline"
                      onClick={() => setPolygon([])}
                    >
                      <Trash2 className="size-3" /> cancella
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={busy}>
                {busy ? "Salvataggio…" : "Salva modifiche"}
              </Button>
              <Button asChild type="button" variant="outline">
                <Link to="/gestione">Annulla</Link>
              </Button>
              <Button type="button" variant="destructive" disabled={busy} onClick={remove}>
                <Trash2 className="size-4" /> Elimina indagine
              </Button>
            </div>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
