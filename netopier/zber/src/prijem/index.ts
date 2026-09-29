// Príjem RSS (XDR-299): všetky kanály z registra zdrojov → surový archív `records` → `dokumenty` → celé texty.
// Idempotentný: rovnaká položka sa druhýkrát nezapíše (URL aj obsah), text sa sťahuje raz (opakuje sa iba chyba).
// Slušné tempo: jeden host naraz sekvenčne s rozostupom (a Crawl-delay), robots.txt, podmienené GET kanálov (ETag).
// Spúšťa sa každých 2–5 minút: node scripts/prijem-node.mjs (lokálny SQLite súbor, STACK.md).

import { archiveChannel } from '../archive';
import { itemToRecord, parseFeed, type FeedItem } from '../sources/rss';
import type { Env } from '../types';
import { errorMessage } from '../util';
import { kanalyZRegistra, zdrojRiadok, type KanalPrijmu, type ZdrojRegistra } from './register';
import { parseRobots, robotsPovoluje, type RobotsPravidla } from './robots';
import { dekodujTelo, htmlNaText, obsahHash, pocetSlov, vytiahniText } from './text';
import { hostZUrl, kanonUrl } from './url';

export interface PrijemMoznosti {
  register: ZdrojRegistra[];
  fetch: typeof fetch;
  userAgent: string;
  now?: () => Date;
  /** koľko celých textov najviac za beh (spolu) */
  maxTextov?: number;
  /** koľko celých textov najviac z jedného hosta za beh */
  maxNaHost?: number;
  /** rozostup medzi požiadavkami na jeden host (ms); Crawl-delay z robots.txt ho môže predĺžiť */
  rozostupMs?: number;
  /** koľko hostov naraz */
  sucasneHosty?: number;
  /** iba kanály, bez sťahovania textov */
  bezTextov?: boolean;
  sleep?: (ms: number) => Promise<void>;
  log?: (riadok: string) => void;
}

export interface ZdrojSuhrn {
  kanalov: number;
  kanalov_chyba: number;
  poloziek: number;
  novych: number;
  texty_ok: number;
}

export interface PrijemSuhrn {
  zaciatok: string;
  koniec: string;
  kanalov: number;
  kanalov_ok: number;
  kanalov_304: number;
  kanalov_chyba: number;
  poloziek: number;
  records_novych: number;
  dokumenty_novych: number;
  dokumenty_uz_boli: number;
  dokumenty_zmenene: number;
  vyskyty_nove: number;
  texty_z_rss: number;
  texty: Record<string, number>;
  duplikaty_obsahu: number;
  po_zdrojoch: Record<string, ZdrojSuhrn>;
  chyby: Array<{ kanal?: string; dokument?: number; chyba: string }>;
}

/** Text kratší ako toto sa berie ako neúplný (platená stena, krátka správa): stav `kratky`. */
export const TEXT_MIN_OK = 600;
/** RSS text sa berie ako celý, ak je aspoň taký dlhý (alebo ak register hovorí cely_text_v_rss). */
export const RSS_TEXT_MIN = 1500;
const ROBOTS_PLATNOST_MS = 24 * 3600_000;
/** Typy, pri ktorých sa stránka nesťahuje (text = popis z kanála). */
const BEZ_STRANKY = new Set(['epizoda', 'video']);
const MAX_POKUSOV = 4;

const spi = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Spustí fn nad položkami zoskupenými podľa hosta: hosty paralelne (limit), v rámci hosta za sebou. */
async function poHostoch<T>(polozky: T[], host: (t: T) => string, sucasne: number, fn: (host: string, skupina: T[]) => Promise<void>) {
  const skupiny = new Map<string, T[]>();
  for (const p of polozky) {
    const h = host(p);
    skupiny.set(h, [...(skupiny.get(h) ?? []), p]);
  }
  const fronta = [...skupiny.entries()];
  const pracovnik = async () => {
    for (let dalsi = fronta.shift(); dalsi; dalsi = fronta.shift()) await fn(dalsi[0], dalsi[1]);
  };
  await Promise.all(Array.from({ length: Math.max(1, Math.min(sucasne, fronta.length)) }, pracovnik));
}

function prazdnySuhrn(zaciatok: string): PrijemSuhrn {
  return {
    zaciatok,
    koniec: zaciatok,
    kanalov: 0,
    kanalov_ok: 0,
    kanalov_304: 0,
    kanalov_chyba: 0,
    poloziek: 0,
    records_novych: 0,
    dokumenty_novych: 0,
    dokumenty_uz_boli: 0,
    dokumenty_zmenene: 0,
    vyskyty_nove: 0,
    texty_z_rss: 0,
    texty: {},
    duplikaty_obsahu: 0,
    po_zdrojoch: {},
    chyby: [],
  };
}

/** Zdroje a kanály z registra do `zdroje` a `zdroj_kanaly` (ručné hodnotenie a outlet sa neprepisujú). */
export async function synchronizujZdroje(db: D1Database, register: ZdrojRegistra[], kanaly: KanalPrijmu[], nowIso: string) {
  const insZdroj = db.prepare(
    `INSERT INTO zdroje (id, nazov, typ, rozsah, krajina, jazyk, url, outlet_id, sledovany,
       register_typ, kategoria, api, cely_text_v_rss, overene_at, poznamka, aktualizovane_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nazov = excluded.nazov, url = COALESCE(excluded.url, zdroje.url),
       outlet_id = COALESCE(zdroje.outlet_id, excluded.outlet_id), register_typ = excluded.register_typ,
       kategoria = excluded.kategoria, api = excluded.api, cely_text_v_rss = excluded.cely_text_v_rss,
       overene_at = excluded.overene_at, poznamka = excluded.poznamka, aktualizovane_at = excluded.aktualizovane_at`,
  );
  const stmts = register.map((z) => {
    const r = zdrojRiadok(z);
    const sledovany = r.krajina === 'SK' && (r.typ === 'medium' || r.typ === 'agentura') ? 1 : 0;
    return insZdroj.bind(r.id, r.nazov, r.typ, r.rozsah, r.krajina, r.jazyk, r.url, r.outlet_id, sledovany, r.register_typ, r.kategoria, r.api, r.cely_text_v_rss, r.overene_at, r.poznamka, nowIso);
  });
  for (const k of kanaly) {
    stmts.push(
      db.prepare(`UPDATE zdroj_kanaly SET zdroj_id = ?, url = ?, druh = 'rss', aktivny = 1 WHERE feed_id = ?`).bind(k.zdrojId, k.url, k.feedId),
      db
        .prepare(`INSERT OR IGNORE INTO zdroj_kanaly (zdroj_id, feed_id, family, verified_at, url, druh, aktivny) VALUES (?, ?, ?, ?, ?, 'rss', 1)`)
        .bind(k.zdrojId, k.feedId, k.zdrojId, nowIso.slice(0, 10), k.url),
    );
  }
  if (stmts.length) await db.batch(stmts);
}

async function stiahni(o: PrijemMoznosti, url: string, headers: Record<string, string>, timeoutMs = 20_000): Promise<Response> {
  return o.fetch(url, { headers: { 'user-agent': o.userAgent, ...headers }, redirect: 'follow', signal: AbortSignal.timeout(timeoutMs) });
}

interface KanalVysledok {
  kanal: KanalPrijmu;
  polozky: FeedItem[];
  cursor: string | null;
  stav: 'ok' | '304' | 'chyba';
  chyba?: string;
}

async function stiahniKanal(db: D1Database, o: PrijemMoznosti, kanal: KanalPrijmu): Promise<KanalVysledok> {
  const stav = await db
    .prepare(`SELECT cursor FROM source_state WHERE source = 'rss' AND channel = ?`)
    .bind(kanal.feedId)
    .first<{ cursor: string | null }>();
  let predosly: { etag?: string; last_modified?: string } = {};
  try {
    predosly = stav?.cursor ? JSON.parse(stav.cursor) : {};
  } catch {
    predosly = {};
  }
  const headers: Record<string, string> = { accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5' };
  if (predosly.etag) headers['if-none-match'] = predosly.etag;
  if (predosly.last_modified) headers['if-modified-since'] = predosly.last_modified;
  try {
    const res = await stiahni(o, kanal.url, headers);
    if (res.status === 304) return { kanal, polozky: [], cursor: null, stav: '304' };
    if (!res.ok) return { kanal, polozky: [], cursor: null, stav: 'chyba', chyba: `HTTP ${res.status}` };
    const xml = dekodujTelo(new Uint8Array(await res.arrayBuffer()), res.headers.get('content-type'));
    const polozky = parseFeed(xml);
    const etag = res.headers.get('etag');
    const lm = res.headers.get('last-modified');
    const cursor = etag || lm ? JSON.stringify({ ...(etag ? { etag } : {}), ...(lm ? { last_modified: lm } : {}) }) : null;
    return { kanal, polozky, cursor, stav: 'ok' };
  } catch (e) {
    return { kanal, polozky: [], cursor: null, stav: 'chyba', chyba: errorMessage(e) };
  }
}

function rovnake(a: string | null | undefined, b: string | null | undefined): boolean {
  return (a ?? '').replace(/\s+/g, ' ').trim() === (b ?? '').replace(/\s+/g, ' ').trim();
}

/** Uloží celý text dokumentu, nastaví stav a obsahový duplikát. Vráti stav textu. */
export async function ulozText(
  db: D1Database,
  dokumentId: number,
  text: string,
  metoda: string,
  zdrojUrl: string | null,
  nowIso: string,
  /** minimálna dĺžka pre stav ok (minúta po minúte je krátka celá); neuplny = platená stena */
  moznosti: { minOk?: number; neuplny?: boolean } = {},
): Promise<{ stav: 'ok' | 'kratky' | 'bez_textu'; duplikatOf: number | null }> {
  if (!text) {
    await db.prepare(`UPDATE dokumenty SET text_stav = 'bez_textu', text_chyba = NULL, aktualizovane_at = ? WHERE id = ?`).bind(nowIso, dokumentId).run();
    return { stav: 'bez_textu', duplikatOf: null };
  }
  const hash = await obsahHash(text);
  const stav = !moznosti.neuplny && text.length >= (moznosti.minOk ?? TEXT_MIN_OK) ? 'ok' : 'kratky';
  const predtym = await db.prepare(`SELECT hash FROM dokument_texty WHERE dokument_id = ?`).bind(dokumentId).first<{ hash: string }>();
  if (!predtym) {
    await db
      .prepare(`INSERT INTO dokument_texty (dokument_id, text, znakov, slov, metoda, zdroj_url, hash, verzia, ziskane_at) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`)
      .bind(dokumentId, text, text.length, pocetSlov(text), metoda, zdrojUrl, hash, nowIso)
      .run();
  } else if (predtym.hash !== hash) {
    await db
      .prepare(`UPDATE dokument_texty SET text = ?, znakov = ?, slov = ?, metoda = ?, zdroj_url = ?, hash = ?, verzia = verzia + 1, zmenene_at = ? WHERE dokument_id = ?`)
      .bind(text, text.length, pocetSlov(text), metoda, zdrojUrl, hash, nowIso, dokumentId)
      .run();
  }
  // Originál je najstarší dokument (najnižšie id) s rovnakým textom; ostatné naň ukazujú cez duplikat_of.
  let duplikatOf: number | null = null;
  if (stav === 'ok') {
    const prvy = await db
      .prepare(`SELECT MIN(id) AS id FROM dokumenty WHERE obsah_hash = ? AND id <> ? AND text_stav = 'ok'`)
      .bind(hash, dokumentId)
      .first<{ id: number | null }>();
    if (prvy?.id != null && prvy.id < dokumentId) duplikatOf = prvy.id;
    else if (prvy?.id != null) {
      await db.prepare(`UPDATE dokumenty SET duplikat_of = ? WHERE obsah_hash = ? AND id <> ? AND text_stav = 'ok'`).bind(dokumentId, hash, dokumentId).run();
      duplikatOf = prvy.id; // pre počet duplikátov v behu: dvojica vznikla
    }
  }
  await db
    .prepare(
      `UPDATE dokumenty SET obsah_hash = ?, text_stav = ?, duplikat_of = ?, text_chyba = NULL, text_dalsi_pokus_at = NULL, aktualizovane_at = ?,
         data = CASE WHEN ? THEN json_set(data, '$.platene', 1) ELSE data END WHERE id = ?`,
    )
    .bind(hash, stav, duplikatOf !== null && duplikatOf < dokumentId ? duplikatOf : null, nowIso, moznosti.neuplny ? 1 : 0, dokumentId)
    .run();
  return { stav, duplikatOf };
}

/** Položky kanála → `dokumenty` (+ výskyty, text z RSS, ak je celý). */
async function zapisDokumenty(db: D1Database, v: KanalVysledok, nazovZdroja: string, nowIso: string, s: PrijemSuhrn) {
  const k = v.kanal;
  const zs = s.po_zdrojoch[k.zdrojId]!;
  for (const item of v.polozky) {
    const record = itemToRecord({ id: k.feedId, name: nazovZdroja, url: k.url, lang: k.jazyk ?? undefined }, item);
    if (!record) continue;
    const kanon = kanonUrl(item.link);
    const externalId = item.guid ?? item.link;
    const rec = await db
      .prepare(`SELECT id FROM records WHERE source = 'rss' AND external_id = ? ORDER BY id DESC LIMIT 1`)
      .bind(record.externalId)
      .first<{ id: number }>();
    const recordId = rec?.id ?? null;
    type Existujuci = { id: number; titulok: string | null; perex: string | null; kanal: string | null };
    let dok = kanon ? await db.prepare(`SELECT id, titulok, perex, kanal FROM dokumenty WHERE url_kanon = ?`).bind(kanon).first<Existujuci>() : null;
    if (!dok && externalId) {
      dok = await db
        .prepare(`SELECT id, titulok, perex, kanal FROM dokumenty WHERE zdroj_id = ? AND external_id = ? ORDER BY id LIMIT 1`)
        .bind(k.zdrojId, externalId)
        .first<Existujuci>();
    }
    if (dok) {
      const vyskyt = await db
        .prepare(`INSERT OR IGNORE INTO dokument_vyskyty (dokument_id, kanal, record_id, prvy_at) VALUES (?, ?, ?, ?)`)
        .bind(dok.id, k.feedId, recordId, nowIso)
        .run();
      if ((vyskyt.meta.changes ?? 0) > 0) s.vyskyty_nove++;
      // Titulok a perex drží kanál, v ktorom sa dokument objavil prvýkrát; ostatné kanály iba pridajú výskyt
      // (rubriky tej istej redakcie mávajú iný perex a prepisovali by sa navzájom pri každom behu).
      if (dok.kanal === k.feedId && (!rovnake(dok.titulok, item.title) || !rovnake(dok.perex, item.summary))) {
        await db
          .prepare(`UPDATE dokumenty SET titulok = ?, perex = ?, record_id = COALESCE(?, record_id), aktualizovane_at = ? WHERE id = ?`)
          .bind(item.title, item.summary, recordId, nowIso, dok.id)
          .run();
        s.dokumenty_zmenene++;
      } else {
        s.dokumenty_uz_boli++;
      }
      continue;
    }
    const rssText = htmlNaText(item.content);
    // Epizóda a video: text je popis z kanála (stránka sa nesťahuje; prepis je samostatný dokument).
    const bezStranky = BEZ_STRANKY.has(k.typDokumentu);
    const popis = bezStranky ? rssText || item.summary || '' : '';
    const celyZRss = bezStranky ? popis || null : rssText.length >= (k.celyTextVRss ? 200 : RSS_TEXT_MIN) ? rssText : null;
    const stav = celyZRss ? 'ok' : item.link && !bezStranky ? 'caka' : 'bez_textu';
    const novy = await db
      .prepare(
        `INSERT INTO dokumenty (typ, zdroj_id, kanal, url, url_kanon, external_id, titulok, perex, autor, jazyk, kategorie,
           published_at_utc, prvy_zaznam_at, aktualizovane_at, record_id, text_stav)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(url_kanon) DO NOTHING RETURNING id`,
      )
      .bind(k.typDokumentu, k.zdrojId, k.feedId, item.link, kanon, externalId, item.title, item.summary, item.author, k.jazyk, JSON.stringify(item.categories), item.published, nowIso, nowIso, recordId, stav)
      .first<{ id: number }>();
    if (!novy) {
      s.dokumenty_uz_boli++;
      continue;
    }
    s.dokumenty_novych++;
    zs.novych++;
    await db.prepare(`INSERT OR IGNORE INTO dokument_vyskyty (dokument_id, kanal, record_id, prvy_at) VALUES (?, ?, ?, ?)`).bind(novy.id, k.feedId, recordId, nowIso).run();
    s.vyskyty_nove++;
    if (celyZRss) {
      const r = await ulozText(db, novy.id, celyZRss, 'rss', item.link, nowIso, bezStranky ? { minOk: 1 } : {});
      s.texty_z_rss++;
      zs.texty_ok += r.stav === 'ok' ? 1 : 0;
      if (r.duplikatOf) s.duplikaty_obsahu++;
    }
  }
}

interface Hostitel {
  robots: RobotsPravidla;
  rozostup: number;
}

async function robotsPreHost(db: D1Database, o: PrijemMoznosti, host: string, now: Date): Promise<Hostitel | null> {
  const rozostup = o.rozostupMs ?? 1500;
  const riadok = await db
    .prepare(`SELECT robots_txt, robots_stav, robots_at FROM hostitelia WHERE host = ?`)
    .bind(host)
    .first<{ robots_txt: string | null; robots_stav: number | null; robots_at: string | null }>();
  let txt: string | null;
  if (riadok?.robots_at && now.getTime() - Date.parse(riadok.robots_at) < ROBOTS_PLATNOST_MS) {
    txt = riadok.robots_txt;
  } else {
    let stav: number;
    try {
      const res = await stiahni(o, `https://${host}/robots.txt`, { accept: 'text/plain,*/*;q=0.5' }, 15_000);
      stav = res.status;
      if (res.ok) txt = dekodujTelo(new Uint8Array(await res.arrayBuffer()), res.headers.get('content-type')).slice(0, 500_000);
      else if (res.status >= 400 && res.status < 500) txt = null; // bez robots.txt = bez obmedzení
      else throw new Error(`HTTP ${res.status}`);
    } catch (e) {
      await db
        .prepare(`INSERT INTO hostitelia (host, chyb, posledna_chyba) VALUES (?, 1, ?) ON CONFLICT(host) DO UPDATE SET chyb = chyb + 1, posledna_chyba = excluded.posledna_chyba`)
        .bind(host, `robots.txt: ${errorMessage(e)}`)
        .run();
      return null; // bez robots.txt sa host v tomto behu nesťahuje
    }
    await db
      .prepare(
        `INSERT INTO hostitelia (host, robots_txt, robots_stav, robots_at) VALUES (?, ?, ?, ?)
         ON CONFLICT(host) DO UPDATE SET robots_txt = excluded.robots_txt, robots_stav = excluded.robots_stav, robots_at = excluded.robots_at`,
      )
      .bind(host, txt, stav, now.toISOString())
      .run();
  }
  const robots = parseRobots(txt, 'netopier');
  const delay = robots.crawlDelay !== null ? Math.min(robots.crawlDelay, 30) * 1000 : 0;
  return { robots, rozostup: Math.max(rozostup, delay) };
}

async function chybaTextu(db: D1Database, id: number, stav: 'chyba' | 'nedostupne' | 'zakazane' | 'bez_textu', chyba: string, now: Date) {
  if (stav === 'chyba') {
    await db
      .prepare(
        `UPDATE dokumenty SET text_stav = 'chyba', text_pokusy = text_pokusy + 1, text_chyba = ?,
           text_dalsi_pokus_at = strftime('%Y-%m-%dT%H:%M:%fZ', ?, '+' || (10 * (1 << MIN(text_pokusy, 6))) || ' minutes'), aktualizovane_at = ?
         WHERE id = ?`,
      )
      .bind(chyba.slice(0, 500), now.toISOString(), now.toISOString(), id)
      .run();
  } else {
    await db
      .prepare(`UPDATE dokumenty SET text_stav = ?, text_pokusy = text_pokusy + 1, text_chyba = ?, aktualizovane_at = ? WHERE id = ?`)
      .bind(stav, chyba.slice(0, 500), now.toISOString(), id)
      .run();
  }
}

/** Celé texty pre dokumenty, ktoré ich ešte nemajú (najnovšie prvé), po hostoch so slušným tempom. */
async function stiahniTexty(db: D1Database, o: PrijemMoznosti, s: PrijemSuhrn) {
  const now = (o.now ?? (() => new Date()))();
  const kandidati = await db
    .prepare(
      `SELECT id, url, zdroj_id, typ FROM dokumenty
       WHERE url IS NOT NULL AND typ NOT IN ('epizoda', 'video') AND (text_stav = 'caka'
         OR (text_stav = 'chyba' AND text_pokusy < ? AND (text_dalsi_pokus_at IS NULL OR text_dalsi_pokus_at <= ?)))
       ORDER BY prvy_zaznam_at DESC, id DESC LIMIT ?`,
    )
    .bind(MAX_POKUSOV, now.toISOString(), (o.maxTextov ?? 400) * 3)
    .all<{ id: number; url: string; zdroj_id: string; typ: string }>();
  const naHost = new Map<string, number>();
  const vybrane: Array<{ id: number; url: string; zdroj_id: string; typ: string; host: string }> = [];
  for (const d of kandidati.results) {
    const host = hostZUrl(d.url);
    if (!host) {
      await chybaTextu(db, d.id, 'nedostupne', 'neplatná URL', now);
      continue;
    }
    const n = naHost.get(host) ?? 0;
    if (n >= (o.maxNaHost ?? 40) || vybrane.length >= (o.maxTextov ?? 400)) continue;
    naHost.set(host, n + 1);
    vybrane.push({ ...d, host });
  }
  const pripocitaj = (stav: string) => (s.texty[stav] = (s.texty[stav] ?? 0) + 1);
  const sleep = o.sleep ?? spi;
  await poHostoch(vybrane, (d) => d.host, o.sucasneHosty ?? 6, async (host, docs) => {
    const h = await robotsPreHost(db, o, host, now);
    if (!h) {
      s.texty.host_bez_robots = (s.texty.host_bez_robots ?? 0) + docs.length;
      return;
    }
    let prvy = true;
    for (const d of docs) {
      if (!robotsPovoluje(h.robots, d.url)) {
        await chybaTextu(db, d.id, 'zakazane', 'robots.txt zakazuje', now);
        pripocitaj('zakazane');
        continue;
      }
      if (!prvy) await sleep(h.rozostup);
      prvy = false;
      const nowIso = new Date().toISOString();
      try {
        const res = await stiahni(o, d.url, { accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5', 'accept-language': 'sk,cs;q=0.8,en;q=0.5' });
        await db
          .prepare(`INSERT INTO hostitelia (host, posledny_fetch_at, fetchov) VALUES (?, ?, 1) ON CONFLICT(host) DO UPDATE SET posledny_fetch_at = excluded.posledny_fetch_at, fetchov = fetchov + 1`)
          .bind(host, nowIso)
          .run();
        if (res.status === 429 || res.status >= 500) {
          await res.body?.cancel().catch(() => {});
          await chybaTextu(db, d.id, 'chyba', `HTTP ${res.status}`, now);
          pripocitaj('chyba');
          s.chyby.push({ dokument: d.id, chyba: `HTTP ${res.status} ${d.url}` });
          if (res.status === 429) break; // host nás brzdí: zvyšok v ďalšom behu
          continue;
        }
        if (!res.ok) {
          await res.body?.cancel().catch(() => {});
          await chybaTextu(db, d.id, 'nedostupne', `HTTP ${res.status}`, now);
          pripocitaj('nedostupne');
          continue;
        }
        const typ = res.headers.get('content-type') ?? '';
        if (typ && !/html|xml/i.test(typ)) {
          await res.body?.cancel().catch(() => {}); // audio, PDF…: telo sa nesťahuje
          await chybaTextu(db, d.id, 'bez_textu', `content-type ${typ}`, now);
          pripocitaj('bez_textu');
          continue;
        }
        const html = dekodujTelo(new Uint8Array(await res.arrayBuffer()), typ);
        const vytiahnuty = vytiahniText(html, res.url || d.url);
        const r = await ulozText(db, d.id, vytiahnuty?.text ?? '', vytiahnuty?.metoda ?? 'readability', res.url || d.url, nowIso, {
          minOk: d.typ === 'minuta' ? 1 : TEXT_MIN_OK,
          neuplny: vytiahnuty?.platene ?? false,
        });
        if (vytiahnuty?.platene) pripocitaj('platene');
        if (vytiahnuty?.autor) {
          await db.prepare(`UPDATE dokumenty SET autor = ? WHERE id = ? AND autor IS NULL`).bind(vytiahnuty.autor.slice(0, 300), d.id).run();
        }
        pripocitaj(r.stav);
        if (vytiahnuty) pripocitaj(`metoda_${vytiahnuty.metoda}`);
        if (r.duplikatOf) s.duplikaty_obsahu++;
        const zs = s.po_zdrojoch[d.zdroj_id];
        if (zs && r.stav === 'ok') zs.texty_ok++;
      } catch (e) {
        await chybaTextu(db, d.id, 'chyba', errorMessage(e), now);
        pripocitaj('chyba');
        s.chyby.push({ dokument: d.id, chyba: `${errorMessage(e)} ${d.url}` });
        await db
          .prepare(`INSERT INTO hostitelia (host, chyb, posledna_chyba) VALUES (?, 1, ?) ON CONFLICT(host) DO UPDATE SET chyb = chyb + 1, posledna_chyba = excluded.posledna_chyba`)
          .bind(host, errorMessage(e).slice(0, 300))
          .run();
      }
    }
  });
}

/** Jeden beh príjmu: kanály → archív → dokumenty → celé texty. Zapíše beh do `runs` (source='prijem'). */
export async function runPrijem(db: D1Database, o: PrijemMoznosti): Promise<PrijemSuhrn> {
  const now = (o.now ?? (() => new Date()))();
  const nowIso = now.toISOString();
  const s = prazdnySuhrn(nowIso);
  const log = o.log ?? (() => {});
  const kanaly = kanalyZRegistra(o.register);
  const nazvy = new Map(o.register.map((z) => [z.id, z.nazov]));
  await synchronizujZdroje(db, o.register, kanaly, nowIso);
  for (const z of o.register) s.po_zdrojoch[z.id] = { kanalov: 0, kanalov_chyba: 0, poloziek: 0, novych: 0, texty_ok: 0 };
  s.kanalov = kanaly.length;

  // 1. Kanály: po hostoch (rozdielne hosty paralelne), v rámci hosta za sebou s rozostupom.
  const vysledky: KanalVysledok[] = [];
  const sleep = o.sleep ?? spi;
  await poHostoch(kanaly, (k) => hostZUrl(k.url) ?? k.url, o.sucasneHosty ?? 6, async (_host, skupina) => {
    let prvy = true;
    for (const k of skupina) {
      if (!prvy) await sleep(o.rozostupMs ?? 1500);
      prvy = false;
      vysledky.push(await stiahniKanal(db, o, k));
    }
  });

  // 2. Surový archív (records, runs, source_state) a dokumenty — zapisuje sa sekvenčne.
  const env = { DB: db } as unknown as Env;
  for (const v of vysledky) {
    const zs = s.po_zdrojoch[v.kanal.zdrojId]!;
    zs.kanalov++;
    const nazov = nazvy.get(v.kanal.zdrojId) ?? v.kanal.zdrojId;
    if (v.stav === 'chyba') {
      s.kanalov_chyba++;
      zs.kanalov_chyba++;
      s.chyby.push({ kanal: v.kanal.feedId, chyba: v.chyba ?? 'chyba' });
      log(`kanál ${v.kanal.feedId}: CHYBA ${v.chyba}`);
    } else if (v.stav === '304') {
      s.kanalov_304++;
    } else {
      s.kanalov_ok++;
    }
    const records = v.polozky
      .map((item) => itemToRecord({ id: v.kanal.feedId, name: nazov, url: v.kanal.url, lang: v.kanal.jazyk ?? undefined }, item))
      .filter((r): r is NonNullable<typeof r> => r !== null);
    const a = await archiveChannel(env, 'rss', { channel: v.kanal.feedId, records, cursor: v.cursor, ...(v.stav === 'chyba' ? { error: v.chyba } : {}) }, now);
    s.records_novych += a.inserted;
    s.poloziek += v.polozky.length;
    zs.poloziek += v.polozky.length;
    await zapisDokumenty(db, v, nazov, nowIso, s);
  }

  // 3. Celé texty.
  if (!o.bezTextov) {
    await stiahniTexty(db, o, s);
  }

  s.koniec = new Date().toISOString();
  await db
    .prepare(`INSERT INTO runs (source, channel, started_at, finished_at, status, seen, inserted, detail) VALUES ('prijem', '*', ?, ?, ?, ?, ?, ?)`)
    .bind(s.zaciatok, s.koniec, s.kanalov_chyba === s.kanalov && s.kanalov > 0 ? 'error' : 'ok', s.poloziek, s.dokumenty_novych, JSON.stringify({ ...s, po_zdrojoch: undefined, chyby: s.chyby.slice(0, 50) }))
    .run();
  return s;
}

/** Stav databázy po behu: dokumenty, texty, po zdrojoch (pre log a STATUS). */
export async function stavPrijmu(db: D1Database) {
  const [spolu, texty, zdroje, dup] = await db.batch([
    db.prepare(`SELECT COUNT(*) AS dokumentov, SUM(text_stav = 'ok') AS s_celym_textom FROM dokumenty`),
    db.prepare(`SELECT text_stav, COUNT(*) AS n FROM dokumenty GROUP BY text_stav ORDER BY n DESC`),
    db.prepare(
      `SELECT d.zdroj_id, COUNT(*) AS dokumentov, SUM(d.text_stav = 'ok') AS s_textom, SUM(d.text_stav = 'kratky') AS kratkych,
         CAST(AVG(t.znakov) AS INTEGER) AS priemer_znakov
       FROM dokumenty d LEFT JOIN dokument_texty t ON t.dokument_id = d.id GROUP BY d.zdroj_id ORDER BY dokumentov DESC`,
    ),
    db.prepare(
      `SELECT (SELECT COUNT(*) FROM (SELECT url_kanon FROM dokumenty WHERE url_kanon IS NOT NULL GROUP BY url_kanon HAVING COUNT(*) > 1)) AS url_duplicit,
              (SELECT COUNT(*) FROM dokumenty WHERE duplikat_of IS NOT NULL) AS obsahovych_duplikatov`,
    ),
  ]);
  return { spolu: spolu!.results[0], texty: texty!.results, zdroje: zdroje!.results, duplicity: dup!.results[0] };
}

export { overRegister, kanalyZRegistra, zlucRegister } from './register';
