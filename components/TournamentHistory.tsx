"use client";

import { computeBracket, type TournamentState } from "@/lib/tournament";
import HistoryCard from "./HistoryCard";

interface TournamentHistoryProps {
  /** Tornei archiviati, già in ordine cronologico inverso (dal più recente al primo). */
  tournaments: TournamentState[];
  isAdmin: boolean;
  onDelete: (id: string) => void;
}

/** Storico dei tornei passati, mostrato sotto al torneo attuale. */
export default function TournamentHistory({ tournaments, isAdmin, onDelete }: TournamentHistoryProps) {
  if (tournaments.length === 0) return null;

  const champions = tournaments.filter((t) => computeBracket(t).champion).length;

  return (
    <section className="mt-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.35em] text-razzo-cyan uppercase">Archivio</p>
          <h2 className="mt-1 font-display text-xl font-black tracking-wider text-white uppercase sm:text-2xl">
            Storico tornei
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          {tournaments.length} {tournaments.length === 1 ? "torneo archiviato" : "tornei archiviati"}
          {champions > 0 && <span className="text-amber-300"> · {champions} 🏆</span>}
        </p>
      </div>

      <div className="space-y-3">
        {tournaments.map((t) => (
          <HistoryCard
            key={t.id}
            tournament={t}
            isAdmin={isAdmin}
            onDelete={() => {
              if (window.confirm(`Eliminare definitivamente il Torneo #${t.number} dallo storico?`)) onDelete(t.id);
            }}
          />
        ))}
      </div>
    </section>
  );
}
