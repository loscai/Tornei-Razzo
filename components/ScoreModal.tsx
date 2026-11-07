"use client";

import { useState, type FormEvent } from "react";
import type { Score } from "@/lib/tournament";
import Modal from "./ui/Modal";

export interface ScoreTarget {
  stageLabel: string;
  gameLabel: string;
  initial: Score | null;
}

interface ScoreModalProps {
  target: ScoreTarget | null;
  onClose: () => void;
  onSave: (score: Score) => void;
  onClear: () => void;
}

/** Popup di inserimento risultato: I Miei Goal (casa) vs Goal Avversario. */
export default function ScoreModal({ target, onClose, onSave, onClear }: ScoreModalProps) {
  // Mantiene l'ultimo target durante l'animazione di chiusura
  const [last, setLast] = useState<ScoreTarget | null>(target);
  if (target && target !== last) setLast(target);
  const shown = target ?? last;

  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title={shown?.stageLabel ?? ""}
      subtitle={shown ? `${shown.gameLabel} · Tu giochi in casa (sinistra)` : undefined}
    >
      {shown && (
        <ScoreForm
          key={`${shown.stageLabel}-${shown.gameLabel}`}
          initial={shown.initial}
          onSave={onSave}
          onClear={onClear}
        />
      )}
    </Modal>
  );
}

function ScoreForm({
  initial,
  onSave,
  onClear,
}: {
  initial: Score | null;
  onSave: (s: Score) => void;
  onClear: () => void;
}) {
  const [me, setMe] = useState(initial ? String(initial.me) : "");
  const [opp, setOpp] = useState(initial ? String(initial.opp) : "");

  const meN = me === "" ? null : Number(me);
  const oppN = opp === "" ? null : Number(opp);
  const complete = meN !== null && oppN !== null;
  const tie = complete && meN === oppN;
  const valid = complete && !tie;
  const outcome = !valid ? null : meN! > oppN! ? "win" : "loss";

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (valid) onSave({ me: meN!, opp: oppN! });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <ScoreInput label="I Miei Goal" value={me} onChange={setMe} accent="cyan" autoFocus />
        <span className="pb-6 font-display text-2xl font-black text-slate-600">–</span>
        <ScoreInput label="Goal Avversario" value={opp} onChange={setOpp} accent="orange" />
      </div>

      <div
        className={`rounded-xl border py-2.5 text-center font-display text-sm font-bold tracking-[0.3em] uppercase transition-all duration-300 ${
          outcome === "win"
            ? "border-razzo-win/50 bg-razzo-win/10 text-razzo-win"
            : outcome === "loss"
              ? "border-razzo-loss/50 bg-razzo-loss/10 text-razzo-loss"
              : "border-white/10 bg-white/5 text-slate-500"
        }`}
      >
        {outcome === "win" ? "Vittoria" : outcome === "loss" ? "Sconfitta" : tie ? "Il pareggio non è ammesso" : "Inserisci il punteggio"}
      </div>

      <div className="flex gap-3">
        {initial && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-slate-400 transition hover:border-razzo-loss/60 hover:text-razzo-loss"
          >
            Cancella
          </button>
        )}
        <button
          type="submit"
          disabled={!valid}
          className="flex-1 rounded-xl bg-gradient-to-r from-razzo-cyan to-sky-500 py-3 font-display text-sm font-bold tracking-widest text-slate-950 uppercase transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30"
        >
          Salva
        </button>
      </div>
    </form>
  );
}

function ScoreInput({
  label,
  value,
  onChange,
  accent,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  accent: "cyan" | "orange";
  autoFocus?: boolean;
}) {
  const n = value === "" ? 0 : Number(value);
  const set = (v: number) => onChange(String(Math.max(0, Math.min(99, v))));
  const color = accent === "cyan" ? "text-razzo-cyan focus:ring-razzo-cyan/50" : "text-razzo-orange focus:ring-razzo-orange/50";

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[11px] font-semibold tracking-widest text-slate-400 uppercase">{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={99}
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 2);
          onChange(v === "" ? "" : String(Number(v)));
        }}
        onFocus={(e) => e.target.select()}
        placeholder="0"
        className={`h-20 w-full rounded-xl border border-white/10 bg-black/40 text-center font-display text-4xl font-black outline-none transition placeholder:text-slate-700 focus:ring-2 ${color}`}
      />
      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={() => set(n - 1)}
          className="flex-1 rounded-lg bg-white/5 py-1.5 text-lg font-bold text-slate-300 transition hover:bg-white/10 active:scale-95"
          aria-label={`Diminuisci ${label}`}
        >
          −
        </button>
        <button
          type="button"
          onClick={() => set(n + 1)}
          className="flex-1 rounded-lg bg-white/5 py-1.5 text-lg font-bold text-slate-300 transition hover:bg-white/10 active:scale-95"
          aria-label={`Aumenta ${label}`}
        >
          +
        </button>
      </div>
    </div>
  );
}
