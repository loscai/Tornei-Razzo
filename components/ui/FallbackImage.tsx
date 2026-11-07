"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

interface FallbackImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback: ReactNode;
}

/**
 * <img> semplice che punta a un file in /public.
 * Se il file non esiste ancora mostra un fallback grafico al suo posto.
 */
export default function FallbackImage({ src, alt, className, fallback }: FallbackImageProps) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  // L'errore può avvenire prima dell'idratazione: controlla lo stato reale dell'immagine.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src, failed]);

  if (failed) return <>{fallback}</>;

  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className={className} onError={() => setFailed(true)} />;
}
