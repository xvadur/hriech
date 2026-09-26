import type { CollectContext } from './types';

/** JSON so zoradenými kľúčmi — rovnaký obsah dá vždy rovnaký hash. */
export function stableStringify(value: unknown): string {
  if (value === undefined) return 'null';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(',')}}`;
}

export async function sha256Hex(input: string | Uint8Array): Promise<string> {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export class HttpError extends Error {
  constructor(
    readonly url: string,
    readonly status: number,
    body: string,
  ) {
    super(`HTTP ${status} pre ${url}: ${body.slice(0, 200)}`);
  }
}

export interface FetchOptions extends RequestInit {
  timeoutMs?: number;
  retries?: number;
}

/** fetch s User-Agentom, časovým limitom a opakovaním pri 429/5xx a sieťovej chybe. */
export async function fetchChecked(ctx: CollectContext, url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeoutMs = 30_000, retries = 2, headers, ...init } = options;
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await ctx.fetch(url, {
        ...init,
        headers: { 'user-agent': ctx.userAgent, ...(headers as Record<string, string> | undefined) },
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (response.ok) return response;
      const body = await response.text().catch(() => '');
      const error = new HttpError(url, response.status, body);
      if (response.status !== 429 && response.status < 500) throw error;
      lastError = error;
    } catch (error) {
      if (error instanceof HttpError && error.status !== 429 && error.status < 500) throw error;
      lastError = error;
    }
    if (attempt < retries) await new Promise((resolve) => setTimeout(resolve, 500 * 2 ** attempt));
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Dátum YYYY-MM-DD v UTC. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(day: string, delta: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return isoDate(date);
}

const bratislavaParts = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Bratislava',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function bratislavaOffsetMinutes(utc: Date): number {
  const parts = Object.fromEntries(bratislavaParts.formatToParts(utc).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!, +parts.second!);
  return Math.round((asUtc - utc.getTime()) / 60_000);
}

/** Miestny čas „YYYY-MM-DD HH:MM:SS“ v Bratislave → ISO 8601 s posunom. Prázdne a nulové dátumy → null. */
export function bratislavaToIso(local: string | null | undefined): string | null {
  if (!local) return null;
  const m = local.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m || m[1] === '0000') return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00'] = m;
  const naive = Date.UTC(+y!, +mo! - 1, +d!, +h, +mi, +s);
  let offset = bratislavaOffsetMinutes(new Date(naive));
  offset = bratislavaOffsetMinutes(new Date(naive - offset * 60_000));
  const sign = offset >= 0 ? '+' : '-';
  const abs = Math.abs(offset);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${mo}-${d}T${h}:${mi}:${s}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** Ľubovoľný dátum zo zdroja → ISO 8601 UTC, alebo null. */
export function toIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

export function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
