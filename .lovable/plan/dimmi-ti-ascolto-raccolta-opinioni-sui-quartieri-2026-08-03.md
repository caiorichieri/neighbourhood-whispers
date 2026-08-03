# Dimmi, ti ascolto — raccolta opinioni sui quartieri

Sito in italiano per raccogliere in modo anonimo le opinioni dei cittadini sui problemi dei quartieri. Il gestore crea un sondaggio disegnando l'area sulla mappa; chi partecipa scrive liberamente, senza filtri e senza identificarsi.

## Pagine

**Home (pubblica)**
- Intestazione con logo "La Fabbrica della Città Nuova", titolo "I problemi dei quartieri di Pordenone".
- Elenco dei sondaggi attivi con mappa in miniatura dell'area.
- Pulsante "Accedi" per il gestore.

**Pagina sondaggio (pubblica, link condivisibile)**
- Mappa con l'area evidenziata (poligono).
- Campo di testo libero, nessun filtro, nessun limite di argomento.
- Nome facoltativo.
- Marcatura del punto sulla mappa **facoltativa**: si clicca dentro l'area per indicare dove si trova il problema; si può inviare anche senza.
- Dopo l'invio: messaggio di ringraziamento. Le risposte non sono pubbliche.

**Accesso gestore**
- Login con email e password (registrazione + recupero password).

**Area gestore (protetta)**
- Nuovo sondaggio: titolo, descrizione, quartiere, disegno del poligono sulla mappa (strumento di disegno: clic per i vertici, modifica e cancellazione), stato attivo/chiuso.
- Elenco dei sondaggi con numero di risposte e link da condividere.
- Dettaglio sondaggio: tutte le risposte in elenco, mappa con i punti segnalati, esportazione CSV.

## Note tecniche

- Backend con Lovable Cloud: autenticazione email/password per il gestore; tabelle `surveys` (titolo, descrizione, poligono GeoJSON, stato, owner) e `responses` (survey_id, testo, nome facoltativo, punto lat/lng facoltativo, data).
- RLS: solo il gestore proprietario legge/gestisce i propri sondaggi e ne legge le risposte; il pubblico può leggere i sondaggi attivi e inserire risposte, mai leggerle.
- Mappa: Leaflet con tile OpenStreetMap (nessun account o chiave esterna), caricata solo lato client; disegno del poligono con strumento di editing e validazione "punto dentro l'area".
- Rotte protette del gestore sotto il layout autenticato; le pagine pubbliche restano indicizzabili e condivisibili.
- Stile ispirato al cartello: blu acceso, gialli in evidenza, testo scritto a mano per gli accenti; interfaccia interamente in italiano, ottimizzata per telefono.
