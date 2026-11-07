# Tornei Lega del Razzo 🚀

Tracker interattivo del tabellone del torneo (Next.js App Router + React + Tailwind CSS v4), pronto per Vercel.

## Avvio locale

```bash
npm install
npm run dev
```

Apri http://localhost:3000. In sviluppo, se `ADMIN_PASSWORD` non è impostata, la password admin predefinita è `admin`.

## Nuove Funzionalità: Modalità e Compagni di Squadra (Mate)

1. **Modalità di Gioco Predefinite e Personalizzate:**
   - Predefinite: `1v1 Soccar`, `2v2 Soccar`, `3v3 Soccar`, `2v2 Heatseeker`, `2v2 Pentathlon`, `3v3 Heatseeker`, `3v3 Dropshot`.
   - Dal pannello Admin (creazione o modifica torneo) puoi aggiungere **qualsiasi nuova modalità al volo** (es. `4v4 Chaos`, `Hoops`, `Rumble`, ecc.). Le nuove modalità vengono salvate persistentemente nell'archivio.

2. **Gestione Compagni di Squadra (Mate):**
   - Durante la creazione del torneo puoi associare uno o più compagni (es. 1 mate per 2v2, 2 mate per 3v3).
   - Inserimento rapido con autocomplete/suggerimenti dai compagni con cui hai già giocato.
   - **Lista Mate con Ricerca:** cliccando sul pulsante **👥 Mate** nella barra superiore si apre un pannello dedicato con ricerca in tempo reale per nome, modalità o rank, con statistiche aggregate (tornei giocati insieme, vittorie 🏆, win rate % e storico tornei).

## Immagini

Inserisci i file in `public/assets/` (vedi [public/assets/README.md](public/assets/README.md)):

- `public/assets/ranks/{bronze|silver|gold|diamond|champion|grand-champion|supersonic-legend}.png`
- `public/assets/trophy.png`

Finché un file manca viene mostrato un segnaposto grafico dedicato.

## Deploy su Vercel

1. Carica il progetto su GitHub e importalo su [vercel.com/new](https://vercel.com/new) (framework rilevato in automatico).
2. In **Settings → Environment Variables** aggiungi `ADMIN_PASSWORD` (obbligatoria in produzione).
3. **Consigliato – risultati visibili a tutti:** in **Storage → Marketplace** aggiungi **Upstash Redis** e collegalo
   al progetto. Vercel crea in automatico `KV_REST_API_URL` e `KV_REST_API_TOKEN`; l'app li usa senza altre modifiche.
   Senza questo storage i risultati vengono salvati solo nel browser dell'admin (localStorage).
4. Rifai il deploy.

## Struttura

```
app/
  page.tsx, layout.tsx, globals.css
  api/auth/route.ts            verifica password admin (env ADMIN_PASSWORD)
  api/state/route.ts           GET pubblico / PUT protetto da password
components/
  TournamentApp.tsx            composizione della pagina
  Header.tsx, RankLogo.tsx, RankSelect.tsx
  Bracket.tsx, StageCard.tsx, MatchSlot.tsx, StatusBanner.tsx
  NewTournamentModal.tsx       creazione torneo (rank, modalità, mate, aggiunta nuove modalità)
  EditTournamentModal.tsx      modifica rapida del torneo attuale
  MatesModal.tsx               lista e ricerca compagni con statistiche
  ScoreModal.tsx, LoginModal.tsx, Trophy.tsx
  ui/Modal.tsx, ui/FallbackImage.tsx
hooks/useTournament.ts         stato, salvataggio, modalità, mate, login
lib/tournament.ts              logica: bracket, modalità, statistiche mate, sanitizzazione
lib/store.ts                   persistenza (Upstash Redis REST o memoria)
lib/auth.ts                    controllo password
```

## Regole del tabellone

- Il punteggio a sinistra è sempre il tuo ("in casa"): `3 - 2` = vittoria, `2 - 3` = sconfitta. Il pareggio non è ammesso.
- Round 1 → Round 2 → Quarti (partita secca) → Semifinale (Bo3) → Finale (Bo3).
- Bo3: 2 vittorie sbloccano lo stage successivo, 2 sconfitte chiudono il torneo; la 3ª partita appare solo se serve.
- Ogni risultato è modificabile dall'admin: gli sblocchi si ricalcolano a cascata. I risultati degli stage
  che tornano bloccati vengono conservati, così correggere un refuso ripristina il percorso.
- I tornei passati sono archiviati in ordine cronologico inverso ed espandibili in sola lettura.
