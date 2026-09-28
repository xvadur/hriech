import { meranie, type ZaznamNaMeranie } from '@netopier/redakcia/meranie';
import type { Env } from '../types';
import { chunk } from '../util';
import { denZaznamu, skRssZaznamy } from './pokrytie';

/** Meranie médií nad RSS sledovaných SK redakcií → tabuľka `meranie` (prepíše riadky s rovnakým kľúčom). */
export async function meranieKrok(env: Env, now: Date) {
  const zaznamy = await skRssZaznamy(env);
  const vstup: ZaznamNaMeranie[] = zaznamy.map((r) => {
    let data: { summary?: unknown; author?: unknown } = {};
    try {
      data = JSON.parse(r.data) as typeof data;
    } catch {
      /* poškodený JSON → bez súhrnu */
    }
    return {
      id: r.id,
      zdroj_id: r.zdroj_id,
      autor: typeof data.author === 'string' ? data.author : null,
      den: denZaznamu(r),
      title: r.title,
      summary: typeof data.summary === 'string' ? data.summary : null,
    };
  });
  const riadky = meranie(vstup);
  const stmt = env.DB.prepare(
    `INSERT OR REPLACE INTO meranie (rozsah, kluc, den, metrika, hodnota, detail, algoritmus, vypocitane_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const at = now.toISOString();
  for (const group of chunk(riadky, 100)) {
    await env.DB.batch(group.map((r) => stmt.bind(r.rozsah, r.kluc, r.den, r.metrika, r.hodnota, r.detail ? JSON.stringify(r.detail) : null, r.algoritmus, at)));
  }
  const zdroje = new Set(riadky.filter((r) => r.rozsah === 'zdroj').map((r) => r.kluc)).size;
  const autori = new Set(riadky.filter((r) => r.rozsah === 'autor').map((r) => r.kluc)).size;
  return { seen: vstup.length, inserted: riadky.length, detail: { redakcii: zdroje, autorov: autori } };
}
