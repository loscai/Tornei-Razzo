"use client";

import { useMemo, useState, type FormEvent } from "react";
import { datetimeInputToTimestamp, timestampToDatetimeInput } from "@/lib/format";
import { RANKS, getRank, type RankId, type TournamentState } from "@/lib/tournament";
import RankLogo from "./RankLogo";
import Modal from "./ui/Modal";

interface EditTournamentModalProps {
  open: boolean;
  onClose: () => void;
  tournament: TournamentState;
  allModes: string[];
  allMates: string[];
  onAddCustomMode: (mode: string) => void;
  onSave: (patch: { rank?: RankId; mode?: string; teammates?: string[]; createdAt?: number }) => void;
}

export default function EditTournamentModal({
  open,
  onClose,
  tournament,
  allModes,
  allMates,
  onAddCustomMode,
  onSave,
}: EditTournamentModalProps) {
  const [rank, setRank] = useState<RankId>(tournament.rank);
  const [mode, setMode] = useState<string>(tournament.mode || "2v2 Soccar");
  const [datetimeStr, setDatetimeStr] = useState<string>(() =>
    timestampToDatetimeInput(tournament.createdAt > 0 ? tournament.createdAt : Date.now())
  );
  const [teammates, setTeammates] = useState<string[]>(tournament.teammates || []);
  const [mateInput, setMateInput] = useState("");

  const [addingMode, setAddingMode] = useState(false);
  const [newModeName, setNewModeName] = useState("");

  const selectedRank = getRank(rank);

  const mateSuggestions = useMemo(() => {
    const selectedSet = new Set(teammates.map((m) => m.toLowerCase()));
    const q = mateInput.trim().toLowerCase();
    return allMates
      .filter((m) => !selectedSet.has(m.toLowerCase()))
      .filter((m) => !q || m.toLowerCase().includes(q));
  }, [allMates, teammates, mateInput]);

  const addMate = (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    if (teammates.some((m) => m.toLowerCase() === clean.toLowerCase())) return;
    setTeammates([...teammates, clean]);
    setMateInput("");
  };

  const removeMate = (index: number) => {
    setTeammates(teammates.filter((_, i) => i !== index));
  };

  const handleCreateMode = () => {
    const clean = newModeName.trim();
    if (!clean) return;
    onAddCustomMode(clean);
    setMode(clean);
    setNewModeName("");
    setAddingMode(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({
      rank,
      mode,
      teammates,
      createdAt: datetimeInputToTimestamp(datetimeStr),
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Modifica Torneo #${tournament.number}`}
      subtitle="Aggiorna la data/ora, il rank, la modalità o i compagni di squadra di questo torneo."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Scelta Data e Ora */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Data e Ora del Torneo
          </label>
          <input
            type="datetime-local"
            value={datetimeStr}
            onChange={(e) => setDatetimeStr(e.target.value)}
            className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 font-display text-sm font-bold text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/30"
          />
        </div>

        {/* Scelta Rank */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Rank Torneo
          </label>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/40 p-3">
            <RankLogo rank={rank} className="h-12 w-12" />
            <div className="flex-1">
              <select
                value={rank}
                onChange={(e) => setRank(e.target.value as RankId)}
                className="w-full cursor-pointer rounded-lg border border-white/10 bg-razzo-panel px-3 py-2 font-display text-sm font-bold text-white outline-none focus:ring-2 focus:ring-cyan-400/50"
                style={{ color: selectedRank.color }}
              >
                {RANKS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-razzo-panel text-slate-100">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Scelta Modalità */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold tracking-wider text-slate-300 uppercase">Modalità</label>
            {!addingMode && (
              <button
                type="button"
                onClick={() => setAddingMode(true)}
                className="text-[11px] font-semibold text-razzo-cyan hover:underline"
              >
                + Nuova modalità
              </button>
            )}
          </div>

          {!addingMode ? (
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full cursor-pointer rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-display text-sm font-bold text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/30"
            >
              {allModes.map((m) => (
                <option key={m} value={m} className="bg-razzo-panel text-slate-100">
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-xl border border-cyan-400/40 bg-cyan-950/20 p-3">
              <p className="text-xs font-semibold text-cyan-300">Aggiungi nuova modalità di gioco:</p>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newModeName}
                  onChange={(e) => setNewModeName(e.target.value)}
                  placeholder="Es. 4v4 Chaos, Hoops, Rumble..."
                  className="flex-1 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-400/50"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateMode();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateMode}
                  disabled={!newModeName.trim()}
                  className="rounded-lg bg-razzo-cyan px-3 py-2 font-display text-xs font-bold text-slate-950 uppercase transition hover:brightness-110 disabled:opacity-40"
                >
                  Salva
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingMode(false);
                    setNewModeName("");
                  }}
                  className="rounded-lg border border-white/10 px-2.5 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Annulla
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Compagni di squadra (Mate) */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Compagni di squadra (Mate)
          </label>

          <div className="flex min-h-[44px] flex-wrap items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-2">
            {teammates.map((m, idx) => (
              <span
                key={m}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 py-1 pr-2 pl-2.5 text-xs font-semibold text-cyan-200"
              >
                <span>@{m}</span>
                <button
                  type="button"
                  onClick={() => removeMate(idx)}
                  className="rounded p-0.5 text-slate-400 hover:bg-white/10 hover:text-white"
                  aria-label={`Rimuovi ${m}`}
                >
                  ✕
                </button>
              </span>
            ))}

            <div className="flex flex-1 items-center gap-1">
              <input
                type="text"
                value={mateInput}
                onChange={(e) => setMateInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addMate(mateInput);
                  }
                }}
                placeholder={teammates.length === 0 ? "Digita nome mate e premi invio…" : "Aggiungi altro mate…"}
                className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-xs text-white outline-none placeholder:text-slate-500"
              />
              {mateInput.trim() && (
                <button
                  type="button"
                  onClick={() => addMate(mateInput)}
                  className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-white hover:bg-cyan-500/20 hover:text-cyan-300"
                >
                  + Aggiungi
                </button>
              )}
            </div>
          </div>

          {mateSuggestions.length > 0 && (
            <div className="mt-2">
              <p className="text-[11px] font-semibold text-slate-400">Compagni già registrati (clicca per aggiungere):</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {mateSuggestions.slice(0, 8).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => addMate(m)}
                    className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium text-slate-300 transition hover:border-cyan-400/50 hover:bg-cyan-500/10 hover:text-cyan-200"
                  >
                    + {m}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pulsanti */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            Annulla
          </button>
          <button
            type="submit"
            className="flex-1 rounded-xl bg-gradient-to-r from-razzo-cyan to-sky-500 py-3 font-display text-sm font-bold tracking-widest text-slate-950 uppercase transition hover:brightness-110 active:scale-[0.99]"
          >
            Salva Modifiche
          </button>
        </div>
      </form>
    </Modal>
  );
}
