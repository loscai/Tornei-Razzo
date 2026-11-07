"use client";

import type { GameView } from "@/lib/tournament";

interface MatchSlotProps {
  game: GameView;
  label: string;
  isAdmin: boolean;
  onClick: () => void;
}

/** Singolo slot partita del tabellone. */
export default function MatchSlot({ game, label, isAdmin, onClick }: MatchSlotProps) {
  const { status, score } = game;
  const editable = isAdmin && (status === "playable" || status === "won" || status === "lost");

  const styles: Record<GameView["status"], string> = {
    locked: "border-white/5 bg-white/[0.02] opacity-50",
    skipped: "border-dashed border-white/10 bg-transparent opacity-40",
    playable: "border-razzo-cyan/60 bg-razzo-cyan/[0.06] animate-glow",
    won: "border-razzo-win/40 bg-gradient-to-r from-razzo-win/15 to-transparent",
    lost: "border-razzo-loss/40 bg-gradient-to-r from-razzo-loss/15 to-transparent",
  };

  const Tag = editable ? "button" : "div";

  return (
    <Tag
      {...(editable ? { type: "button" as const, onClick } : {})}
      className={`group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border px-3 py-2.5 text-left transition-all duration-300 ${
        styles[status]
      } ${editable ? "cursor-pointer hover:-translate-y-0.5 hover:brightness-125 active:scale-[0.98]" : "cursor-default"}`}
      aria-label={editable ? `Modifica ${label}` : undefined}
    >
      {/* Barra laterale colorata */}
      <span
        className={`absolute inset-y-0 left-0 w-1 ${
          status === "won" ? "bg-razzo-win" : status === "lost" ? "bg-razzo-loss" : status === "playable" ? "bg-razzo-cyan" : "bg-transparent"
        }`}
      />

      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.2em] text-slate-500 uppercase">{label}</p>
        <div className="mt-0.5 flex items-center gap-2 text-sm">
          {score ? (
            <>
              <span className="font-semibold text-white">Tu</span>
              <span className="font-display text-lg font-black tabular-nums">
                <span className={status === "won" ? "text-razzo-win" : "text-slate-300"}>{score.me}</span>
                <span className="mx-1.5 text-slate-600">-</span>
                <span className={status === "lost" ? "text-razzo-loss" : "text-slate-300"}>{score.opp}</span>
              </span>
              <span className="font-semibold text-slate-400">Avv</span>
            </>
          ) : status === "playable" ? (
            <span className="font-medium text-razzo-cyan">{isAdmin ? "+ Inserisci risultato" : "In attesa…"}</span>
          ) : status === "skipped" ? (
            <span className="text-slate-500">Non necessaria</span>
          ) : (
            <span className="flex items-center gap-1.5 text-slate-500">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 118 0v4" />
              </svg>
              Bloccata
            </span>
          )}
        </div>
      </div>

      {(status === "won" || status === "lost") && (
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-display text-sm font-black ${
            status === "won" ? "bg-razzo-win/20 text-razzo-win" : "bg-razzo-loss/20 text-razzo-loss"
          }`}
        >
          {status === "won" ? "W" : "L"}
        </span>
      )}

      {editable && (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 shrink-0 text-slate-500 opacity-0 transition group-hover:opacity-100"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M4 20h4L18.5 9.5a2.1 2.1 0 00-3-3L5 17v3z" strokeLinejoin="round" />
        </svg>
      )}
    </Tag>
  );
}
