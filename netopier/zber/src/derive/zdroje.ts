import mediaFeeds from '../../data/media-feeds.json';
import worldmonitorFeeds from '../../data/worldmonitor-feeds.json';
import type { Env } from '../types';
import { chunk } from '../util';

interface MediaFeed {
  id: string;
  name: string;
  url: string;
  site_url?: string;
  family: string;
  lang?: string;
  country?: string;
}

interface WmFeed {
  id: string;
  category?: string;
  name: string;
  url: string;
  lang?: string;
}

/** family v data/media-feeds.json → outlets[].id v src/data/editorial-organization-map.json */
export const OUTLET_PODLA_FAMILY: Record<string, string> = {
  dennikn: 'dennik-n',
  sme: 'sme',
  aktuality: 'aktuality',
  pravda: 'pravda',
  hn: 'hospodarske-noviny',
  trend: 'trend',
  standard: 'standard',
  postoj: 'postoj',
  startitup: 'startitup',
  refresher: 'refresher',
};

export interface ZdrojRiadok {
  id: string;
  nazov: string;
  typ: 'medium' | 'agentura' | 'register' | 'institucia' | 'thinktank' | 'agregator';
  rozsah: 'lokalny' | 'narodny' | 'medzinarodny';
  krajina: string | null;
  jazyk: string | null;
  url: string | null;
  outlet_id: string | null;
  wm_category: string | null;
  sledovany: 0 | 1;
}

export interface KanalRiadok {
  zdroj_id: string;
  feed_id: string;
  family: string | null;
}

/** Zdroje a kanály zo seedov (čistá funkcia, testovateľná bez DB). */
export function zdrojeZoSeedov(media: MediaFeed[] = mediaFeeds.feeds as MediaFeed[], wm: WmFeed[] = worldmonitorFeeds.feeds as WmFeed[]) {
  const zdroje = new Map<string, ZdrojRiadok>();
  const kanaly: KanalRiadok[] = [];
  for (const f of media) {
    const id = f.family || f.id;
    const existing = zdroje.get(id);
    const nazov = f.id === id ? f.name : (existing?.nazov ?? f.name);
    zdroje.set(id, {
      id,
      nazov,
      typ: 'medium',
      rozsah: 'narodny',
      krajina: f.country ?? 'SK',
      jazyk: f.lang ?? 'sk',
      url: existing?.url ?? f.site_url ?? null,
      outlet_id: OUTLET_PODLA_FAMILY[id] ?? null,
      wm_category: null,
      sledovany: 1,
    });
    kanaly.push({ zdroj_id: id, feed_id: f.id, family: f.family ?? null });
  }
  for (const f of wm) {
    zdroje.set(f.id, {
      id: f.id,
      nazov: f.name,
      typ: f.category === 'thinktanks' ? 'thinktank' : f.category === 'gov' ? 'institucia' : 'medium',
      rozsah: 'medzinarodny',
      krajina: null,
      jazyk: f.lang ?? null,
      url: f.url,
      outlet_id: null,
      wm_category: f.category ?? null,
      sledovany: 0,
    });
    kanaly.push({ zdroj_id: f.id, feed_id: f.id, family: null });
  }
  const registre: ZdrojRiadok[] = [
    { id: 'crz', nazov: 'Centrálny register zmlúv', typ: 'register', rozsah: 'narodny', krajina: 'SK', jazyk: 'sk', url: 'https://www.crz.gov.sk/', outlet_id: null, wm_category: null, sledovany: 0 },
    { id: 'ted', nazov: 'TED — Tenders Electronic Daily', typ: 'register', rozsah: 'medzinarodny', krajina: 'EU', jazyk: 'en', url: 'https://ted.europa.eu/', outlet_id: null, wm_category: null, sledovany: 0 },
    { id: 'kataster', nazov: 'Kataster nehnuteľností (ÚGKK)', typ: 'register', rozsah: 'narodny', krajina: 'SK', jazyk: 'sk', url: 'https://www.geoportal.sk/', outlet_id: null, wm_category: null, sledovany: 0 },
    { id: 'statistika', nazov: 'Štatistický úrad SR', typ: 'institucia', rozsah: 'narodny', krajina: 'SK', jazyk: 'sk', url: 'https://data.statistics.sk/', outlet_id: null, wm_category: null, sledovany: 0 },
    { id: 'worldmonitor', nazov: 'World Monitor (inventár zdrojov)', typ: 'agregator', rozsah: 'medzinarodny', krajina: null, jazyk: 'en', url: 'https://worldmonitor.app/', outlet_id: null, wm_category: null, sledovany: 0 },
  ];
  for (const r of registre) zdroje.set(r.id, r);
  return { zdroje: [...zdroje.values()], kanaly };
}

/** Seed kartičiek zdrojov a kanálov; existujúce riadky sa iba dopĺňajú (ručné hodnotenie sa neprepisuje). */
export async function zdrojeKrok(env: Env) {
  const { zdroje, kanaly } = zdrojeZoSeedov();
  const insZdroj = env.DB.prepare(
    `INSERT INTO zdroje (id, nazov, typ, rozsah, krajina, jazyk, url, outlet_id, wm_category, sledovany)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nazov = excluded.nazov, url = COALESCE(zdroje.url, excluded.url),
       outlet_id = COALESCE(zdroje.outlet_id, excluded.outlet_id), wm_category = excluded.wm_category`,
  );
  for (const group of chunk(zdroje, 100)) {
    await env.DB.batch(group.map((z) => insZdroj.bind(z.id, z.nazov, z.typ, z.rozsah, z.krajina, z.jazyk, z.url, z.outlet_id, z.wm_category, z.sledovany)));
  }
  const insKanal = env.DB.prepare(`INSERT OR IGNORE INTO zdroj_kanaly (zdroj_id, feed_id, family) VALUES (?, ?, ?)`);
  for (const group of chunk(kanaly, 100)) await env.DB.batch(group.map((k) => insKanal.bind(k.zdroj_id, k.feed_id, k.family)));
  return { seen: zdroje.length + kanaly.length, inserted: zdroje.length, detail: { zdrojov: zdroje.length, kanalov: kanaly.length } };
}
