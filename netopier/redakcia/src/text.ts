// Čisté textové funkcie pre meranie médií: tokeny, lexika, znaky titulku.
// Bez LLM, bez siete. Zoznamy slov sú v data/politika-merania.json (verzované).

import politika from '../data/politika-merania.json';

export interface Politika {
  verzia: string;
  stop_slova: string[];
  poplasne: string[];
  vata: string[];
}

export const POLITIKA: Politika = politika as Politika;

const STOP = new Set(POLITIKA.stop_slova.map((s) => s.toLowerCase()));

/** Slová (písmená a číslice, s diakritikou), malé písmená; krátke tokeny ≤ 1 znak vypadnú. */
export function tokeny(text: string | null | undefined): string[] {
  if (!text) return [];
  return (text.toLowerCase().match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).filter((t) => t.length > 1);
}

/** Tokeny bez stop slov a bez čistých čísel. */
export function lexikalneTokeny(text: string | null | undefined): string[] {
  return tokeny(text).filter((t) => !STOP.has(t) && !/^\d+$/.test(t));
}

/** Prvých N slov podľa počtu; pri rovnosti abecedne (deterministicky). */
export function topSlova(counts: Map<string, number>, n: number): Array<[string, number]> {
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)).slice(0, n);
}

export function pripocitaj(counts: Map<string, number>, slova: Iterable<string>): void {
  for (const s of slova) counts.set(s, (counts.get(s) ?? 0) + 1);
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Položka zoznamu sa zhoduje na začiatku slova (prefix): „šokujúc“ chytí „šokujúce“, „tip“ chytí „tipov“, nie „multiple“. */
function obsahujeZoZoznamu(text: string, zoznam: readonly string[]): string[] {
  const lower = text.toLowerCase();
  return zoznam.filter((slovo) => new RegExp(`(?<!\\p{L})${escapeRegex(slovo.toLowerCase())}`, 'u').test(lower));
}

/** Zvučné slová v texte (poplašné): zásah zo zoznamu politiky. */
export function poplasneSlova(text: string | null | undefined): string[] {
  return text ? obsahujeZoZoznamu(text, POLITIKA.poplasne) : [];
}

/** Vatové obraty (clickbait) v texte podľa zoznamu politiky. */
export function vatoveSlova(text: string | null | undefined): string[] {
  return text ? obsahujeZoZoznamu(text, POLITIKA.vata) : [];
}

export interface ZnakyTitulku {
  slov: number;
  znakov: number;
  /** obsahuje otáznik */
  otazka: boolean;
  /** „Aktér: výrok“ – dvojbodka po prvom slove až po polovicu titulku */
  dvojbodka: boolean;
  /** úvodzovky = citát v titulku */
  citacia: boolean;
  /** číslo v titulku */
  cislo: boolean;
  vykricnik: boolean;
  /** slová celé veľkými písmenami (≥ 3 písmená), okrem skratiek na začiatku sa počítajú všetky */
  velke_slova: number;
  poplasne: string[];
  vata: string[];
}

/** Stavba titulku: dĺžka, otázka, dvojbodka, citácia, čísla, veľké písmená, poplašné a vatové slová. */
export function znakyTitulku(title: string | null | undefined): ZnakyTitulku {
  const text = (title ?? '').trim();
  const slova = tokeny(text);
  const dvojbodkaPozicia = text.indexOf(':');
  return {
    slov: slova.length,
    znakov: text.length,
    otazka: text.includes('?'),
    dvojbodka: dvojbodkaPozicia > 0 && dvojbodkaPozicia < text.length - 1,
    citacia: /[„“"‚‘’]/.test(text),
    cislo: /\d/.test(text),
    vykricnik: text.includes('!'),
    velke_slova: (text.match(/\b\p{Lu}{3,}\b/gu) ?? []).length,
    poplasne: poplasneSlova(text),
    vata: vatoveSlova(text),
  };
}
