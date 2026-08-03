import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { MapPin, X } from "lucide-react";
import { MapView } from "@/components/MapView";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { pointInPolygon, type LatLng } from "@/lib/geo";
import { fetchSurvey } from "@/lib/surveys";

export const Route = createFileRoute("/s/$surveyId")({
  head: () => ({
    meta: [
      { title: "Dimmi la tua — problemi del quartiere | Pordenone" },
      {
        name: "description",
        content:
          "Scrivi in modo anonimo il problema più importante del quartiere e, se vuoi, segna il punto sulla mappa.",
      },
      { property: "og:title", content: "Dimmi la tua sul quartiere" },
      {
        property: "og:description",
        content:
          "Partecipa all'indagine sui problemi del quartiere: anonimo, libero, senza filtri.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SurveyPage,
});

function SurveyPage() {
  const { surveyId } = Route.useParams();
  const { data: survey, isLoading } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => fetchSurvey(surveyId),
  });

  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [marker, setMarker] = useState<LatLng | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleMarker = (p: LatLng | null) => {
    if (p && survey && survey.polygon.length >= 3 && !pointInPolygon(p, survey.polygon)) {
      toast.error("Il punto deve essere dentro l'area dell'indagine.");
      return;
    }
    setMarker(p);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (text.length === 0) {
      toast.error("Scrivi qualcosa prima di inviare.");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("responses").insert({
      survey_id: surveyId,
      body: text.slice(0, 5000),
      author_name: name.trim() ? name.trim().slice(0, 100) : null,
      lat: marker ? marker[0] : null,
      lng: marker ? marker[1] : null,
    });
    setSending(false);
    if (error) {
      toast.error("Invio non riuscito. Riprova.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-6">
        {isLoading && <p className="text-sm text-muted-foreground">Caricamento…</p>}

        {!isLoading && !survey && (
          <div className="rounded-lg border border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Questa indagine non esiste o è stata chiusa.
            </p>
            <Button asChild className="mt-4">
              <Link to="/">Torna alla home</Link>
            </Button>
          </div>
        )}

        {survey && sent && (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <p className="font-display text-3xl text-primary">Grazie!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              La tua opinione è stata registrata in forma anonima.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSent(false);
                  setBody("");
                  setName("");
                  setMarker(null);
                }}
              >
                Scrivi un'altra opinione
              </Button>
              <Button asChild>
                <Link to="/">Torna alla home</Link>
              </Button>
            </div>
          </div>
        )}

        {survey && !sent && (
          <>
            {survey.neighborhood && (
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {survey.neighborhood}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">
              {survey.title}
            </h1>
            {survey.description && (
              <p className="mt-2 text-sm text-muted-foreground">{survey.description}</p>
            )}

            <div className="mt-4 overflow-hidden rounded-xl border border-border">
              <MapView
                mode="pick"
                polygon={survey.polygon}
                marker={marker}
                onMarkerChange={handleMarker}
                className="h-64 w-full"
              />
              <div className="flex items-center justify-between gap-2 bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  Facoltativo: tocca la mappa per indicare dove si trova il problema.
                </span>
                {marker && (
                  <button
                    type="button"
                    onClick={() => setMarker(null)}
                    className="flex items-center gap-1 font-medium text-foreground underline"
                  >
                    <X className="size-3" /> togli
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="body">Qual è il problema più importante per te?</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  maxLength={5000}
                  placeholder="Scrivi liberamente…"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="name">Il tuo nome (facoltativo)</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={100}
                  placeholder="Puoi restare anonimo"
                  className="mt-1"
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={sending}>
                {sending ? "Invio…" : "Invia"}
              </Button>
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
