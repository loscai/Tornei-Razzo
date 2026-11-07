"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_MODES,
  createInitialData,
  createInitialState,
  getAllMates,
  getMatesStats,
  sanitizeAppData,
  withAddedMode,
  withCurrent,
  withNewTournament,
  withoutTournament,
  withScore,
  type AppData,
  type NewTournamentParams,
  type RankId,
  type Score,
  type StageId,
} from "@/lib/tournament";

const LOCAL_KEY = "tornei-lega-del-razzo:state";
const SESSION_PW_KEY = "tornei-lega-del-razzo:admin";
const POLL_MS = 20_000;

/**
 * Archivio tornei + autenticazione admin.
 * - data.tournaments[0] è il torneo attuale, i successivi sono lo storico (dal più recente).
 * - Legge i dati dal server (/api/state). Se il server non ha storage persistente,
 *   usa localStorage come fallback.
 * - I visitatori (read-only) ricevono aggiornamenti periodici.
 */
export function useTournament() {
  const [data, setData] = useState<AppData>(createInitialData);
  const [loading, setLoading] = useState(true);
  const [persistent, setPersistent] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  const readLocal = () => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? sanitizeAppData(JSON.parse(raw)) : null;
    } catch {
      return null;
    }
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const json = (await res.json()) as { data: unknown; persistent: boolean };
      const remote = sanitizeAppData(json.data);
      setPersistent(json.persistent);
      if (json.persistent) {
        setData(remote);
      } else {
        const local = readLocal();
        setData(local && local.updatedAt >= remote.updatedAt ? local : remote);
      }
    } catch {
      const local = readLocal();
      if (local) setData(local);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(SESSION_PW_KEY);
    if (saved) setPassword(saved);
    load();
  }, [load]);

  // Aggiornamento live per i visitatori
  useEffect(() => {
    if (password || !persistent) return;
    const id = setInterval(load, POLL_MS);
    return () => clearInterval(id);
  }, [password, persistent, load]);

  const login = useCallback(async (pw: string) => {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "Accesso negato.");
    sessionStorage.setItem(SESSION_PW_KEY, pw);
    setPassword(pw);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_PW_KEY);
    setPassword(null);
  }, []);

  const commit = useCallback(
    async (next: AppData) => {
      if (!password) return;
      const prev = dataRef.current;
      dataRef.current = next;
      setData(next);
      setError(null);
      try {
        localStorage.setItem(LOCAL_KEY, JSON.stringify(next));
      } catch {
        /* storage pieno o disabilitato */
      }
      setSaving(true);
      try {
        const res = await fetch("/api/state", {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-admin-password": password },
          body: JSON.stringify(next),
        });
        if (res.status === 401) {
          dataRef.current = prev;
          setData(prev);
          logout();
          setError("Sessione admin non valida: effettua di nuovo l'accesso.");
        } else if (!res.ok) {
          setError("Salvataggio sul server non riuscito (dati salvati in locale).");
        }
      } catch {
        setError("Connessione assente: dati salvati solo in locale.");
      } finally {
        setSaving(false);
      }
    },
    [password, logout]
  );

  const current = data.tournaments[0];

  const allModes = useMemo(() => {
    return Array.from(new Set([...DEFAULT_MODES, ...(data.customModes ?? [])]));
  }, [data.customModes]);

  const allMates = useMemo(() => {
    return getAllMates(data.tournaments);
  }, [data.tournaments]);

  const matesStats = useMemo(() => {
    return getMatesStats(data.tournaments);
  }, [data.tournaments]);

  const setRank = useCallback(
    (rank: RankId) => {
      const d = dataRef.current;
      commit(withCurrent(d, { ...d.tournaments[0], rank, updatedAt: Date.now() }));
    },
    [commit]
  );

  const updateCurrentTournament = useCallback(
    (patch: { rank?: RankId; mode?: string; teammates?: string[]; createdAt?: number }) => {
      const d = dataRef.current;
      const cur = d.tournaments[0];
      commit(
        withCurrent(d, {
          ...cur,
          rank: patch.rank ?? cur.rank,
          mode: patch.mode ?? cur.mode,
          teammates: patch.teammates ?? cur.teammates,
          createdAt: patch.createdAt && patch.createdAt > 0 ? patch.createdAt : cur.createdAt,
          updatedAt: Date.now(),
        })
      );
    },
    [commit]
  );

  const addCustomMode = useCallback(
    (newMode: string) => {
      commit(withAddedMode(dataRef.current, newMode));
    },
    [commit]
  );

  const setScore = useCallback(
    (stage: StageId, game: number, score: Score | null) => {
      const d = dataRef.current;
      commit(withCurrent(d, withScore(d.tournaments[0], stage, game, score)));
    },
    [commit]
  );

  /** Azzera i risultati del torneo attuale (mantiene numero, data, rank, mode e mate). */
  const reset = useCallback(() => {
    const d = dataRef.current;
    const cur = d.tournaments[0];
    const fresh = createInitialState(cur.number, cur.rank, cur.mode, cur.teammates);
    commit(withCurrent(d, { ...fresh, id: cur.id, createdAt: cur.createdAt, updatedAt: Date.now() }));
  }, [commit]);

  /** Archivia il torneo attuale nello storico e ne apre uno nuovo con parametri specificati. */
  const newTournament = useCallback(
    (params?: NewTournamentParams) => {
      commit(withNewTournament(dataRef.current, params));
    },
    [commit]
  );

  const deleteTournament = useCallback(
    (id: string) => commit(withoutTournament(dataRef.current, id)),
    [commit]
  );

  return {
    data,
    current,
    history: data.tournaments.slice(1),
    allModes,
    allMates,
    matesStats,
    loading,
    persistent,
    saving,
    error,
    dismissError: () => setError(null),
    isAdmin: password !== null,
    login,
    logout,
    setRank,
    updateCurrentTournament,
    addCustomMode,
    setScore,
    reset,
    newTournament,
    deleteTournament,
  };
}
