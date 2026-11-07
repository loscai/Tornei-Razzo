import "server-only";
import { createHash, timingSafeEqual } from "crypto";

// Password admin fissa da variabile d'ambiente (ADMIN_PASSWORD).
// In sviluppo, se non impostata, vale "admin". In produzione è obbligatoria.

export function getAdminPassword(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (pw) return pw;
  return process.env.NODE_ENV === "production" ? null : "admin";
}

const hash = (s: string) => createHash("sha256").update(s).digest();

export function checkPassword(candidate: unknown): boolean {
  const expected = getAdminPassword();
  if (!expected || typeof candidate !== "string" || candidate.length === 0) return false;
  return timingSafeEqual(hash(candidate), hash(expected));
}
