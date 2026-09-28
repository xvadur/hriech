import { entityZoZaznamu, type Entita } from '@netopier/redakcia/entity';
import type { Env } from '../types';
import { chunk } from '../util';

const PAGE = 500;
const BATCH = 100;

/** Entity podľa IČO z CRZ a TED → entity + record_entity. Idempotentné (INSERT OR IGNORE, výskyty sa rozširujú). */
export async function entityKrok(env: Env) {
  let lastId = 0;
  let seen = 0;
  let vazieb = 0;
  const entity = new Map<string, Entita & { prvy: string; posledny: string }>();
  const insertVazba = env.DB.prepare(`INSERT OR IGNORE INTO record_entity (record_id, entity_id, rola) VALUES (?, ?, ?)`);
  const vazby: Array<[number, string, string]> = [];
  for (;;) {
    const { results } = await env.DB.prepare(
      `SELECT id, source, data, COALESCE(published_at_utc, published_at, collected_at) AS kedy
         FROM records WHERE source IN ('crz', 'ted') AND id > ? ORDER BY id LIMIT ?`,
    )
      .bind(lastId, PAGE)
      .all<{ id: number; source: string; data: string; kedy: string }>();
    if (results.length === 0) break;
    for (const row of results) {
      seen++;
      lastId = row.id;
      let data: Record<string, unknown>;
      try {
        data = JSON.parse(row.data) as Record<string, unknown>;
      } catch {
        continue;
      }
      for (const v of entityZoZaznamu(row.source, data)) {
        const e = entity.get(v.entita.id);
        if (!e) entity.set(v.entita.id, { ...v.entita, prvy: row.kedy, posledny: row.kedy });
        else {
          if (row.kedy < e.prvy) e.prvy = row.kedy;
          if (row.kedy > e.posledny) e.posledny = row.kedy;
          if (e.nazov.startsWith('IČO ') && !v.entita.nazov.startsWith('IČO ')) e.nazov = v.entita.nazov;
        }
        vazby.push([row.id, v.entita.id, v.rola]);
      }
    }
    if (results.length < PAGE) break;
  }
  const upsert = env.DB.prepare(
    `INSERT INTO entity (id, druh, nazov, ico, verejne, prvy_vyskyt, posledny_vyskyt) VALUES (?, ?, ?, ?, 1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       prvy_vyskyt = MIN(prvy_vyskyt, excluded.prvy_vyskyt),
       posledny_vyskyt = MAX(posledny_vyskyt, excluded.posledny_vyskyt),
       nazov = CASE WHEN nazov LIKE 'IČO %' THEN excluded.nazov ELSE nazov END`,
  );
  for (const group of chunk([...entity.values()], BATCH)) {
    await env.DB.batch(group.map((e) => upsert.bind(e.id, e.druh, e.nazov, e.ico, e.prvy, e.posledny)));
  }
  for (const group of chunk(vazby, BATCH)) {
    const results = await env.DB.batch(group.map(([r, e, rola]) => insertVazba.bind(r, e, rola)));
    for (const res of results) vazieb += (res.meta.changes ?? 0) > 0 ? 1 : 0;
  }
  return { seen, inserted: vazieb, detail: { entit: entity.size, vazieb_spolu: vazby.length } };
}
