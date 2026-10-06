import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { SponsorsSection } from "@/components/SponsorsSection";

export const Route = createFileRoute("/patrocinatori")({
  head: () => ({
    meta: [
      { title: "Sponsors | Dimmi, ti ascolto" },
      { name: "description", content: "Le realtà che sostengono la raccolta di opinioni sui quartieri di Pordenone." },
      { property: "og:title", content: "Sponsors — Dimmi, ti ascolto" },
      { property: "og:description", content: "Grazie a chi sostiene il progetto sui quartieri di Pordenone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="py-6">
        <SponsorsSection showEmpty />
      </main>
      <SiteFooter />
    </div>
  ),
});
