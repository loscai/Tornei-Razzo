"use client";

import { getRank, rankImagePath, type RankId } from "@/lib/tournament";
import FallbackImage from "./ui/FallbackImage";

/** Logo del rank: carica /assets/ranks/{rank}.png, con un emblema di fallback. */
export default function RankLogo({ rank, className = "h-20 w-20" }: { rank: RankId; className?: string }) {
  const r = getRank(rank);
  return (
    <div key={rank} className={`relative shrink-0 animate-unlock ${className}`}>
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-2xl"
        style={{ backgroundColor: r.color }}
        aria-hidden
      />
      <FallbackImage
        src={rankImagePath(rank)}
        alt={`Rank ${r.label}`}
        className="relative h-full w-full object-contain drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]"
        fallback={
          <div
            className="relative flex h-full w-full items-center justify-center rounded-2xl border-2 font-display text-xl font-black"
            style={{ borderColor: r.color, color: r.color, background: `${r.color}1a` }}
            title={`Inserisci /public${rankImagePath(rank)}`}
          >
            {r.label
              .split(" ")
              .map((w) => w[0])
              .join("")}
          </div>
        }
      />
    </div>
  );
}
