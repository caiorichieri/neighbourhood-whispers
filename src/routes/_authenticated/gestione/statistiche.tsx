import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye, MapPin, MessageSquare, Phone, Smartphone, Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { fetchAllResponses, fetchAllSurveys } from "@/lib/surveys";
import { fetchPageViews } from "@/lib/visits";

export const Route = createFileRoute("/_authenticated/gestione/statistiche")({
  head: () => ({
    meta: [
      { title: "Statistiche | Dimmi, ti ascolto" },
      {
        name: "description",
        content: "Visite al sito e andamento delle risposte raccolte nelle indagini di quartiere.",
      },
      { property: "og:title", content: "Statistiche" },
      { property: "og:description", content: "Visite e risposte delle indagini di quartiere." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StatsPage,
});

const RANGES = [
  { label: "7 giorni", days: 7 },
  { label: "30 giorni", days: 30 },
  { label: "90 giorni", days: 90 },
];

function dayKey(iso: string) {
  return iso.slice(0, 10);
}

function labelOf(key: string) {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

function StatsPage() {
  const [days, setDays] = useState(30);

  const { data: views } = useQuery({
    queryKey: ["page-views", days],
    queryFn: () => fetchPageViews(days),
  });
  const { data: responses } = useQuery({ queryKey: ["all-responses"], queryFn: fetchAllResponses });
  const { data: surveys } = useQuery({ queryKey: ["all-surveys"], queryFn: fetchAllSurveys });

  const since = useMemo(() => Date.now() - days * 24 * 60 * 60 * 1000, [days]);
  const periodResponses = useMemo(
    () => (responses ?? []).filter((r) => new Date(r.created_at).getTime() >= since),
    [responses, since],
  );

  const daily = useMemo(() => {
    const map = new Map<string, { day: string; visite: number; risposte: number }>();
    for (let i = days - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      map.set(key, { day: labelOf(key), visite: 0, risposte: 0 });
    }
    for (const v of views ?? []) {
      const row = map.get(dayKey(v.created_at));
      if (row) row.visite += 1;
    }
    for (const r of periodResponses) {
      const row = map.get(dayKey(r.created_at));
      if (row) row.risposte += 1;
    }
    return [...map.values()];
  }, [views, periodResponses, days]);

  const totalViews = views?.length ?? 0;
  const sessions = new Set((views ?? []).map((v) => v.session_id ?? v.id)).size;
  const mobileShare = totalViews
    ? Math.round(((views ?? []).filter((v) => v.is_mobile).length / totalViews) * 100)
    : 0;

  const byPage = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of views ?? []) map.set(v.path, (map.get(v.path) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [views]);

  const bySource = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of views ?? []) {
      let key = "Diretto";
      if (v.referrer) {
        try {
          const host = new URL(v.referrer).hostname.replace(/^www\./, "");
          if (host && !host.includes("localhost")) key = host;
        } catch {
          key = "Altro";
        }
      }
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [views]);

  const perSurvey = useMemo(() => {
    return (surveys ?? []).map((s) => ({
      name: s.title.length > 18 ? `${s.title.slice(0, 18)}…` : s.title,
      visite: (views ?? []).filter((v) => v.survey_id === s.id).length,
      risposte: periodResponses.filter((r) => r.survey_id === s.id).length,
    }));
  }, [surveys, views, periodResponses]);

  const withPoint = periodResponses.filter((r) => r.lat != null && r.lng != null).length;
  const withPhone = periodResponses.filter((r) => r.phone).length;
  const conversion = totalViews ? Math.round((periodResponses.length / totalViews) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        action={
          <Button asChild variant="secondary" size="sm">
            <Link to="/gestione">
              <ArrowLeft className="size-4" /> Dashboard
            </Link>
          </Button>
        }
      />
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl text-primary">Statistiche</h1>
          <div className="flex gap-2">
            {RANGES.map((r) => (
              <Button
                key={r.days}
                size="sm"
                variant={days === r.days ? "default" : "outline"}
                onClick={() => setDays(r.days)}
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Stat icon={<Eye className="size-4" />} label="Visite" value={totalViews} />
          <Stat icon={<Users className="size-4" />} label="Sessioni" value={sessions} />
          <Stat
            icon={<Smartphone className="size-4" />}
            label="Da mobile"
            value={`${mobileShare}%`}
          />
          <Stat
            icon={<MessageSquare className="size-4" />}
            label="Risposte"
            value={periodResponses.length}
          />
          <Stat icon={<MapPin className="size-4" />} label="Con mappa" value={withPoint} />
          <Stat icon={<Phone className="size-4" />} label="Contatti" value={withPhone} />
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Tasso di partecipazione: <strong className="text-primary">{conversion}%</strong> delle
          visite si è trasformato in una risposta.
        </p>

        <section className="mt-8 rounded-xl border border-border bg-card p-4">
          <h2 className="font-display text-2xl text-primary">Visite e risposte per giorno</h2>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="visite"
                  name="Visite"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="risposte"
                  name="Risposte"
                  stroke="hsl(var(--accent-foreground))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {perSurvey.length > 0 && (
          <section className="mt-6 rounded-xl border border-border bg-card p-4">
            <h2 className="font-display text-2xl text-primary">Per indagine</h2>
            <div className="mt-4 h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perSurvey} margin={{ left: -20, right: 8, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="visite" name="Visite" fill="hsl(var(--primary))" radius={4} />
                  <Bar dataKey="risposte" name="Risposte" fill="hsl(var(--muted-foreground))" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <ListCard title="Pagine più viste" rows={byPage} />
          <ListCard title="Provenienza" rows={bySource} />
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
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-2xl font-extrabold text-primary">{value}</p>
    </div>
  );
}

function ListCard({ title, rows }: { title: string; rows: [string, number][] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <h2 className="font-display text-xl text-primary">{title}</h2>
      {rows.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">Ancora nessun dato.</p>
      )}
      <ul className="mt-3 space-y-2">
        {rows.map(([label, value]) => (
          <li key={label} className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate text-card-foreground">{label}</span>
            <span className="font-semibold text-primary">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
