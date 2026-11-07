"use client";

import type { StageView } from "@/lib/tournament";
import MatchSlot from "./MatchSlot";

interface StageCardProps {
  stage: StageView;
  isAdmin: boolean;
  onSlotClick: (gameIndex: number) => void;
}

const STATUS_UI = {
  locked: { text: "Bloccato", cls: "border-white/10 text-slate-500" },
  active: { text: "In corso", cls: "border-razzo-cyan/50 text-razzo-cyan bg-razzo-cyan/10" },
  won: { text: "Superato", cls: "border-razzo-win/50 text-razzo-win bg-razzo-win/10" },
  lost: { text: "Eliminato", cls: "border-razzo-loss/50 text-razzo-loss bg-razzo-loss/10" },
} as const;

/** Card di uno stage del tabellone (Bo1 o Bo3). */
export default function StageCard({ stage, isAdmin, onSlotClick }: StageCardProps) {
  const { def, status, wins, losses, games } = stage;
  const isBo3 = def.format === "bo3";
  const ui = STATUS_UI[status];

  const frame = {
    locked: "border-white/5 bg-razzo-panel/40 grayscale",
    active: "border-razzo-cyan/30 bg-razzo-panel/80 shadow-[0_0_40px_rgb(34_211_238/0.12)]",
    won: "border-razzo-win/25 bg-razzo-panel/80",
    lost: "border-razzo-loss/30 bg-razzo-panel/80",
  }[status];

  return (
    <section
      // Rimonta la card al momento dello sblocco per riprodurre l'animazione
      key={status === "locked" ? "locked" : "unlocked"}
      className={`relative w-full rounded-2xl border p-4 backdrop-blur transition-all duration-500 ${frame} ${
        status !== "locked" ? "animate-unlock" : ""
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-[10px] font-bold tracking-widest text-slate-500">{def.short}</span>
            <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              {isBo3 ? "Bo3" : "Bo1"}
            </span>
          </div>
          <h3 className="mt-1 font-display text-sm font-bold tracking-wider text-white uppercase">{def.label}</h3>
        </div>
        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${ui.cls}`}>
          {ui.text}
        </span>
      </div>

      {isBo3 && status !== "locked" && (
        <div className="mb-3 flex items-center justify-center gap-3 rounded-lg bg-black/30 py-1.5 font-display text-sm font-black">
          <span className="text-razzo-win">{wins}</span>
          <span className="flex gap-1">
            {games.map((g) => (
              <span
                key={g.index}
                className={`h-1.5 w-5 rounded-full transition-colors duration-500 ${
                  g.status === "won" ? "bg-razzo-win" : g.status === "lost" ? "bg-razzo-loss" : "bg-white/10"
                }`}
              />
            ))}
          </span>
          <span className="text-razzo-loss">{losses}</span>
        </div>
      )}

      <div className="space-y-2">
        {games.map((g) => (
          <MatchSlot
            key={g.index}
            game={g}
            label={isBo3 ? `Partita ${g.index + 1}` : "Partita secca"}
            isAdmin={isAdmin}
            onClick={() => onSlotClick(g.index)}
          />
        ))}
      </div>
    </section>
  );
}
