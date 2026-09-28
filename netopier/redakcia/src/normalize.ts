// Normalizácia času publikácie zo zdrojov na ISO 8601 UTC (records.published_at_utc).
//
// Formáty v archíve (zber 26. 9. 2026):
//   1. ISO s posunom        crz        2013-09-30T14:34:09+02:00
//   2. ISO UTC              kataster   2026-06-30T16:00:00Z
//   3. ISO s milisekundami  rss        2026-09-26T17:40:03.000Z
//   4. iba dátum            statistika 2025-12-19            → polnoc v Bratislave
//   5. miestny čas bez zóny crz export 2013-09-30 14:34:09   → čas v Bratislave
// Ostatné (RFC 2822 z RSS a pod.) cez Date.parse. Nič, prázdne a rok 0000 → null.

const BRATISLAVA = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Europe/Bratislava',
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function posunBratislavaMin(utc: Date): number {
  const parts = Object.fromEntries(BRATISLAVA.formatToParts(utc).map((p) => [p.type, p.value]));
  const asUtc = Date.UTC(+parts.year!, +parts.month! - 1, +parts.day!, +parts.hour!, +parts.minute!, +parts.second!);
  return Math.round((asUtc - utc.getTime()) / 60_000);
}

/** Miestny čas v Bratislave (bez zóny) → UTC. */
export function bratislavaNaUtc(y: number, mo: number, d: number, h = 0, mi = 0, s = 0): Date {
  const naive = Date.UTC(y, mo - 1, d, h, mi, s);
  let offset = posunBratislavaMin(new Date(naive));
  offset = posunBratislavaMin(new Date(naive - offset * 60_000));
  return new Date(naive - offset * 60_000);
}

export type FormatDatumu = 'iso_posun' | 'iso_utc' | 'iba_datum' | 'miestny' | 'ine' | 'ziadny';

export interface NormalizovanyDatum {
  utc: string | null;
  format: FormatDatumu;
}

const ISO_ZONA = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(Z|[+-]\d{2}:?\d{2})$/;
const IBA_DATUM = /^(\d{4})-(\d{2})-(\d{2})$/;
const MIESTNY = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/;

export function normalizujDatum(value: string | null | undefined): NormalizovanyDatum {
  if (value == null) return { utc: null, format: 'ziadny' };
  const text = String(value).trim();
  if (!text || text.startsWith('0000')) return { utc: null, format: 'ziadny' };

  let m = text.match(ISO_ZONA);
  if (m) {
    const time = Date.parse(text);
    if (Number.isNaN(time)) return { utc: null, format: 'ine' };
    return { utc: new Date(time).toISOString(), format: m[7] === 'Z' ? 'iso_utc' : 'iso_posun' };
  }
  m = text.match(IBA_DATUM);
  if (m) return { utc: bratislavaNaUtc(+m[1]!, +m[2]!, +m[3]!).toISOString(), format: 'iba_datum' };
  m = text.match(MIESTNY);
  if (m) return { utc: bratislavaNaUtc(+m[1]!, +m[2]!, +m[3]!, +m[4]!, +m[5]!, +(m[6] ?? '0')).toISOString(), format: 'miestny' };
  const time = Date.parse(text);
  if (Number.isNaN(time)) return { utc: null, format: 'ine' };
  return { utc: new Date(time).toISOString(), format: 'ine' };
}

/** Deň YYYY-MM-DD v Bratislave pre ISO UTC čas (denné agregáty sa robia v miestnom čase). */
export function denVBratislave(utcIso: string): string {
  const parts = Object.fromEntries(BRATISLAVA.formatToParts(new Date(utcIso)).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
