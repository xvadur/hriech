// Voľby 24. 10. 2026 (XDR-276): seed územia, kalendára a prieskumov zo súborov data/volby/*.json,
// kandidáti z oficiálnych zoznamov (zdroje.json) a z médií (kandidati-media.json), väzba na entity (osoby).
// Každý krok je idempotentný; `pribudlo` v súhrne hovorí, čo je nové oproti minulému behu.
// Spustenie: pnpm run volby (scripts/volby-node.mjs) nad lokálnou D1.

import kalendarJson from '../../data/volby/kalendar.json';
import mediaJson from '../../data/volby/kandidati-media.json';
import krajeGeo from '../../data/volby/geo/kraje.geo.json';
import okresyGeo from '../../data/volby/geo/okresy.geo.json';
import prieskumyJson from '../../data/volby/prieskumy.json';
import uzemieJson from '../../data/volby/uzemie.json';
import zdrojeJson from '../../data/volby/zdroje.json';
import type { Env } from '../types';
import { chunk, errorMessage, sha256Hex } from '../util';
import { STRANY, kandidatId, parseZoznam, slug, stranaId, stranyZNavrhovatela, type Kandidat, type Volba } from './parse';

export type VolbyKrok = 'uzemie' | 'kalendar' | 'kandidati' | 'prieskumy' | 'entity';
export const VOLBY_KROKY: readonly VolbyKrok[] = ['uzemie', 'kalendar', 'kandidati', 'prieskumy', 'entity'];

export interface VolbySummary {
  krok: VolbyKrok;
  status: 'ok' | 'error';
  seen: number;
  pribudlo: number;
  detail?: Record<string, unknown>;
  error?: string;
}

/** Kontext: sieť a čítanie PDF idú cez neho, aby testy bežali bez siete. */
export interface VolbyCtx {
  fetch: typeof fetch;
  /** PDF → text (na Macu PDFKit cez osascript; v testoch fixture). null = nevie čítať PDF. */
  pdfText: ((bytes: Uint8Array) => Promise<string>) | null;
  now: Date;
  userAgent: string;
}

interface ZdrojZoznamu {
  id: string;
  volba: Volba;
  kraj_id: string;
  obec_id?: string;
  url: string;
  druh: 'oficialny' | 'media';
  format: 'pdf' | 'html' | 'json';
  poznamka?: string;
}

interface MediaKandidat {
  volba: Volba;
  kraj_id: string;
  obec_id?: string;
  meno: string;
  priezvisko: string;
  tituly?: string;
  vek?: number;
  zamestnanie?: string;
  navrhovatel: string;
  stav?: 'ohlaseny' | 'registrovany' | 'vzdal_sa' | 'odvolany';
  stav_poznamka?: string;
  zdroj_url: string;
  zdroj_datum?: string;
}

const globalFetch: typeof fetch = (input, init) => fetch(input, init);

export function defaultCtx(env: Env, partial: Partial<VolbyCtx> = {}): VolbyCtx {
  return {
    fetch: globalFetch,
    pdfText: null,
    now: new Date(),
    userAgent: env.USER_AGENT ?? 'Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)',
    ...partial,
  };
}

async function count(env: Env, sql: string, ...params: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

async function zmeny(env: Env, stmts: D1PreparedStatement[]): Promise<number> {
  let n = 0;
  for (const group of chunk(stmts, 100)) {
    const res = await env.DB.batch(group);
    for (const r of res) n += (r.meta.changes ?? 0) > 0 ? 1 : 0;
  }
  return n;
}

/** Kraje, okresy (z GeoJSON), obce a mestské časti, strany zo slovníka. */
export async function uzemieKrok(env: Env): Promise<Omit<VolbySummary, 'krok' | 'status'>> {
  const pred = await count(env, `SELECT (SELECT COUNT(*) FROM volby_kraje) + (SELECT COUNT(*) FROM volby_okresy) + (SELECT COUNT(*) FROM volby_obce) + (SELECT COUNT(*) FROM volby_strany) AS n`);
  const kraj = env.DB.prepare(
    `INSERT INTO volby_kraje (id, kod, nuts3, nazov, skratka, sidlo_obec_id, poslancov, url, geo_subor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'data/volby/geo/kraje.geo.json')
     ON CONFLICT(id) DO UPDATE SET nazov = excluded.nazov, poslancov = excluded.poslancov, url = excluded.url`,
  );
  await zmeny(env, uzemieJson.kraje.map((k) => kraj.bind(k.id, k.kod, k.nuts3, k.nazov, k.skratka, k.sidlo_obec_id, k.poslancov ?? null, k.url ?? null)));
  const okres = env.DB.prepare(
    `INSERT INTO volby_okresy (kod, nazov, kraj_id, vymera_ha, geo_subor) VALUES (?, ?, ?, ?, 'data/volby/geo/okresy.geo.json')
     ON CONFLICT(kod) DO UPDATE SET nazov = excluded.nazov, vymera_ha = excluded.vymera_ha`,
  );
  const okresy = (okresyGeo as { features: Array<{ properties: { IDN3: number; NM3: string; VYMERA_ha: number; kraj_id: string } }> }).features.map((f) => f.properties);
  await zmeny(env, okresy.map((o) => okres.bind(o.IDN3, o.NM3, o.kraj_id, o.VYMERA_ha)));
  const obec = env.DB.prepare(
    `INSERT INTO volby_obce (id, nazov, druh, kraj_id, okres_kod, nadradena_obec_id, poslancov, url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nazov = excluded.nazov, okres_kod = excluded.okres_kod, poslancov = excluded.poslancov, url = excluded.url`,
  );
  const obce = uzemieJson.obce as Array<{ id: string; nazov: string; druh: string; kraj_id: string; okres_kod?: number; nadradena_obec_id?: string; poslancov?: number; url?: string }>;
  await zmeny(env, obce.map((o) => obec.bind(o.id, o.nazov, o.druh, o.kraj_id, o.okres_kod ?? null, o.nadradena_obec_id ?? null, o.poslancov ?? null, o.url ?? null)));
  const strana = env.DB.prepare(`INSERT INTO volby_strany (id, nazov, skratka, parlamentna) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET nazov = excluded.nazov, skratka = excluded.skratka, parlamentna = excluded.parlamentna`);
  await zmeny(env, STRANY.map((s) => strana.bind(s.id, s.nazov, s.skratka, s.parlamentna ? 1 : 0)));
  const po = await count(env, `SELECT (SELECT COUNT(*) FROM volby_kraje) + (SELECT COUNT(*) FROM volby_okresy) + (SELECT COUNT(*) FROM volby_obce) + (SELECT COUNT(*) FROM volby_strany) AS n`);
  const krajov = (krajeGeo as { features: unknown[] }).features.length;
  return { seen: uzemieJson.kraje.length + okresy.length + obce.length + STRANY.length, pribudlo: po - pred, detail: { kraje: uzemieJson.kraje.length, okresy: okresy.length, obce: obce.length, strany: STRANY.length, geo_kraje: krajov } };
}

/** Kalendár kampane zo súboru (zákonné termíny, debaty, tlačovky). */
export async function kalendarKrok(env: Env): Promise<Omit<VolbySummary, 'krok' | 'status'>> {
  const pred = await count(env, `SELECT COUNT(*) AS n FROM volby_kalendar`);
  const ins = env.DB.prepare(
    `INSERT INTO volby_kalendar (id, datum, cas, druh, nazov, popis, kraj_id, obec_id, pravny_zaklad, zdroj_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET datum = excluded.datum, cas = excluded.cas, nazov = excluded.nazov, popis = excluded.popis, pravny_zaklad = excluded.pravny_zaklad, zdroj_url = excluded.zdroj_url`,
  );
  const udalosti = kalendarJson.udalosti as Array<{ id: string; datum: string; cas?: string; druh: string; nazov: string; popis?: string; kraj_id?: string; obec_id?: string; pravny_zaklad?: string; zdroj_url?: string }>;
  await zmeny(env, udalosti.map((u) => ins.bind(u.id, u.datum, u.cas ?? null, u.druh, u.nazov, u.popis ?? null, u.kraj_id ?? null, u.obec_id ?? null, u.pravny_zaklad ?? null, u.zdroj_url ?? null)));
  const po = await count(env, `SELECT COUNT(*) AS n FROM volby_kalendar`);
  return { seen: udalosti.length, pribudlo: po - pred, detail: { zakon: udalosti.filter((u) => u.druh === 'zakon').length } };
}

interface KandidatRiadok {
  id: string;
  volba: Volba;
  kraj_id: string;
  obec_id: string | null;
  poradie: number | null;
  meno: string;
  priezvisko: string;
  tituly: string | null;
  vek: number | null;
  zamestnanie: string | null;
  bydlisko: string | null;
  navrhovatel: string;
  nezavisly: 0 | 1;
  stav: string;
  stav_poznamka: string | null;
  zdroj_druh: 'oficialny' | 'media';
  zdroj_url: string;
  zdroj_datum: string | null;
  strany: string[];
}

function zParsovaneho(k: Kandidat, z: ZdrojZoznamu, datum: string | null): KandidatRiadok {
  return {
    id: kandidatId(z.volba, z.obec_id ?? z.kraj_id, k.meno, k.priezvisko),
    volba: z.volba,
    kraj_id: z.kraj_id,
    obec_id: z.obec_id ?? null,
    poradie: k.poradie,
    meno: k.meno,
    priezvisko: k.priezvisko,
    tituly: k.tituly,
    vek: k.vek,
    zamestnanie: k.zamestnanie,
    bydlisko: k.bydlisko,
    navrhovatel: k.navrhovatel,
    nezavisly: k.nezavisly ? 1 : 0,
    stav: 'registrovany',
    stav_poznamka: null,
    zdroj_druh: z.druh,
    zdroj_url: z.url,
    zdroj_datum: datum,
    strany: k.strany,
  };
}

function zMedii(m: MediaKandidat): KandidatRiadok {
  return {
    id: kandidatId(m.volba, m.obec_id ?? m.kraj_id, m.meno, m.priezvisko),
    volba: m.volba,
    kraj_id: m.kraj_id,
    obec_id: m.obec_id ?? null,
    poradie: null,
    meno: m.meno,
    priezvisko: m.priezvisko,
    tituly: m.tituly ?? null,
    vek: m.vek ?? null,
    zamestnanie: m.zamestnanie ?? null,
    bydlisko: null,
    navrhovatel: m.navrhovatel,
    nezavisly: stranyZNavrhovatela(m.navrhovatel).length === 0 ? 1 : 0,
    stav: m.stav ?? 'registrovany',
    stav_poznamka: m.stav_poznamka ?? null,
    zdroj_druh: 'media',
    zdroj_url: m.zdroj_url,
    zdroj_datum: m.zdroj_datum ?? null,
    strany: stranyZNavrhovatela(m.navrhovatel),
  };
}

/** Upsert kandidátov: oficiálny zdroj prepíše mediálny; mediálny neprepíše oficiálny (iba doplní posledny_zber). */
async function ulozKandidatov(env: Env, riadky: KandidatRiadok[], now: string): Promise<number> {
  if (riadky.length === 0) return 0;
  const pred = await count(env, `SELECT COUNT(*) AS n FROM volby_kandidati`);
  const ins = env.DB.prepare(
    `INSERT INTO volby_kandidati (id, volba, kraj_id, obec_id, poradie, meno, priezvisko, tituly, vek, zamestnanie, bydlisko, navrhovatel, nezavisly, stav, stav_poznamka, zdroj_druh, zdroj_url, zdroj_datum, prvy_zber, posledny_zber)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       posledny_zber = excluded.posledny_zber,
       poradie = CASE WHEN excluded.zdroj_druh = 'oficialny' OR volby_kandidati.zdroj_druh = 'media' THEN excluded.poradie ELSE volby_kandidati.poradie END,
       tituly = CASE WHEN excluded.zdroj_druh = 'oficialny' OR volby_kandidati.zdroj_druh = 'media' THEN excluded.tituly ELSE volby_kandidati.tituly END,
       vek = COALESCE(CASE WHEN excluded.zdroj_druh = 'oficialny' THEN excluded.vek END, volby_kandidati.vek, excluded.vek),
       zamestnanie = COALESCE(CASE WHEN excluded.zdroj_druh = 'oficialny' THEN excluded.zamestnanie END, volby_kandidati.zamestnanie, excluded.zamestnanie),
       bydlisko = COALESCE(excluded.bydlisko, volby_kandidati.bydlisko),
       navrhovatel = CASE WHEN excluded.zdroj_druh = 'oficialny' OR volby_kandidati.zdroj_druh = 'media' THEN excluded.navrhovatel ELSE volby_kandidati.navrhovatel END,
       nezavisly = CASE WHEN excluded.zdroj_druh = 'oficialny' OR volby_kandidati.zdroj_druh = 'media' THEN excluded.nezavisly ELSE volby_kandidati.nezavisly END,
       stav = CASE WHEN excluded.stav <> 'registrovany' THEN excluded.stav ELSE volby_kandidati.stav END,
       stav_poznamka = COALESCE(excluded.stav_poznamka, volby_kandidati.stav_poznamka),
       zdroj_druh = CASE WHEN excluded.zdroj_druh = 'oficialny' THEN 'oficialny' ELSE volby_kandidati.zdroj_druh END,
       zdroj_url = CASE WHEN excluded.zdroj_druh = 'oficialny' OR volby_kandidati.zdroj_druh = 'media' THEN excluded.zdroj_url ELSE volby_kandidati.zdroj_url END,
       zdroj_datum = CASE WHEN excluded.zdroj_druh = 'oficialny' OR volby_kandidati.zdroj_druh = 'media' THEN excluded.zdroj_datum ELSE volby_kandidati.zdroj_datum END`,
  );
  await zmeny(
    env,
    riadky.map((r) =>
      ins.bind(r.id, r.volba, r.kraj_id, r.obec_id, r.poradie, r.meno, r.priezvisko, r.tituly, r.vek, r.zamestnanie, r.bydlisko, r.navrhovatel, r.nezavisly, r.stav, r.stav_poznamka, r.zdroj_druh, r.zdroj_url, r.zdroj_datum, now, now),
    ),
  );
  // strany: oficiálny zdroj nahradí väzby; neznáme strany sa založia so slugom
  const insStrana = env.DB.prepare(`INSERT OR IGNORE INTO volby_strany (id, nazov) VALUES (?, ?)`);
  const delVazby = env.DB.prepare(`DELETE FROM volby_kandidat_strany WHERE kandidat_id = ?`);
  const insVazba = env.DB.prepare(`INSERT OR IGNORE INTO volby_kandidat_strany (kandidat_id, strana_id, poradie) VALUES (?, ?, ?)`);
  const stmts: D1PreparedStatement[] = [];
  for (const r of riadky) {
    const nazvy = r.navrhovatel.split(',').map((s) => s.trim()).filter(Boolean);
    stmts.push(delVazby.bind(r.id));
    r.strany.forEach((sid, i) => {
      const nazov = nazvy.find((n) => stranaId(n) === sid) ?? sid;
      stmts.push(insStrana.bind(sid, nazov), insVazba.bind(r.id, sid, i + 1));
    });
  }
  await zmeny(env, stmts);
  return (await count(env, `SELECT COUNT(*) AS n FROM volby_kandidati`)) - pred;
}

/** Stiahne oficiálne zoznamy (zdroje.json), rozparsuje a uloží; potom kandidáti z médií (nikdy neprepíšu oficiálnych). */
export async function kandidatiKrok(env: Env, ctx: VolbyCtx): Promise<Omit<VolbySummary, 'krok' | 'status'>> {
  const now = ctx.now.toISOString();
  const zdroje = zdrojeJson.zdroje as ZdrojZoznamu[];
  const detail: Record<string, unknown> = {};
  let pribudlo = 0;
  let seen = 0;
  const insZdroj = env.DB.prepare(
    `INSERT INTO volby_zdroje (id, volba, kraj_id, obec_id, url, druh, format, posledne_stiahnute, posledny_hash, kandidatov, chyba) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET url = excluded.url, posledne_stiahnute = excluded.posledne_stiahnute,
       posledny_hash = COALESCE(excluded.posledny_hash, volby_zdroje.posledny_hash), kandidatov = COALESCE(excluded.kandidatov, volby_zdroje.kandidatov), chyba = excluded.chyba`,
  );
  for (const z of zdroje) {
    let hash: string | null = null;
    let kandidatov: number | null = null;
    let chyba: string | null = null;
    try {
      const res = await ctx.fetch(z.url, { headers: { 'user-agent': ctx.userAgent }, signal: AbortSignal.timeout(30_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      hash = await sha256Hex(bytes);
      let text: string;
      if (z.format === 'pdf') {
        if (!ctx.pdfText) throw new Error('PDF sa nedá čítať (chýba pdfText)');
        text = await ctx.pdfText(bytes);
      } else text = new TextDecoder().decode(bytes);
      const p = parseZoznam(text);
      kandidatov = p.kandidati.length;
      seen += kandidatov;
      if (kandidatov === 0) chyba = 'parser nenašiel kandidátov (sken alebo iný formát)';
      else {
        const nove = await ulozKandidatov(env, p.kandidati.map((k) => zParsovaneho(k, z, p.datum)), now);
        pribudlo += nove;
        detail[z.id] = { kandidatov, nove, datum: p.datum };
      }
    } catch (e) {
      chyba = errorMessage(e);
    }
    if (chyba) detail[z.id] = { kandidatov: kandidatov ?? 0, chyba };
    await insZdroj.bind(z.id, z.volba, z.kraj_id, z.obec_id ?? null, z.url, z.druh, z.format, now, hash, kandidatov, chyba).run();
  }
  const media = (mediaJson.kandidati as MediaKandidat[]).map(zMedii);
  seen += media.length;
  const noveMedia = await ulozKandidatov(env, media, now);
  pribudlo += noveMedia;
  detail.media = { kandidatov: media.length, nove: noveMedia };
  return { seen, pribudlo, detail };
}

/** Prieskumy zo súboru; hodnoty sa priradia ku kandidátom podľa priezviska v rámci územia. */
export async function prieskumyKrok(env: Env): Promise<Omit<VolbySummary, 'krok' | 'status'>> {
  const pred = await count(env, `SELECT COUNT(*) AS n FROM volby_prieskumy`);
  const hlav = env.DB.prepare(
    `INSERT INTO volby_prieskumy (id, agentura, objednavatel, volba, kraj_id, obec_id, zber_od, zber_do, zverejnene, vzorka, metoda, nerozhodnuti, ucast, zdroj_url, poznamka)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET agentura = excluded.agentura, objednavatel = excluded.objednavatel, zber_od = excluded.zber_od, zber_do = excluded.zber_do, zverejnene = excluded.zverejnene,
       vzorka = excluded.vzorka, metoda = excluded.metoda, nerozhodnuti = excluded.nerozhodnuti, ucast = excluded.ucast, zdroj_url = excluded.zdroj_url, poznamka = excluded.poznamka`,
  );
  const hodn = env.DB.prepare(`INSERT INTO volby_prieskum_hodnoty (prieskum_id, meno, percenta, kandidat_id) VALUES (?, ?, ?, ?) ON CONFLICT(prieskum_id, meno) DO UPDATE SET percenta = excluded.percenta, kandidat_id = COALESCE(excluded.kandidat_id, volby_prieskum_hodnoty.kandidat_id)`);
  const prieskumy = prieskumyJson.prieskumy as unknown as Array<{ id: string; agentura: string; objednavatel?: string; volba: string; kraj_id: string; obec_id?: string; zber_od?: string; zber_do?: string; zverejnene?: string; vzorka?: number; metoda?: string; nerozhodnuti?: number; ucast?: number; zdroj_url: string; poznamka?: string; hodnoty: Record<string, number> }>;
  const { results: kandidati } = await env.DB.prepare(`SELECT id, volba, kraj_id, obec_id, meno, priezvisko FROM volby_kandidati`).all<{ id: string; volba: string; kraj_id: string; obec_id: string | null; meno: string; priezvisko: string }>();
  const stmts: D1PreparedStatement[] = [];
  let hodnot = 0;
  let priradene = 0;
  for (const p of prieskumy) {
    stmts.push(hlav.bind(p.id, p.agentura, p.objednavatel ?? null, p.volba, p.kraj_id, p.obec_id ?? null, p.zber_od ?? null, p.zber_do ?? null, p.zverejnene ?? null, p.vzorka ?? null, p.metoda ?? null, p.nerozhodnuti ?? null, p.ucast ?? null, p.zdroj_url, p.poznamka ?? null));
    for (const [meno, percenta] of Object.entries(p.hodnoty)) {
      const s = slug(meno);
      const k = kandidati.find((c) => c.volba === p.volba && c.kraj_id === p.kraj_id && (c.obec_id ?? null) === (p.obec_id ?? null) && slug(`${c.meno} ${c.priezvisko}`) === s);
      if (k) priradene++;
      hodnot++;
      stmts.push(hodn.bind(p.id, meno, percenta, k?.id ?? null));
    }
  }
  await zmeny(env, stmts);
  const po = await count(env, `SELECT COUNT(*) AS n FROM volby_prieskumy`);
  return { seen: prieskumy.length, pribudlo: po - pred, detail: { hodnot, priradene_kandidatom: priradene } };
}

/**
 * Každý kandidát dostane entitu `osoba:<slug>` (druh fyzicka_osoba, verejne = 0 podľa STACK.md) a alias „Meno Priezvisko“
 * so zdrojom 'volby' — z toho žije derive:zmienky a sledované osoby (XDR-277).
 */
export async function entityKrok(env: Env, ctx: VolbyCtx): Promise<Omit<VolbySummary, 'krok' | 'status'>> {
  const now = ctx.now.toISOString();
  const { results } = await env.DB.prepare(`SELECT id, meno, priezvisko, zdroj_datum, entity_id FROM volby_kandidati`).all<{ id: string; meno: string; priezvisko: string; zdroj_datum: string | null; entity_id: string | null }>();
  const predEntit = await count(env, `SELECT COUNT(*) AS n FROM entity WHERE id LIKE 'osoba:%'`);
  const insEntita = env.DB.prepare(
    `INSERT INTO entity (id, druh, nazov, ico, verejne, sledovane, sledovane_dovod, prvy_vyskyt, posledny_vyskyt) VALUES (?, 'fyzicka_osoba', ?, NULL, 0, 0, NULL, ?, ?)
     ON CONFLICT(id) DO UPDATE SET posledny_vyskyt = MAX(entity.posledny_vyskyt, excluded.posledny_vyskyt)`,
  );
  const insAlias = env.DB.prepare(`INSERT OR IGNORE INTO entity_alias (entity_id, alias, zdroj) VALUES (?, ?, 'volby')`);
  const upd = env.DB.prepare(`UPDATE volby_kandidati SET entity_id = ? WHERE id = ?`);
  const stmts: D1PreparedStatement[] = [];
  for (const k of results) {
    const eid = `osoba:${slug(`${k.meno} ${k.priezvisko}`)}`;
    const kedy = k.zdroj_datum ? `${k.zdroj_datum}T00:00:00.000Z` : now;
    stmts.push(insEntita.bind(eid, `${k.meno} ${k.priezvisko}`, kedy, kedy), insAlias.bind(eid, `${k.meno} ${k.priezvisko}`), upd.bind(eid, k.id));
  }
  await zmeny(env, stmts);
  const poEntit = await count(env, `SELECT COUNT(*) AS n FROM entity WHERE id LIKE 'osoba:%'`);
  const aliasov = await count(env, `SELECT COUNT(*) AS n FROM entity_alias WHERE zdroj = 'volby'`);
  return { seen: results.length, pribudlo: poEntit - predEntit, detail: { osob: poEntit, aliasov } };
}

export async function runVolby(env: Env, krok: VolbyKrok, ctx: VolbyCtx): Promise<VolbySummary> {
  const startedAt = ctx.now.toISOString();
  const run = await env.DB.prepare(`INSERT INTO runs (source, channel, started_at, status) VALUES ('volby', ?, ?, 'running') RETURNING id`).bind(krok, startedAt).first<{ id: number }>();
  try {
    const r =
      krok === 'uzemie' ? await uzemieKrok(env)
      : krok === 'kalendar' ? await kalendarKrok(env)
      : krok === 'kandidati' ? await kandidatiKrok(env, ctx)
      : krok === 'prieskumy' ? await prieskumyKrok(env)
      : await entityKrok(env, ctx);
    await env.DB.prepare(`UPDATE runs SET finished_at = ?, status = 'ok', seen = ?, inserted = ? WHERE id = ?`).bind(new Date().toISOString(), r.seen, r.pribudlo, run!.id).run();
    return { krok, status: 'ok', ...r };
  } catch (error) {
    const message = errorMessage(error);
    await env.DB.prepare(`UPDATE runs SET finished_at = ?, status = 'error', error = ? WHERE id = ?`).bind(new Date().toISOString(), message.slice(0, 2000), run!.id).run();
    throw error;
  }
}

export async function runVolbyAll(env: Env, ctx: VolbyCtx): Promise<VolbySummary[]> {
  const out: VolbySummary[] = [];
  for (const k of VOLBY_KROKY) out.push(await runVolby(env, k, ctx));
  return out;
}

export interface VolbyPocty {
  kraje: number;
  okresy: number;
  obce: number;
  kandidati: Record<string, number>;
  kandidati_oficialni: number;
  kandidati_media: number;
  strany: number;
  prieskumy: number;
  prieskum_hodnoty: number;
  kalendar: number;
  osoby: number;
}

/** Počty pre STATUS a log. */
export async function pocty(env: Env): Promise<VolbyPocty> {
  const { results } = await env.DB.prepare(`SELECT volba, COUNT(*) AS n FROM volby_kandidati GROUP BY volba`).all<{ volba: string; n: number }>();
  return {
    kraje: await count(env, `SELECT COUNT(*) AS n FROM volby_kraje`),
    okresy: await count(env, `SELECT COUNT(*) AS n FROM volby_okresy`),
    obce: await count(env, `SELECT COUNT(*) AS n FROM volby_obce`),
    kandidati: Object.fromEntries(results.map((r) => [r.volba, r.n])),
    kandidati_oficialni: await count(env, `SELECT COUNT(*) AS n FROM volby_kandidati WHERE zdroj_druh = 'oficialny'`),
    kandidati_media: await count(env, `SELECT COUNT(*) AS n FROM volby_kandidati WHERE zdroj_druh = 'media'`),
    strany: await count(env, `SELECT COUNT(DISTINCT strana_id) AS n FROM volby_kandidat_strany`),
    prieskumy: await count(env, `SELECT COUNT(*) AS n FROM volby_prieskumy`),
    prieskum_hodnoty: await count(env, `SELECT COUNT(*) AS n FROM volby_prieskum_hodnoty`),
    kalendar: await count(env, `SELECT COUNT(*) AS n FROM volby_kalendar`),
    osoby: await count(env, `SELECT COUNT(*) AS n FROM volby_kandidati WHERE entity_id IS NOT NULL`),
  };
}
