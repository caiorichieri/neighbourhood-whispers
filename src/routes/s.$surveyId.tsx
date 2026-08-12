import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, MapPin, Minus, Plus, X } from "lucide-react";
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

const STEPS = 3;

function SurveyPage() {
  const { surveyId } = Route.useParams();
  const { data: survey, isLoading } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: () => fetchSurvey(surveyId),
  });

  const [step, setStep] = useState(1);
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
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

  const next = () => {
    if (step === 1 && body.trim().length === 0) {
      toast.error("Scrivi qualcosa prima di proseguire.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = body.trim();
    if (text.length === 0) {
      toast.error("Scrivi qualcosa prima di inviare.");
      setStep(1);
      return;
    }
    setSending(true);
    const { error } = await supabase.from("responses").insert({
      survey_id: surveyId,
      body: text.slice(0, 5000),
      author_name: name.trim() ? name.trim().slice(0, 100) : null,
      phone: phone.trim() ? phone.trim().slice(0, 40) : null,
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

  const restart = () => {
    setSent(false);
    setStep(1);
    setBody("");
    setName("");
    setPhone("");
    setMarker(null);
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
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check className="size-7" />
            </div>
            <p className="mt-4 font-display text-4xl text-primary">
              Grazie per la partecipazione!
            </p>
            <p className="mt-3 text-base font-semibold text-foreground">
              La tua risposta è stata registrata correttamente.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Il tuo contributo ci aiuta a capire i problemi del quartiere. Le risposte
              sono anonime e non vengono pubblicate.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={restart}>
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
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">{survey.title}</h1>
            {survey.description && step === 1 && (
              <p className="mt-2 text-sm text-muted-foreground">{survey.description}</p>
            )}

            <div className="mt-4 flex items-center gap-2">
              {Array.from({ length: STEPS }, (_, i) => (
                <span
                  key={i}
                  className={`h-1.5 flex-1 rounded-full ${
                    i + 1 <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Passo {step} di {STEPS}
            </p>

            <form onSubmit={submit} className="mt-6">
              {step === 1 && (
                <div>
                  <Label htmlFor="body" className="font-display text-2xl text-primary">
                    Qual è il problema più importante per te?
                  </Label>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Scrivi liberamente: nessun filtro, non serve registrarsi.
                  </p>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={8}
                    maxLength={5000}
                    autoFocus
                    placeholder="Racconta qui…"
                    className="mt-3 text-base"
                  />
                  <Button type="button" size="lg" className="mt-4 w-full" onClick={next}>
                    Prosegui <ArrowRight className="size-4" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <p className="font-display text-2xl text-primary">
                    Vuoi indicare il luogo preciso?
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Basta un tocco sulla mappa. È facoltativo.
                  </p>

                  <div className="mt-3 overflow-hidden rounded-xl border border-border">
                    <MapView
                      mode="pick"
                      polygon={survey.polygon}
                      marker={marker}
                      onMarkerChange={handleMarker}
                      className="h-72 w-full"
                    />
                    <div className="flex items-center justify-between gap-2 bg-muted px-3 py-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {marker ? "Punto indicato" : "Tocca la mappa per indicare il punto"}
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

                  <div className="mt-3 rounded-lg bg-accent/15 p-3 text-xs text-foreground">
                    <p className="font-semibold">Come ingrandire o rimpicciolire la mappa</p>
                    <ul className="mt-1 space-y-1 text-muted-foreground">
                      <li className="flex items-center gap-1">
                        <Plus className="size-3" />
                        <Minus className="size-3" />
                        Usa i pulsanti in alto a sinistra della mappa.
                      </li>
                      <li>Da telefono: avvicina o allontana due dita sullo schermo.</li>
                      <li>Da computer: doppio clic per ingrandire; trascina per spostarti.</li>
                    </ul>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                    >
                      <ArrowLeft className="size-4" /> Indietro
                    </Button>
                    <Button type="button" size="lg" className="flex-1" onClick={next}>
                      Prosegui <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div>
                  <p className="font-display text-2xl text-primary">
                    Vuoi lasciare nome e telefono?
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Solo se ti va di fare due chiacchiere con noi. Puoi restare anonimo.
                  </p>

                  <div className="mt-3 space-y-4">
                    <div>
                      <Label htmlFor="name">Nome (facoltativo)</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={100}
                        placeholder="Come ti chiami?"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefono (facoltativo)</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={40}
                        placeholder="Es. 340 1234567"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(2)}
                    >
                      <ArrowLeft className="size-4" /> Indietro
                    </Button>
                    <Button type="submit" size="lg" className="flex-1" disabled={sending}>
                      {sending ? "Invio…" : "Invia"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
