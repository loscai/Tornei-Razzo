// Logica pura del torneo: tipi, definizione degli stage, modalità, mate e calcolo degli sblocchi.
// Nessuna dipendenza da React: usata sia dal client che dalle API route.

export const RANKS = [
  { id: "bronze", label: "Bronze", color: "#cd7f32" },
  { id: "silver", label: "Silver", color: "#c0c7d1" },
  { id: "gold", label: "Gold", color: "#f5c542" },
  { id: "diamond", label: "Diamond", color: "#5ec8ff" },
  { id: "champion", label: "Champion", color: "#b77bff" },
  { id: "grand-champion", label: "Grand Champion", color: "#ff4d6d" },
  { id: "supersonic-legend", label: "Supersonic Legend", color: "#f0f0ff" },
] as const;

export type RankId = (typeof RANKS)[number]["id"];

/** Modalità predefinite richieste */
export const DEFAULT_MODES = [
  "1v1 Soccar",
  "2v2 Soccar",
  "3v3 Soccar",
  "2v2 Heatseeker",
  "2v2 Pentathlon",
  "3v3 Heatseeker",
  "3v3 Dropshot",
] as const;

export type DefaultMode = (typeof DEFAULT_MODES)[number];

/** Percorso dell'immagine del rank: basta inserire i file in /public/assets/ranks/ */
export const rankImagePath = (rank: RankId) => `/assets/ranks/${rank}.png`;
export const TROPHY_IMAGE_PATH = "/assets/trophy.png";

export const getRank = (id: RankId) => RANKS.find((r) => r.id === id) ?? RANKS[0];

/** Punteggio: l'utente gioca sempre "in casa" (lato sinistro). */
export interface Score {
  me: number;
  opp: number;
}

export type StageId = "r1" | "r2" | "qf" | "sf" | "f";

export interface StageDef {
  id: StageId;
  label: string;
  short: string;
  format: "bo1" | "bo3";
  games: number;
}

export const STAGES: StageDef[] = [
  { id: "r1", label: "Round 1", short: "R1", format: "bo1", games: 1 },
  { id: "r2", label: "Round 2", short: "R2", format: "bo1", games: 1 },
  { id: "qf", label: "Quarti di Finale", short: "QF", format: "bo1", games: 1 },
  { id: "sf", label: "Semifinale", short: "SF", format: "bo3", games: 3 },
  { id: "f", label: "Finale", short: "F", format: "bo3", games: 3 },
];

export interface TournamentState {
  id: string;
  /** Numero progressivo del torneo (#1, #2, ...) */
  number: number;
  createdAt: number;
  rank: RankId;
  /** Modalità di gioco (es. 2v2 Soccar) */
  mode: string;
  /** Compagni di squadra (mate) per questo torneo */
  teammates: string[];
  results: Record<StageId, (Score | null)[]>;
  updatedAt: number;
}

/**
 * Dati completi dell'app: elenco dei tornei in ordine cronologico inverso
 * + eventuali modalità personalizzate create dall'admin.
 */
export interface AppData {
  tournaments: TournamentState[];
  customModes: string[];
  updatedAt: number;
}

const MAX_TOURNAMENTS = 500;

export type StageStatus = "locked" | "active" | "won" | "lost";
export type GameStatus = "locked" | "playable" | "won" | "lost" | "skipped";

export interface GameView {
  index: number;
  status: GameStatus;
  score: Score | null;
}

export interface StageView {
  def: StageDef;
  status: StageStatus;
  wins: number;
  losses: number;
  games: GameView[];
}

export interface BracketView {
  stages: StageView[];
  champion: boolean;
  eliminatedAt: StageDef | null;
  current: StageDef | null;
}

export const isWin = (s: Score) => s.me > s.opp;

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const emptyResults = () =>
  Object.fromEntries(
    STAGES.map((s) => [s.id, Array.from({ length: s.games }, () => null)])
  ) as TournamentState["results"];

export function createInitialState(
  number = 1,
  rank: RankId = "bronze",
  mode = "2v2 Soccar",
  teammates: string[] = []
): TournamentState {
  return {
    id: `t-${number}`,
    number,
    createdAt: 0,
    rank,
    mode,
    teammates,
    results: emptyResults(),
    updatedAt: 0,
  };
}

export function createInitialData(): AppData {
  return { tournaments: [createInitialState()], customModes: [], updatedAt: 0 };
}

/** true se nel torneo è stato inserito almeno un risultato. */
export const hasResults = (t: TournamentState) =>
  Object.values(t.results).some((games) => games.some((g) => g !== null));

export interface NewTournamentParams {
  rank?: RankId;
  mode?: string;
  teammates?: string[];
  createdAt?: number;
}

/** Archivia il torneo attuale e ne apre uno nuovo in cima alla lista */
export function withNewTournament(data: AppData, params?: NewTournamentParams): AppData {
  const current = data.tournaments[0];
  const maxNumber = Math.max(0, ...data.tournaments.map((t) => t.number));
  const next: TournamentState = {
    id: newId(),
    number: maxNumber + 1,
    createdAt: params?.createdAt && params.createdAt > 0 ? params.createdAt : Date.now(),
    rank: params?.rank ?? current?.rank ?? "bronze",
    mode: params?.mode ?? current?.mode ?? "2v2 Soccar",
    teammates: params?.teammates ?? [],
    results: emptyResults(),
    updatedAt: Date.now(),
  };
  return {
    ...data,
    tournaments: [next, ...data.tournaments].slice(0, MAX_TOURNAMENTS),
    updatedAt: Date.now(),
  };
}

/** Sostituisce il torneo attuale (indice 0). */
export function withCurrent(data: AppData, current: TournamentState): AppData {
  return { ...data, tournaments: [current, ...data.tournaments.slice(1)], updatedAt: Date.now() };
}

/** Aggiunge una nuova modalità personalizzata (evita duplicati). */
export function withAddedMode(data: AppData, newMode: string): AppData {
  const clean = newMode.trim();
  if (!clean) return data;
  const allKnown = new Set([...DEFAULT_MODES, ...data.customModes]);
  if (allKnown.has(clean)) return data;
  return {
    ...data,
    customModes: [...data.customModes, clean],
    updatedAt: Date.now(),
  };
}

/** Rimuove un torneo archiviato (il torneo attuale non si può eliminare). */
export function withoutTournament(data: AppData, id: string): AppData {
  if (data.tournaments[0]?.id === id) return data;
  return { ...data, tournaments: data.tournaments.filter((t) => t.id !== id), updatedAt: Date.now() };
}

/**
 * Calcola lo stato derivato del tabellone a partire dai risultati salvati.
 * Tutto è ricalcolato a ogni modifica, quindi una correzione aggiorna
 * automaticamente "a cascata" gli sblocchi degli stage successivi.
 */
export function computeBracket(state: TournamentState): BracketView {
  const stages: StageView[] = [];
  let prevWon = true;
  let eliminatedAt: StageDef | null = null;
  let current: StageDef | null = null;

  for (const def of STAGES) {
    const raw = state.results[def.id] ?? [];

    if (!prevWon) {
      stages.push({
        def,
        status: "locked",
        wins: 0,
        losses: 0,
        games: Array.from({ length: def.games }, (_, index) => ({
          index,
          status: "locked" as const,
          score: null,
        })),
      });
      continue;
    }

    const needed = def.format === "bo3" ? 2 : 1;
    let wins = 0;
    let losses = 0;
    const games: GameView[] = [];

    for (let i = 0; i < def.games; i++) {
      if (wins >= needed || losses >= needed) {
        games.push({ index: i, status: "skipped", score: null });
        continue;
      }
      const prevFilled = i === 0 || games[i - 1].score !== null;
      if (!prevFilled) {
        games.push({ index: i, status: "locked", score: null });
        continue;
      }
      const score = raw[i] ?? null;
      if (!score) {
        games.push({ index: i, status: "playable", score: null });
      } else if (isWin(score)) {
        wins++;
        games.push({ index: i, status: "won", score });
      } else {
        losses++;
        games.push({ index: i, status: "lost", score });
      }
    }

    const status: StageStatus =
      wins >= needed ? "won" : losses >= needed ? "lost" : "active";

    if (status === "lost") eliminatedAt = def;
    if (status === "active") current = def;
    prevWon = status === "won";
    stages.push({ def, status, wins, losses, games });
  }

  const final = stages[stages.length - 1];
  return { stages, champion: final.status === "won", eliminatedAt, current };
}

/** Restituisce un nuovo stato con il punteggio aggiornato (o rimosso se null). */
export function withScore(
  state: TournamentState,
  stage: StageId,
  gameIndex: number,
  score: Score | null
): TournamentState {
  const games = [...state.results[stage]];
  games[gameIndex] = score;
  return { ...state, results: { ...state.results, [stage]: games }, updatedAt: Date.now() };
}

/** Valida/normalizza dati provenienti da storage o rete. */
export function sanitizeState(raw: unknown): TournamentState {
  const base = createInitialState();
  if (!raw || typeof raw !== "object") return base;
  const obj = raw as Partial<TournamentState>;

  const rank = RANKS.some((r) => r.id === obj.rank) ? (obj.rank as RankId) : base.rank;
  const mode = typeof obj.mode === "string" && obj.mode.trim().length > 0 ? obj.mode.trim().slice(0, 50) : "2v2 Soccar";
  const teammates = Array.isArray(obj.teammates)
    ? obj.teammates
        .filter((m): m is string => typeof m === "string" && m.trim().length > 0)
        .map((m) => m.trim().slice(0, 40))
    : [];

  const validScore = (s: unknown): Score | null => {
    if (!s || typeof s !== "object") return null;
    const { me, opp } = s as Score;
    const ok = (n: unknown) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= 99;
    return ok(me) && ok(opp) && me !== opp ? { me, opp } : null;
  };

  for (const def of STAGES) {
    const arr = obj.results?.[def.id];
    if (Array.isArray(arr)) {
      base.results[def.id] = Array.from({ length: def.games }, (_, i) => validScore(arr[i]));
    }
  }

  const num = (v: unknown, fallback: number) =>
    typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback;

  return {
    id: typeof obj.id === "string" && obj.id.length > 0 && obj.id.length <= 64 ? obj.id : base.id,
    number: Number.isInteger(obj.number) && (obj.number as number) > 0 ? (obj.number as number) : base.number,
    createdAt: num(obj.createdAt, num(obj.updatedAt, base.createdAt) || base.createdAt),
    rank,
    mode,
    teammates,
    results: base.results,
    updatedAt: num(obj.updatedAt, 0),
  };
}

/**
 * Valida i dati completi. Supporta anche il vecchio formato (singolo torneo),
 * che viene migrato automaticamente come Torneo #1.
 */
export function sanitizeAppData(raw: unknown): AppData {
  if (!raw || typeof raw !== "object") return createInitialData();
  const obj = raw as Partial<AppData> & Partial<TournamentState>;

  let tournaments: TournamentState[];
  if (Array.isArray(obj.tournaments)) {
    tournaments = obj.tournaments.slice(0, MAX_TOURNAMENTS).map(sanitizeState);
  } else if (obj.results) {
    tournaments = [sanitizeState(obj)];
  } else {
    tournaments = [];
  }
  if (tournaments.length === 0) return createInitialData();

  // id univoci (protezione da dati corrotti)
  const seen = new Set<string>();
  tournaments = tournaments.map((t) => {
    if (!seen.has(t.id)) {
      seen.add(t.id);
      return t;
    }
    const fixed = { ...t, id: newId() };
    seen.add(fixed.id);
    return fixed;
  });

  const customModes = Array.isArray(obj.customModes)
    ? Array.from(
        new Set(
          obj.customModes
            .filter((m): m is string => typeof m === "string" && m.trim().length > 0)
            .map((m) => m.trim().slice(0, 50))
        )
      )
    : [];

  const updatedAt =
    typeof obj.updatedAt === "number" ? obj.updatedAt : Math.max(...tournaments.map((t) => t.updatedAt));
  return { tournaments, customModes, updatedAt };
}

/** Statistiche dettagliate per ciascun compagno di squadra (mate) */
export interface MateStats {
  name: string;
  totalTournaments: number;
  victories: number;
  losses: number;
  winRate: number; // percentuale 0-100
  ranks: RankId[];
  modes: string[];
  lastPlayed: number;
  tournamentNumbers: number[];
}

/** Restituisce l'elenco alfabetico di tutti i compagni con cui si è giocato almeno una volta */
export function getAllMates(tournaments: TournamentState[]): string[] {
  const set = new Set<string>();
  for (const t of tournaments) {
    for (const m of t.teammates ?? []) {
      const clean = m.trim();
      if (clean) set.add(clean);
    }
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/** Calcola le statistiche aggregate per ogni compagno con cui si è giocato almeno una volta */
export function getMatesStats(tournaments: TournamentState[]): MateStats[] {
  const map = new Map<
    string,
    {
      name: string;
      total: number;
      victories: number;
      ranks: Set<RankId>;
      modes: Set<string>;
      lastPlayed: number;
      numbers: number[];
    }
  >();

  for (const t of tournaments) {
    const isChamp = computeBracket(t).champion;
    for (const rawName of t.teammates ?? []) {
      const name = rawName.trim();
      if (!name) continue;
      const key = name.toLowerCase();
      let entry = map.get(key);
      if (!entry) {
        entry = {
          name,
          total: 0,
          victories: 0,
          ranks: new Set<RankId>(),
          modes: new Set<string>(),
          lastPlayed: 0,
          numbers: [],
        };
        map.set(key, entry);
      }
      entry.total += 1;
      if (isChamp) entry.victories += 1;
      entry.ranks.add(t.rank);
      if (t.mode) entry.modes.add(t.mode);
      if (t.createdAt > entry.lastPlayed) entry.lastPlayed = t.createdAt;
      entry.numbers.push(t.number);
    }
  }

  return Array.from(map.values())
    .map((e) => ({
      name: e.name,
      totalTournaments: e.total,
      victories: e.victories,
      losses: e.total - e.victories,
      winRate: Math.round((e.victories / e.total) * 100),
      ranks: Array.from(e.ranks),
      modes: Array.from(e.modes),
      lastPlayed: e.lastPlayed,
      tournamentNumbers: e.numbers,
    }))
    .sort((a, b) => b.totalTournaments - a.totalTournaments || a.name.localeCompare(b.name));
}
