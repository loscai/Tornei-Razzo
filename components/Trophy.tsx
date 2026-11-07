"use client";

import { useEffect } from "react";
import { TROPHY_IMAGE_PATH } from "@/lib/tournament";
import FallbackImage from "./ui/FallbackImage";

const TrophyFallback = ({ className }: { className: string }) => (
  <div className={`flex items-center justify-center ${className}`} title={`Inserisci /public${TROPHY_IMAGE_PATH}`}>
    <span className="text-[7rem] leading-none drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">🏆</span>
  </div>
);

function TrophyImage({ className }: { className: string }) {
  return (
    <FallbackImage
      src={TROPHY_IMAGE_PATH}
      alt="Trofeo Tornei Lega del Razzo"
      className={`object-contain drop-shadow-[0_0_40px_rgba(251,191,36,0.55)] ${className}`}
      fallback={<TrophyFallback className={className} />}
    />
  );
}

/** Sezione celebrativa fissa alla base del tabellone. */
export function TrophySection() {
  return (
    <section className="relative mx-auto mt-12 max-w-xl animate-pop-in overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-amber-400/10 via-razzo-panel/80 to-razzo-panel/80 px-6 py-10 text-center">
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-amber-400/20 blur-3xl" />
      <div className="relative mx-auto h-48 w-48 animate-float sm:h-56 sm:w-56">
        <TrophyImage className="h-full w-full" />
      </div>
      <p className="relative mt-6 text-xs font-semibold tracking-[0.4em] text-amber-300 uppercase">Tornei Lega del Razzo</p>
      <h2 className="relative mt-2 font-display text-3xl font-black tracking-wider text-white uppercase sm:text-4xl">
        Campioni!
      </h2>
    </section>
  );
}

/** Overlay a schermo intero mostrato quando la Finale viene vinta. */
export function TrophyOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade-in cursor-pointer flex-col items-center justify-center bg-black/85 p-6 text-center backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-label="Vittoria del torneo"
    >
      <div className="pointer-events-none absolute h-[28rem] w-[28rem] rounded-full bg-amber-400/25 blur-[100px]" />
      <div className="relative h-64 w-64 animate-trophy sm:h-80 sm:w-80">
        <div className="h-full w-full animate-float">
          <TrophyImage className="h-full w-full" />
        </div>
      </div>
      <h2 className="relative mt-8 font-display text-4xl font-black tracking-wider uppercase sm:text-6xl">
        <span className="text-shine">Campioni!</span>
      </h2>
      <p className="relative mt-3 text-slate-300">Hai vinto i Tornei Lega del Razzo</p>
      <p className="relative mt-8 text-xs tracking-widest text-slate-500 uppercase">Tocca per chiudere</p>
    </div>
  );
}
