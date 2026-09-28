import { env as workerEnv } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { DERIVE_KROKY, hladaj, runDerive, runDeriveAll } from '../src/derive';
import { zdrojeZoSeedov } from '../src/derive/zdroje';
import { ftsFraza } from '../src/derive/zmienky';
import type { Env } from '../src/types';

const env = workerEnv as unknown as Env;

async function count(sql: string, ...params: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

interface Riadok {
  source: string;
  channel: string;
  external_id: string;
  url?: string;
  title?: string | null;
  published_at?: string | null;
  data: Record<string, unknown>;
}

async function vloz(riadky: Riadok[]): Promise<void> {
  const stmt = env.DB.prepare(
    `INSERT INTO records (source, channel, external_id, url, title, published_at, collected_at, content_hash, data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  await env.DB.batch(
    riadky.map((r, i) =>
      stmt.bind(r.source, r.channel, r.external_id, r.url ?? null, r.title ?? null, r.published_at ?? null, '2026-09-26T18:00:00.000Z', `hash-${r.source}-${r.external_id}-${i}`, JSON.stringify(r.data)),
    ),
  );
}

const FIXTURE: Riadok[] = [
  { source: 'crz', channel: '2026-09-25', external_id: '304/2013/LMU', title: 'KÚPNA ZMLUVA', published_at: '2013-09-30T14:34:09+02:00', data: { predmet: 'KÚPNA ZMLUVA', objednavatel: 'ITALZVER, s.r.o.', objednavatel_ico: '46566023', dodavatel: 'Lesopoľnohospodársky majetok Ulič, š. p.', dodavatel_ico: '00492531', suma_spolu: 0 } },
  { source: 'crz', channel: '2026-09-25', external_id: '305/2013', title: 'Dodatok k zmluve o dielo', published_at: '2026-09-25 10:00:00', data: { predmet: 'Dodatok', objednavatel: 'Ministerstvo školstva SR', objednavatel_ico: '00164381', dodavatel: 'ITALZVER, s.r.o.', dodavatel_ico: '46566023', suma_spolu: 48073.32 } },
  { source: 'ted', channel: '2026-09-21', external_id: '646374-2026', title: 'Rekonštrukcia vodnej elektrárne', published_at: '2026-09-21T00:00:00+02:00', data: { obstaravatel: 'VODOHOSPODÁRSKA VÝSTAVBA, ŠTÁTNY PODNIK', obstaravatel_id: ['00156752', '2020480198'], vitaz: ['Stavby a. s.'], vitaz_id: ['31300000'] } },
  { source: 'kataster', channel: 'bratislava-urad-vlady', external_id: '21721', published_at: '2026-06-30T16:00:00Z', data: { parcela: '21721' } },
  { source: 'statistika', channel: 'as1001rs', external_id: 'as1001rs', title: 'Obyvateľstvo', published_at: '2025-12-19', data: { code: 'as1001rs' } },
  { source: 'worldmonitor', channel: 'inventar', external_id: '2026-09-26', published_at: null, data: { providerCount: 770 } },
  { source: 'rss', channel: 'dennikn_minuty_all', external_id: 'g1', url: 'https://dennikn.sk/minuta/1', title: 'Fico: „Vláda schválila rozpočet na školstvo“', published_at: '2026-09-26T17:40:03.000Z', data: { feed_id: 'dennikn_minuty_all', author: 'Juraj Helbich', summary: 'Vláda schválila rozpočet. Robert Fico to oznámil po rokovaní.' } },
  { source: 'rss', channel: 'dennikn', external_id: 'g2', url: 'https://dennikn.sk/2', title: 'Prečo hrozí kolaps nemocníc?', published_at: '2026-09-26T22:30:00.000Z', data: { feed_id: 'dennikn', author: 'Autorka N', summary: 'Nemocnice varujú pred kolapsom.' } },
  { source: 'rss', channel: 'aktuality', external_id: 'g3', url: 'https://aktuality.sk/3', title: 'Parlament rokuje o rozpočte', published_at: 'Sat, 26 Sep 2026 20:00:00 +0200', data: { feed_id: 'aktuality', summary: null } },
  { source: 'rss', channel: 'pravda_spravy', external_id: 'g4', url: 'https://pravda.sk/4', title: 'Zmluva s dodávateľom sa ruší', published_at: '', data: { feed_id: 'pravda_spravy', author: 'TASR', summary: 'Ministerstvo zrušilo zmluvu.' } },
  { source: 'rss', channel: 'wm-bbc-world', external_id: 'g5', url: 'https://bbc.co.uk/5', title: 'Government signs contract', published_at: '2026-09-26T10:00:00.000Z', data: { feed_id: 'wm-bbc-world', summary: 'A contract was signed.' } },
];

beforeEach(async () => {
  await env.DB.batch(
    ['record_entity', 'entity_alias', 'entity', 'zdroj_pokrytie_denne', 'zdroj_kanaly', 'zdroje', 'pocty', 'meranie', 'records', 'runs', 'source_state'].map((t) => env.DB.prepare(`DELETE FROM ${t}`)),
  );
});

describe('odvodenie nad archívom (0002_zaklad)', () => {
  it('normalize: 5 formátov → UTC, prázdne a NULL ostávajú NULL, druhý beh nič nemení', async () => {
    await vloz(FIXTURE);
    const s = await runDerive(env, 'normalize');
    expect(s).toMatchObject({ status: 'ok', seen: 9, inserted: 9 }); // prázdne a NULL sa ani nečítajú
    expect(s.detail?.formaty).toEqual({ iso_posun: 2, miestny: 1, iso_utc: 4, iba_datum: 1, ine: 1 });
    const rows = await env.DB.prepare(`SELECT external_id, published_at_utc FROM records ORDER BY id`).all<{ external_id: string; published_at_utc: string | null }>();
    const utc = Object.fromEntries(rows.results.map((r) => [r.external_id, r.published_at_utc]));
    expect(utc['304/2013/LMU']).toBe('2013-09-30T12:34:09.000Z');
    expect(utc['305/2013']).toBe('2026-09-25T08:00:00.000Z');
    expect(utc['as1001rs']).toBe('2025-12-18T23:00:00.000Z');
    expect(utc.g3).toBe('2026-09-26T18:00:00.000Z');
    expect(utc.g4).toBeNull();
    expect(utc['2026-09-26']).toBeNull();
    expect(await count(`SELECT COUNT(*) AS n FROM records WHERE published_at_utc IS NOT NULL`)).toBe(9);
    const again = await runDerive(env, 'normalize');
    expect(again).toMatchObject({ seen: 0, inserted: 0 });
    expect(await count(`SELECT COUNT(*) AS n FROM runs WHERE source = 'derive' AND channel = 'normalize' AND status = 'ok'`)).toBe(2);
  });

  it('entity: IČO z CRZ a TED, väzby s rolami, idempotentné, výskyty sa rozširujú', async () => {
    await vloz(FIXTURE);
    await runDerive(env, 'normalize');
    const s = await runDerive(env, 'entity');
    expect(s).toMatchObject({ status: 'ok', seen: 3, inserted: 6 });
    expect(await count(`SELECT COUNT(*) AS n FROM entity`)).toBe(5);
    const italzver = await env.DB.prepare(`SELECT * FROM entity WHERE id = 'ico:46566023'`).first<Record<string, unknown>>();
    expect(italzver).toMatchObject({ druh: 'firma', nazov: 'ITALZVER, s.r.o.', ico: '46566023', verejne: 1, prvy_vyskyt: '2013-09-30T12:34:09.000Z', posledny_vyskyt: '2026-09-25T08:00:00.000Z' });
    const role = await env.DB.prepare(`SELECT entity_id, rola FROM record_entity ORDER BY record_id, rola`).all<{ entity_id: string; rola: string }>();
    expect(role.results.map((r) => `${r.entity_id}:${r.rola}`)).toEqual([
      'ico:46566023:strana_a', 'ico:00492531:strana_b',
      'ico:00164381:strana_a', 'ico:46566023:strana_b',
      'ico:00156752:obstaravatel', 'ico:31300000:vitaz',
    ]);
    expect(await count(`SELECT COUNT(*) AS n FROM entity WHERE druh = 'statny_organ'`)).toBe(1);
    const again = await runDerive(env, 'entity');
    expect(again.inserted).toBe(0);
    expect(await count(`SELECT COUNT(*) AS n FROM record_entity`)).toBe(6);
  });

  it('fulltext: triggery pri INSERT, DELETE odstráni riadok z FTS, integrity-check prejde, prefix a fráza fungujú', async () => {
    await vloz(FIXTURE);
    expect(await count(`SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'zmluva'`)).toBe(2);
    expect(await count(`SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'školstv*'`)).toBe(1);
    expect(await count(`SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'skolstv*'`)).toBe(1); // bez diakritiky
    expect(await count(`SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH ?`, ftsFraza('Robert Fico'))).toBe(1);
    const najdene = await hladaj(env, 'rozpočet OR rozpočte');
    expect(najdene.map((r) => r.title)).toEqual(expect.arrayContaining(['Parlament rokuje o rozpočte', 'Fico: „Vláda schválila rozpočet na školstvo“']));

    const id = (await env.DB.prepare(`SELECT id FROM records WHERE external_id = 'g4'`).first<{ id: number }>())!.id;
    await env.DB.prepare(`DELETE FROM records WHERE id = ?`).bind(id).run();
    expect(await count(`SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'zmluva'`)).toBe(1);
    await env.DB.prepare(`UPDATE records SET title = 'Zmluva zmenená' WHERE external_id = 'g3'`).run();
    expect(await count(`SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'zmluva'`)).toBe(2);
    expect(await count(`SELECT COUNT(*) AS n FROM records_fts WHERE records_fts MATCH 'rozpočte'`)).toBe(0);
    const fts = await runDerive(env, 'fts');
    expect(fts).toMatchObject({ status: 'ok', seen: 10, detail: { match_zmluva: 2, match_skolstv: 1 } });
    await expect(env.DB.prepare(`INSERT INTO records_fts(records_fts) VALUES ('integrity-check')`).run()).resolves.toBeTruthy();
  });

  it('zdroje: seed médií, World Monitor a registrov; kanály mapujú feed → redakcia; ručné hodnotenie sa neprepíše', async () => {
    const seed = zdrojeZoSeedov();
    expect(seed.zdroje.length).toBeGreaterThanOrEqual(3 + 155 + 5);
    expect(seed.zdroje.find((z) => z.id === 'dennikn')).toMatchObject({ typ: 'medium', krajina: 'SK', outlet_id: 'dennik-n', sledovany: 1, nazov: 'Denník N' });
    expect(seed.kanaly.filter((k) => k.zdroj_id === 'dennikn').map((k) => k.feed_id).sort()).toEqual(['dennikn', 'dennikn_minuty_all']);
    const s = await runDerive(env, 'zdroje');
    expect(s.status).toBe('ok');
    expect(await count(`SELECT COUNT(*) AS n FROM zdroje`)).toBe(seed.zdroje.length);
    expect(await count(`SELECT COUNT(*) AS n FROM zdroj_kanaly`)).toBe(seed.kanaly.length);
    expect(await count(`SELECT COUNT(*) AS n FROM zdroje WHERE typ = 'register'`)).toBe(3);
    await env.DB.prepare(`UPDATE zdroje SET bias = 'stred', hodnotil = 'adam', url = 'https://x.sk' WHERE id = 'dennikn'`).run();
    await runDerive(env, 'zdroje');
    expect(await env.DB.prepare(`SELECT bias, hodnotil, url FROM zdroje WHERE id = 'dennikn'`).first()).toEqual({ bias: 'stred', hodnotil: 'adam', url: 'https://x.sk' });
  });

  it('pocty, pokrytie a meranie: iba sledované SK redakcie, deň v Bratislave, podiel z dňa, metriky s detailom', async () => {
    await vloz(FIXTURE);
    await runDerive(env, 'normalize');
    await runDerive(env, 'zdroje');
    const pocty = await runDerive(env, 'pocty');
    expect(pocty).toMatchObject({ seen: 11, inserted: 10 });
    expect(await env.DB.prepare(`SELECT riadkov FROM pocty WHERE source = 'crz'`).first()).toEqual({ riadkov: 2 });

    const pokrytie = await runDerive(env, 'pokrytie');
    expect(pokrytie).toMatchObject({ seen: 4, inserted: 4, detail: { dni: 2 } });
    const rows = await env.DB.prepare(`SELECT zdroj_id, den, zaznamov, podiel FROM zdroj_pokrytie_denne ORDER BY zdroj_id, den`).all();
    expect(rows.results).toEqual([
      { zdroj_id: 'aktuality', den: '2026-09-26', zaznamov: 1, podiel: 1 / 3 },
      { zdroj_id: 'dennikn', den: '2026-09-26', zaznamov: 1, podiel: 1 / 3 },
      { zdroj_id: 'dennikn', den: '2026-09-27', zaznamov: 1, podiel: 1 }, // 22:30 UTC = 27. 9. v Bratislave
      { zdroj_id: 'pravda', den: '2026-09-26', zaznamov: 1, podiel: 1 / 3 }, // bez dátumu → deň zberu
    ]);

    const m = await runDerive(env, 'meranie');
    expect(m).toMatchObject({ seen: 4, detail: { redakcii: 3, autorov: 3 } });
    const otazka = await env.DB.prepare(`SELECT hodnota, detail, algoritmus FROM meranie WHERE rozsah = 'zdroj' AND kluc = 'dennikn' AND den = '*' AND metrika = 'titulok_otazka_podiel'`).first<{ hodnota: number; detail: string; algoritmus: string }>();
    expect(otazka?.hodnota).toBe(0.5);
    expect(JSON.parse(otazka!.detail)).toEqual({ pocet: 1 });
    expect(otazka?.algoritmus).toMatch(/^meranie-v1\/politika-/);
    expect(await count(`SELECT COUNT(*) AS n FROM meranie WHERE rozsah = 'autor' AND kluc = 'dennikn|Juraj Helbich'`)).toBeGreaterThan(5);
    expect(await count(`SELECT COUNT(*) AS n FROM meranie WHERE kluc LIKE 'wm-%'`)).toBe(0);
    const poplasne = await env.DB.prepare(`SELECT detail FROM meranie WHERE kluc = 'dennikn' AND den = '*' AND metrika = 'poplasne_podiel'`).first<{ detail: string }>();
    expect(JSON.parse(poplasne!.detail).slova).toEqual(expect.arrayContaining([['kolaps', 1]]));
  });

  it('zmienky: aliasy sledovanej entity → record_entity (zmienka) cez fulltext; nesledovaná entita sa nehľadá', async () => {
    await vloz(FIXTURE);
    await env.DB.batch([
      env.DB.prepare(`INSERT INTO entity (id, druh, nazov, verejne, sledovane, sledovane_dovod, prvy_vyskyt, posledny_vyskyt) VALUES ('osoba:robert-fico', 'fyzicka_osoba', 'Robert Fico', 1, 1, 'predseda vlády', '2026-01-01', '2026-01-01')`),
      env.DB.prepare(`INSERT INTO entity_alias (entity_id, alias, zdroj) VALUES ('osoba:robert-fico', 'Fico', 'rucne'), ('osoba:robert-fico', 'Robert Fico', 'rucne')`),
      env.DB.prepare(`INSERT INTO entity (id, druh, nazov, verejne, sledovane, prvy_vyskyt, posledny_vyskyt) VALUES ('organ:parlament', 'statny_organ', 'Parlament', 1, 0, '2026-01-01', '2026-01-01')`),
      env.DB.prepare(`INSERT INTO entity_alias (entity_id, alias, zdroj) VALUES ('organ:parlament', 'Parlament', 'rucne')`),
    ]);
    await runDerive(env, 'normalize');
    const s = await runDerive(env, 'zmienky');
    expect(s).toMatchObject({ status: 'ok', seen: 2, inserted: 1, detail: { aliasov: 2 } });
    const z = await env.DB.prepare(`SELECT r.external_id, re.rola FROM record_entity re JOIN records r ON r.id = re.record_id WHERE re.entity_id = 'osoba:robert-fico'`).all();
    expect(z.results).toEqual([{ external_id: 'g1', rola: 'zmienka' }]);
    expect(await env.DB.prepare(`SELECT posledny_vyskyt FROM entity WHERE id = 'osoba:robert-fico'`).first()).toEqual({ posledny_vyskyt: '2026-09-26T17:40:03.000Z' });
    expect(await count(`SELECT COUNT(*) AS n FROM record_entity WHERE entity_id = 'organ:parlament'`)).toBe(0);
  });

  it('all: všetky kroky prejdú v poradí a zapíšu behy', async () => {
    await vloz(FIXTURE);
    const out = await runDeriveAll(env);
    expect(out.map((s) => s.krok)).toEqual([...DERIVE_KROKY]);
    expect(out.every((s) => s.status === 'ok')).toBe(true);
    expect(await count(`SELECT COUNT(*) AS n FROM runs WHERE source = 'derive' AND status = 'ok'`)).toBe(DERIVE_KROKY.length);
  });
});
