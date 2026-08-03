import { Link } from "@tanstack/react-router";

export function SiteHeader({ action }: { action?: React.ReactNode }) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-lg font-bold text-primary">
            FC
          </span>
          <span className="leading-tight">
            <span className="block text-[11px] uppercase tracking-wide opacity-90">
              La Fabbrica della Città Nuova
            </span>
            <span className="block font-display text-lg text-accent">
              Dimmi, ti ascolto
            </span>
          </span>
        </Link>
        {action}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-border py-6 text-center text-xs text-muted-foreground">
      La Fabbrica della Città Nuova · I problemi dei quartieri di Pordenone
    </footer>
  );
}
