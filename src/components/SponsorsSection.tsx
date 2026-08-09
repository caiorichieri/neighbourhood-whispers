import { useQuery } from "@tanstack/react-query";
import { fetchSponsors } from "@/lib/sponsors";

export function SponsorsSection() {
  const { data: sponsors } = useQuery({ queryKey: ["sponsors"], queryFn: fetchSponsors });

  if (!sponsors || sponsors.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      <h2 className="text-center font-display text-2xl text-primary">Patrocinatori</h2>
      <p className="mt-1 text-center text-sm text-muted-foreground">
        Grazie a chi sostiene questo progetto.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
        {sponsors.map((s) => {
          const img = (
            <img
              src={s.logo_url}
              alt={`Logo ${s.name}`}
              className="h-16 w-auto max-w-[180px] object-contain"
              loading="lazy"
            />
          );
          return (
            <div key={s.id} className="flex flex-col items-center gap-1">
              {s.website_url ? (
                <a href={s.website_url} target="_blank" rel="noopener noreferrer">
                  {img}
                </a>
              ) : (
                img
              )}
              {s.website_url && (
                <a
                  href={s.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground underline hover:text-primary"
                >
                  {s.website_url.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
