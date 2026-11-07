"use client";

import type { RankId } from "@/lib/tournament";
import RankLogo from "./RankLogo";
import RankSelect from "./RankSelect";

interface HeaderProps {
  rank: RankId;
  mode: string;
  teammates: string[];
  allMatesCount: number;
  isAdmin: boolean;
  saving: boolean;
  onRankChange: (rank: RankId) => void;
  onOpenMates: () => void;
  onEditTournament: () => void;
  onAdminClick: () => void;
  onLogout: () => void;
}

export default function Header({
  rank,
  mode,
  teammates,
  allMatesCount,
  isAdmin,
  saving,
  onRankChange,
  onOpenMates,
  onEditTournament,
  onAdminClick,
  onLogout,
}: HeaderProps) {
  return (
    <header className="relative">
      {/* Barra superiore: stato + compagni + admin */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-slate-400 uppercase">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-razzo-loss opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-razzo-loss" />
            </span>
            Live Bracket
            {saving && <span className="text-razzo-cyan normal-case tracking-normal">· salvataggio…</span>}
          </div>

          {/* Tasto per consultare la lista Mate con ricerca */}
          <button
            onClick={onOpenMates}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-200"
            title="Visualizza e cerca tra tutti i compagni di squadra"
          >
            <span>👥</span>
            <span>Mate</span>
            {allMatesCount > 0 && (
              <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300">
                {allMatesCount}
              </span>
            )}
          </button>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-razzo-orange/50 bg-razzo-orange/10 px-3 py-1 text-[11px] font-bold tracking-widest text-razzo-orange uppercase sm:inline">
              Modalità Admin
            </span>
            <button
              onClick={onLogout}
              className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-razzo-loss/60 hover:text-razzo-loss"
            >
              Esci
            </button>
          </div>
        ) : (
          <button
            onClick={onAdminClick}
            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-400 transition hover:border-razzo-cyan/50 hover:text-razzo-cyan"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 118 0v4" />
            </svg>
            Admin
          </button>
        )}
      </div>

      {/* Titolo + logo rank + info torneo */}
      <div className="mt-8 flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left">
        <RankLogo rank={rank} className="h-20 w-20 sm:h-24 sm:w-24" />
        <div>
          <p className="text-xs font-semibold tracking-[0.35em] text-razzo-cyan uppercase">E-Sports Tournament</p>
          <h1 className="mt-1 font-display text-3xl leading-tight font-black tracking-wide uppercase sm:text-5xl">
            <span className="text-shine">Tornei Lega del Razzo</span>
          </h1>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <RankSelect rank={rank} isAdmin={isAdmin} onChange={onRankChange} />

            {/* Badge Modalità */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-3 py-1 font-display text-xs font-bold tracking-wider text-cyan-200 uppercase">
              🎮 {mode || "2v2 Soccar"}
            </span>

            {/* Mate del torneo attuale */}
            {teammates && teammates.length > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                <span className="text-slate-500">Mate:</span>
                <span className="font-semibold text-cyan-300">{teammates.map((m) => `@${m}`).join(", ")}</span>
              </span>
            ) : mode.startsWith("1v1") ? (
              <span className="inline-flex items-center rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-1 text-xs text-slate-500">
                Solo (1v1)
              </span>
            ) : null}

            {/* Tasto Admin per modificare rank, modalità o compagni */}
            {isAdmin && (
              <button
                type="button"
                onClick={onEditTournament}
                className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs font-semibold text-slate-400 transition hover:border-cyan-400/50 hover:text-cyan-300"
                title="Modifica modalità, rank o mate di questo torneo"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z" strokeLinejoin="round" />
                </svg>
                Modifica info
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
