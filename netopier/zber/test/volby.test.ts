import { env as workerEnv } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { kandidatId, parseZoznam, rozdelMeno, stranaId, stranyZNavrhovatela } from '../src/volby/parse';
import { defaultCtx, pocty, runVolby, runVolbyAll, type VolbyCtx } from '../src/volby';
import type { Env } from '../src/types';
import kosice from './fixtures/volby-kosice-primator.txt?raw';
import zsk from './fixtures/volby-zsk-predseda.txt?raw';
import trnava2022 from './fixtures/volby-trnava-primator-2022.txt?raw';

const env = workerEnv as unknown as Env;

async function count(sql: string, ...params: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

describe('parser oficiálnych zoznamov kandidátov (vzor MV SR)', () => {
  it('Košice, primátor: 8 kandidátov, poradové čísla vytiahnuté pred mená, koalície cez viac riadkov, dátum', () => {
    const p = parseZoznam(kosice);
    expect(p.hlavicka).toBe('primátora mesta Košice');
    expect(p.datum).toBe('2026-09-09');
    expect(p.kandidati).toHaveLength(8);
    expect(p.kandidati.map((k) => k.priezvisko)).toEqual(['Kovačevičová', 'Lörinc', 'Lörincz', 'Mudrák', 'Polaček', 'Riabov', 'Sabol', 'Székely']);
    expect(p.kandidati[0]).toMatchObject({ poradie: 1, meno: 'Lenka', tituly: 'Ing. Mgr.', vek: 50, zamestnanie: 'starostka mestskej časti', bydlisko: null, nezavisly: false, strany: ['tim-kosice', 'sanik', 'pravo-na-pravdu'] });
    expect(p.kandidati[1]).toMatchObject({ tituly: 'Mgr., MPA', vek: 37, navrhovatel: 'Košická strana', strany: ['kosicka-strana'] });
    expect(p.kandidati[4]).toMatchObject({ meno: 'Jaroslav', priezvisko: 'Polaček', vek: 49, zamestnanie: 'primátor mesta', strany: ['kdh', 'sas', 'madarska-aliancia', 'srk', 'nova', 'ds-ods'] });
    expect(p.kandidati[6]).toMatchObject({ priezvisko: 'Sabol', tituly: null, zamestnanie: 'lobista, konzultant', navrhovatel: 'nezávislý kandidát', nezavisly: true, strany: [] });
  });

  it('ŽSK, predseda kraja: 7 kandidátov, obec pobytu oddelená od strán, koalícia s 10 stranami', () => {
    const p = parseZoznam(zsk);
    expect(p.hlavicka).toBe('predsedu Žilinského samosprávneho kraja');
    expect(p.datum).toBe('2026-09-09');
    expect(p.kandidati).toHaveLength(7);
    expect(p.kandidati[0]).toMatchObject({ meno: 'Anna', priezvisko: 'Belousovová', tituly: 'RNDr.', vek: 67, zamestnanie: 'viceprimátorka', bydlisko: 'Čadca', strany: ['republika'] });
    expect(p.kandidati[3]).toMatchObject({ priezvisko: 'Jurinová', vek: 55, bydlisko: 'Nižná' });
    expect(p.kandidati[3]!.strany).toEqual(['hnutie-slovensko', 'za-ludi', 'nova', 'ps', 'sas', 'kdh', 'demokrati', 'ku', 'oks', 'ds-ods']);
    expect(p.kandidati[4]).toMatchObject({ priezvisko: 'Kapitulík', zamestnanie: 'riaditeľ, regionálny stratég', bydlisko: 'Žilina', nezavisly: true, strany: [] });
    expect(p.kandidati[6]).toMatchObject({ priezvisko: 'Pova', bydlisko: 'Liptovská Osada', strany: ['kss'] });
  });

  it('starší vzor s poradovými číslami inline a priezviskom malými písmenami (Trnava 2022)', () => {
    const p = parseZoznam(trnava2022);
    expect(p.kandidati).toHaveLength(6);
    expect(p.kandidati[1]).toMatchObject({ meno: 'Zuzana', priezvisko: 'Bošnáková', tituly: 'JUDr., Bc.', vek: 36, strany: ['kdh', 'za-ludi', 'ku'] });
    expect(p.kandidati[4]).toMatchObject({ priezvisko: 'Lančarič', zamestnanie: 'manažér, poslanec zastupiteľstva', nezavisly: true });
    expect(p.kandidati[5]!.strany).toEqual(['narodna-koalicia']);
  });

  it('pomocné funkcie: meno, id strany, id kandidáta', () => {
    expect(rozdelMeno('Monika Sofiya SOROČINOVÁ')).toEqual({ meno: 'Monika Sofiya', priezvisko: 'Soročinová' });
    expect(rozdelMeno('Ján Nosko')).toEqual({ meno: 'Ján', priezvisko: 'Nosko' });
    expect(stranaId('Kdh - kresťanskodemokratické hnutie')).toBe('kdh');
    expect(stranaId('Smer - sociálna demokracia')).toBe('smer');
    expect(stranaId('Neznáma strana XY')).toBe('neznama-strana-xy');
    expect(stranyZNavrhovatela('nezávislá kandidátka')).toEqual([]);
    expect(kandidatId('primator', 'kosice', 'Ladislav', 'Lörinc')).toBe('primator:kosice:ladislav-lorinc');
  });
});

describe('volby nad D1 (0003_volby)', () => {
  beforeEach(async () => {
    await env.DB.batch(
      ['volby_prieskum_hodnoty', 'volby_prieskumy', 'volby_kandidat_strany', 'volby_kandidati', 'volby_zdroje', 'volby_kalendar', 'volby_obce', 'volby_okresy', 'volby_kraje', 'volby_strany', 'entity_alias', 'record_entity', 'entity', 'runs'].map((t) =>
        env.DB.prepare(`DELETE FROM ${t}`),
      ),
    );
  });

  function ctx(): VolbyCtx {
    // sieť: oficiálne zoznamy nahradia fixture texty; Bratislava ostane „sken“ (prázdny text)
    const texty: Record<string, string> = { 'kosice-primator': kosice, 'za-predseda': zsk };
    const fakeFetch: typeof fetch = async (input) => {
      const url = String(input);
      const id = Object.keys(texty).find((k) => (k === 'kosice-primator' ? url.includes('kosice') : url.includes('predsedu-ZSK')));
      if (url.includes('bratislava')) return new Response(new Uint8Array([37, 80, 68, 70]));
      if (!id) return new Response('nie', { status: 404 });
      return new Response(new TextEncoder().encode(texty[id]!));
    };
    return defaultCtx(env, { fetch: fakeFetch, pdfText: async (b) => new TextDecoder().decode(b).replace(/^%PDF$/, ''), now: new Date('2026-09-28T12:00:00Z') });
  }

  it('všetky kroky: územie, kalendár, kandidáti (oficiálni + médiá), prieskumy, entity; druhý beh bez duplicít', async () => {
    const c = ctx();
    const prvy = await runVolbyAll(env, c);
    expect(prvy.map((s) => s.status)).toEqual(['ok', 'ok', 'ok', 'ok', 'ok']);
    const p1 = await pocty(env);
    expect(p1.kraje).toBe(8);
    expect(p1.okresy).toBe(79);
    expect(p1.obce).toBe(8 + 17 + 22);
    expect(p1.kalendar).toBeGreaterThanOrEqual(13);
    // oficiálne: Košice 8 + ŽSK 7; médiá: 7 krajov (49, BB je záloha) + Bratislava 6 + Trnava 6 + Prešov 6
    expect(p1.kandidati_oficialni).toBe(15);
    expect(p1.kandidati_media).toBe(49 + 18);
    expect(p1.kandidati).toEqual({ predseda_kraja: 56, primator: 26 });
    expect(p1.osoby).toBe(82);
    expect(p1.prieskumy).toBe(16);
    // zdroje: Bratislava sken → chyba zapísaná, ostatné bez fixture → 404
    const zdroje = await env.DB.prepare(`SELECT id, kandidatov, chyba FROM volby_zdroje ORDER BY id`).all<{ id: string; kandidatov: number | null; chyba: string | null }>();
    const z = Object.fromEntries(zdroje.results.map((r) => [r.id, r]));
    expect(z['kosice-primator']).toMatchObject({ kandidatov: 8, chyba: null });
    expect(z['za-predseda']).toMatchObject({ kandidatov: 7, chyba: null });
    expect(z['bratislava-primator']!.chyba).toMatch(/parser nenašiel/);
    expect(z['nitra-primator']!.chyba).toMatch(/HTTP 404/);
    // väzby na strany a entity
    const lorinc = await env.DB.prepare(`SELECT k.*, GROUP_CONCAT(s.strana_id) AS strany FROM volby_kandidati k LEFT JOIN volby_kandidat_strany s ON s.kandidat_id = k.id WHERE k.id = 'primator:kosice:ladislav-lorinc'`).first<Record<string, unknown>>();
    expect(lorinc).toMatchObject({ vek: 37, zdroj_druh: 'oficialny', zdroj_datum: '2026-09-09', entity_id: 'osoba:ladislav-lorinc', strany: 'kosicka-strana' });
    const osoba = await env.DB.prepare(`SELECT druh, verejne, nazov FROM entity WHERE id = 'osoba:ladislav-lorinc'`).first<Record<string, unknown>>();
    expect(osoba).toEqual({ druh: 'fyzicka_osoba', verejne: 0, nazov: 'Ladislav Lörinc' });
    expect(await count(`SELECT COUNT(*) AS n FROM entity_alias WHERE zdroj = 'volby' AND alias = 'Ladislav Lörinc'`)).toBe(1);
    // prieskum priradený ku kandidátom podľa mena v území
    const hodnoty = await env.DB.prepare(`SELECT meno, percenta, kandidat_id FROM volby_prieskum_hodnoty WHERE prieskum_id = 'sanep-2026-09-za-predseda' ORDER BY percenta DESC`).all<{ meno: string; percenta: number; kandidat_id: string | null }>();
    expect(hodnoty.results[0]).toEqual({ meno: 'Erika Jurinová', percenta: 31.1, kandidat_id: 'predseda_kraja:ZA:erika-jurinova' });
    expect(hodnoty.results.every((h) => h.kandidat_id)).toBe(true);
    const gurbalova = await env.DB.prepare(`SELECT kandidat_id FROM volby_prieskum_hodnoty WHERE prieskum_id = 'ako-2026-04-ke-predseda' AND meno = 'Lucia Gurbáľová'`).first<{ kandidat_id: string | null }>();
    expect(gurbalova?.kandidat_id).toBeNull();
    // stav z médií: Bratislava, Winkler sa vzdal
    const winkler = await env.DB.prepare(`SELECT stav FROM volby_kandidati WHERE id = 'primator:bratislava:martin-winkler'`).first<{ stav: string }>();
    expect(winkler?.stav).toBe('vzdal_sa');

    const druhy = await runVolbyAll(env, c);
    expect(druhy.map((s) => s.pribudlo)).toEqual([0, 0, 0, 0, 0]);
    const p2 = await pocty(env);
    expect(p2).toEqual(p1);
    expect(await count(`SELECT COUNT(*) AS n FROM volby_kandidat_strany`)).toBe(await count(`SELECT COUNT(*) AS n FROM (SELECT DISTINCT kandidat_id, strana_id FROM volby_kandidat_strany)`));
    expect(await count(`SELECT COUNT(*) AS n FROM runs WHERE source = 'volby' AND status = 'ok'`)).toBe(10);
  });

  it('oficiálny zoznam prepíše mediálny riadok, mediálny neprepíše oficiálny', async () => {
    const c = ctx();
    await runVolby(env, 'uzemie', c);
    // najprv iba médiá (sieť padá), potom oficiálne
    const bezSiete = defaultCtx(env, { fetch: async () => new Response('', { status: 503 }), pdfText: null, now: c.now });
    await runVolby(env, 'kandidati', bezSiete);
    expect(await count(`SELECT COUNT(*) AS n FROM volby_kandidati WHERE zdroj_druh = 'oficialny'`)).toBe(0);
    await env.DB.prepare(`INSERT INTO volby_kandidati (id, volba, kraj_id, obec_id, meno, priezvisko, vek, navrhovatel, nezavisly, zdroj_druh, zdroj_url, prvy_zber, posledny_zber)
      VALUES ('primator:kosice:ladislav-lorinc', 'primator', 'KE', 'kosice', 'Ladislav', 'Lörinc', 36, 'médiá', 0, 'media', 'https://priklad.sk', '2026-09-01', '2026-09-01')`).run();
    const s = await runVolby(env, 'kandidati', c);
    expect(s.pribudlo).toBe(15 - 1);
    const lorinc = await env.DB.prepare(`SELECT vek, navrhovatel, zdroj_druh, prvy_zber, posledny_zber FROM volby_kandidati WHERE id = 'primator:kosice:ladislav-lorinc'`).first<Record<string, unknown>>();
    expect(lorinc).toEqual({ vek: 37, navrhovatel: 'Košická strana', zdroj_druh: 'oficialny', prvy_zber: '2026-09-01', posledny_zber: '2026-09-28T12:00:00.000Z' });
    // ďalší mediálny beh oficiálny riadok nezmení
    await runVolby(env, 'kandidati', bezSiete);
    const znova = await env.DB.prepare(`SELECT vek, zdroj_druh FROM volby_kandidati WHERE id = 'primator:kosice:ladislav-lorinc'`).first<Record<string, unknown>>();
    expect(znova).toEqual({ vek: 37, zdroj_druh: 'oficialny' });
  });
});
