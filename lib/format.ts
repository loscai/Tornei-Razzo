const dateFmt = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateTimeFmt = new Intl.DateTimeFormat("it-IT", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDate = (ts: number) => (ts > 0 ? dateFmt.format(ts) : "—");
export const formatDateTime = (ts: number) => (ts > 0 ? dateTimeFmt.format(ts) : "—");

/** Converte un timestamp millisecondi nel formato YYYY-MM-DDTHH:mm per <input type="datetime-local"> */
export function timestampToDatetimeInput(ts?: number): string {
  const d = ts && ts > 0 ? new Date(ts) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/** Converte il valore da <input type="datetime-local"> in timestamp millisecondi */
export function datetimeInputToTimestamp(val: string): number {
  if (!val) return Date.now();
  const ts = new Date(val).getTime();
  return Number.isNaN(ts) || ts <= 0 ? Date.now() : ts;
}
