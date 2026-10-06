import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Informativa sulla privacy | Dimmi, ti ascolto" },
      { name: "description", content: "Come trattiamo i dati raccolti con le indagini sui quartieri di Pordenone, ai sensi del Regolamento UE 2016/679 (GDPR)." },
      { property: "og:title", content: "Informativa sulla privacy — Dimmi, ti ascolto" },
      { property: "og:description", content: "Informativa ai sensi degli artt. 13-14 del GDPR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function Sezione({ titolo, children }: { titolo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="text-lg font-bold text-foreground">{titolo}</h2>
      <div className="mt-2 space-y-2 text-sm text-muted-foreground">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-extrabold text-foreground">Informativa sulla privacy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 ("GDPR") e del D.Lgs. 196/2003
          come modificato dal D.Lgs. 101/2018.
        </p>

        <Sezione titolo="1. Titolare del trattamento">
          <p>La Fabbrica della Città Nuova — Pordenone.</p>
          <p>
            Realizzazione tecnica del sito: Friulion, P.Iva 03157410303, via Sedegliano, 22 — 33033
            Codroipo (Ud), che opera come responsabile del trattamento.
          </p>
        </Sezione>

        <Sezione titolo="2. Responsabile della protezione dei dati (DPO)">
          <p>
            Caio Silvestre Richieri — C.F. SLVCAI76D16Z602F
            <br />
            Email:{" "}
            <a href="mailto:privacy@friulion.it" className="underline hover:text-foreground">
              privacy@friulion.it
            </a>
          </p>
        </Sezione>

        <Sezione titolo="3. Quali dati trattiamo">
          <ul className="list-disc space-y-1 pl-5">
            <li>Il testo dell'opinione che scrivi (obbligatorio per partecipare). Non è richiesta alcuna registrazione.</li>
            <li>Il punto indicato sulla mappa, se scegli di segnarlo (facoltativo).</li>
            <li>Una foto del luogo, se scegli di caricarla (facoltativa).</li>
            <li>Nome e numero di telefono, solo se scegli di lasciarli per essere ricontattato (facoltativi).</li>
            <li>Dati tecnici anonimi di navigazione: pagina visitata, provenienza, tipo di dispositivo e un identificativo casuale di sessione, senza indirizzo IP.</li>
          </ul>
          <p>
            Ti invitiamo a non inserire nel testo o nelle foto dati di terzi, volti riconoscibili,
            targhe o dati particolari (salute, opinioni politiche, religione, ecc.).
          </p>
        </Sezione>

        <Sezione titolo="4. Finalità e base giuridica">
          <ul className="list-disc space-y-1 pl-5">
            <li>Raccogliere e analizzare le segnalazioni sui problemi dei quartieri: consenso dell'interessato espresso con l'invio volontario (art. 6.1.a GDPR).</li>
            <li>Ricontattarti, solo se hai lasciato nome e telefono: consenso (art. 6.1.a GDPR).</li>
            <li>Statistiche anonime sulle visite e sicurezza del sito: legittimo interesse del titolare (art. 6.1.f GDPR).</li>
          </ul>
        </Sezione>

        <Sezione titolo="5. Destinatari e conservazione">
          <p>
            Le risposte sono visibili solo all'amministratore dell'indagine e non vengono pubblicate.
            I dati sono conservati su infrastruttura cloud del fornitore tecnico e non vengono
            venduti né ceduti a terzi per finalità commerciali.
          </p>
          <p>
            I dati sono conservati per il tempo necessario allo svolgimento dell'indagine e alle
            relative attività di analisi; puoi chiederne in qualsiasi momento la cancellazione.
          </p>
        </Sezione>

        <Sezione titolo="6. I tuoi diritti">
          <p>
            Puoi esercitare in ogni momento i diritti di accesso, rettifica, cancellazione,
            limitazione, portabilità, opposizione e revoca del consenso (artt. 15-22 GDPR), senza
            pregiudizio per la liceità del trattamento precedente, scrivendo a{" "}
            <a href="mailto:privacy@friulion.it" className="underline hover:text-foreground">
              privacy@friulion.it
            </a>
            .
          </p>
          <p>
            Hai inoltre diritto di proporre reclamo al Garante per la protezione dei dati personali
            (
            <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
              www.garanteprivacy.it
            </a>
            ).
          </p>
        </Sezione>

        <Sezione titolo="7. Natura del conferimento">
          <p>
            Il conferimento dei dati è volontario. Nome, telefono, posizione e foto sono facoltativi:
            se non li fornisci puoi comunque partecipare in forma anonima.
          </p>
        </Sezione>
      </main>
      <SiteFooter />
    </div>
  );
}
