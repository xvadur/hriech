import { normalizujDatum } from '@netopier/redakcia/normalize';
import type { Env } from '../types';
import { chunk } from '../util';

const PAGE = 1000;
const BATCH = 100;

/** records.published_at → published_at_utc (ISO UTC). Rieši iba riadky, ktoré ešte nemajú UTC čas. */
export async function normalizeKrok(env: Env) {
  let lastId = 0;
  let seen = 0;
  let updated = 0;
  const formaty: Record<string, number> = {};
  for (;;) {
    const { results } = await env.DB.prepare(
      `SELECT id, published_at FROM records
        WHERE published_at_utc IS NULL AND published_at IS NOT NULL AND published_at != '' AND id > ?
        ORDER BY id LIMIT ?`,
    )
      .bind(lastId, PAGE)
      .all<{ id: number; published_at: string }>();
    if (results.length === 0) break;
    const updates: Array<[string, number]> = [];
    for (const row of results) {
      seen++;
      lastId = row.id;
      const n = normalizujDatum(row.published_at);
      formaty[n.format] = (formaty[n.format] ?? 0) + 1;
      if (n.utc) updates.push([n.utc, row.id]);
    }
    const stmt = env.DB.prepare(`UPDATE records SET published_at_utc = ? WHERE id = ?`);
    for (const group of chunk(updates, BATCH)) await env.DB.batch(group.map(([utc, id]) => stmt.bind(utc, id)));
    updated += updates.length;
    if (results.length < PAGE) break;
  }
  return { seen, inserted: updated, detail: { formaty } };
}
