import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MapView } from "@/components/MapView";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { fetchActiveSurveys } from "@/lib/surveys";
import notepad from "@/assets/dimmi-poster.jpg.asset.json";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dimmi, ti ascolto — I problemi dei quartieri di Pordenone" },
      {
        name: "description",
        content:
          "Racconta in modo anonimo qual è il problema più importante del tuo quartiere a Pordenone. Nessuna registrazione, scrivi liberamente.",
      },
      { property: "og:title", content: "Dimmi, ti ascolto — I problemi dei quartieri di Pordenone" },
      {
        property: "og:description",
        content:
          "Racconta in modo anonimo qual è il problema più importante del tuo quartiere a Pordenone. Nessuna registrazione, scrivi liberamente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: surveys, isLoading } = useQuery({
    queryKey: ["surveys", "active"],
    queryFn: fetchActiveSurveys,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <section className="bg-primary px-4 pb-8 pt-4 text-primary-foreground">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            I problemi dei <span className="text-accent">QUARTIERI</span> di Pordenone
          </h1>
        </div>
      </section>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid items-start gap-6 lg:grid-cols-2">
          <div>
            {isLoading && (
              <p className="text-sm text-muted-foreground">Caricamento…</p>
            )}

            {!isLoading && (surveys?.length ?? 0) === 0 && (
              <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Al momento non ci sono indagini aperte. Torna a trovarci presto.
              </p>
            )}

            <div className="grid gap-4">
              {surveys?.map((survey) => (
                <article
                  key={survey.id}
                  className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                >
                  <MapView mode="view" polygon={survey.polygon} className="h-40 w-full" />
                  <div className="p-4">
                    {survey.neighborhood && (
                      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                        {survey.neighborhood}
                      </p>
                    )}
                    <h3 className="mt-1 text-lg font-bold text-card-foreground">
                      {survey.title}
                    </h3>
                    {survey.description && (
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                        {survey.description}
                      </p>
                    )}
                    <Button asChild className="mt-4 w-full">
                      <Link to="/s/$surveyId" params={{ surveyId: survey.id }}>
                        Dimmi la tua
                      </Link>
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="text-center">
            <img
              src={notepad.url}
              alt="Cartello Dimmi ti ascolto — I problemi dei quartieri di Pordenone"
              className="mx-auto w-full max-w-sm rounded-xl shadow-lg"
            />

            <p className="mt-6 text-base text-foreground">
              Scrivi il più importante per te e inseriscilo qui.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Nessuna registrazione, nessun filtro: il nome è facoltativo.
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
