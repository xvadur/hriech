import { zipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { CRON_DAILY, CRON_FREQUENT, plan, planAll, worldFeedsDue } from '../src/plan';
import { nextCrzDay, parseCrzExport, unzipExport } from '../src/sources/crz';
import { AREAS, parcelToRecord, wfsUrl } from '../src/sources/kataster';
import { FEED_SETS, feedBatches, itemToRecord, parseFeed, stripHtml } from '../src/sources/rss';
import { dataUrl, parseCatalog } from '../src/sources/statistika';
import { noticeToRecord } from '../src/sources/ted';
import { inventoryRecords } from '../src/sources/worldmonitor';
import { bratislavaToIso, stableStringify, toIso } from '../src/util';
import { fixtures } from './fixtures';

describe('util', () => {
  it('stableStringify nezávisí od poradia kľúčov', () => {
    expect(stableStringify({ b: 1, a: { d: [1, { y: 2, x: 1 }], c: null } })).toBe(
      stableStringify({ a: { c: null, d: [1, { x: 1, y: 2 }] }, b: 1 }),
    );
  });

  it('bratislavaToIso rozlišuje letný a zimný čas a ignoruje nulové dátumy', () => {
    expect(bratislavaToIso('2026-09-24 10:38:51')).toBe('2026-09-24T10:38:51+02:00');
    expect(bratislavaToIso('2015-01-12 11:18:03')).toBe('2015-01-12T11:18:03+01:00');
    expect(bratislavaToIso('2026-03-29 03:30:00')).toBe('2026-03-29T03:30:00+02:00');
    expect(bratislavaToIso('0000-00-00')).toBeNull();
    expect(bratislavaToIso('')).toBeNull();
  });

  it('toIso prevedie RFC 822 aj ISO na UTC', () => {
    expect(toIso('Sat, 26 Sep 2026 16:00:00 +0200')).toBe('2026-09-26T14:00:00.000Z');
    expect(toIso('nezmysel')).toBeNull();
  });
});

describe('rss', () => {
  it('RSS 2.0: CDATA, entity, kategórie, guid, preskočí položku bez identity', () => {
    const items = parseFeed(fixtures.rss);
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({
      guid: 'https://example.sk/?p=1001',
      link: 'https://example.sk/1001/vlada-schvalila-rozpocet/',
      title: 'Vláda schválila rozpočet & ďalšie body',
      summary: 'Prvý odsek s tučným textom a entitou – pomlčkou.',
      published: '2026-09-26T17:06:25.000Z',
      author: 'Redaktor Testovací',
      categories: ['Domov', 'Politika'],
    });
    expect(items[1]!.title).toBe('Druhá správa bez guid');
    const feed = { id: 'test', name: 'Test', url: 'https://example.sk/feed/' };
    const records = items.map((item) => itemToRecord(feed, item));
    expect(records[0]!.externalId).toBe('test:https://example.sk/?p=1001');
    expect(records[1]!.externalId).toBe('test:https://example.sk/1002/druha-sprava/');
    expect(records[2]).toBeNull();
  });

  it('Atom: alternate link, HTML v titulku, autor, kategória', () => {
    const [entry] = parseFeed(fixtures.atom);
    expect(entry).toMatchObject({
      guid: 'tag:example.org,2026:1',
      link: 'https://example.org/a/1',
      title: 'Správa jedna',
      published: '2026-09-26T07:30:00.000Z',
      author: 'Autorka',
      categories: ['svet'],
    });
  });

  it('RSS 1.0 (RDF)', () => {
    const [item] = parseFeed(fixtures.rdf);
    expect(item).toMatchObject({ link: 'https://example.net/x', title: 'RDF položka', published: '2026-09-25T08:00:00.000Z' });
  });

  it('neznámy formát je chyba', () => {
    expect(() => parseFeed('<html><body>nie</body></html>')).toThrow(/Neznámy formát/);
  });

  it('stripHtml skracuje a čistí', () => {
    expect(stripHtml('<p>a&nbsp;b</p><script>x()</script>')).toBe('a b');
    expect(stripHtml('x'.repeat(50), 10)).toHaveLength(10);
  });

  it('sady kanálov: médiá z registra a svetové kanály z World Monitor, v dávkach po 25', () => {
    expect(FEED_SETS.media!.length).toBeGreaterThanOrEqual(4);
    expect(FEED_SETS.worldmonitor!.length).toBeGreaterThan(100);
    const ids = FEED_SETS.worldmonitor!.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(feedBatches('worldmonitor').every((b) => b.length <= 25)).toBe(true);
  });
});

describe('crz', () => {
  it('rozbalí ZIP a naparsuje zmluvy s prílohami', () => {
    const zip = zipSync({ '2026-09-24.xml': new TextEncoder().encode(fixtures.crzExport) });
    const records = parseCrzExport(unzipExport(zip));
    expect(records).toHaveLength(2);
    const first = records[0]!;
    expect(first).toMatchObject({
      externalId: '1686454',
      url: 'https://www.crz.gov.sk/1686454/',
      title: 'Dodatok k Zmluve o poskytovaní verejných služieb',
      publishedAt: '2015-01-12T11:18:03+01:00',
    });
    expect(first.data).toMatchObject({
      objednavatel: 'Regionálny úrad verejného zdravotníctva Žiar nad Hronom',
      objednavatel_ico: '17336104',
      dodavatel: 'Slovak Telekom, a.s.',
      dodavatel_ico: '35763469',
      suma_spolu: 0,
      datum_platnost_do: null,
    });
    const second = records[1]!;
    expect(second.data.suma_spolu).toBe(2560);
    expect(second.data.poznamka).toBe('platba štvrťročne+DPH');
    expect(second.data.prilohy).toEqual([
      expect.objectContaining({ id: '2979446', file: '7022586.pdf', url: 'https://www.crz.gov.sk/data/att/7022586.pdf' }),
      expect.objectContaining({ id: '2979447', size: 127903 }),
    ]);
  });

  it('nextCrzDay: bez kurzora včerajšok, inak ďalší deň, najviac 14 dní dozadu, nič keď je aktuálny', () => {
    const now = new Date('2026-09-26T05:20:00Z');
    expect(nextCrzDay(null, now)).toBe('2026-09-25');
    expect(nextCrzDay('2026-09-23', now)).toBe('2026-09-24');
    expect(nextCrzDay('2026-09-25', now)).toBeNull();
    expect(nextCrzDay('2026-01-01', now)).toBe('2026-09-12');
  });
});

describe('ted', () => {
  it('oznámenie → záznam so slovenským titulkom, obstarávateľom a víťazom', () => {
    const page = JSON.parse(fixtures.tedPage);
    const record = noticeToRecord(page.notices[0])!;
    expect(record.externalId).toMatch(/^\d+-2026$/);
    expect(record.url).toBe(`https://ted.europa.eu/sk/notice/-/detail/${record.externalId}`);
    expect(record.title).toMatch(/^Slovensko – /);
    expect(record.publishedAt).toMatch(/^2026-09-2\dT00:00:00\+02:00$/);
    expect(typeof record.data.obstaravatel).toBe('string');
    expect(Array.isArray(record.data.cpv)).toBe(true);
    expect(new Set(record.data.cpv as string[]).size).toBe((record.data.cpv as string[]).length);
    expect(noticeToRecord({})).toBeNull();
  });
});

describe('kataster', () => {
  it('parcela → záznam s verziou, výmerou a hashom geometrie', async () => {
    const collection = JSON.parse(fixtures.katasterWfs);
    const record = (await parcelToRecord(AREAS[0]!, collection.features[0]))!;
    expect(record.externalId).toMatch(/^\d{6}_[\d/]+\.C$/);
    expect(record.upstreamVersion).toMatch(/^\d{8}T/);
    expect(record.data.katastralne_uzemie).toBe(record.externalId.split('_')[0]);
    expect(record.data.register).toBe('C');
    expect(typeof record.data.vymera_m2).toBe('number');
    expect(record.data.geometria_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(record.url).toContain('zbgis.skgeodesy.sk');
  });

  it('WFS URL nesie bbox v CRS84 a stránkovanie', () => {
    const url = new URL(wfsUrl({ id: 'x', name: 'x', bbox: [17, 48, 17.1, 48.1] }, 1000));
    expect(url.searchParams.get('bbox')).toBe('17,48,17.1,48.1,urn:ogc:def:crs:OGC:1.3:CRS84');
    expect(url.searchParams.get('startIndex')).toBe('1000');
  });
});

describe('statistika', () => {
  it('katalóg → datasety s dimenziami a URL na celé dáta', () => {
    const catalog = parseCatalog(JSON.parse(fixtures.statistikaKatalog));
    const debt = catalog.find((e) => e.code === 'nu1061qs')!;
    expect(debt.dimensions).toEqual(['nu1061qs_rok', 'nu1061qs_stv', 'nu1061qs_ukaz']);
    expect(dataUrl(debt)).toBe('https://data.statistics.sk/api/v2/dataset/nu1061qs/all/all/all?lang=sk');
    expect(debt.update).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe('worldmonitor', () => {
  it('inventár outletov → záznamy s tierom a provenienciou', () => {
    const message = JSON.parse(fixtures.worldmonitorOutlets);
    const records = inventoryRecords('outlets-tier-1', message.result.structuredContent);
    expect(records).toHaveLength(2);
    expect(records[0]!.externalId).toBe(`outlet:${records[0]!.title}`);
    expect(records[0]!.data).toMatchObject({ tier: 1, query: 'outlets-tier-1' });
  });
});

describe('plan', () => {
  it('denný cron zaradí štátne zdroje, polhodinový médiá a každé 2 h svetové kanály', () => {
    expect(plan(CRON_DAILY, new Date()).map((j) => j.source)).toEqual(['crz', 'ted', 'statistika', 'kataster', 'worldmonitor']);
    const media = feedBatches('media').length;
    const world = feedBatches('worldmonitor').length;
    expect(plan(CRON_FREQUENT, new Date('2026-09-26T13:30:00Z'))).toHaveLength(media);
    expect(plan(CRON_FREQUENT, new Date('2026-09-26T14:00:00Z'))).toHaveLength(media + world);
    expect(worldFeedsDue(new Date('2026-09-26T15:00:00Z'))).toBe(false);
    expect(planAll()).toHaveLength(5 + media + world);
  });
});
