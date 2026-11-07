"use client";

import { RANKS, getRank, type RankId } from "@/lib/tournament";

interface RankSelectProps {
  rank: RankId;
  isAdmin: boolean;
  onChange: (rank: RankId) => void;
}

/** Select del rank (solo admin). In read-only mostra un semplice badge. */
export default function RankSelect({ rank, isAdmin, onChange }: RankSelectProps) {
  const r = getRank(rank);

  if (!isAdmin) {
    return (
      <span
        className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-display text-xs font-bold tracking-widest uppercase"
        style={{ borderColor: `${r.color}80`, color: r.color, background: `${r.color}14` }}
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: r.color }} />
        {r.label}
      </span>
    );
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Rank del torneo</span>
      <select
        value={rank}
        onChange={(e) => onChange(e.target.value as RankId)}
        className="cursor-pointer appearance-none rounded-full border bg-razzo-panel py-1.5 pr-9 pl-4 font-display text-xs font-bold tracking-widest uppercase outline-none transition focus:ring-2 focus:ring-razzo-cyan/60"
        style={{ borderColor: `${r.color}a0`, color: r.color }}
      >
        {RANKS.map((opt) => (
          <option key={opt.id} value={opt.id} className="bg-razzo-panel text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      <svg
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 h-4 w-4"
        fill="none"
        stroke={r.color}
        strokeWidth={2.5}
      >
        <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </label>
  );
}
