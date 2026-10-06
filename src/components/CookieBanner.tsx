import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const CHIAVE_CONSENSO = "consenso-cookie";

// Banner GDPR: visibile finché l'utente non sceglie Accetta o Rifiuta
export function CookieBanner() {
  const [visibile, setVisibile] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(CHIAVE_CONSENSO)) setVisibile(true);
  }, []);

  const decidi = (scelta: "accettato" | "rifiutato") => {
    localStorage.setItem(CHIAVE_CONSENSO, scelta);
    setVisibile(false);
  };

  if (!visibile) return null;

  return (
    <div
      role="dialog"
      aria-label="Consenso ai cookie"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card p-4 shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Usiamo solo strumenti tecnici necessari al funzionamento del sito e un conteggio
          anonimo delle visite. Nessun cookie di profilazione o pubblicità. Leggi l'{" "}
          <Link to="/cookie-policy" className="underline hover:text-foreground">
            informativa sui cookie
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => decidi("rifiutato")}
            className="rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
          >
            Rifiuta
          </button>
          <button
            onClick={() => decidi("accettato")}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Accetta
          </button>
        </div>
      </div>
    </div>
  );
}

export function haRifiutatoCookie() {
  return typeof window !== "undefined" && localStorage.getItem(CHIAVE_CONSENSO) === "rifiutato";
}
