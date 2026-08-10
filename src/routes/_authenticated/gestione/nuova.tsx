import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/_authenticated/gestione/nuova")({
  head: () => ({
    meta: [
      { title: "Nuova indagine | Dimmi, ti ascolto" },
      {
        name: "description",
        content:
          "Crea una nuova indagine di quartiere disegnando l'area sulla mappa di Pordenone.",
      },
      { property: "og:title", content: "Nuova indagine di quartiere" },
      {
        property: "og:description",
        content: "Disegna l'area sulla mappa e raccogli le opinioni dei cittadini.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewSurvey,
});

function NewSurvey() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [description, setDescription] = useState("");
  const [polygon, setPolygon] = useState<LatLng[]>([]);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length === 0) {
      toast.error("Inserisci un titolo.");
      return;
    }
    if (polygon.length > 0 && polygon.length < 3) {
      toast.error("Disegna almeno 3 punti oppure lascia l'area vuota.");
      return;
    }

    setBusy(true);
    const { data: userData } = await supabase.auth.getUser();
    const ownerId = userData.user?.id;
    if (!ownerId) {
      setBusy(false);
      toast.error("Sessione scaduta, accedi di nuovo.");
      return;
    }
    const { error } = await supabase.from("surveys").insert({
      owner_id: ownerId,
      title: title.trim().slice(0, 200),
      neighborhood: neighborhood.trim() ? neighborhood.trim().slice(0, 100) : null,
      description: description.trim() ? description.trim().slice(0, 1000) : null,
      polygon,
      status: "active",
    });
    setBusy(false);
    if (error) {
      toast.error("Creazione non riuscita. Riprova.");
      return;
    }
    toast.success("Indagine creata.");
    navigate({ to: "/gestione" });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="font-display text-3xl text-primary">Nuova indagine</h1>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label htmlFor="title">Titolo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Es. I problemi del centro"
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
              placeholder="Es. Torre"
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
            <Label>Area dell'indagine (facoltativa)</Label>
            <p className="mt-1 text-xs text-muted-foreground">
              Puoi creare l'indagine senza area. Se vuoi delimitarla, tocca la mappa per
              aggiungere i vertici: servono almeno 3 punti.
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

          <div className="flex gap-2">
            <Button type="submit" disabled={busy}>
              {busy ? "Salvataggio…" : "Crea indagine"}
            </Button>
            <Button asChild type="button" variant="outline">
              <Link to="/gestione">Annulla</Link>
            </Button>
          </div>
        </form>
      </main>
      <SiteFooter />
    </div>
  );
}
