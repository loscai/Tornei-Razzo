"use client";

import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import { computeBracket, getRank, type StageView, type TournamentState } from "@/lib/tournament";
import Bracket from "./Bracket";
import OutcomeBadge from "./OutcomeBadge";
import RankLogo from "./RankLogo";

interface HistoryCardProps {
  tournament: TournamentState;
  isAdmin: boolean;
  onDelete: () => void;
}

/** Card compatta di un torneo archiviato, espandibile per vedere il tabellone completo. */
export default function HistoryCard({ tournament, isAdmin, onDelete }: HistoryCardProps) {
  const [open, setOpen] = useState(false);
  const bracket = useMemo(() => computeBracket(tournament), [tournament]);
  const rank = getRank(tournament.rank);
  const played = bracket.stages.filter((s) => s.games.some((g) => g.score));

  const accent = bracket.champion
    ? "border-amber-400/30 hover:border-amber-400/50"
    : bracket.eliminatedAt
      ? "border-razzo-loss/20 hover:border-razzo-loss/40"
      : "border-white/10 hover:border-white/20";

  return (
    <article className={`animate-pop-in rounded-2xl border bg-razzo-panel/70 backdrop-blur transition-colors ${accent}`}>
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <RankLogo rank={tournament.rank} className="h-12 w-12 sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-base font-bold tracking-wider text-white uppercase">
                Torneo #{tournament.number}
              </h3>
              <OutcomeBadge bracket={bracket} />
              {tournament.mode && (
                <span className="rounded-md border border-cyan-400/30 bg-cyan-400/10 px-2 py-0.5 font-display text-[10px] font-bold tracking-wide text-cyan-200">
                  {tournament.mode}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1 font-medium text-slate-300">
                <span>🕒</span>
                <span>{formatDateTime(tournament.createdAt)}</span>
              </span>
              <span>·</span>
              <span style={{ color: rank.color }} className="font-semibold">{rank.label}</span>
              {tournament.teammates && tournament.teammates.length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-cyan-300">
                    Mate: {tournament.teammates.map((m) => `@${m}`).join(", ")}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Percorso sintetico */}
        <div className="flex flex-wrap gap-1.5 sm:justify-end">
          {played.length === 0 ? (
            <span className="text-xs text-slate-500">Nessun risultato</span>
          ) : (
            played.map((s) => <StageChip key={s.def.id} stage={s} />)
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-white/5 px-4 py-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-razzo-cyan"
          aria-expanded={open}
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {open ? "Nascondi tabellone" : "Mostra tabellone"}
        </button>
        {isAdmin && (
          <button
            onClick={onDelete}
            className="text-xs font-semibold text-slate-600 transition hover:text-razzo-loss"
          >
            Elimina
          </button>
        )}
      </div>

      {/* Tabellone completo (sola lettura) con espansione animata */}
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          {open && (
            <div className="border-t border-white/5 p-4">
              <Bracket bracket={bracket} isAdmin={false} onSlotClick={() => {}} />
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function StageChip({ stage }: { stage: StageView }) {
  const { def, status, wins, losses, games } = stage;
  const color =
    status === "won"
      ? "border-razzo-win/40 bg-razzo-win/10 text-razzo-win"
      : status === "lost"
        ? "border-razzo-loss/40 bg-razzo-loss/10 text-razzo-loss"
        : "border-white/10 bg-white/5 text-slate-300";

  const scores = games.filter((g) => g.score).map((g) => `${g.score!.me}-${g.score!.opp}`);
  const text = def.format === "bo3" ? `${wins}-${losses}` : scores[0];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-display text-[11px] font-bold ${color}`}
      title={`${def.label}: ${scores.join(", ")}`}
    >
      <span className="text-slate-500">{def.short}</span>
      <span className="tabular-nums">{text}</span>
    </span>
  );
}
