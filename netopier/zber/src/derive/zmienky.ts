import type { Env } from '../types';
import { chunk } from '../util';

/** Alias → FTS5 fráza: úvodzovky sa zdvoja, celé v úvodzovkách. */
export function ftsFraza(alias: string): string {
  return `"${alias.replace(/"/g, '""')}"`;
}

/**
 * Zmienky sledovaných entít v archíve: pre každý alias entity so `sledovane = 1`
 * fulltext nad titulkami a súhrnmi → record_entity (rola 'zmienka').
 * Toto je entitný filter z rozhodnutia 28. 9.: neoznačené texty sa nečítajú celé.
 */
export async function zmienkyKrok(env: Env) {
  const { results: aliasy } = await env.DB.prepare(
    `SELECT a.entity_id, a.alias FROM entity_alias a JOIN entity e ON e.id = a.entity_id WHERE e.sledovane = 1 ORDER BY a.entity_id, a.alias`,
  ).all<{ entity_id: string; alias: string }>();
  const ins = env.DB.prepare(`INSERT OR IGNORE INTO record_entity (record_id, entity_id, rola) VALUES (?, ?, 'zmienka')`);
  let seen = 0;
  let inserted = 0;
  const perEntita: Record<string, number> = {};
  for (const { entity_id, alias } of aliasy) {
    const { results } = await env.DB.prepare(`SELECT rowid AS id FROM records_fts WHERE records_fts MATCH ?`).bind(ftsFraza(alias)).all<{ id: number }>();
    seen += results.length;
    for (const group of chunk(results, 100)) {
      const res = await env.DB.batch(group.map((r) => ins.bind(r.id, entity_id)));
      for (const x of res) inserted += (x.meta.changes ?? 0) > 0 ? 1 : 0;
    }
    perEntita[entity_id] = (perEntita[entity_id] ?? 0) + results.length;
  }
  for (const entity_id of Object.keys(perEntita)) {
    await env.DB.prepare(
      `UPDATE entity SET posledny_vyskyt = COALESCE((
         SELECT MAX(COALESCE(r.published_at_utc, r.collected_at)) FROM record_entity re JOIN records r ON r.id = re.record_id WHERE re.entity_id = ?
       ), posledny_vyskyt) WHERE id = ?`,
    )
      .bind(entity_id, entity_id)
      .run();
  }
  return { seen, inserted, detail: { aliasov: aliasy.length, zmienok_per_entita: perEntita } };
}
