import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, LogOut, Plus } from "lucide-react";
import { MapView } from "@/components/MapView";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { countResponses, fetchMySurveys } from "@/lib/surveys";

export const Route = createFileRoute("/_authenticated/gestione/")({
  head: () => ({
    meta: [
      { title: "Le mie indagini | Dimmi, ti ascolto" },
      {
        name: "description",
        content: "Gestisci le indagini di quartiere, condividi i link e leggi le risposte.",
      },
      { property: "og:title", content: "Le mie indagini" },
      { property: "og:description", content: "Area gestore delle indagini di quartiere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ManagePage,
});

function ManagePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const { data: surveys } = useQuery({
    queryKey: ["my-surveys", userId],
    queryFn: () => fetchMySurveys(userId!),
    enabled: !!userId,
  });

  const { data: counts } = useQuery({
    queryKey: ["response-counts", surveys?.map((s) => s.id).join(",")],
    queryFn: () => countResponses(surveys!.map((s) => s.id)),
    enabled: !!surveys && surveys.length > 0,
  });

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const copyLink = (id: string) => {
    void navigator.clipboard.writeText(`${window.location.origin}/s/${id}`);
    toast.success("Link copiato.");
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
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-primary">Le mie indagini</h1>
          <Button asChild>
            <Link to="/gestione/nuova">
              <Plus className="size-4" /> Nuova indagine
            </Link>
          </Button>
        </div>

        {surveys?.length === 0 && (
          <p className="mt-6 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Non hai ancora creato indagini.
          </p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {surveys?.map((survey) => (
            <article
              key={survey.id}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <MapView mode="view" polygon={survey.polygon} className="h-36 w-full" />
              <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-bold text-card-foreground">{survey.title}</h2>
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
                  <Button size="sm" variant="outline" onClick={() => copyLink(survey.id)}>
                    <Copy className="size-4" /> Copia link
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
