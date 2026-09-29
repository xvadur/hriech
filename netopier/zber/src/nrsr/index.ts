// Národná rada SR (XDR-297): poslanci, členstvo v kluboch a výboroch (história), zmeny v zložení, schôdze, parlamentné tlače,
// hlasovania s hlasmi po poslancoch, vystúpenia v rozprave (prepis + video).
// Zdroje: oficiálne JSON API www.nrsr.sk/opendata/1/sk (api.ts) a HTML stránky www.nrsr.sk / tv.nrsr.sk (parse.ts) pre to,
// čo API nemá: hlas každého poslanca, zmeny v zložení, prepisy. Každý krok je idempotentný; `pribudlo` v súhrne hovorí,
// čo je nové oproti minulému behu. Spustenie: pnpm run nrsr (scripts/nrsr-node.mjs) nad lokálnou databázou.

import type { Env } from '../types';
import { HttpError, chunk, errorMessage, sha256Hex } from '../util';
import { slug } from '../volby/parse';
import {
  apiUrl,
  mapFunkcie,
  mapHlasovanie,
  mapKlub,
  mapPoslanec,
  mapSchodza,
  mapTlac,
  mapVybor,
  type HlasovanieJson,
  type KlubJson,
  type MembershipJson,
  type MpJson,
  type SchodzaJson,
  type TlacJson,
  type VyborJson,
} from './api';
import { NRSR_BASE, celeMeno, mena, parseHlasKlub, parseVystupenia, parseZmeny, poliaFormulara, strankyPagera, type HlasovanieDetail } from './parse';

export type NrsrKrok = 'poslanci' | 'funkcie' | 'organy' | 'zmeny' | 'schodze' | 'tlace' | 'hlasovania' | 'rozprava';
/** Kroky, ktoré beží `all`. `rozprava` je veľká (tisíce strán s prepismi), spúšťa sa zvlášť. */
export const NRSR_KROKY: readonly NrsrKrok[] = ['poslanci', 'funkcie', 'organy', 'zmeny', 'schodze', 'tlace', 'hlasovania'];
export const NRSR_VSETKY_KROKY: readonly NrsrKrok[] = [...NRSR_KROKY, 'rozprava'];

/** Aktuálne volebné obdobie (9. — od 25. 10. 2023). Zmeny v zložení HTML stránka ukazuje iba pre aktuálne. */
export const AKTUALNE_OBDOBIE = 9;

/** Dni volieb do NR SR (mandát „nadobudnutý vo voľbách“ nesie tento dátum). */
const DEN_VOLIEB: Record<number, string> = { 5: '2010-06-12', 6: '2012-03-10', 7: '2016-03-05', 8: '2020-02-29', 9: '2023-09-30' };

export interface NrsrSummary {
  krok: NrsrKrok;
  status: 'ok' | 'error';
  seen: number;
  pribudlo: number;
  detail?: Record<string, unknown>;
  error?: string;
}

/** Kontext: sieť, tempo a rozsah idú cez neho, aby testy bežali bez siete a bez čakania. */
export interface NrsrCtx {
  fetch: typeof fetch;
  now: Date;
  userAgent: string;
  /** pauza medzi začiatkami požiadaviek na nrsr.sk (slušné tempo) */
  pauzaMs: number;
  spanie: (ms: number) => Promise<void>;
  log: (sprava: string) => void;
  obdobie: number;
  /** obmedzenie na schôdze (hlasovania, rozprava); null = všetky */
  schodze: number[] | null;
  /** strop nových záznamov v kroku (skúšobný beh); null = bez stropu */
  limit: number | null;
  /** stiahnuť znova aj to, čo už je uložené */
  znova: boolean;
  /** počet pokusov pri sieťovej chybe */
  pokusy: number;
  /** koľko detailov sa sťahuje súbežne; začiatky požiadaviek sú aj tak od seba aspoň `pauzaMs` */
  paralelne: number;
}

export function defaultCtx(env: Env, partial: Partial<NrsrCtx> = {}): NrsrCtx {
  return {
    fetch: (input, init) => fetch(input, init),
    now: new Date(),
    userAgent: env.USER_AGENT ?? 'Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)',
    pauzaMs: 500,
    spanie: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    log: () => {},
    obdobie: AKTUALNE_OBDOBIE,
    schodze: null,
    limit: null,
    znova: false,
    pokusy: 6,
    paralelne: 1,
    ...partial,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// HTTP klient: pauza medzi požiadavkami, opakovanie pri sieťovej chybe a 5xx, stránkovanie cez postback

export function url(sid: string, params: Record<string, string | number> = {}): string {
  const q = Object.entries(params).map(([k, v]) => `&${k}=${encodeURIComponent(String(v))}`).join('');
  return `${NRSR_BASE}Default.aspx?sid=${sid}${q}`;
}

export class Klient {
  private posledne = 0;
  pozadiavok = 0;

  constructor(private readonly ctx: NrsrCtx) {}

  private async pockaj(): Promise<void> {
    // každý začiatok požiadavky si rezervuje slot najskôr `pauzaMs` po predchádzajúcom — platí aj pri súbežnom sťahovaní
    const slot = Math.max(Date.now(), this.posledne + this.ctx.pauzaMs);
    this.posledne = slot;
    const cakat = slot - Date.now();
    if (cakat > 0) await this.ctx.spanie(cakat);
  }

  private async poziadaj(adresa: string, init: RequestInit): Promise<string> {
    let posledna: unknown;
    for (let pokus = 0; pokus < this.ctx.pokusy; pokus++) {
      await this.pockaj();
      this.pozadiavok++;
      try {
        const res = await this.ctx.fetch(adresa, {
          ...init,
          headers: { 'user-agent': this.ctx.userAgent, ...(init.headers as Record<string, string> | undefined) },
          signal: AbortSignal.timeout(90_000),
        });
        if (res.ok) return await res.text();
        const body = await res.text().catch(() => '');
        posledna = new HttpError(adresa, res.status, body);
        // 4xx okrem 403/429 (ochrana pred záťažou) je definitívne
        if (res.status < 500 && res.status !== 403 && res.status !== 429) throw posledna;
      } catch (error) {
        if (error instanceof HttpError && error.status < 500 && error.status !== 403 && error.status !== 429) throw error;
        posledna = error;
      }
      await this.ctx.spanie(Math.min(30_000, 1500 * 2 ** pokus));
    }
    throw posledna instanceof Error ? posledna : new Error(String(posledna));
  }

  get(adresa: string): Promise<string> {
    return this.poziadaj(adresa, { method: 'GET' });
  }

  async getJson<T>(adresa: string): Promise<T> {
    const telo = await this.poziadaj(adresa, { method: 'GET', headers: { accept: 'application/json' } });
    try {
      return JSON.parse(telo) as T;
    } catch {
      throw new Error(`odpoveď nie je JSON: ${adresa} (${telo.slice(0, 80).replace(/\s+/g, ' ')})`);
    }
  }

  post(adresa: string, polia: Record<string, string>): Promise<string> {
    return this.poziadaj(adresa, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(polia).toString(),
    });
  }

  /** Všetky strany výsledkov: prvá cez GET, ďalšie cez postback na `Page$N`, kým pager ponúka nasledujúcu. */
  async *strany(adresa: string): AsyncGenerator<{ strana: number; html: string }> {
    let html = await this.get(adresa);
    let strana = 1;
    yield { strana, html };
    for (;;) {
      const pager = strankyPagera(html);
      if (!pager || !pager.strany.includes(strana + 1)) return;
      html = await this.post(adresa, { ...poliaFormulara(html), __EVENTTARGET: pager.ciel, __EVENTARGUMENT: `Page$${strana + 1}` });
      strana++;
      yield { strana, html };
    }
  }
}

// ---------------------------------------------------------------------------------------------------------------------
// Pomocné DB funkcie

async function count(env: Env, sql: string, ...params: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

async function davky(env: Env, stmts: D1PreparedStatement[], velkost = 50): Promise<number> {
  let zmien = 0;
  for (const skupina of chunk(stmts, velkost)) {
    const res = await env.DB.batch(skupina);
    for (const r of res) zmien += r.meta.changes ?? 0;
  }
  return zmien;
}

/** Spracuje položky po `n` súbežne (poradie výsledkov sa nezaručuje); chyba jednej položky sa zachytí v `fn`. */
export async function paralelne<T>(polozky: readonly T[], n: number, fn: (polozka: T) => Promise<void>): Promise<void> {
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.max(1, n) }, async () => {
      for (;;) {
        const idx = i++;
        if (idx >= polozky.length) return;
        await fn(polozky[idx]!);
      }
    }),
  );
}

export function denVBratislave(utcIso: string): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Bratislava', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(utcIso));
}

function profilUrl(id: number, obdobie: number): string {
  return url('poslanci/poslanec', { PoslanecID: id, CisObdobia: obdobie });
}

/** Poslanci videní v hlasovaní alebo zmenách: riadok v `nrsr_poslanci` (meno z „Priezvisko, Meno“) bez profilu z API. */
async function ulozPoslancov(env: Env, ctx: NrsrCtx, zoznam: Array<{ id: number; cele: string }>): Promise<void> {
  if (zoznam.length === 0) return;
  const now = ctx.now.toISOString();
  for (const skupina of chunk(zoznam, 150)) {
    const data = skupina.map((p) => {
      const m = mena(p.cele);
      return [p.id, m.meno, m.priezvisko, profilUrl(p.id, ctx.obdobie)];
    });
    await env.DB.prepare(
      `INSERT INTO nrsr_poslanci (id, meno, priezvisko, url, prvy_zber, posledny_zber)
       SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]'), json_extract(value, '$[2]'), json_extract(value, '$[3]'), ?2, ?2 FROM json_each(?1) WHERE true
       ON CONFLICT(id) DO UPDATE SET posledny_zber = excluded.posledny_zber`,
    ).bind(JSON.stringify(data), now).run();
  }
}

/**
 * Každý poslanec dostane `entity` riadok `osoba:<slug mena>` (verejný funkcionár: `verejne = 1`).
 * Rovnaké meno ako kandidát z volieb = rovnaké id. Dve rôzne osoby s rovnakým menom → druhá dostane `-<id>`.
 */
export async function priradEntity(env: Env, ctx: NrsrCtx): Promise<number> {
  const { results } = await env.DB.prepare(`SELECT id, meno, priezvisko FROM nrsr_poslanci WHERE entity_id IS NULL ORDER BY id`).all<{ id: number; meno: string; priezvisko: string }>();
  const now = ctx.now.toISOString();
  const insEntita = env.DB.prepare(
    `INSERT INTO entity (id, druh, nazov, ico, verejne, sledovane, sledovane_dovod, prvy_vyskyt, posledny_vyskyt) VALUES (?, 'fyzicka_osoba', ?, NULL, 1, 0, NULL, ?, ?)
     ON CONFLICT(id) DO UPDATE SET verejne = 1, posledny_vyskyt = MAX(entity.posledny_vyskyt, excluded.posledny_vyskyt)`,
  );
  const upd = env.DB.prepare(`UPDATE nrsr_poslanci SET entity_id = ? WHERE id = ?`);
  const stmts: D1PreparedStatement[] = [];
  const pouzite = new Map<string, number>();
  for (const p of results) {
    const nazov = celeMeno(p);
    let eid = `osoba:${slug(nazov)}`;
    const iny = pouzite.get(eid) ?? (await env.DB.prepare(`SELECT id FROM nrsr_poslanci WHERE entity_id = ? AND id != ?`).bind(eid, p.id).first<{ id: number }>())?.id;
    if (iny !== undefined && iny !== p.id) eid = `${eid}-${p.id}`;
    pouzite.set(eid, p.id);
    stmts.push(insEntita.bind(eid, nazov, now, now), upd.bind(eid, p.id));
  }
  await davky(env, stmts, 100);
  return results.length;
}

type Casti = Omit<NrsrSummary, 'krok' | 'status'>;

// ---------------------------------------------------------------------------------------------------------------------
// Krok: poslanci (JSON API: všetci poslanci obdobia vrátane tých, čo mandát stratili)

export async function poslanciKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  const predPoslancov = await count(env, `SELECT COUNT(*) AS n FROM nrsr_poslanci`);
  const predMandatov = await count(env, `SELECT COUNT(*) AS n FROM nrsr_mandaty WHERE obdobie = ?`, ctx.obdobie);
  const poslanci = (await klient.getJson<MpJson[]>(apiUrl('MP/MembersOfParliament', { termNr: ctx.obdobie }))).map(mapPoslanec);
  const now = ctx.now.toISOString();
  const insPoslanec = env.DB.prepare(
    `INSERT INTO nrsr_poslanci (id, meno, priezvisko, titul, titul_za, narodeny, narodnost, pohlavie, kluc, url, foto_url, profil_zber, prvy_zber, posledny_zber)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?12, ?12)
     ON CONFLICT(id) DO UPDATE SET meno = excluded.meno, priezvisko = excluded.priezvisko, titul = excluded.titul, titul_za = excluded.titul_za, narodeny = excluded.narodeny,
       narodnost = excluded.narodnost, pohlavie = excluded.pohlavie, kluc = excluded.kluc, url = excluded.url, foto_url = excluded.foto_url,
       profil_zber = excluded.profil_zber, posledny_zber = excluded.posledny_zber`,
  );
  const insMandat = env.DB.prepare(
    `INSERT INTO nrsr_mandaty (poslanec_id, obdobie, kandidoval_za, kandidoval_za_kluc, bydlisko, kraj, email, posledny_klub, zber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(poslanec_id, obdobie) DO UPDATE SET kandidoval_za = excluded.kandidoval_za, kandidoval_za_kluc = excluded.kandidoval_za_kluc, bydlisko = excluded.bydlisko,
       kraj = excluded.kraj, email = excluded.email, posledny_klub = excluded.posledny_klub, zber = excluded.zber`,
  );
  const stmts: D1PreparedStatement[] = [];
  for (const p of poslanci) {
    stmts.push(
      insPoslanec.bind(p.id, p.meno, p.priezvisko, p.titul, p.titulZa, p.narodeny, p.narodnost, p.pohlavie, p.kluc, profilUrl(p.id, ctx.obdobie), p.fotoUrl, now),
      insMandat.bind(p.id, ctx.obdobie, p.kandidovalZa, p.kandidovalZaKluc, p.bydlisko, p.kraj, p.email, p.poslednyKlub, now),
    );
  }
  await davky(env, stmts, 100);
  const entit = await priradEntity(env, ctx);
  const poPoslancov = await count(env, `SELECT COUNT(*) AS n FROM nrsr_poslanci`);
  const poMandatov = await count(env, `SELECT COUNT(*) AS n FROM nrsr_mandaty WHERE obdobie = ?`, ctx.obdobie);
  return {
    seen: poslanci.length,
    pribudlo: poPoslancov - predPoslancov + (poMandatov - predMandatov),
    detail: { poslancov: poPoslancov, mandatov: poMandatov, entit_novych: entit },
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Krok: história členstva a funkcií (kluby, výbory, delegácie) — jedna požiadavka na poslanca

export async function funkcieKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  const pred = await count(env, `SELECT COUNT(*) AS n FROM nrsr_funkcie WHERE obdobie = ?`, ctx.obdobie);
  const { results } = await env.DB.prepare(`SELECT poslanec_id AS id FROM nrsr_mandaty WHERE obdobie = ? ORDER BY poslanec_id`).bind(ctx.obdobie).all<{ id: number }>();
  const ids = ctx.limit !== null ? results.slice(0, ctx.limit) : results;
  const now = ctx.now.toISOString();
  const del = env.DB.prepare(`DELETE FROM nrsr_funkcie WHERE poslanec_id = ? AND obdobie = ?`);
  const ins = env.DB.prepare(
    `INSERT OR REPLACE INTO nrsr_funkcie (poslanec_id, obdobie, organ_kluc, organ, druh, funkcia_kluc, funkcia, od, do, zber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  let videnych = 0;
  let chyb = 0;
  await paralelne(ids, ctx.paralelne, async ({ id }) => {
    try {
      const j = await klient.getJson<{ memberships?: MembershipJson[] }>(apiUrl('MP/MemberOfParliament', { id }));
      const f = mapFunkcie((j.memberships ?? []).filter((m) => m.termNr === ctx.obdobie));
      videnych += f.length;
      await davky(env, [del.bind(id, ctx.obdobie), ...f.map((x) => ins.bind(id, ctx.obdobie, x.organKluc, x.organ, x.druh, x.funkciaKluc, x.funkcia, x.od, x.do, now))]);
    } catch (error) {
      chyb++;
      ctx.log(`funkcie poslanca ${id}: ${errorMessage(error)}`);
    }
  });
  const po = await count(env, `SELECT COUNT(*) AS n FROM nrsr_funkcie WHERE obdobie = ?`, ctx.obdobie);
  const kluby = await count(env, `SELECT COUNT(*) AS n FROM nrsr_funkcie WHERE obdobie = ? AND druh = 'klub'`, ctx.obdobie);
  const vybory = await count(env, `SELECT COUNT(*) AS n FROM nrsr_funkcie WHERE obdobie = ? AND druh = 'vybor'`, ctx.obdobie);
  const aktualnych = await count(env, `SELECT COUNT(*) AS n FROM nrsr_clenstvo_aktualne WHERE obdobie = ?`, ctx.obdobie);
  return { seen: videnych, pribudlo: po - pred, detail: { funkcii: po, klubovych: kluby, vyborovych: vybory, aktualnych, chyb } };
}

// ---------------------------------------------------------------------------------------------------------------------
// Krok: kluby a výbory

export async function organyKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  const pred = await count(env, `SELECT COUNT(*) AS n FROM nrsr_organy WHERE obdobie = ?`, ctx.obdobie);
  const organy = [
    ...(await klient.getJson<KlubJson[]>(apiUrl('MP/Clubs', { termNr: ctx.obdobie }))).map(mapKlub),
    ...(await klient.getJson<VyborJson[]>(apiUrl('Committee/Committees', { termNr: ctx.obdobie }))).map(mapVybor),
  ];
  const now = ctx.now.toISOString();
  const ins = env.DB.prepare(
    `INSERT INTO nrsr_organy (id, druh, obdobie, kluc, nazov, skratka, od, do, email, clenov_celkom, clenov_aktualne, farba, zber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET nazov = excluded.nazov, skratka = excluded.skratka, od = excluded.od, do = excluded.do, email = excluded.email,
       clenov_celkom = excluded.clenov_celkom, clenov_aktualne = excluded.clenov_aktualne, farba = excluded.farba, zber = excluded.zber`,
  );
  await davky(env, organy.map((o) => ins.bind(o.id, o.druh, o.obdobie, o.kluc, o.nazov, o.skratka, o.od, o.do, o.email, o.clenovCelkom, o.clenovAktualne, o.farba, now)));
  const po = await count(env, `SELECT COUNT(*) AS n FROM nrsr_organy WHERE obdobie = ?`, ctx.obdobie);
  return { seen: organy.length, pribudlo: po - pred, detail: { klubov: organy.filter((o) => o.druh === 'klub').length, vyborov: organy.filter((o) => o.druh === 'vybor').length } };
}

// ---------------------------------------------------------------------------------------------------------------------
// Krok: zmeny v zložení NR SR (HTML)

export async function zmenyKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  if (ctx.obdobie !== AKTUALNE_OBDOBIE) return { seen: 0, pribudlo: 0, detail: { preskocene: 'zmeny v zložení sú dostupné iba pre aktuálne obdobie' } };
  const pred = await count(env, `SELECT COUNT(*) AS n FROM nrsr_zmeny WHERE obdobie = ?`, ctx.obdobie);
  const ins = env.DB.prepare(
    `INSERT INTO nrsr_zmeny (obdobie, datum, poslanec_id, strana, druh, dovod) VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(obdobie, datum, poslanec_id, druh) DO UPDATE SET strana = excluded.strana, dovod = excluded.dovod`,
  );
  let videnych = 0;
  for await (const { html } of klient.strany(url('poslanci/zmeny'))) {
    // stránka spája so zmenami aktuálneho obdobia aj zmeny prvého (1990–92); berieme iba tie od volieb požadovaného obdobia
    const odVolieb = DEN_VOLIEB[ctx.obdobie] ?? '0000-00-00';
    const zmeny = parseZmeny(html).filter((z) => z.datum >= odVolieb);
    videnych += zmeny.length;
    await ulozPoslancov(env, ctx, zmeny.map((z) => ({ id: z.poslanecId, cele: z.cele })));
    await davky(env, zmeny.map((z) => ins.bind(ctx.obdobie, z.datum, z.poslanecId, z.strana, z.druh, z.dovod)));
  }
  await priradEntity(env, ctx);
  const po = await count(env, `SELECT COUNT(*) AS n FROM nrsr_zmeny WHERE obdobie = ?`, ctx.obdobie);
  return { seen: videnych, pribudlo: po - pred, detail: { zmien: po } };
}

// ---------------------------------------------------------------------------------------------------------------------
// Krok: schôdze (JSON API)

export async function schodzeKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  const pred = await count(env, `SELECT COUNT(*) AS n FROM nrsr_schodze WHERE obdobie = ?`, ctx.obdobie);
  const schodze = (await klient.getJson<SchodzaJson[]>(apiUrl('General/Meetings', { termNr: ctx.obdobie }))).map(mapSchodza);
  const now = ctx.now.toISOString();
  const ins = env.DB.prepare(
    `INSERT INTO nrsr_schodze (obdobie, cislo, popis, od, do, program_id, url, zber) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(obdobie, cislo) DO UPDATE SET popis = excluded.popis, od = excluded.od, do = excluded.do, program_id = excluded.program_id, zber = excluded.zber`,
  );
  await davky(env, schodze.map((s) => ins.bind(s.obdobie, s.cislo, s.popis, s.od, s.do, s.programId, url('schodze/hlasovanie/vyhladavanie_vysledok', { ZakZborID: 13, CisObdobia: s.obdobie, CisSchodze: s.cislo, ShowCisloSchodze: 'False' }), now)));
  const po = await count(env, `SELECT COUNT(*) AS n FROM nrsr_schodze WHERE obdobie = ?`, ctx.obdobie);
  return { seen: schodze.length, pribudlo: po - pred, detail: { schodzi: po } };
}

async function schodzeNaSpracovanie(env: Env, ctx: NrsrCtx): Promise<number[]> {
  const { results } = await env.DB.prepare(`SELECT cislo FROM nrsr_schodze WHERE obdobie = ? ORDER BY cislo`).bind(ctx.obdobie).all<{ cislo: number }>();
  const vsetky = results.map((r) => r.cislo);
  return ctx.schodze ? vsetky.filter((c) => ctx.schodze!.includes(c)) : vsetky;
}

// ---------------------------------------------------------------------------------------------------------------------
// Krok: parlamentné tlače (návrhy zákonov a iné materiály; JSON API, celé obdobie jednou požiadavkou)

export async function tlaceKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  const pred = await count(env, `SELECT COUNT(*) AS n FROM nrsr_tlace WHERE obdobie = ?`, ctx.obdobie);
  const tlace = (await klient.getJson<TlacJson[]>(apiUrl('Bill/Bills', { termNr: ctx.obdobie }))).map(mapTlac).filter((t) => t !== null);
  const now = ctx.now.toISOString();
  for (const skupina of chunk(tlace, 300)) {
    const data = skupina.map((t) => [t.obdobie, t.cpt, t.idNrsr, t.typId, t.typ, t.nazov, t.doruceny, t.pridelena, url('zakony/cpt', { ZakZborID: 13, CisObdobia: t.obdobie, ID: t.cpt })]);
    await env.DB.prepare(
      `INSERT INTO nrsr_tlace (obdobie, cpt, id_nrsr, typ_id, typ, nazov, doruceny, pridelena, url, zber)
       SELECT json_extract(value, '$[0]'), json_extract(value, '$[1]'), json_extract(value, '$[2]'), json_extract(value, '$[3]'), json_extract(value, '$[4]'),
         json_extract(value, '$[5]'), json_extract(value, '$[6]'), json_extract(value, '$[7]'), json_extract(value, '$[8]'), ?2 FROM json_each(?1) WHERE true
       ON CONFLICT(obdobie, cpt) DO UPDATE SET id_nrsr = excluded.id_nrsr, typ_id = excluded.typ_id, typ = excluded.typ, nazov = excluded.nazov,
         doruceny = excluded.doruceny, pridelena = excluded.pridelena, zber = excluded.zber`,
    ).bind(JSON.stringify(data), now).run();
  }
  const po = await count(env, `SELECT COUNT(*) AS n FROM nrsr_tlace WHERE obdobie = ?`, ctx.obdobie);
  const navrhov = await count(env, `SELECT COUNT(*) AS n FROM nrsr_tlace WHERE obdobie = ? AND typ_id = 1`, ctx.obdobie);
  return { seen: tlace.length, pribudlo: po - pred, detail: { tlac: po, navrhov_zakonov: navrhov } };
}

// ---------------------------------------------------------------------------------------------------------------------
// Krok: hlasovania. Zoznam s výsledkami z API (jedna požiadavka na obdobie), potom pre každé verejné hlasovanie stránka
// „Hlasovanie podľa klubov“ = hlas každého poslanca a jeho klub v čase hlasovania.

/** Hlasy poslancov z jednej stránky „Hlasovanie podľa klubov“ (poslanci, kluby a hlasy v jednej dávke). */
export async function ulozHlasy(env: Env, ctx: NrsrCtx, id: number, obdobie: number, detail: HlasovanieDetail): Promise<number> {
  const hlasy: Array<[number, string, string]> = [];
  const poslanci: Array<{ id: number; cele: string }> = [];
  for (const k of detail.kluby) {
    for (const h of k.hlasy) {
      hlasy.push([h.poslanecId, h.hlas, k.nazov]);
      poslanci.push({ id: h.poslanecId, cele: h.cele });
    }
  }
  await ulozPoslancov(env, { ...ctx, obdobie }, poslanci);
  const insKlub = env.DB.prepare(`INSERT OR IGNORE INTO nrsr_kluby (obdobie, nazov) VALUES (?, ?)`);
  return davky(env, [
    ...detail.kluby.map((k) => insKlub.bind(obdobie, k.nazov)),
    env.DB.prepare(
      `INSERT INTO nrsr_hlasy (hlasovanie_id, poslanec_id, hlas, klub_id)
       SELECT ?1, json_extract(j.value, '$[0]'), json_extract(j.value, '$[1]'), k.id FROM json_each(?2) j
       LEFT JOIN nrsr_kluby k ON k.obdobie = ?3 AND k.nazov = json_extract(j.value, '$[2]') WHERE true
       ON CONFLICT(hlasovanie_id, poslanec_id) DO UPDATE SET hlas = excluded.hlas, klub_id = excluded.klub_id`,
    ).bind(id, JSON.stringify(hlasy), obdobie),
  ]);
}

export async function hlasovaniaKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  const predHlasovani = await count(env, `SELECT COUNT(*) AS n FROM nrsr_hlasovania WHERE obdobie = ?`, ctx.obdobie);
  const predHlasov = await count(env, `SELECT COUNT(*) AS n FROM nrsr_hlasy h JOIN nrsr_hlasovania v ON v.id = h.hlasovanie_id WHERE v.obdobie = ?`, ctx.obdobie);
  const zoznam = (await klient.getJson<HlasovanieJson[]>(apiUrl('Voting/Votings', { termNr: ctx.obdobie }))).map(mapHlasovanie).filter((h) => h !== null);
  const now = ctx.now.toISOString();
  for (const skupina of chunk(zoznam, 250)) {
    const data = skupina.map((h) => [
      h.id, h.obdobie, h.schodza, h.cislo, h.casUtc, denVBratislave(h.casUtc), h.nazov, h.cpt, h.typ, h.tajne ? 1 : 0, h.ustavne ? 1 : 0, h.vysledok,
      h.pritomni, h.hlasujuci, h.za, h.proti, h.zdrzali, h.nehlasovali, h.nepritomni, url('schodze/hlasovanie/hlasovanie', { ID: h.id }),
    ]);
    await env.DB.prepare(
      `INSERT INTO nrsr_hlasovania (id, obdobie, schodza, cislo, cas_utc, den, nazov, cpt, typ, tajne, ustavne, vysledok, pritomni, hlasujuci, za, proti, zdrzali, nehlasovali, nepritomni, url, zber)
       SELECT ${Array.from({ length: 20 }, (_, i) => `json_extract(value, '$[${i}]')`).join(', ')}, ?2 FROM json_each(?1) WHERE true
       ON CONFLICT(id) DO UPDATE SET obdobie = excluded.obdobie, schodza = excluded.schodza, cislo = excluded.cislo, cas_utc = excluded.cas_utc, den = excluded.den,
         nazov = excluded.nazov, cpt = excluded.cpt, typ = excluded.typ, tajne = excluded.tajne, ustavne = excluded.ustavne, vysledok = excluded.vysledok,
         pritomni = excluded.pritomni, hlasujuci = excluded.hlasujuci, za = excluded.za, proti = excluded.proti, zdrzali = excluded.zdrzali,
         nehlasovali = excluded.nehlasovali, nepritomni = excluded.nepritomni, zber = excluded.zber`,
    ).bind(JSON.stringify(data), now).run();
  }
  const noveHlasovania = (await count(env, `SELECT COUNT(*) AS n FROM nrsr_hlasovania WHERE obdobie = ?`, ctx.obdobie)) - predHlasovani;

  // hlasy poslancov: verejné hlasovania bez hlasov (najnovšie prvé); s `znova` všetky vo vybranom rozsahu.
  // Tajné a „hromadné“ hlasovania sú voľby hlasovacími lístkami (naskenované dokumenty) — hlasy po poslancoch nemajú.
  const { results } = await env.DB.prepare(
    `SELECT v.id, v.schodza FROM nrsr_hlasovania v WHERE v.obdobie = ?1 AND v.tajne = 0 AND COALESCE(v.typ, '') != 'hromadné hlasovanie' AND (?2 = 1 OR NOT EXISTS (SELECT 1 FROM nrsr_hlasy h WHERE h.hlasovanie_id = v.id)) ORDER BY v.id DESC`,
  ).bind(ctx.obdobie, ctx.znova ? 1 : 0).all<{ id: number; schodza: number }>();
  const vRozsahu = ctx.schodze ? results.filter((r) => ctx.schodze!.includes(r.schodza)) : results;
  const cielove = ctx.limit !== null ? vRozsahu.slice(0, ctx.limit) : vRozsahu;
  ctx.log(`hlasovaní v zozname ${zoznam.length} (nových ${noveHlasovania}), hlasy treba stiahnuť pre ${cielove.length}`);
  let nacitanych = 0;
  let chyb = 0;
  await paralelne(cielove, ctx.paralelne, async (r) => {
    try {
      const detail = parseHlasKlub(await klient.get(url('schodze/hlasovanie/hlasklub', { ID: r.id })));
      if (!detail || detail.kluby.length === 0) throw new Error('stránka bez hlasov poslancov');
      await ulozHlasy(env, ctx, r.id, ctx.obdobie, detail);
      nacitanych++;
    } catch (error) {
      chyb++;
      ctx.log(`hlasovanie ${r.id}: ${errorMessage(error)}`);
    }
    if (nacitanych % 100 === 0 && nacitanych > 0) ctx.log(`  … ${nacitanych} hlasovaní s hlasmi`);
  });
  await priradEntity(env, ctx);
  const poHlasov = await count(env, `SELECT COUNT(*) AS n FROM nrsr_hlasy h JOIN nrsr_hlasovania v ON v.id = h.hlasovanie_id WHERE v.obdobie = ?`, ctx.obdobie);
  return {
    seen: zoznam.length,
    pribudlo: noveHlasovania,
    detail: {
      hlasovani: predHlasovani + noveHlasovania,
      tajnych: await count(env, `SELECT COUNT(*) AS n FROM nrsr_hlasovania WHERE obdobie = ? AND tajne = 1`, ctx.obdobie),
      s_hlasmi: await count(env, `SELECT COUNT(DISTINCT hlasovanie_id) AS n FROM nrsr_hlasy h JOIN nrsr_hlasovania v ON v.id = h.hlasovanie_id WHERE v.obdobie = ?`, ctx.obdobie),
      hlasov: poHlasov,
      hlasov_nove: poHlasov - predHlasov,
      chyb,
      pozadiavok: klient.pozadiavok,
    },
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Krok: vystúpenia v rozprave (HTML: prepis + video), po schôdzach; najnovšie prvé

export async function rozpravaKrok(env: Env, ctx: NrsrCtx, klient: Klient): Promise<Casti> {
  const pred = await count(env, `SELECT COUNT(*) AS n FROM nrsr_vystupenia WHERE obdobie = ?`, ctx.obdobie);
  const schodze = (await schodzeNaSpracovanie(env, ctx)).reverse();
  const now = ctx.now.toISOString();
  const { results: poslanci } = await env.DB.prepare(`SELECT id, meno, priezvisko FROM nrsr_poslanci`).all<{ id: number; meno: string; priezvisko: string }>();
  const podlaMena = new Map<string, number | null>();
  for (const p of poslanci) {
    const kluc = `${p.priezvisko}, ${p.meno}`;
    podlaMena.set(kluc, podlaMena.has(kluc) ? null : p.id);
  }
  const ins = env.DB.prepare(
    `INSERT INTO nrsr_vystupenia (id, obdobie, schodza, den_popis, cas_od_utc, cas_do_utc, cpt, recnik, poslanec_id, funkcia, typ, upraveny, text, video_id, video_url, video_schodza_url, hash, zber)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET text = excluded.text, upraveny = excluded.upraveny, typ = excluded.typ, cpt = excluded.cpt, funkcia = excluded.funkcia,
       poslanec_id = COALESCE(excluded.poslanec_id, nrsr_vystupenia.poslanec_id), video_url = COALESCE(excluded.video_url, nrsr_vystupenia.video_url),
       video_schodza_url = COALESCE(excluded.video_schodza_url, nrsr_vystupenia.video_schodza_url), hash = excluded.hash, zber = excluded.zber
     WHERE nrsr_vystupenia.hash != excluded.hash OR nrsr_vystupenia.video_url IS NULL AND excluded.video_url IS NOT NULL`,
  );
  let videnych = 0;
  let zmenenych = 0;
  let stran = 0;
  vonkajsi: for (const cislo of schodze) {
    const stav = await env.DB.prepare(`SELECT vystupenia_kompletne AS k FROM nrsr_schodze WHERE obdobie = ? AND cislo = ?`).bind(ctx.obdobie, cislo).first<{ k: string | null }>();
    const kompletne = !ctx.znova && !!stav?.k;
    let prejdene = true;
    for await (const { strana, html } of klient.strany(url('schodze/rozprava/vyhladavanie', { CisObdobia: ctx.obdobie, CisSchodze: cislo }))) {
      const vystupenia = parseVystupenia(html);
      videnych += vystupenia.length;
      stran++;
      const stmts: D1PreparedStatement[] = [];
      for (const v of vystupenia) {
        const hash = await sha256Hex(v.text);
        const id = v.videoId !== null ? `v${v.videoId}` : `h${(await sha256Hex(`${v.casOd}|${v.recnik}|${v.text}`)).slice(0, 20)}`;
        stmts.push(ins.bind(id, ctx.obdobie, v.schodza ?? cislo, v.denPopis, v.casOd, v.casDo, v.cpt, v.recnik, podlaMena.get(v.recnik) ?? null, v.funkcia, v.typ, v.upraveny ? 1 : 0, v.text, v.videoId, v.videoUrl, v.videoSchodzaUrl, hash, now));
      }
      const zmien = await davky(env, stmts, 25);
      zmenenych += zmien;
      ctx.log(`schôdza ${cislo}, strana ${strana}: ${vystupenia.length} vystúpení, zmenených ${zmien}`);
      if (kompletne && zmien === 0) break; // ďalšie strany sú staršie a už uložené
      if (ctx.limit !== null && zmenenych >= ctx.limit) {
        prejdene = false;
        break vonkajsi;
      }
    }
    if (prejdene) await env.DB.prepare(`UPDATE nrsr_schodze SET vystupenia_kompletne = ? WHERE obdobie = ? AND cislo = ?`).bind(now, ctx.obdobie, cislo).run();
  }
  const po = await count(env, `SELECT COUNT(*) AS n FROM nrsr_vystupenia WHERE obdobie = ?`, ctx.obdobie);
  const sVideom = await count(env, `SELECT COUNT(*) AS n FROM nrsr_vystupenia WHERE obdobie = ? AND video_url IS NOT NULL`, ctx.obdobie);
  const sPoslancom = await count(env, `SELECT COUNT(*) AS n FROM nrsr_vystupenia WHERE obdobie = ? AND poslanec_id IS NOT NULL`, ctx.obdobie);
  return { seen: videnych, pribudlo: po - pred, detail: { schodzi: schodze.length, stran, vystupeni: po, s_videom: sVideom, s_poslancom: sPoslancom, pozadiavok: klient.pozadiavok } };
}

// ---------------------------------------------------------------------------------------------------------------------

export async function runNrsr(env: Env, krok: NrsrKrok, ctx: NrsrCtx, klient: Klient = new Klient(ctx)): Promise<NrsrSummary> {
  const startedAt = ctx.now.toISOString();
  const run = await env.DB.prepare(`INSERT INTO runs (source, channel, started_at, status) VALUES ('nrsr', ?, ?, 'running') RETURNING id`).bind(krok, startedAt).first<{ id: number }>();
  try {
    const r =
      krok === 'poslanci' ? await poslanciKrok(env, ctx, klient)
      : krok === 'funkcie' ? await funkcieKrok(env, ctx, klient)
      : krok === 'organy' ? await organyKrok(env, ctx, klient)
      : krok === 'zmeny' ? await zmenyKrok(env, ctx, klient)
      : krok === 'schodze' ? await schodzeKrok(env, ctx, klient)
      : krok === 'tlace' ? await tlaceKrok(env, ctx, klient)
      : krok === 'hlasovania' ? await hlasovaniaKrok(env, ctx, klient)
      : await rozpravaKrok(env, ctx, klient);
    await env.DB.prepare(`UPDATE runs SET finished_at = ?, status = 'ok', seen = ?, inserted = ? WHERE id = ?`).bind(new Date().toISOString(), r.seen, r.pribudlo, run!.id).run();
    return { krok, status: 'ok', ...r };
  } catch (error) {
    const message = errorMessage(error);
    await env.DB.prepare(`UPDATE runs SET finished_at = ?, status = 'error', error = ? WHERE id = ?`).bind(new Date().toISOString(), message.slice(0, 2000), run!.id).run();
    throw error;
  }
}

export async function runNrsrAll(env: Env, ctx: NrsrCtx, kroky: readonly NrsrKrok[] = NRSR_KROKY): Promise<NrsrSummary[]> {
  const klient = new Klient(ctx);
  const out: NrsrSummary[] = [];
  for (const k of kroky) out.push(await runNrsr(env, k, ctx, klient));
  return out;
}

export interface NrsrPocty {
  poslanci: number;
  poslanci_s_profilom: number;
  poslanci_s_entitou: number;
  mandaty: number;
  funkcie: number;
  zmeny: number;
  kluby: number;
  vybory: number;
  schodze: number;
  hlasovania: number;
  hlasovania_s_hlasmi: number;
  hlasy: number;
  hlasy_podla_druhu: Record<string, number>;
  tlace: number;
  vystupenia: number;
  vystupenia_s_videom: number;
}

/** Počty pre STATUS a log. */
export async function pocty(env: Env): Promise<NrsrPocty> {
  const { results } = await env.DB.prepare(`SELECT hlas, COUNT(*) AS n FROM nrsr_hlasy GROUP BY hlas`).all<{ hlas: string; n: number }>();
  return {
    poslanci: await count(env, `SELECT COUNT(*) AS n FROM nrsr_poslanci`),
    poslanci_s_profilom: await count(env, `SELECT COUNT(*) AS n FROM nrsr_poslanci WHERE profil_zber IS NOT NULL`),
    poslanci_s_entitou: await count(env, `SELECT COUNT(*) AS n FROM nrsr_poslanci WHERE entity_id IS NOT NULL`),
    mandaty: await count(env, `SELECT COUNT(*) AS n FROM nrsr_mandaty`),
    funkcie: await count(env, `SELECT COUNT(*) AS n FROM nrsr_funkcie`),
    zmeny: await count(env, `SELECT COUNT(*) AS n FROM nrsr_zmeny`),
    kluby: await count(env, `SELECT COUNT(*) AS n FROM nrsr_organy WHERE druh = 'klub'`),
    vybory: await count(env, `SELECT COUNT(*) AS n FROM nrsr_organy WHERE druh = 'vybor'`),
    schodze: await count(env, `SELECT COUNT(*) AS n FROM nrsr_schodze`),
    hlasovania: await count(env, `SELECT COUNT(*) AS n FROM nrsr_hlasovania`),
    hlasovania_s_hlasmi: await count(env, `SELECT COUNT(DISTINCT hlasovanie_id) AS n FROM nrsr_hlasy`),
    hlasy: await count(env, `SELECT COUNT(*) AS n FROM nrsr_hlasy`),
    hlasy_podla_druhu: Object.fromEntries(results.map((r) => [r.hlas, r.n])),
    tlace: await count(env, `SELECT COUNT(*) AS n FROM nrsr_tlace`),
    vystupenia: await count(env, `SELECT COUNT(*) AS n FROM nrsr_vystupenia`),
    vystupenia_s_videom: await count(env, `SELECT COUNT(*) AS n FROM nrsr_vystupenia WHERE video_url IS NOT NULL`),
  };
}
