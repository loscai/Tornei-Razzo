import "server-only";
import { createInitialData, sanitizeAppData, type AppData } from "./tournament";

// Persistenza lato server dell'intero archivio tornei.
// - Se sono presenti le variabili Upstash/Vercel KV usa Redis via REST (nessuna dipendenza extra).
// - Altrimenti usa una memoria volatile (utile in sviluppo): il client farà fallback su localStorage.

const KEY = "tornei-lega-del-razzo:state";

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

const memory = globalThis as unknown as { __razzoData?: AppData };

export const isPersistent = () => redisConfig() !== null;

export async function readData(): Promise<AppData> {
  const cfg = redisConfig();
  if (!cfg) return memory.__razzoData ?? createInitialData();

  const res = await fetch(`${cfg.url}/get/${encodeURIComponent(KEY)}`, {
    headers: { Authorization: `Bearer ${cfg.token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis GET failed: ${res.status}`);
  const json = (await res.json()) as { result: string | null };
  // sanitizeAppData migra automaticamente il vecchio formato a torneo singolo
  return json.result ? sanitizeAppData(JSON.parse(json.result)) : createInitialData();
}

export async function writeData(data: AppData): Promise<void> {
  const cfg = redisConfig();
  if (!cfg) {
    memory.__razzoData = data;
    return;
  }
  const res = await fetch(cfg.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(["SET", KEY, JSON.stringify(data)]),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis SET failed: ${res.status}`);
}
