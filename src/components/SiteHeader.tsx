import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo-fabbrica.jpg";
import friuliOnLogo from "@/assets/friulion-logo.png.asset.json";

export function SiteHeader({ action }: { action?: React.ReactNode }) {
  return (
    <header className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo La Fabbrica della Città Nuova"
            className="size-11 shrink-0 rounded-full bg-background object-cover"
          />
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
    <footer className="mt-12 border-t border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 py-3">
        <div className="flex flex-row items-center justify-center gap-3">
          <img
            src={friuliOnLogo.url}
            alt="Friuli On"
            className="h-32 w-auto object-contain"
          />
          <div className="text-left text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Realizzato da Friuli On</p>
            <p>
              Tel.{" "}
              <a href="tel:+393518230667" className="underline hover:text-primary">
                351 823 0667
              </a>
              {" · "}P.IVA 03157410303{" · "}
              <a
                href="https://friulion.it"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-primary"
              >
                friulion.it
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
