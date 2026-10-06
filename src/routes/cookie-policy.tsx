import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";
import { apriPreferenzeCookie } from "@/components/CookieBanner";

export const Route = createFileRoute("/cookie-policy")({
  head: () => ({
    meta: [
      { title: "Informativa sui cookie | Dimmi, ti ascolto" },
      { name: "description", content: "Quali cookie e strumenti di memorizzazione usa il sito Dimmi, ti ascolto." },
      { property: "og:title", content: "Informativa sui cookie — Dimmi, ti ascolto" },
      { property: "og:description", content: "Solo strumenti tecnici e statistiche anonime, nessuna profilazione." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CookiePage,
});

function CookiePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 text-sm text-muted-foreground">
        <h1 className="text-2xl font-extrabold text-foreground">Informativa sui cookie</h1>
        <p>
          Questa informativa è resa ai sensi dell'art. 122 del D.Lgs. 196/2003, della Direttiva
          2002/58/CE e delle Linee guida del Garante privacy del 10 giugno 2021.
        </p>
        <h2 className="text-lg font-bold text-foreground">Strumenti tecnici (sempre attivi)</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li><strong>consenso-cookie</strong> (memoria locale): ricorda la tua scelta sul banner.</li>
          <li><strong>Sessione di accesso</strong> (memoria locale): solo per l'amministratore che effettua l'accesso.</li>
          <li><strong>Identificativo di visita</strong> (memoria di sessione): numero casuale, cancellato alla chiusura della scheda.</li>
        </ul>
        <h2 className="text-lg font-bold text-foreground">Statistiche</h2>
        <p>
          Contiamo le visite in forma anonima e aggregata, senza indirizzo IP e senza incrocio con
          altri dati. Se scegli "Rifiuta" il conteggio viene disattivato.
        </p>
        <h2 className="text-lg font-bold text-foreground">Servizi di terze parti</h2>
        <p>
          La mappa usa le tessere di OpenStreetMap e i caratteri tipografici sono caricati da Google
          Fonts: questi servizi possono ricevere l'indirizzo IP del tuo dispositivo per fornire il
          contenuto. Non usiamo cookie di profilazione né pubblicitari.
        </p>
        <h2 className="text-lg font-bold text-foreground">Modificare la scelta</h2>
        <p>
          Puoi modificare o revocare la tua scelta in qualsiasi momento con il link "Gestisci
          consenso cookie" in fondo a ogni pagina, oppure qui:{" "}
          <button type="button" onClick={apriPreferenzeCookie} className="font-semibold text-primary underline">
            modifica le preferenze
          </button>
          . Per informazioni:{" "}
          <a href="mailto:privacy@friulion.it" className="underline hover:text-foreground">privacy@friulion.it</a>.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
