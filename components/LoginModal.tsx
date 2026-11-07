"use client";

import { useState, type FormEvent } from "react";
import Modal from "./ui/Modal";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (password: string) => Promise<void>;
}

export default function LoginModal({ open, onClose, onLogin }: LoginModalProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setPassword("");
    setError(null);
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      await onLogin(password);
      close();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accesso negato.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Accesso Admin" subtitle="Inserisci la password per modificare il tabellone.">
      <form onSubmit={submit} className="space-y-4">
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={`w-full rounded-xl border bg-black/40 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:ring-2 ${
            error ? "border-razzo-loss/70 focus:ring-razzo-loss/40" : "border-white/10 focus:ring-razzo-cyan/50"
          }`}
        />
        {error && <p className="text-sm text-razzo-loss">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full rounded-xl bg-gradient-to-r from-razzo-cyan to-sky-500 py-3 font-display text-sm font-bold tracking-widest text-slate-950 uppercase transition hover:brightness-110 disabled:opacity-40"
        >
          {busy ? "Verifica…" : "Sblocca"}
        </button>
      </form>
    </Modal>
  );
}
