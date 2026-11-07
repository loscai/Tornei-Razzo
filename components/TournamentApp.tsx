"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTournament } from "@/hooks/useTournament";
import { formatDate, formatDateTime } from "@/lib/format";
import { STAGES, computeBracket, hasResults, type StageId } from "@/lib/tournament";
import Bracket from "./Bracket";
import EditTournamentModal from "./EditTournamentModal";
import Header from "./Header";
import LoginModal from "./LoginModal";
import MatesModal from "./MatesModal";
import NewTournamentModal from "./NewTournamentModal";
import ScoreModal, { type ScoreTarget } from "./ScoreModal";
import StatusBanner from "./StatusBanner";
import TournamentHistory from "./TournamentHistory";
import { TrophyOverlay, TrophySection } from "./Trophy";

/** Componente principale: torneo attuale in alto, storico (dal più recente) sotto. */
export default function TournamentApp() {
  const t = useTournament();
  const { current } = t;
  const bracket = useMemo(() => computeBracket(current), [current]);
  const finished = bracket.champion || bracket.eliminatedAt !== null;

  const [loginOpen, setLoginOpen] = useState(false);
  const [matesOpen, setMatesOpen] = useState(false);
  const [newTournamentOpen, setNewTournamentOpen] = useState(false);
  const [editTournamentOpen, setEditTournamentOpen] = useState(false);
  const [editing, setEditing] = useState<{ stage: StageId; game: number } | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mostra l'overlay del trofeo quando la Finale passa a "vinta" durante la sessione
  const prevChampion = useRef<{ id: string; champion: boolean } | null>(null);
  useEffect(() => {
    if (t.loading) return;
    const prev = prevChampion.current;
    if (prev && prev.id === current.id && !prev.champion && bracket.champion) setCelebrate(true);
    prevChampion.current = { id: current.id, champion: bracket.champion };
  }, [bracket.champion, current.id, t.loading]);

  // Se l'admin esce, chiude eventuali popup aperti
  useEffect(() => {
    if (!t.isAdmin) {
      setEditing(null);
      setNewTournamentOpen(false);
      setEditTournamentOpen(false);
    }
  }, [t.isAdmin]);

  const scoreTarget = useMemo<ScoreTarget | null>(() => {
    if (!editing) return null;
    const def = STAGES.find((s) => s.id === editing.stage)!;
    return {
      stageLabel: def.label,
      gameLabel: def.format === "bo3" ? `Partita ${editing.game + 1} di 3` : "Partita secca",
      initial: current.results[editing.stage][editing.game] ?? null,
    };
  }, [editing, current.results]);

  const handleReset = () => {
    if (window.confirm(`Vuoi davvero azzerare tutti i risultati del Torneo #${current.number}?`)) t.reset();
  };

  const handleOpenNewTournament = () => {
    if (hasResults(current) && !finished) {
      if (
        !window.confirm(
          `Il Torneo #${current.number} non è ancora terminato. Vuoi archiviarlo comunque e configurarne uno nuovo?`
        )
      ) {
        return;
      }
    }
    setNewTournamentOpen(true);
  };

  if (!mounted) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 pt-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-razzo-cyan/20 border-t-razzo-cyan" />
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 pt-5 pb-16 sm:px-6 lg:px-8">
      <Header
        rank={current.rank}
        mode={current.mode}
        teammates={current.teammates}
        allMatesCount={t.allMates.length}
        isAdmin={t.isAdmin}
        saving={t.saving}
        onRankChange={t.setRank}
        onOpenMates={() => setMatesOpen(true)}
        onEditTournament={() => setEditTournamentOpen(true)}
        onAdminClick={() => setLoginOpen(true)}
        onLogout={t.logout}
      />

      {t.error && (
        <div className="mx-auto mt-6 flex max-w-xl animate-fade-in items-center justify-between gap-3 rounded-xl border border-razzo-loss/40 bg-razzo-loss/10 px-4 py-2.5 text-sm text-razzo-loss">
          <span>{t.error}</span>
          <button onClick={t.dismissError} className="font-bold" aria-label="Chiudi avviso">
            ✕
          </button>
        </div>
      )}

      <div className="mt-10">
        {t.loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-razzo-cyan/20 border-t-razzo-cyan" />
          </div>
        ) : (
          <>
            {/* Torneo attuale (o ultimo giocato) */}
            <section key={current.id} className="animate-fade-in">
              <div className="mb-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-center">
                <span className="rounded-md bg-razzo-cyan/15 px-2 py-0.5 text-[10px] font-bold tracking-[0.25em] text-razzo-cyan uppercase">
                  {finished ? "Ultimo torneo" : "Torneo attuale"}
                </span>
                <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase">
                  Torneo #{current.number}
                </h2>
                <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-display text-xs font-bold text-cyan-200">
                  {current.mode}
                </span>
                {current.teammates && current.teammates.length > 0 && (
                  <span className="text-xs text-slate-300">
                    Mate:{" "}
                    <span className="font-semibold text-cyan-300">
                      {current.teammates.map((m) => `@${m}`).join(", ")}
                    </span>
                  </span>
                )}
                {current.createdAt > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-slate-300">
                    <span>🕒</span>
                    <span>{formatDateTime(current.createdAt)}</span>
                  </span>
                )}
              </div>

              <StatusBanner bracket={bracket} />

              <div className="mt-8">
                <Bracket
                  bracket={bracket}
                  isAdmin={t.isAdmin}
                  onSlotClick={(stage, game) => setEditing({ stage, game })}
                />
              </div>
              {bracket.champion && <TrophySection />}
            </section>

            {t.isAdmin && (
              <div className="mt-10 flex flex-col items-center gap-3 text-center">
                <div className="flex flex-wrap justify-center gap-3">
                  <button
                    onClick={handleOpenNewTournament}
                    className={`rounded-xl px-5 py-2.5 font-display text-xs font-bold tracking-widest uppercase transition ${
                      finished
                        ? "animate-glow bg-gradient-to-r from-razzo-cyan to-sky-500 text-slate-950 hover:brightness-110"
                        : "border border-razzo-cyan/40 bg-razzo-panel text-razzo-cyan hover:bg-razzo-cyan/10"
                    }`}
                  >
                    + Nuovo torneo
                  </button>
                  <button
                    onClick={() => setEditTournamentOpen(true)}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold tracking-wider text-slate-300 uppercase transition hover:border-cyan-400/50 hover:text-cyan-300"
                  >
                    Modifica modalità / mate
                  </button>
                  <button
                    onClick={handleReset}
                    className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold tracking-wider text-slate-500 uppercase transition hover:border-razzo-loss/50 hover:text-razzo-loss"
                  >
                    Azzera risultati
                  </button>
                </div>
                {finished && (
                  <p className="text-xs text-slate-400">
                    Torneo concluso: clicca su <strong>+ Nuovo torneo</strong> per scegliere modalità e compagni del prossimo.
                  </p>
                )}
                {!t.persistent && (
                  <p className="max-w-lg text-xs text-amber-300/80">
                    Storage condiviso non configurato: i risultati sono salvati solo in questo browser. Collega
                    Upstash Redis su Vercel per renderli visibili a tutti.
                  </p>
                )}
              </div>
            )}

            {/* Storico: dal più recente al primo */}
            <TournamentHistory tournaments={t.history} isAdmin={t.isAdmin} onDelete={t.deleteTournament} />
          </>
        )}
      </div>

      <footer className="mt-16 text-center text-xs text-slate-600">
        Tornei Lega del Razzo · {t.isAdmin ? "Modalità Admin" : "Sola lettura"}
      </footer>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} onLogin={t.login} />

      <ScoreModal
        target={scoreTarget}
        onClose={() => setEditing(null)}
        onSave={(score) => {
          if (editing) t.setScore(editing.stage, editing.game, score);
          setEditing(null);
        }}
        onClear={() => {
          if (editing) t.setScore(editing.stage, editing.game, null);
          setEditing(null);
        }}
      />

      <NewTournamentModal
        open={newTournamentOpen}
        onClose={() => setNewTournamentOpen(false)}
        currentRank={current.rank}
        currentMode={current.mode}
        allModes={t.allModes}
        allMates={t.allMates}
        onAddCustomMode={t.addCustomMode}
        onCreate={t.newTournament}
      />

      <EditTournamentModal
        open={editTournamentOpen}
        onClose={() => setEditTournamentOpen(false)}
        tournament={current}
        allModes={t.allModes}
        allMates={t.allMates}
        onAddCustomMode={t.addCustomMode}
        onSave={t.updateCurrentTournament}
      />

      <MatesModal open={matesOpen} onClose={() => setMatesOpen(false)} matesStats={t.matesStats} />

      <TrophyOverlay open={celebrate} onClose={() => setCelebrate(false)} />
    </main>
  );
}
