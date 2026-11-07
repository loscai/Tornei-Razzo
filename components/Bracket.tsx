"use client";

import { Fragment } from "react";
import type { BracketView, StageId, StageStatus } from "@/lib/tournament";
import StageCard from "./StageCard";

interface BracketProps {
  bracket: BracketView;
  isAdmin: boolean;
  onSlotClick: (stage: StageId, gameIndex: number) => void;
}

/** Tabellone: verticale su smartphone, orizzontale su desktop. */
export default function Bracket({ bracket, isAdmin, onSlotClick }: BracketProps) {
  return (
    <div className="flex flex-col items-stretch lg:flex-row lg:items-center">
      {bracket.stages.map((stage, i) => (
        <Fragment key={stage.def.id}>
          {i > 0 && <Connector from={bracket.stages[i - 1].status} />}
          <div className="w-full lg:min-w-0 lg:flex-1">
            <StageCard stage={stage} isAdmin={isAdmin} onSlotClick={(g) => onSlotClick(stage.def.id, g)} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** Linea di collegamento tra stage: si illumina quando lo stage precedente è superato. */
function Connector({ from }: { from: StageStatus }) {
  const won = from === "won";
  const lost = from === "lost";

  return (
    <div className="relative flex shrink-0 items-center justify-center py-1 lg:px-1 lg:py-0" aria-hidden>
      <div
        className={`h-6 w-0.5 rounded-full transition-all duration-700 lg:h-0.5 lg:w-6 ${
          won
            ? "bg-gradient-to-b from-razzo-win to-razzo-cyan shadow-[0_0_10px_rgb(34_211_238/0.8)] lg:bg-gradient-to-r"
            : lost
              ? "bg-razzo-loss/40"
              : "bg-white/10"
        }`}
      />
      {lost && (
        <span className="absolute flex h-5 w-5 items-center justify-center rounded-full border border-razzo-loss/60 bg-razzo-bg text-[10px] font-black text-razzo-loss">
          ✕
        </span>
      )}
    </div>
  );
}
