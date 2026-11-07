"use client";

import type { BracketView } from "@/lib/tournament";

/** Riepilogo dello stato del torneo sopra il tabellone. */
export default function StatusBanner({ bracket }: { bracket: BracketView }) {
  const { champion, eliminatedAt, current } = bracket;

  let tone = "border-razzo-cyan/30 bg-razzo-cyan/5 text-razzo-cyan";
  let title = "Torneo in corso";
  let detail = current ? `Prossimo match: ${current.label}` : "";

  if (champion) {
    tone = "border-amber-400/40 bg-amber-400/10 text-amber-300";
    title = "Campioni del torneo!";
    detail = "Finale vinta 🏆";
  } else if (eliminatedAt) {
    tone = "border-razzo-loss/40 bg-razzo-loss/10 text-razzo-loss";
    title = "Percorso concluso";
    detail = `Eliminati in ${eliminatedAt.label}`;
  }

  return (
    <div
      key={title}
      className={`mx-auto flex w-fit max-w-full animate-fade-in flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border px-5 py-2 text-center ${tone}`}
    >
      <span className="font-display text-xs font-bold tracking-[0.25em] uppercase">{title}</span>
      {detail && <span className="text-sm text-slate-300">{detail}</span>}
    </div>
  );
}
