// Skóre zvodu (EKG): vážený súčet dôkazov → −100 … 100, istota, odporúčaný stav.
//
// Vzorec je port klientskeho `scoring.js` + `status.js` z openclaw.sk (kópia v
// test/fixtures/openclaw/). Openclaw je jedna kontrola, nie definícia: parita
// s pôvodným súborom sa overuje v test/skore.test.ts nad 20 článkami. Meranie
// médií podľa registra funkcií je v meranie.ts, toto je iba mechanika zvodov.

export type Sila = 'strong' | 'moderate' | 'weak';
export type Relevancia = 'direct' | 'supporting' | 'tangential';
export type Smer = 'confirming' | 'contradicting' | 'neutral';
export type IstotaSignalu = 'high' | 'medium' | 'low';
export type IstotaSkore = 'insufficient' | 'low' | 'medium' | 'high';
export type StavZvodu = 'nepotvrdene' | 'vznikajuce' | 'potvrdene' | 'vyvratene';

export const ALGORITMUS = 'openclaw-scoring-v1';

export const VAHY = {
  sila: { strong: 3, moderate: 1.5, weak: 0.5 } as Record<string, number>,
  relevancia: { direct: 2, supporting: 1, tangential: 0.3 } as Record<string, number>,
  istota: { high: 1.5, medium: 1, low: 0.5 } as Record<string, number>,
  smer: { confirming: 1, contradicting: -1, neutral: 0 } as Record<string, number>,
};

/** Signál starší než 30 dní má polovičnú váhu. */
export const STARNUTIE_DNI = 30;
export const STARNUTIE_FAKTOR = 0.5;

/** Jeden dôkaz = jedna väzba signál → zvod (riadok signal_zvody + dátum a istota signálu). */
export interface Dokaz {
  /** scan_date signálu; bez dátumu sa berie „teraz“ (rovnako ako openclaw) */
  datum: string | Date | null | undefined;
  sila: Sila | string;
  relevancia: Relevancia | string;
  smer: Smer | string;
  istota: IstotaSignalu | string;
}

export interface RozkladSmeru {
  pocet: number;
  vaha: number;
}

export interface Skore {
  skore: number;
  istota: IstotaSkore;
  pocet: number;
  rozklad: { confirming: RozkladSmeru; contradicting: RozkladSmeru; neutral: RozkladSmeru } | null;
  /** Σ (váha × smer) */
  raw_weighted_sum: number;
  /** Σ váha */
  total_weight: number;
  algoritmus: typeof ALGORITMUS;
}

function naDatum(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function smerKluc(smer: string): 'confirming' | 'contradicting' | 'neutral' {
  return smer === 'confirming' || smer === 'contradicting' ? smer : 'neutral';
}

/** Skóre zvodu z jeho dôkazov. Prázdny zoznam → 0, insufficient. */
export function vypocitajSkore(dokazy: readonly Dokaz[], teraz: Date | string = new Date()): Skore {
  const now = naDatum(teraz) ?? new Date();
  if (dokazy.length === 0) {
    return { skore: 0, istota: 'insufficient', pocet: 0, rozklad: null, raw_weighted_sum: 0, total_weight: 0, algoritmus: ALGORITMUS };
  }
  let total = 0;
  let sum = 0;
  const rozklad = {
    confirming: { pocet: 0, vaha: 0 },
    contradicting: { pocet: 0, vaha: 0 },
    neutral: { pocet: 0, vaha: 0 },
  };
  for (const d of dokazy) {
    const datum = naDatum(d.datum) ?? now;
    let vaha = (VAHY.sila[d.sila] ?? 1) * (VAHY.relevancia[d.relevancia] ?? 1) * (VAHY.istota[d.istota] ?? 1);
    if ((now.getTime() - datum.getTime()) / 86_400_000 > STARNUTIE_DNI) vaha *= STARNUTIE_FAKTOR;
    const smerovana = vaha * (VAHY.smer[d.smer] ?? 0);
    total += vaha;
    sum += smerovana;
    const k = smerKluc(d.smer);
    rozklad[k].pocet++;
    rozklad[k].vaha += Math.abs(smerovana);
  }
  const n = dokazy.length;
  const surove = (sum / (9 * n)) * 100;
  const skore = Math.round(Math.max(-100, Math.min(100, surove)));
  const rozhodnute = rozklad.confirming.pocet + rozklad.contradicting.pocet;
  const istota: IstotaSkore = n >= 10 && rozhodnute >= 5 ? 'high' : n >= 5 ? 'medium' : 'low';
  return { skore, istota, pocet: n, rozklad, raw_weighted_sum: sum, total_weight: total, algoritmus: ALGORITMUS };
}

/** Stav, ktorý dôkazy odporúčajú (port `status.js: determineStatus`); menej než 3 dôkazy → nepotvrdené. */
export function urciStav(s: Pick<Skore, 'skore' | 'istota' | 'pocet'>): StavZvodu {
  if (s.pocet < 3 || s.istota === 'insufficient') return 'nepotvrdene';
  if (s.skore >= 50 && s.istota !== 'low') return 'potvrdene';
  if (s.skore <= -50 && s.istota !== 'low') return 'vyvratene';
  if (Math.abs(s.skore) >= 20) return 'vznikajuce';
  return 'nepotvrdene';
}

/** Odporúčaný stav pri známom súčasnom stave (port `scoring.js: getRecommendedStatus`): slabé dôkazy nič nemenia. */
export function odporucanyStav(s: Pick<Skore, 'skore' | 'istota' | 'pocet'>, sucasny: StavZvodu): StavZvodu {
  if (s.pocet < 3 || s.istota === 'insufficient') return sucasny;
  if (s.skore >= 50 && s.istota !== 'low') return 'potvrdene';
  if (s.skore <= -50 && s.istota !== 'low') return 'vyvratene';
  if (Math.abs(s.skore) >= 20) return 'vznikajuce';
  return sucasny;
}

const PRECHODY: Record<StavZvodu, readonly StavZvodu[]> = {
  nepotvrdene: ['vznikajuce', 'potvrdene', 'vyvratene'],
  vznikajuce: ['potvrdene', 'vyvratene', 'nepotvrdene'],
  potvrdene: ['vyvratene'],
  vyvratene: ['potvrdene'],
};

/** Povolené prechody presne ako `status.js: isValidTransition`. */
export function povolenyPrechod(zo: StavZvodu, doStavu: StavZvodu): boolean {
  return PRECHODY[zo]?.includes(doStavu) ?? false;
}

export interface Odporucanie {
  zmena: boolean;
  sucasny: StavZvodu;
  odporucany: StavZvodu;
  skore: number;
  /** prechod je mimo povolených → vyžaduje človeka */
  vyzaduje_cloveka: boolean;
}

/** Port `status.js: getStatusRecommendation`. */
export function odporucanie(sucasny: StavZvodu, s: Skore): Odporucanie {
  const odporucany = urciStav(s);
  if (sucasny === odporucany) return { zmena: false, sucasny, odporucany, skore: s.skore, vyzaduje_cloveka: false };
  if (povolenyPrechod(sucasny, odporucany)) return { zmena: true, sucasny, odporucany, skore: s.skore, vyzaduje_cloveka: false };
  return { zmena: false, sucasny, odporucany, skore: s.skore, vyzaduje_cloveka: true };
}

// --- Adaptér nad tvarom openclaw (signals/<den>.json) pre kontrolu a import ----

export interface OpenclawLink {
  prediction_id: string;
  relevance: string;
  evidence_direction: string;
  evidence_strength: string;
  rationale?: string;
}

export interface OpenclawSignal {
  signal_id: string;
  scan_date?: string | null;
  confidence: string;
  prediction_links?: OpenclawLink[];
}

export interface OpenclawDen {
  date?: string;
  meta?: { date?: string };
  signals?: OpenclawSignal[];
}

/** Dôkazy pre jednu predikciu zo signálov openclaw, v poradí dní a signálov. */
export function dokazyZoSignalov(predictionId: string, dni: readonly OpenclawDen[]): Dokaz[] {
  const out: Dokaz[] = [];
  for (const den of dni) {
    for (const signal of den.signals ?? []) {
      const link = signal.prediction_links?.find((l) => l.prediction_id === predictionId);
      if (!link) continue;
      out.push({
        datum: signal.scan_date ?? den.date ?? den.meta?.date ?? null,
        sila: link.evidence_strength,
        relevancia: link.relevance,
        smer: link.evidence_direction,
        istota: signal.confidence,
      });
    }
  }
  return out;
}

export function skoreZoSignalov(predictionId: string, dni: readonly OpenclawDen[], teraz: Date | string = new Date()): Skore {
  return vypocitajSkore(dokazyZoSignalov(predictionId, dni), teraz);
}

/** Všetky predikcie, ktoré sa v signáloch vyskytujú, so skóre. */
export function vsetkySkoreZoSignalov(dni: readonly OpenclawDen[], teraz: Date | string = new Date()): Record<string, Skore> {
  const ids = new Set<string>();
  for (const den of dni) for (const s of den.signals ?? []) for (const l of s.prediction_links ?? []) ids.add(l.prediction_id);
  const out: Record<string, Skore> = {};
  for (const id of [...ids].sort()) out[id] = skoreZoSignalov(id, dni, teraz);
  return out;
}

export const STAV_OPENCLAW: Record<StavZvodu, string> = {
  nepotvrdene: 'unconfirmed',
  vznikajuce: 'emerging',
  potvrdene: 'confirmed',
  vyvratene: 'refuted',
};

export const STAV_Z_OPENCLAW: Record<string, StavZvodu> = Object.fromEntries(
  Object.entries(STAV_OPENCLAW).map(([k, v]) => [v, k as StavZvodu]),
) as Record<string, StavZvodu>;
