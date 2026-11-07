"use client";

import type { BracketView } from "@/lib/tournament";

/** Badge sintetico con l'esito di un torneo. */
export default function OutcomeBadge({ bracket, size = "sm" }: { bracket: BracketView; size?: "sm" | "md" }) {
  const { champion, eliminatedAt } = bracket;
  const pad = size === "md" ? "px-3 py-1 text-xs" : "px-2.5 py-0.5 text-[10px]";

  if (champion) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-400/10 font-bold tracking-wider text-amber-300 uppercase ${pad}`}>
        🏆 Campioni
      </span>
    );
  }
  if (eliminatedAt) {
    return (
      <span className={`inline-flex items-center rounded-full border border-razzo-loss/50 bg-razzo-loss/10 font-bold tracking-wider text-razzo-loss uppercase ${pad}`}>
        Eliminati · {eliminatedAt.short}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full border border-white/15 bg-white/5 font-bold tracking-wider text-slate-400 uppercase ${pad}`}>
      Non concluso
    </span>
  );
}
