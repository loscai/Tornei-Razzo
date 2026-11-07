"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

/** Modal riutilizzabile con transizioni di ingresso/uscita, ESC e click sullo sfondo. */
export default function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  const [mounted, setMounted] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center ${
        open ? "animate-fade-in" : "animate-fade-out"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-400/30 bg-razzo-panel/95 shadow-[0_0_60px_rgb(34_211_238/0.15)] ${
          open ? "animate-pop-in" : "animate-pop-out"
        }`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-razzo-cyan via-fuchsia-500 to-razzo-orange" />
        <div className="flex items-start justify-between gap-4 px-6 pt-5">
          <div>
            <h2 className="font-display text-lg font-bold tracking-wider text-white uppercase">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Chiudi"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 pt-4 pb-6">{children}</div>
      </div>
    </div>
  );
}
