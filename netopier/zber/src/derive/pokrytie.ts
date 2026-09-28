import { denVBratislave } from '@netopier/redakcia/normalize';
import type { Env } from '../types';
import { chunk } from '../util';

export interface RssRiadok {
  id: number;
  zdroj_id: string;
  title: string | null;
  data: string;
  published_at_utc: string | null;
  collected_at: string;
}

/** RSS záznamy sledovaných slovenských redakcií (zdroje.krajina='SK' ∧ sledovany=1) so zdroj_id cez zdroj_kanaly. */
export async function skRssZaznamy(env: Env): Promise<RssRiadok[]> {
  const out: RssRiadok[] = [];
  let lastId = 0;
  for (;;) {
    const { results } = await env.DB.prepare(
      `SELECT r.id, k.zdroj_id, r.title, r.data, r.published_at_utc, r.collected_at
         FROM records r JOIN zdroj_kanaly k ON k.feed_id = r.channel JOIN zdroje z ON z.id = k.zdroj_id
        WHERE r.source = 'rss' AND z.krajina = 'SK' AND z.sledovany = 1 AND r.id > ?
        ORDER BY r.id LIMIT 1000`,
    )
      .bind(lastId)
      .all<RssRiadok>();
    if (results.length === 0) break;
    out.push(...results);
    lastId = results[results.length - 1]!.id;
    if (results.length < 1000) break;
  }
  return out;
}

export function denZaznamu(r: Pick<RssRiadok, 'published_at_utc' | 'collected_at'>): string {
  return denVBratislave(r.published_at_utc ?? r.collected_at);
}

/** Pokrytie po dňoch: záznamov per redakcia a deň, podiel z Σ sledovaných SK redakcií v ten deň. */
export async function pokrytieKrok(env: Env) {
  const zaznamy = await skRssZaznamy(env);
  const perZdrojDen = new Map<string, number>();
  const perDen = new Map<string, number>();
  for (const r of zaznamy) {
    const den = denZaznamu(r);
    const k = `${r.zdroj_id}\u0000${den}`;
    perZdrojDen.set(k, (perZdrojDen.get(k) ?? 0) + 1);
    perDen.set(den, (perDen.get(den) ?? 0) + 1);
  }
  const stmt = env.DB.prepare(
    `INSERT INTO zdroj_pokrytie_denne (zdroj_id, den, zaznamov, podiel) VALUES (?, ?, ?, ?)
     ON CONFLICT(zdroj_id, den) DO UPDATE SET zaznamov = excluded.zaznamov, podiel = excluded.podiel`,
  );
  const rows = [...perZdrojDen.entries()].sort().map(([k, n]) => {
    const [zdroj, den] = k.split('\u0000') as [string, string];
    return stmt.bind(zdroj, den, n, n / (perDen.get(den) ?? n));
  });
  for (const group of chunk(rows, 100)) await env.DB.batch(group);
  return { seen: zaznamy.length, inserted: rows.length, detail: { dni: perDen.size } };
}
