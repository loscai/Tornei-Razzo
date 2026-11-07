"use client";

import { useMemo, useState } from "react";
import { formatDate } from "@/lib/format";
import { getRank, type MateStats } from "@/lib/tournament";
import Modal from "./ui/Modal";

interface MatesModalProps {
  open: boolean;
  onClose: () => void;
  matesStats: MateStats[];
}

export default function MatesModal({ open, onClose, matesStats }: MatesModalProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return matesStats;
    return matesStats.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.modes.some((mode) => mode.toLowerCase().includes(q)) ||
        m.ranks.some((r) => getRank(r).label.toLowerCase().includes(q))
    );
  }, [matesStats, query]);

  return (
    <Modal
      open={open}
      onClose={() => {
        setQuery("");
        onClose();
      }}
      title="Compagni di Squadra (Mate)"
      subtitle="Lista dei compagni con cui hai giocato almeno un torneo."
    >
      <div className="space-y-4">
        {/* Barra di ricerca */}
        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome compagno, modalità o rank…"
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2.5 pr-4 pl-10 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-razzo-cyan/50 focus:ring-2 focus:ring-razzo-cyan/30"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-white"
              aria-label="Cancella ricerca"
            >
              ✕
            </button>
          )}
        </div>

        {/* Elenco compagni */}
        <div className="max-h-[55vh] space-y-2.5 overflow-y-auto pr-1">
          {matesStats.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-6 text-center">
              <span className="text-3xl">👥</span>
              <p className="mt-2 font-display text-sm font-bold text-slate-300">Nessun mate registrato</p>
              <p className="mt-1 text-xs text-slate-500">
                Aggiungi i compagni di squadra quando avvii un nuovo torneo 2v2 o 3v3!
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Nessun compagno trovato per &ldquo;{query}&rdquo;
            </p>
          ) : (
            filtered.map((m) => (
              <div
                key={m.name}
                className="group rounded-xl border border-white/10 bg-black/30 p-3.5 transition hover:border-cyan-400/40 hover:bg-black/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-sky-600/20 font-display text-base font-black text-razzo-cyan">
                      {m.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold tracking-wide text-white">{m.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {m.totalTournaments} {m.totalTournaments === 1 ? "torneo giocato" : "tornei giocati"}
                        {m.lastPlayed > 0 && ` · Ultimo: ${formatDate(m.lastPlayed)}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-display text-xs font-bold ${
                        m.victories > 0
                          ? "border border-amber-400/40 bg-amber-400/10 text-amber-300"
                          : "border border-white/10 bg-white/5 text-slate-400"
                      }`}
                    >
                      {m.victories > 0 && "🏆 "}
                      {m.victories} {m.victories === 1 ? "vittoria" : "vittorie"}
                    </span>
                    <p className="mt-0.5 text-[10px] text-slate-500">{m.winRate}% win rate</p>
                  </div>
                </div>

                {/* Dettagli: modalità e tornei */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">Modalità:</span>
                  {m.modes.map((mode) => (
                    <span
                      key={mode}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-slate-300"
                    >
                      {mode}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] text-slate-500">
                    Tornei: {m.tournamentNumbers.map((n) => `#${n}`).join(", ")}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
