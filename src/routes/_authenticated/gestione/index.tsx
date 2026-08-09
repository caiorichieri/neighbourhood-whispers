import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Copy, LogOut, MapPin, MessageSquare, Pencil, Phone, Plus, Trash2 } from "lucide-react";
import { MapView } from "@/components/MapView";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  countResponses,
  deleteSurvey,
  fetchAllResponses,
  fetchAllSurveys,
} from "@/lib/surveys";
import { createSponsor, deleteSponsor, fetchSponsors } from "@/lib/sponsors";



export const Route = createFileRoute("/_authenticated/gestione/")({
  head: () => ({
    meta: [
      { title: "Dashboard indagini | Dimmi, ti ascolto" },
      {
        name: "description",
        content: "Dashboard del gestore: indagini, risposte raccolte e contatti lasciati.",
      },
      { property: "og:title", content: "Dashboard indagini" },
      { property: "og:description", content: "Area gestore delle indagini di quartiere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManagePage,
});

function ManagePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();



  const { data: surveys } = useQuery({
    queryKey: ["all-surveys"],
    queryFn: fetchAllSurveys,
  });

  const { data: counts } = useQuery({
    queryKey: ["response-counts", surveys?.map((s) => s.id).join(",")],
    queryFn: () => countResponses(surveys!.map((s) => s.id)),
    enabled: !!surveys && surveys.length > 0,
  });

  const { data: responses } = useQuery({
    queryKey: ["all-responses"],
    queryFn: fetchAllResponses,
  });

  const titleOf = (id: string) => surveys?.find((s) => s.id === id)?.title ?? "Indagine";

  const withPoint = responses?.filter((r) => r.lat != null && r.lng != null).length ?? 0;
  const withPhone = responses?.filter((r) => r.phone).length ?? 0;

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const copyLink = (id: string) => {
    void navigator.clipboard.writeText(`${window.location.origin}/s/${id}`);
    toast.success("Link copiato.");
  };

  const removeSurvey = async (id: string) => {
    if (!window.confirm("Eliminare l'indagine e tutte le risposte? L'azione è definitiva.")) return;
    try {
      await deleteSurvey(id);
    } catch {
      toast.error("Eliminazione non riuscita.");
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["all-surveys"] });
    await queryClient.invalidateQueries({ queryKey: ["all-responses"] });
    toast.success("Indagine eliminata.");
  };


  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        action={
          <Button variant="secondary" size="sm" onClick={logout}>
            <LogOut className="size-4" /> Esci
          </Button>
        }
      />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-primary">Dashboard</h1>
          <Button asChild>
            <Link to="/gestione/nuova">
              <Plus className="size-4" /> Nuova indagine
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Stat
            icon={<MessageSquare className="size-4" />}
            label="Risposte totali"
            value={responses?.length ?? 0}
          />
          <Stat
            icon={<MapPin className="size-4" />}
            label="Con punto sulla mappa"
            value={withPoint}
          />
          <Stat icon={<Phone className="size-4" />} label="Contatti lasciati" value={withPhone} />
        </div>

        <h2 className="mt-10 font-display text-2xl text-primary">Indagini</h2>
        {surveys?.length === 0 && (
          <p className="mt-4 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Non c'è ancora nessuna indagine.
          </p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {surveys?.map((survey) => (
            <article
              key={survey.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <MapView mode="view" polygon={survey.polygon} className="h-36 w-full" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-card-foreground">{survey.title}</h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      survey.status === "active"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {survey.status === "active" ? "Attiva" : "Chiusa"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {counts?.[survey.id] ?? 0} risposte
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link to="/gestione/$surveyId" params={{ surveyId: survey.id }}>
                      Vedi risposte
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <Link to="/gestione/modifica/$surveyId" params={{ surveyId: survey.id }}>
                      <Pencil className="size-4" /> Modifica
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyLink(survey.id)}>
                    <Copy className="size-4" /> Copia link
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeSurvey(survey.id)}>
                    <Trash2 className="size-4" /> Elimina
                  </Button>
                </div>

              </div>
            </article>
          ))}
        </div>

        <SponsorsManager />

        <h2 className="mt-10 font-display text-2xl text-primary">Ultime risposte</h2>

        <div className="mt-4 space-y-3">
          {responses?.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Ancora nessuna risposta.
            </p>
          )}
          {responses?.slice(0, 30).map((r) => (
            <article key={r.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <Link
                  to="/gestione/$surveyId"
                  params={{ surveyId: r.survey_id }}
                  className="font-semibold text-primary underline"
                >
                  {titleOf(r.survey_id)}
                </Link>
                <span>{new Date(r.created_at).toLocaleString("it-IT")}</span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-card-foreground">{r.body}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span>{r.author_name || "Anonimo"}</span>
                {r.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="size-3" /> {r.phone}
                  </span>
                )}
                {r.lat != null && r.lng != null && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" /> {r.lat.toFixed(5)}, {r.lng.toFixed(5)}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-3xl font-extrabold text-primary">{value}</p>
    </div>
  );
}

function SponsorsManager() {
  const queryClient = useQueryClient();
  const { data: sponsors } = useQuery({ queryKey: ["sponsors"], queryFn: fetchSponsors });
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) {
      toast.error("Inserisci il nome e carica il logo.");
      return;
    }
    setSaving(true);
    try {
      await createSponsor({
        name: name.trim(),
        website_url: url.trim() ? (url.startsWith("http") ? url.trim() : `https://${url.trim()}`) : null,
        file,
      });
      setName("");
      setUrl("");
      setFile(null);
      await queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast.success("Patrocinatore aggiunto.");
    } catch {
      toast.error("Salvataggio non riuscito.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    const sponsor = sponsors?.find((s) => s.id === id);
    if (!sponsor) return;
    if (!window.confirm("Eliminare questo patrocinatore?")) return;
    try {
      await deleteSponsor(sponsor);
      await queryClient.invalidateQueries({ queryKey: ["sponsors"] });
      toast.success("Patrocinatore eliminato.");
    } catch {
      toast.error("Eliminazione non riuscita.");
    }
  };

  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl text-primary">Patrocinatori</h2>
      <form
        onSubmit={submit}
        className="mt-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-3"
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome del patrocinatore"
          maxLength={120}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Sito web (es. www.esempio.it)"
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <div className="sm:col-span-3">
          <Button type="submit" size="sm" disabled={saving}>
            <Plus className="size-4" /> {saving ? "Caricamento…" : "Aggiungi patrocinatore"}
          </Button>
        </div>
      </form>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {sponsors?.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
          >
            <img src={s.logo_url} alt={`Logo ${s.name}`} className="h-14 w-24 object-contain" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-card-foreground">{s.name}</p>
              {s.website_url && (
                <a
                  href={s.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block truncate text-xs text-muted-foreground underline"
                >
                  {s.website_url}
                </a>
              )}
            </div>
            <Button size="sm" variant="destructive" onClick={() => remove(s.id)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
