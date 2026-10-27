const MS_PER_DAY = 86_400_000;

/** Convierte "YYYY-MM-DD..." a milisegundos UTC. Devuelve null si no es una fecha real. */
export function parseIsoDate(value: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const ms = Date.UTC(year, month, day);
  const check = new Date(ms);

  const isRealDate =
    check.getUTCFullYear() === year &&
    check.getUTCMonth() === month &&
    check.getUTCDate() === day;

  return isRealDate ? ms : null;
}

export function requireIsoDate(value: string): number {
  const ms = parseIsoDate(value);
  if (ms === null) {
    throw new Error(`Fecha inválida: "${value}". Usa el formato YYYY-MM-DD.`);
  }
  return ms;
}

export function daysBetween(fromMs: number, toMs: number): number {
  return Math.round((toMs - fromMs) / MS_PER_DAY);
}

export function addDays(ms: number, days: number): number {
  return ms + days * MS_PER_DAY;
}

export function addYears(ms: number, years: number): number {
  const date = new Date(ms);
  date.setUTCFullYear(date.getUTCFullYear() + years);
  return date.getTime();
}

export function todayIsoDate(now: Date): string {
  return now.toISOString().slice(0, 10);
}
