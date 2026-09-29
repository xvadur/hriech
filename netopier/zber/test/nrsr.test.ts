import { env as workerEnv } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { apiUrl, denZ, druhOrganu, mapFunkcie, mapHlasovanie, mapKlub, mapPoslanec, mapSchodza, mapTlac, mapVybor, miestnyCasNaUtc, type HlasovanieJson, type KlubJson, type MembershipJson, type MpJson, type SchodzaJson, type TlacJson, type VyborJson } from '../src/nrsr/api';
import { casSk, datumSk, mena, parseHlasKlub, parseVystupenia, parseZmeny, poliaFormulara, strankyPagera } from '../src/nrsr/parse';
import { Klient, defaultCtx, funkcieKrok, hlasovaniaKrok, organyKrok, paralelne, pocty, poslanciKrok, rozpravaKrok, runNrsr, runNrsrAll, schodzeKrok, tlaceKrok, zmenyKrok, type NrsrCtx } from '../src/nrsr';
import type { Env } from '../src/types';
import mpJson from './fixtures/nrsr-mp.json';
import mpDetail from './fixtures/nrsr-mp-detail.json';
import klubyJson from './fixtures/nrsr-kluby.json';
import vyboryJson from './fixtures/nrsr-vybory.json';
import schodzeJson from './fixtures/nrsr-schodze.json';
import votingsJson from './fixtures/nrsr-votings.json';
import billsJson from './fixtures/nrsr-bills.json';
import hlasKlub from './fixtures/nrsr-hlasklub.html?raw';
import zmeny from './fixtures/nrsr-zmeny.html?raw';
import rozprava from './fixtures/nrsr-rozprava.html?raw';

const env = workerEnv as unknown as Env;

async function count(sql: string, ...params: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

/** Fixture bez pagera — odpoveď na postback (poslednú stranu). */
const bezPagera = (html: string) => html.replace(/<tr class="pager">[\s\S]*?<\/tr>/, '');

describe('oficiálne JSON API NR SR: mapovanie', () => {
  it('pomocné funkcie: adresa API, miestny čas → UTC, deň', () => {
    expect(apiUrl('MP/MembersOfParliament', { termNr: 9 })).toBe('https://www.nrsr.sk/opendata/1/sk/MP/MembersOfParliament?termNr=9');
    expect(miestnyCasNaUtc('2023-12-07T17:13:41')).toBe('2023-12-07T16:13:41.000Z');
    expect(miestnyCasNaUtc('2026-09-29T18:51:42')).toBe('2026-09-29T16:51:42.000Z');
    expect(miestnyCasNaUtc(null)).toBeNull();
    expect(denZ('1984-02-06T00:00:00')).toBe('1984-02-06');
    expect(druhOrganu('NRSR.Kluby.KDH')).toBe('klub');
    expect(druhOrganu('NRSR.Vybory.VSV')).toBe('vybor');
    expect(druhOrganu('NRSR.Delegacie.X')).toBe('ine');
  });

  it('poslanec: meno, titul, narodenie, kandidatúra, bydlisko, posledný klub', () => {
    const p = mapPoslanec((mpJson as MpJson[])[0]!);
    expect(p).toMatchObject({
      id: 1180,
      meno: 'Martina',
      priezvisko: 'Bajo Holečková',
      titul: 'Mgr.',
      titulZa: null,
      narodeny: '1984-02-06',
      narodnost: 'slovenská',
      pohlavie: 'Z',
      kluc: 'Martina.Holeckovai',
      obdobie: 9,
      kandidovalZa: 'Kresťanskodemokratické hnutie',
      kandidovalZaKluc: 'PolitickeStrany.KDH',
      bydlisko: 'Kozárovce',
      kraj: 'Nitriansky',
      email: 'martina.holeckova@nrsr.sk',
      poslednyKlub: 'SaS',
    });
    expect(mapPoslanec((mpJson as MpJson[])[1]!)).toMatchObject({ id: 808, pohlavie: 'M', poslednyKlub: 'SLOVENSKO' });
  });

  it('história členstva: klub a výbor s dátumami v UTC, zmena klubu = dva riadky', () => {
    const f = mapFunkcie((mpDetail as { memberships: MembershipJson[] }).memberships);
    expect(f).toHaveLength(4);
    expect(f[0]).toEqual({
      poslanecId: 1180,
      obdobie: 9,
      organKluc: 'NRSR.Kluby.KDH',
      organ: 'Klub KDH',
      druh: 'klub',
      funkciaKluc: 'NRSR.Kluby.KDH.Predseda',
      funkcia: 'predsedníčka',
      od: '2023-10-24T22:00:00.000Z',
      do: '2024-06-11T21:58:00.000Z',
    });
    expect(f.filter((x) => x.druh === 'klub').map((x) => x.organ)).toEqual(['Klub KDH', 'Klub KDH', 'Klub Sloboda a Solidarita']);
    expect(f[2]!.do).toBeNull();
    expect(f[3]).toMatchObject({ druh: 'vybor', organ: 'Výbor NR SR pre sociálne veci' });
  });

  it('kluby, výbory, schôdze a tlače', () => {
    const k = (klubyJson as KlubJson[]).map(mapKlub);
    expect(k[0]).toMatchObject({ id: 'klub:59', druh: 'klub', kluc: 'NRSR.Kluby.HLAS-SD', skratka: 'HLAS-SD', do: null, clenovCelkom: 40, farba: '#C33090' });
    const v = (vyboryJson as VyborJson[]).map(mapVybor);
    expect(v[0]).toMatchObject({ id: 'vybor:172', druh: 'vybor', skratka: 'MIV', nazov: 'Mandátový a imunitný výbor NR SR' });
    const s = (schodzeJson as SchodzaJson[]).map(mapSchodza);
    expect(s[0]).toMatchObject({ obdobie: 9, cislo: 1, od: '2023-10-25', do: '2023-10-25', programId: 502 });
    expect(s[s.length - 1]).toMatchObject({ cislo: 63, od: '2026-09-16', do: null });
    const t = (billsJson as TlacJson[]).map(mapTlac);
    expect(t[0]).toMatchObject({ obdobie: 9, cpt: 19, typ: 'Iný typ', doruceny: '2023-10-12' });
    expect(t[4]).toMatchObject({ typId: 5, typ: 'Medzinárodná zmluva' });
    expect(mapTlac({ id: 1, termNr: 9, billNr: '', typeId: 1 })).toBeNull();
  });

  it('hlasovanie: čas v UTC, tlač, druh, tajné voľby bez výsledku, súčty', () => {
    const [tajne, standardne, hromadne, bezTlace] = (votingsJson as HlasovanieJson[]).map((j) => mapHlasovanie(j)!);
    expect(tajne).toMatchObject({ id: 51445, tajne: true, typ: 'tajné hlasovanie', vysledok: null, cpt: 11, schodza: 1, cislo: 19 });
    expect(standardne).toMatchObject({
      id: 52785,
      casUtc: '2023-12-07T16:13:41.000Z',
      cpt: 82,
      typ: 'štandardné hlasovanie',
      tajne: false,
      vysledok: 'Návrh prešiel',
      pritomni: 77,
      za: 76,
      proti: 0,
      zdrzali: 0,
      hlasujuci: 76,
      nehlasovali: 1,
      nepritomni: 73,
    });
    expect(standardne!.nazov).toMatch(/^Vládny návrh zákona/);
    expect(hromadne!.typ).toBe('hromadné hlasovanie');
    expect(bezTlace!.cpt).toBeNull();
  });
});

describe('parsery HTML stránok NR SR', () => {
  it('pomocné funkcie: dátumy, čas v Bratislave → UTC, mená', () => {
    expect(datumSk('6. 2. 1984')).toBe('1984-02-06');
    expect(datumSk('16.9.2026')).toBe('2026-09-16');
    expect(datumSk('bez dátumu')).toBeNull();
    // 25. 3. 2025 platí ešte zimný čas (+1), 17. 9. 2026 letný (+2)
    expect(casSk('25.3.2025 13:45:56')).toBe('2025-03-25T12:45:56.000Z');
    expect(casSk('17. 9. 2026 12:31')).toBe('2026-09-17T10:31:00.000Z');
    expect(casSk('29. 9. 2026', '18:51:40')).toBe('2026-09-29T16:51:40.000Z');
    expect(mena('Bajo Holečková, Martina')).toEqual({ priezvisko: 'Bajo Holečková', meno: 'Martina' });
  });

  it('pager a polia formulára pre postback', () => {
    const pager = strankyPagera(rozprava)!;
    expect(pager.ciel).toBe('_sectionLayoutContainer$ctl01$_resultGrid');
    expect(pager.strany.slice(0, 3)).toEqual([2, 3, 4]);
    const polia = poliaFormulara(rozprava);
    expect(polia.__VIEWSTATE).toBe('VS');
    expect(Object.keys(polia)).not.toContain('_sectionLayoutContainer$ctl01$_searchButton');
    expect(strankyPagera('<html></html>')).toBeNull();
  });

  it('hlasovanie podľa klubov: metadáta, súčty a hlas každého poslanca v jeho klube', () => {
    const h = parseHlasKlub(hlasKlub)!;
    expect(h).toMatchObject({
      obdobie: 9,
      schodza: 45,
      cislo: 1,
      cas: '2025-12-12T08:03:00.000Z',
      nazov: 'Prezentácia č. 1, NR SR je uznášaniaschopná.',
      vysledok: 'Návrh prešiel',
      pritomni: 140,
      hlasujuci: 140,
      za: 140,
      proti: 0,
      zdrzali: 0,
      nehlasovali: 0,
      nepritomni: 10,
    });
    expect(h.kluby.map((k) => k.nazov)).toEqual(['Klub SMER - SD', 'Klub PS', 'Klub HLAS - SD', 'Klub SLOVENSKO', 'Klub SaS', 'Klub KDH', 'Klub SNS', 'Poslanci, ktorí nie sú členmi poslaneckých klubov']);
    expect(h.kluby[0]!.hlasy[0]).toEqual({ poslanecId: 871, cele: 'Baláž, Vladimír', hlas: 'Z' });
    const vsetky = h.kluby.flatMap((k) => k.hlasy);
    expect(vsetky.filter((x) => x.hlas === '0').map((x) => x.cele)).toContain('Bartek, Michal');
    expect(new Set(vsetky.map((x) => x.hlas))).toEqual(new Set(['Z', '0']));
    expect(parseHlasKlub('<html>nič</html>')).toBeNull();
  });

  it('zmeny v zložení: dátum, poslanec, strana, druh, dôvod', () => {
    const z = parseZmeny(zmeny);
    expect(z).toHaveLength(4);
    expect(z[0]).toMatchObject({ datum: '2026-09-15', poslanecId: 1227, cele: 'Kováč, Milan', strana: 'SNS', druh: 'Mandát náhradníka vykonávaný', dovod: 'Zložil sľub poslanca' });
    expect(z[2]!.dovod).toMatch(/Nastúpil ako náhradník na neuplatňovaný mandát poslanca .* Samuela Migaľa/);
  });

  it('vystúpenia v rozprave: čas, schôdza, tlač, rečník, funkcia, typ, text, video (skryté odkazy sa nepoužijú)', () => {
    const v = parseVystupenia(rozprava);
    expect(v).toHaveLength(4);
    expect(v[0]).toMatchObject({
      casOd: '2026-09-29T16:51:40.000Z',
      casDo: '2026-09-29T16:53:40.000Z',
      schodza: 61,
      denPopis: '61. schôdza NR SR - 9.deň - B. popoludní',
      cpt: null,
      recnik: 'Raši, Richard',
      funkcia: 'predseda NR SR',
      typ: 'Vstup predsedajúceho',
      upraveny: false,
      videoId: 375841,
      videoUrl: null,
      videoSchodzaUrl: null,
    });
    expect(v[0]!.text).toMatch(/^Budeme hlasovať o prednesenom návrhu/);
    expect(v[1]).toMatchObject({ recnik: 'Hlina, Alojz', cpt: null, funkcia: 'poslanec NR SR', typ: 'Vystúpenie spoločného spravodajcu' });
    expect(v[2]).toMatchObject({ recnik: 'Taraba, Tomáš', cpt: 1400, funkcia: 'podpredseda vlády SR a minister životného prostredia SR', typ: 'Vystúpenie' });
    // vystúpenie s dostupným videom: klip aj celý záznam rokovania
    expect(v[3]).toMatchObject({
      recnik: 'Bajo Holečková, Martina',
      cpt: 1247,
      typ: 'Vystúpenie s faktickou poznámkou',
      videoId: 375225,
      videoUrl: 'http://tv.nrsr.sk/archiv/schodza/9/61?id=375225',
      videoSchodzaUrl: 'http://tv.nrsr.sk/archiv/schodza/9/61',
    });
  });

  it('paralelne spracuje všetko a nepresiahne počet súbežných', async () => {
    let beží = 0;
    let max = 0;
    const hotove: number[] = [];
    await paralelne([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
      beží++;
      max = Math.max(max, beží);
      await new Promise((r) => setTimeout(r, 1));
      hotove.push(n);
      beží--;
    });
    expect(hotove.sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(max).toBeLessThanOrEqual(3);
  });
});

describe('NR SR nad D1 (0005_nrsr)', () => {
  beforeEach(async () => {
    await env.DB.batch(
      ['nrsr_vystupenia', 'nrsr_tlace', 'nrsr_hlasy', 'nrsr_hlasovania', 'nrsr_kluby', 'nrsr_schodze', 'nrsr_funkcie', 'nrsr_organy', 'nrsr_zmeny', 'nrsr_mandaty', 'nrsr_poslanci', 'entity', 'runs'].map((t) =>
        env.DB.prepare(`DELETE FROM ${t}`),
      ),
    );
  });

  type Odpoved = string | ((adresa: string, metoda: string) => string);

  /** Falošný nrsr.sk: podreťazec adresy → odpoveď; postback vracia tú istú stranu bez pagera. */
  function ctx(strany: Record<string, Odpoved>, partial: Partial<NrsrCtx> = {}): NrsrCtx & { volane: string[] } {
    const volane: string[] = [];
    const fakeFetch: typeof fetch = async (input, init) => {
      const u = String(input);
      const metoda = init?.method ?? 'GET';
      volane.push(`${metoda} ${u}`);
      const kluc = Object.keys(strany).find((k) => u.includes(k));
      if (!kluc) return new Response('nie', { status: 404 });
      const o = strany[kluc]!;
      const telo = typeof o === 'function' ? o(u, metoda) : o;
      return new Response(metoda === 'POST' ? bezPagera(telo) : telo);
    };
    return Object.assign(defaultCtx(env, { fetch: fakeFetch, pauzaMs: 0, spanie: async () => {}, now: new Date('2026-09-29T20:00:00Z'), pokusy: 2 }), partial, { volane });
  }

  const json = (o: unknown) => JSON.stringify(o);
  /** Detail poslanca s mpId podľa požiadavky (`id=…`). */
  const detailPodlaId: Odpoved = (u) => json({ ...mpDetail, mpId: Number(u.match(/id=(\d+)/)![1]), memberships: mpDetail.memberships.map((m) => ({ ...m, mpId: Number(u.match(/id=(\d+)/)![1]) })) });

  it('poslanci z API: profil, mandát, entita osoba:<slug>; kolízia mien dostane -id; druhý beh nič nezdvojí', async () => {
    // dvaja rôzni poslanci s rovnakým menom
    const dvojnik = { ...(mpJson as MpJson[])[0]!, mpId: 9999, personKey: 'Martina.Holeckovaii' };
    const c = ctx({ 'MP/MembersOfParliament': json([...(mpJson as MpJson[]), dvojnik]) });
    const s = await runNrsr(env, 'poslanci', c);
    expect(s.status).toBe('ok');
    expect(s.detail).toMatchObject({ poslancov: 4, mandatov: 4 });
    const p = await env.DB.prepare(`SELECT meno, priezvisko, titul, narodeny, pohlavie, kluc, entity_id, profil_zber FROM nrsr_poslanci WHERE id = 1180`).first<Record<string, unknown>>();
    expect(p).toMatchObject({ meno: 'Martina', priezvisko: 'Bajo Holečková', titul: 'Mgr.', narodeny: '1984-02-06', pohlavie: 'Z', kluc: 'Martina.Holeckovai', entity_id: 'osoba:martina-bajo-holeckova' });
    expect(p?.profil_zber).toBeTruthy();
    const dvojnikEntita = await env.DB.prepare(`SELECT entity_id FROM nrsr_poslanci WHERE id = 9999`).first<{ entity_id: string }>();
    expect(dvojnikEntita?.entity_id).toBe('osoba:martina-bajo-holeckova-9999');
    const e = await env.DB.prepare(`SELECT druh, verejne, nazov FROM entity WHERE id = 'osoba:martina-bajo-holeckova'`).first<Record<string, unknown>>();
    expect(e).toEqual({ druh: 'fyzicka_osoba', verejne: 1, nazov: 'Martina Bajo Holečková' });
    const mandat = await env.DB.prepare(`SELECT kandidoval_za, kraj, bydlisko, posledny_klub FROM nrsr_mandaty WHERE poslanec_id = 1180 AND obdobie = 9`).first<Record<string, string>>();
    expect(mandat).toEqual({ kandidoval_za: 'Kresťanskodemokratické hnutie', kraj: 'Nitriansky', bydlisko: 'Kozárovce', posledny_klub: 'SaS' });
    const s2 = await runNrsr(env, 'poslanci', c);
    expect(s2.pribudlo).toBe(0);
    expect(await count(`SELECT COUNT(*) AS n FROM entity WHERE id LIKE 'osoba:%'`)).toBe(4);
  });

  it('funkcie: história klubov a výborov po poslancoch; obnova nezdvojí; aktuálne členstvo cez pohľad', async () => {
    const c = ctx({ 'MP/MembersOfParliament': json(mpJson), 'MP/MemberOfParliament': detailPodlaId });
    await runNrsr(env, 'poslanci', c);
    const s = await funkcieKrok(env, { ...c, paralelne: 2 }, new Klient(c));
    expect(s.pribudlo).toBe(12);
    expect(s.detail).toMatchObject({ funkcii: 12, klubovych: 9, vyborovych: 3, aktualnych: 3, chyb: 0 });
    const historia = await env.DB.prepare(`SELECT organ, funkcia, od, do FROM nrsr_funkcie WHERE poslanec_id = 808 AND druh = 'klub' ORDER BY od`).all<Record<string, string | null>>();
    expect(historia.results.map((r) => `${r.organ}|${r.funkcia}`)).toEqual(['Klub KDH|predsedníčka', 'Klub KDH|členka', 'Klub Sloboda a Solidarita|členka']);
    const aktualne = await env.DB.prepare(`SELECT organ FROM nrsr_clenstvo_aktualne WHERE poslanec_id = 1180`).all<{ organ: string }>();
    expect(aktualne.results).toEqual([{ organ: 'Klub Sloboda a Solidarita' }]);
    const s2 = await funkcieKrok(env, c, new Klient(c));
    expect(s2.pribudlo).toBe(0);
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_funkcie`)).toBe(12);
  });

  it('organy, schôdze a tlače z API', async () => {
    const c = ctx({ 'MP/Clubs': json(klubyJson), 'Committee/Committees': json(vyboryJson), 'General/Meetings': json(schodzeJson), 'Bill/Bills': json(billsJson) });
    const k = new Klient(c);
    expect((await organyKrok(env, c, k)).detail).toEqual({ klubov: 2, vyborov: 2 });
    expect((await schodzeKrok(env, c, k)).pribudlo).toBe(5);
    const t = await tlaceKrok(env, c, k);
    expect(t.pribudlo).toBe(5);
    expect(t.detail).toEqual({ tlac: 5, navrhov_zakonov: 2 });
    const tlac = await env.DB.prepare(`SELECT typ, nazov, doruceny, url FROM nrsr_tlace WHERE cpt = 36`).first<Record<string, string>>();
    expect(tlac).toMatchObject({ typ: 'Medzinárodná zmluva', doruceny: '2023-11-20' });
    expect(tlac?.url).toContain('sid=zakony/cpt');
    // druhý beh
    expect((await tlaceKrok(env, c, k)).pribudlo).toBe(0);
    expect((await organyKrok(env, c, k)).pribudlo).toBe(0);
    expect((await schodzeKrok(env, c, k)).pribudlo).toBe(0);
  });

  it('hlasovania: zoznam z API + hlas každého poslanca s klubom; tajné bez hlasov; druhý beh nesťahuje nič', async () => {
    const strany = { 'Voting/Votings': json(votingsJson), 'sid=schodze/hlasovanie/hlasklub': hlasKlub };
    const c = ctx(strany);
    const k = new Klient(c);
    const s = await hlasovaniaKrok(env, c, k);
    expect(s.seen).toBe(5);
    expect(s.pribudlo).toBe(5);
    expect(s.detail).toMatchObject({ hlasovani: 5, tajnych: 1, s_hlasmi: 3, hlasov: 96, hlasov_nove: 96, chyb: 0 });
    const h = await env.DB.prepare(`SELECT * FROM nrsr_hlasovania WHERE id = 52785`).first<Record<string, unknown>>();
    expect(h).toMatchObject({ obdobie: 9, schodza: 6, cislo: 41, cas_utc: '2023-12-07T16:13:41.000Z', den: '2023-12-07', cpt: 82, typ: 'štandardné hlasovanie', tajne: 0, vysledok: 'Návrh prešiel', pritomni: 77, za: 76, nepritomni: 73 });
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_hlasy WHERE hlasovanie_id = 51445`)).toBe(0);
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_hlasy WHERE hlasovanie_id = 52785`)).toBe(32);
    const klubBartka = parseHlasKlub(hlasKlub)!.kluby.find((kl) => kl.hlasy.some((x) => x.poslanecId === 1207))!.nazov;
    const hlas = await env.DB.prepare(
      `SELECT h.hlas, k.nazov AS klub FROM nrsr_hlasy h JOIN nrsr_kluby k ON k.id = h.klub_id WHERE h.hlasovanie_id = 52785 AND h.poslanec_id = 1207`,
    ).first<Record<string, string>>();
    expect(hlas).toEqual({ hlas: '0', klub: klubBartka });
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_kluby`)).toBe(8);
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_poslanci WHERE entity_id IS NOT NULL`)).toBe(32);
    const historia = await env.DB.prepare(`SELECT klub, od, do, hlasovani FROM nrsr_klub_historia WHERE poslanec_id = 1207`).first<Record<string, unknown>>();
    expect(historia).toEqual({ klub: klubBartka, od: '2023-10-25', do: '2026-09-29', hlasovani: 3 });
    // idempotencia: zoznam sa obnoví, hlasy sa nesťahujú
    const c2 = ctx(strany);
    const s2 = await hlasovaniaKrok(env, c2, new Klient(c2));
    expect(s2.pribudlo).toBe(0);
    expect(s2.detail).toMatchObject({ hlasov_nove: 0, chyb: 0 });
    expect(c2.volane.filter((v) => v.includes('hlasklub'))).toHaveLength(0);
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_hlasy`)).toBe(96);
  });

  it('hlasovanie s chybnou stránkou: zapíše chybu, metadáta ostanú, hlasy sa doťahujú pri ďalšom behu; limit a schôdza obmedzia rozsah', async () => {
    const c = ctx({ 'Voting/Votings': json(votingsJson), 'sid=schodze/hlasovanie/hlasklub': '<html>bez hlasovania</html>' });
    const s = await hlasovaniaKrok(env, c, new Klient(c));
    expect(s.detail).toMatchObject({ hlasovani: 5, s_hlasmi: 0, chyb: 3 });
    const c2 = ctx({ 'Voting/Votings': json(votingsJson), 'sid=schodze/hlasovanie/hlasklub': hlasKlub });
    const s2 = await hlasovaniaKrok(env, { ...c2, limit: 1 }, new Klient(c2));
    expect(s2.detail).toMatchObject({ s_hlasmi: 1, hlasov_nove: 32 });
    // najnovšie prvé
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_hlasy WHERE hlasovanie_id = 58377`)).toBe(32);
    const c3 = ctx({ 'Voting/Votings': json(votingsJson), 'sid=schodze/hlasovanie/hlasklub': hlasKlub });
    const s3 = await hlasovaniaKrok(env, { ...c3, schodze: [6] }, new Klient(c3));
    expect(s3.detail).toMatchObject({ s_hlasmi: 2 });
    expect(c3.volane.filter((v) => v.includes('hlasklub'))).toHaveLength(1);
  });

  it('zmeny v zložení: iba od volieb, poslanci bez profilu sa založia', async () => {
    const stary = zmeny.replace('15. 9. 2026', '9. 6. 1990');
    const c = ctx({ 'sid=poslanci/zmeny': stary });
    const s = await zmenyKrok(env, c, new Klient(c));
    expect(s.pribudlo).toBe(3);
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_zmeny WHERE datum < '2023-09-30'`)).toBe(0);
    const z = await env.DB.prepare(`SELECT strana, druh FROM nrsr_zmeny WHERE poslanec_id = 1197 AND datum = '2026-07-01'`).first<Record<string, string>>();
    expect(z).toEqual({ strana: 'HLAS - SD', druh: 'Mandát náhradníka získaný' });
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_poslanci WHERE profil_zber IS NULL AND entity_id IS NOT NULL`)).toBeGreaterThanOrEqual(2);
    expect((await zmenyKrok(env, c, new Klient(c))).pribudlo).toBe(0);
  });

  it('rozprava: vystúpenia s videom, väzba na poslanca podľa mena, kompletnosť schôdze, druhý beh nezdvojí', async () => {
    await env.DB.prepare(`INSERT INTO nrsr_schodze (obdobie, cislo, popis, url, zber) VALUES (9, 61, '61. schôdza', 'x', '2026-09-29')`).run();
    await env.DB.prepare(`INSERT INTO nrsr_poslanci (id, meno, priezvisko, url, prvy_zber, posledny_zber) VALUES (859, 'Alojz', 'Hlina', 'x', '2026-09-29', '2026-09-29')`).run();
    const c = ctx({ 'sid=schodze/rozprava/vyhladavanie': rozprava });
    const k = new Klient(c);
    const s = await rozpravaKrok(env, { ...c, schodze: [61] }, k);
    expect(s.seen).toBe(8);
    expect(s.pribudlo).toBe(4);
    const hlina = await env.DB.prepare(`SELECT id, poslanec_id, cpt, typ, cas_od_utc, video_id, video_url FROM nrsr_vystupenia WHERE recnik = 'Hlina, Alojz'`).first<Record<string, unknown>>();
    expect(hlina).toMatchObject({ id: 'v375840', poslanec_id: 859, cpt: null, typ: 'Vystúpenie spoločného spravodajcu', video_id: 375840, video_url: null });
    const bajo = await env.DB.prepare(`SELECT video_url, video_schodza_url, cpt FROM nrsr_vystupenia WHERE id = 'v375225'`).first<Record<string, unknown>>();
    expect(bajo).toEqual({ video_url: 'http://tv.nrsr.sk/archiv/schodza/9/61?id=375225', video_schodza_url: 'http://tv.nrsr.sk/archiv/schodza/9/61', cpt: 1247 });
    const raši = await env.DB.prepare(`SELECT poslanec_id FROM nrsr_vystupenia WHERE recnik = 'Raši, Richard'`).first<{ poslanec_id: number | null }>();
    expect(raši?.poslanec_id).toBeNull();
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_vystupenia_fts WHERE nrsr_vystupenia_fts MATCH 'hlasovat'`)).toBeGreaterThanOrEqual(1);
    const stav = await env.DB.prepare(`SELECT vystupenia_kompletne AS k FROM nrsr_schodze WHERE cislo = 61`).first<{ k: string | null }>();
    expect(stav?.k).toBeTruthy();
    // druhý beh: nič nové; keďže schôdza je kompletná, končí po prvej strane
    const c2 = ctx({ 'sid=schodze/rozprava/vyhladavanie': rozprava });
    const s2 = await rozpravaKrok(env, { ...c2, schodze: [61] }, new Klient(c2));
    expect(s2.pribudlo).toBe(0);
    expect(c2.volane.filter((v) => v.startsWith('POST'))).toHaveLength(0);
    expect(await count(`SELECT COUNT(*) AS n FROM nrsr_vystupenia`)).toBe(4);
    // zmena textu (autorizácia) aktualizuje riadok
    await env.DB.prepare(`UPDATE nrsr_vystupenia SET text = 'starý', hash = 'x' WHERE id = 'v375840'`).run();
    const s3 = await rozpravaKrok(env, { ...c2, schodze: [61], znova: true }, new Klient(c2));
    expect(s3.detail).toMatchObject({ vystupeni: 4 });
    const text = await env.DB.prepare(`SELECT text FROM nrsr_vystupenia WHERE id = 'v375840'`).first<{ text: string }>();
    expect(text?.text).not.toBe('starý');
  });

  it('všetky kroky za sebou (bez rozpravy), počty a záznamy v runs', async () => {
    const c = ctx({
      'MP/MembersOfParliament': json(mpJson),
      'MP/MemberOfParliament': detailPodlaId,
      'MP/Clubs': json(klubyJson),
      'Committee/Committees': json(vyboryJson),
      'sid=poslanci/zmeny': zmeny,
      'General/Meetings': json(schodzeJson),
      'Bill/Bills': json(billsJson),
      'Voting/Votings': json(votingsJson),
      'sid=schodze/hlasovanie/hlasklub': hlasKlub,
    });
    const vysledky = await runNrsrAll(env, c);
    expect(vysledky.map((v) => `${v.krok}:${v.status}`)).toEqual(['poslanci:ok', 'funkcie:ok', 'organy:ok', 'zmeny:ok', 'schodze:ok', 'tlace:ok', 'hlasovania:ok']);
    const p = await pocty(env);
    expect(p).toMatchObject({ mandaty: 3, funkcie: 12, kluby: 2, vybory: 2, schodze: 5, tlace: 5, hlasovania: 5, hlasovania_s_hlasmi: 3, hlasy: 96, zmeny: 4 });
    expect(p.hlasy_podla_druhu).toEqual({ '0': 12, Z: 84 });
    expect(await count(`SELECT COUNT(*) AS n FROM runs WHERE source = 'nrsr' AND status = 'ok'`)).toBe(7);
    // druhý beh: nič nové
    const druhy = await runNrsrAll(env, ctx({ ...{}, 'MP/MembersOfParliament': json(mpJson), 'MP/MemberOfParliament': detailPodlaId, 'MP/Clubs': json(klubyJson), 'Committee/Committees': json(vyboryJson), 'sid=poslanci/zmeny': zmeny, 'General/Meetings': json(schodzeJson), 'Bill/Bills': json(billsJson), 'Voting/Votings': json(votingsJson), 'sid=schodze/hlasovanie/hlasklub': hlasKlub }));
    expect(druhy.map((v) => v.pribudlo)).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('klient opakuje pri sieťovej chybe a 5xx, 404 je definitívne, JSON musí byť JSON', async () => {
    let n = 0;
    const c = defaultCtx(env, {
      pauzaMs: 0,
      spanie: async () => {},
      pokusy: 4,
      fetch: async (input) => {
        n++;
        const u = String(input);
        if (u.includes('nie')) return new Response('nič', { status: 404 });
        if (u.includes('html')) return new Response('<html>nie je json</html>');
        if (n < 3) throw new TypeError('fetch failed');
        if (n === 3) return new Response('chyba', { status: 503 });
        return new Response('ok');
      },
    });
    const k = new Klient(c);
    expect(await k.get('https://www.nrsr.sk/a')).toBe('ok');
    expect(n).toBe(4);
    await expect(k.get('https://www.nrsr.sk/nie')).rejects.toThrow(/HTTP 404/);
    await expect(k.getJson('https://www.nrsr.sk/html')).rejects.toThrow(/nie je JSON/);
  });
});
