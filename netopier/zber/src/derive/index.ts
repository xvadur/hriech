// Odvodenie nad archívom (krok I0): deterministické kroky nad lokálnou D1, bez siete a bez LLM.
// Každý krok je idempotentný (dá sa pustiť znova) a zapíše beh do `runs` (source='derive').
// Spustenie: node scripts/derive-node.mjs <krok|all>  (lokálna D1 v .wrangler/state)

import type { Env } from '../types';
import { normalizeKrok } from './normalize';
import { entityKrok } from './entity';
import { zdrojeKrok } from './zdroje';
import { pokrytieKrok } from './pokrytie';
import { zmienkyKrok } from './zmienky';
import { meranieKrok } from './meranie';

export type DeriveKrok = 'normalize' | 'entity' | 'zdroje' | 'fts' | 'pocty' | 'pokrytie' | 'zmienky' | 'meranie';

/** Poradie krokov pri `all` (zdroje pred pokrytím a meraním; FTS pred zmienkami). */
export const DERIVE_KROKY: readonly DeriveKrok[] = ['normalize', 'entity', 'zdroje', 'fts', 'pocty', 'pokrytie', 'zmienky', 'meranie'];

export interface DeriveSummary {
  krok: DeriveKrok;
  status: 'ok' | 'error';
  /** koľko riadkov krok prešiel */
  seen: number;
  /** koľko riadkov zapísal alebo zmenil */
  inserted: number;
  detail?: Record<string, unknown>;
  error?: string;
}

export type KrokFn = (env: Env, now: Date) => Promise<Omit<DeriveSummary, 'krok' | 'status'>>;

export const KROKY: Record<DeriveKrok, KrokFn> = {
  normalize: normalizeKrok,
  entity: entityKrok,
  zdroje: zdrojeKrok,
  fts: ftsKrok,
  pocty: poctyKrok,
  pokrytie: pokrytieKrok,
  zmienky: zmienkyKrok,
  meranie: meranieKrok,
};

/** Fulltext: prebuduje index z `records` a overí integritu (externý obsah). */
export async function ftsKrok(env: Env): Promise<Omit<DeriveSummary, 'krok' | 'status'>> {
  await env.DB.prepare(`INSERT INTO records_fts(records_fts) VALUES ('rebuild')`).run();
  await env.DB.prepare(`INSERT INTO records_fts(records_fts) VALUES ('integrity-check')`).run();
  const zmluva = await count(env, `SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'zmluva'`);
  const skolstvo = await count(env, `SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'školstv*'`);
  const riadkov = await count(env, `SELECT COUNT(*) AS n FROM records`);
  return { seen: riadkov, inserted: riadkov, detail: { match_zmluva: zmluva, match_skolstv: skolstvo } };
}

/** Počty riadkov per zdroj a kanál (pre /health a terminál bez plného skenu). */
export async function poctyKrok(env: Env): Promise<Omit<DeriveSummary, 'krok' | 'status'>> {
  await env.DB.prepare(
    `INSERT OR REPLACE INTO pocty (source, channel, riadkov, posledny_at)
     SELECT source, channel, COUNT(*), MAX(collected_at) FROM records GROUP BY source, channel`,
  ).run();
  const riadkov = await count(env, `SELECT COUNT(*) AS n FROM pocty`);
  const spolu = await count(env, `SELECT COALESCE(SUM(riadkov), 0) AS n FROM pocty`);
  return { seen: spolu, inserted: riadkov };
}

export async function count(env: Env, sql: string, ...params: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

/** Spustí jeden krok a zapíše beh do `runs`. Chyba sa zapíše a vyhodí. */
export async function runDerive(env: Env, krok: DeriveKrok, now = new Date()): Promise<DeriveSummary> {
  const fn = KROKY[krok];
  if (!fn) throw new Error(`Neznámy krok odvodenia ${krok}`);
  const startedAt = now.toISOString();
  const run = await env.DB.prepare(`INSERT INTO runs (source, channel, started_at, status) VALUES ('derive', ?, ?, 'running') RETURNING id`)
    .bind(krok, startedAt)
    .first<{ id: number }>();
  try {
    const result = await fn(env, now);
    await env.DB.prepare(`UPDATE runs SET finished_at = ?, status = 'ok', seen = ?, inserted = ? WHERE id = ?`)
      .bind(new Date().toISOString(), result.seen, result.inserted, run!.id)
      .run();
    return { krok, status: 'ok', ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await env.DB.prepare(`UPDATE runs SET finished_at = ?, status = 'error', error = ? WHERE id = ?`)
      .bind(new Date().toISOString(), message.slice(0, 2000), run!.id)
      .run();
    throw error;
  }
}

/** Všetky kroky v poradí; zastaví sa na prvej chybe. */
export async function runDeriveAll(env: Env, now = new Date()): Promise<DeriveSummary[]> {
  const out: DeriveSummary[] = [];
  for (const krok of DERIVE_KROKY) out.push(await runDerive(env, krok, now));
  return out;
}

export interface Najdeny {
  id: number;
  source: string;
  channel: string;
  title: string | null;
  url: string | null;
  published_at_utc: string | null;
}

/** Fulltext nad titulkami a súhrnmi (FTS5 syntax: slovo, "fráza", prefix*). */
export async function hladaj(env: Env, dopyt: string, limit = 20): Promise<Najdeny[]> {
  const { results } = await env.DB.prepare(
    `SELECT r.id, r.source, r.channel, r.title, r.url, r.published_at_utc
       FROM records_fts f JOIN records r ON r.id = f.rowid
      WHERE records_fts MATCH ?
      ORDER BY bm25(records_fts) LIMIT ?`,
  )
    .bind(dopyt, limit)
    .all<Najdeny>();
  return results;
}
