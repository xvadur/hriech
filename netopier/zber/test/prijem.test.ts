import { env as workerEnv } from 'cloudflare:workers';
import { beforeEach, describe, expect, it } from 'vitest';
import { runPrijem, stavPrijmu, ulozText } from '../src/prijem/index';
import { kanalyZRegistra, overRegister, zlucRegister, type ZdrojRegistra } from '../src/prijem/register';
import { parseRobots, robotsPovoluje } from '../src/prijem/robots';
import { dekodujTelo, htmlNaText, jsonLdClanok, vytiahniText } from '../src/prijem/text';
import { kanonUrl } from '../src/prijem/url';
import { parseFeed } from '../src/sources/rss';

const db = (workerEnv as unknown as { DB: D1Database }).DB;

async function n(sql: string, ...params: unknown[]): Promise<number> {
  const row = await db.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

async function vycisti() {
  await db.batch([
    db.prepare('DELETE FROM dokument_texty'),
    db.prepare('DELETE FROM dokument_vyskyty'),
    db.prepare('DELETE FROM dokument_entity'),
    db.prepare('DELETE FROM dokument_temy'),
    db.prepare('DELETE FROM udalost_dokumenty'),
    db.prepare('DELETE FROM dokumenty'),
    db.prepare('DELETE FROM hostitelia'),
    db.prepare('DELETE FROM records'),
    db.prepare('DELETE FROM runs'),
    db.prepare('DELETE FROM source_state'),
  ]);
}

beforeEach(vycisti);

const odsek = (i: number) =>
  `Odsek ${i}: Vláda na dnešnom rokovaní schválila návrh rozpočtu verejnej správy na budúci rok a ministerstvo financií zverejnilo podrobnosti o deficite, ktorý má klesnúť pod päť percent HDP.`;
const dlhyText = (tema: string) => Array.from({ length: 12 }, (_, i) => `${odsek(i)} Téma: ${tema}.`).join('\n\n');

const clanokJsonLd = (tema: string) => `<!doctype html><html><head><meta charset="utf-8"><title>${tema}</title>
<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    { '@type': 'WebPage', name: 'x' },
    { '@type': 'NewsArticle', headline: tema, author: [{ '@type': 'Person', name: 'Jana Redaktorová' }], datePublished: '2026-09-29T10:00:00+02:00', articleBody: dlhyText(tema) },
  ],
})}</script></head><body><article><p>Iba perex.</p></article></body></html>`;

const clanokHtml = (tema: string) => `<!doctype html><html><head><meta charset="utf-8"><title>${tema}</title></head><body>
<nav><a href="/">Domov</a> <a href="/svet">Svet</a></nav>
<article><h1>${tema}</h1>${Array.from({ length: 10 }, (_, i) => `<p>${odsek(i)} Kľúčové slovo ${tema}.</p>`).join('\n')}</article>
<footer>© Redakcia 2026</footer></body></html>`;

const rss = (polozky: Array<{ link: string; guid?: string; title: string; content?: string }>) => `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/"><channel><title>T</title>
${polozky
  .map(
    (p) => `<item><title>${p.title}</title><link>${p.link}</link>${p.guid ? `<guid>${p.guid}</guid>` : ''}
<pubDate>Tue, 29 Sep 2026 08:00:00 +0000</pubDate><description>Perex ${p.title}</description>
${p.content ? `<content:encoded><![CDATA[${p.content}]]></content:encoded>` : ''}</item>`,
  )
  .join('\n')}
</channel></rss>`;

const REGISTER: ZdrojRegistra[] = [
  { id: 'alfa', nazov: 'Alfa denník', typ: 'medium', url_web: 'https://alfa.test/', rss: ['https://alfa.test/feed'], jazyk: 'sk', cely_text_v_rss: false },
  { id: 'beta', nazov: 'Beta agentúra', typ: 'agentura', url_web: 'https://beta.test/', rss: ['https://beta.test/rss', 'https://beta.test/rss/domov'], jazyk: 'sk' },
  { id: 'gama', nazov: 'Gama bez RSS', typ: 'tv', url_web: 'https://gama.test/', rss: [], jazyk: 'sk' },
];

function web() {
  const volania: string[] = [];
  const hlavicky: Record<string, Record<string, string>> = {};
  const routes: Record<string, () => Response> = {
    'https://alfa.test/feed': () =>
      new Response(
        rss([
          { link: 'https://alfa.test/clanok-1/?utm_source=rss', guid: 'a1', title: 'Rozpočet schválený' },
          { link: 'https://alfa.test/clanok-2', guid: 'a2', title: 'Druhý článok' },
          { link: 'https://alfa.test/sukromne/3', guid: 'a3', title: 'Zakázaný robotmi' },
          { link: 'https://alfa.test/chyba-404', guid: 'a4', title: 'Zmazaný článok' },
          { link: 'https://alfa.test/cely-v-rss', guid: 'a5', title: 'Celý text v RSS', content: dlhyText('rss') },
        ]),
        { headers: { 'content-type': 'application/rss+xml; charset=utf-8', etag: '"v1"' } },
      ),
    'https://beta.test/rss': () =>
      new Response(rss([{ link: 'https://www.alfa.test/clanok-1/#komentare', guid: 'b1', title: 'Rozpočet schválený' }, { link: 'https://beta.test/spravy/9', guid: 'b9', title: 'Agentúrna správa' }]), {
        headers: { 'content-type': 'application/xml' },
      }),
    'https://beta.test/rss/domov': () => new Response(rss([{ link: 'https://beta.test/spravy/9', guid: 'b9', title: 'Agentúrna správa v rubrike' }]), { headers: { 'content-type': 'application/xml' } }),
    'https://alfa.test/robots.txt': () => new Response('User-agent: *\nDisallow: /sukromne/\nCrawl-delay: 0\n', { headers: { 'content-type': 'text/plain' } }),
    'https://beta.test/robots.txt': () => new Response('nie je', { status: 404 }),
    'https://alfa.test/clanok-1': () => new Response(clanokJsonLd('rozpocet'), { headers: { 'content-type': 'text/html; charset=utf-8' } }),
    'https://alfa.test/clanok-1/?utm_source=rss': () => new Response(clanokJsonLd('rozpocet'), { headers: { 'content-type': 'text/html; charset=utf-8' } }),
    'https://alfa.test/clanok-2': () => new Response(clanokHtml('druhy'), { headers: { 'content-type': 'text/html' } }),
    'https://alfa.test/chyba-404': () => new Response('preč', { status: 404 }),
    'https://beta.test/spravy/9': () => new Response(clanokJsonLd('rozpocet'), { headers: { 'content-type': 'text/html' } }),
  };
  const fetcher = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    volania.push(url);
    hlavicky[url] = Object.fromEntries(new Headers(init?.headers).entries());
    if (url === 'https://alfa.test/feed' && hlavicky[url]!['if-none-match'] === '"v1"') return new Response(null, { status: 304 });
    const route = routes[url];
    return route ? route() : new Response('nenájdené', { status: 404 });
  }) as typeof fetch;
  return { fetcher, volania, hlavicky };
}

const moznosti = (fetcher: typeof fetch) => ({ register: REGISTER, fetch: fetcher, userAgent: 'Netopier/test', sleep: async () => {}, rozostupMs: 0 });

describe('schéma 0004', () => {
  it('tabuľky, číselník typov, rozšírené meranie, pôvodné dáta merania ostali', async () => {
    for (const t of ['dokumenty', 'dokument_texty', 'dokument_vyskyty', 'dokument_entity', 'udalosti', 'udalost_dokumenty', 'udalost_entity', 'temy', 'dokument_temy', 'udalost_temy', 'hostitelia', 'dokument_typy']) {
      expect(await n(`SELECT COUNT(*) AS n FROM sqlite_master WHERE name = ?`, t)).toBe(1);
    }
    expect(await n(`SELECT COUNT(*) AS n FROM dokument_typy WHERE id IN ('clanok','prepis','hlasovanie','tlacova_sprava','minuta')`)).toBe(5);
    await db.prepare(`INSERT OR REPLACE INTO meranie VALUES ('dokument', '1', '2026-09-29', 'dlzka', 10, NULL, 'test', '2026-09-29')`).run();
    await expect(db.prepare(`INSERT INTO meranie VALUES ('nieco', '1', '*', 'x', 1, NULL, 't', 't')`).run()).rejects.toThrow();
    await expect(db.prepare(`INSERT INTO dokumenty (typ, zdroj_id, prvy_zaznam_at, aktualizovane_at) VALUES ('neexistuje', 'alfa', 'x', 'x')`).run()).rejects.toThrow();
  });

  it('fulltext sleduje titulok aj celý text (bez diakritiky), zmenu aj zmazanie', async () => {
    await db.prepare(`INSERT OR IGNORE INTO zdroje (id, nazov, typ, rozsah) VALUES ('alfa', 'Alfa', 'medium', 'narodny')`).run();
    const d = await db
      .prepare(`INSERT INTO dokumenty (typ, zdroj_id, url_kanon, titulok, perex, prvy_zaznam_at, aktualizovane_at) VALUES ('clanok', 'alfa', 'https://x.test/1', 'Školstvo v kríze', 'perex', 't', 't') RETURNING id`)
      .first<{ id: number }>();
    const match = (q: string) => n(`SELECT COUNT(*) AS n FROM dokumenty_fts WHERE dokumenty_fts MATCH ?`, q);
    expect(await match('skolstvo')).toBe(1);
    await ulozText(db, d!.id, `${dlhyText('nemocnica')} Žilinská nemocnica.`, 'readability', null, '2026-09-29T10:00:00Z');
    expect(await match('zilinska')).toBe(1);
    await ulozText(db, d!.id, `${dlhyText('letisko')} Košické letisko.`, 'readability', null, '2026-09-29T11:00:00Z');
    expect(await match('zilinska')).toBe(0);
    expect(await match('kosicke')).toBe(1);
    expect(await n(`SELECT verzia AS n FROM dokument_texty WHERE dokument_id = ?`, d!.id)).toBe(2);
    const neuplny = await ulozText(db, d!.id, `${dlhyText('letisko')} Košické letisko.`, 'readability', null, '2026-09-29T12:00:00Z', { neuplny: true });
    expect(neuplny.stav).toBe('kratky');
    expect(await n(`SELECT json_extract(data, '$.platene') AS n FROM dokumenty WHERE id = ?`, d!.id)).toBe(1);
    expect((await ulozText(db, d!.id, 'Krátka minúta.', 'readability', null, '2026-09-29T12:00:00Z', { minOk: 1 })).stav).toBe('ok');
    await ulozText(db, d!.id, `${dlhyText('letisko')} Košické letisko.`, 'readability', null, '2026-09-29T13:00:00Z');
    await db.prepare(`UPDATE dokumenty SET titulok = 'Zdravotníctvo' WHERE id = ?`).bind(d!.id).run();
    expect(await match('skolstvo')).toBe(0);
    expect(await match('zdravotnictvo AND kosicke')).toBe(1);
    await db.batch([db.prepare(`DELETE FROM dokument_texty WHERE dokument_id = ?`).bind(d!.id), db.prepare(`DELETE FROM dokumenty WHERE id = ?`).bind(d!.id)]);
    expect(await match('zdravotnictvo OR kosicke')).toBe(0);
    await db.prepare(`INSERT INTO dokumenty_fts(dokumenty_fts) VALUES ('integrity-check')`).run();
  });
});

describe('príjem: pomocné funkcie', () => {
  it('kanonická URL', () => {
    expect(kanonUrl('https://www.Alfa.test/clanok-1/?utm_source=rss&utm_medium=x#komentare')).toBe('https://alfa.test/clanok-1');
    expect(kanonUrl('http://alfa.test/a?b=2&a=1&fbclid=z')).toBe('https://alfa.test/a?a=1&b=2');
    expect(kanonUrl('https://alfa.test/')).toBe('https://alfa.test/');
    expect(kanonUrl('mailto:x@y.sk')).toBeNull();
    expect(kanonUrl('nezmysel')).toBeNull();
  });

  it('robots.txt: skupiny, najdlhšia zhoda, wildcard, crawl-delay', () => {
    const r = parseRobots('User-agent: Googlebot\nDisallow: /\n\nUser-agent: *\nDisallow: /search\nDisallow: /*.pdf$\nAllow: /search/verejne\nCrawl-delay: 2\n');
    expect(robotsPovoluje(r, 'https://x.sk/clanok')).toBe(true);
    expect(robotsPovoluje(r, 'https://x.sk/search?q=1')).toBe(false);
    expect(robotsPovoluje(r, 'https://x.sk/search/verejne/1')).toBe(true);
    expect(robotsPovoluje(r, 'https://x.sk/a/b.pdf')).toBe(false);
    expect(r.crawlDelay).toBe(2);
    const vlastna = parseRobots('User-agent: *\nDisallow:\n\nUser-agent: Netopier\nDisallow: /\n');
    expect(robotsPovoluje(vlastna, 'https://x.sk/clanok')).toBe(false);
    expect(robotsPovoluje(parseRobots(null), 'https://x.sk/cokolvek')).toBe(true);
  });

  it('text: JSON-LD articleBody v @graph, Readability, HTML na odseky, znaková sada', () => {
    const ld = jsonLdClanok(clanokJsonLd('test'));
    expect(ld!.autor).toBe('Jana Redaktorová');
    expect(ld!.text).toContain('Odsek 11');
    const zLd = vytiahniText(clanokJsonLd('test'), 'https://x.sk/1');
    expect(zLd!.metoda).toBe('jsonld');
    const zHtml = vytiahniText(clanokHtml('druhy'), 'https://x.sk/2');
    expect(zHtml!.metoda).toBe('readability');
    expect(zHtml!.text).toContain('Odsek 9');
    expect(zHtml!.text).not.toContain('Domov');
    expect(zHtml!.text).not.toContain('© Redakcia');
    expect(htmlNaText('<p>Prvý&nbsp;odsek</p><p>Druhý <b>odsek</b></p>')).toBe('Prvý odsek\n\nDruhý odsek');
    const platena = `<html><head><script type="application/ld+json">{"@type":"NewsArticle","isAccessibleForFree":"False","headline":"x"}</script></head><body>${clanokHtml('stena').replace(/<html>|<\/html>/g, '')}</body></html>`;
    expect(vytiahniText(platena, 'https://x.sk/3')).toMatchObject({ metoda: 'readability', platene: true });
    expect(zHtml!.platene).toBe(false);
    const cp1250 = new Uint8Array([0x9e, 0x6c, 0x74, 0x9d]); // „žltť“ vo windows-1250
    expect(dekodujTelo(cp1250, 'text/html; charset=windows-1250')).toBe('žltť');
  });

  it('YouTube Atom: popis z media:description, content:encoded ako celý obsah', () => {
    const yt = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/"><entry><id>yt:video:1</id><title>Video</title>
<link rel="alternate" href="https://www.youtube.com/watch?v=1"/><published>2026-09-29T08:00:00+00:00</published>
<media:group><media:title>Video</media:title><media:description>Popis videa o voľbách.</media:description></media:group></entry></feed>`;
    expect(parseFeed(yt)[0]).toMatchObject({ link: 'https://www.youtube.com/watch?v=1', summary: 'Popis videa o voľbách.', content: null });
    const [polozka] = parseFeed(rss([{ link: 'https://x.sk/1', title: 'T', content: '<p>Celý text</p>' }]));
    expect(polozka!.content).toBe('<p>Celý text</p>');
  });

  it('register: kontrola, kanály, zlúčenie so zálohou', () => {
    const { zdroje, chyby } = overRegister([...REGISTER, { id: 'alfa', nazov: 'dup' }, { nazov: 'bez id' }]);
    expect(zdroje).toHaveLength(3);
    expect(chyby).toHaveLength(2);
    const kanaly = kanalyZRegistra(zdroje);
    expect(kanaly.map((k) => k.feedId)).toEqual(['alfa', 'beta', 'beta_2']);
    expect(kanaly.find((k) => k.zdrojId === 'beta')!.typDokumentu).toBe('clanok');
    const typy = kanalyZRegistra([
      { id: 'p', nazov: 'P', typ: 'podcast', rss: ['https://p.test/rss'] },
      { id: 'y', nazov: 'Y', typ: 'medium', kategoria: 'youtube_kanal', rss: ['https://www.youtube.com/feeds/videos.xml?channel_id=x'] },
      { id: 'm', nazov: 'M', typ: 'statny_zdroj', rss: ['https://m.test/rss'] },
    ]);
    expect(typy.map((k) => k.typDokumentu)).toEqual(['epizoda', 'video', 'tlacova_sprava']);
    const existujuci = kanalyZRegistra([{ id: 'dennikn', nazov: 'N', typ: 'medium', rss: ['https://dennikn.sk/minuta/feed/?cat=2386'] }]);
    expect(existujuci[0]).toMatchObject({ feedId: 'dennikn_minuty_all', typDokumentu: 'minuta' });
    const zlucene = zlucRegister(zdroje, [
      { id: 'alfa', nazov: 'iná alfa', typ: 'medium', rss: ['https://x.test/'] },
      { id: 'alfa-2', nazov: 'rovnaká URL', typ: 'medium', rss: ['https://alfa.test/feed/'] },
      { id: 'gama', nazov: 'Gama', typ: 'tv', rss: ['https://gama.test/rss'], overene_at: '2026-09-29' },
      { id: 'delta', nazov: 'Delta', typ: 'medium', rss: ['https://delta.test/rss'] },
    ]);
    expect(zlucene.map((z) => z.id)).toEqual(['alfa', 'beta', 'gama', 'delta']);
    expect(zlucene.find((z) => z.id === 'alfa')!.rss).toEqual(['https://alfa.test/feed']);
    expect(zlucene.find((z) => z.id === 'gama')).toMatchObject({ nazov: 'Gama bez RSS', rss: ['https://gama.test/rss'] });
    expect(zlucene.find((z) => z.id === 'gama')!.poznamka).toContain('zálohy');
  });
});

describe('príjem: beh nad kanálmi', () => {
  it('prvý beh: dokumenty, deduplikácia URL, celé texty, robots, chyby; druhý beh nič nezdvojí', async () => {
    const w = web();
    const s1 = await runPrijem(db, moznosti(w.fetcher));
    expect(s1.kanalov).toBe(3);
    expect(s1.kanalov_ok).toBe(3);
    expect(s1.poloziek).toBe(8);
    // alfa 5 + beta 1 nový (článok 1 z bety je ten istý ako z alfy, správa 9 je v dvoch kanáloch bety)
    expect(s1.dokumenty_novych).toBe(6);
    expect(await n(`SELECT COUNT(*) AS n FROM dokumenty`)).toBe(6);
    expect(await n(`SELECT COUNT(*) AS n FROM dokument_vyskyty WHERE dokument_id = (SELECT id FROM dokumenty WHERE url_kanon = 'https://alfa.test/clanok-1')`)).toBe(2);
    expect(await n(`SELECT COUNT(*) AS n FROM records WHERE source = 'rss'`)).toBe(8);
    expect(s1.texty_z_rss).toBe(1);
    expect(s1.texty).toMatchObject({ ok: 3, zakazane: 1, nedostupne: 1 });
    const stav = (url: string) => db.prepare(`SELECT text_stav, duplikat_of, autor FROM dokumenty WHERE url_kanon = ?`).bind(url).first<Record<string, unknown>>();
    expect(await stav('https://alfa.test/clanok-1')).toMatchObject({ text_stav: 'ok', duplikat_of: null, autor: 'Jana Redaktorová' });
    expect(await stav('https://alfa.test/sukromne/3')).toMatchObject({ text_stav: 'zakazane' });
    expect(await stav('https://alfa.test/chyba-404')).toMatchObject({ text_stav: 'nedostupne' });
    expect(await stav('https://alfa.test/cely-v-rss')).toMatchObject({ text_stav: 'ok' });
    // agentúrna správa má rovnaký text ako článok alfy → obsahový duplikát
    const dup = await stav('https://beta.test/spravy/9');
    expect(dup!.duplikat_of).toBe(await n(`SELECT id AS n FROM dokumenty WHERE url_kanon = 'https://alfa.test/clanok-1'`));
    expect(s1.duplikaty_obsahu).toBe(1);
    expect(await n(`SELECT COUNT(*) AS n FROM dokument_texty WHERE metoda = 'rss'`)).toBe(1);
    expect(await n(`SELECT COUNT(*) AS n FROM dokument_texty WHERE metoda = 'readability'`)).toBe(1);
    expect(await n(`SELECT COUNT(*) AS n FROM dokumenty_fts WHERE dokumenty_fts MATCH 'deficite'`)).toBe(4);
    expect(w.volania.filter((u) => u.endsWith('/sukromne/3'))).toHaveLength(0);
    expect(await n(`SELECT COUNT(*) AS n FROM zdroje WHERE id IN ('alfa','beta','gama') AND aktualizovane_at IS NOT NULL`)).toBe(3);
    expect(await n(`SELECT COUNT(*) AS n FROM zdroj_kanaly WHERE feed_id IN ('alfa','beta','beta_2') AND url IS NOT NULL`)).toBe(3);
    expect(await n(`SELECT COUNT(*) AS n FROM runs WHERE source = 'prijem'`)).toBe(1);

    const clankovPred = w.volania.length;
    const s2 = await runPrijem(db, moznosti(w.fetcher));
    expect(s2.dokumenty_novych).toBe(0);
    expect(s2.dokumenty_zmenene).toBe(0);
    expect(await n(`SELECT COUNT(*) AS n FROM dokumenty WHERE titulok = 'Agentúrna správa'`)).toBe(1);
    expect(s2.records_novych).toBe(0);
    expect(s2.kanalov_304).toBe(1);
    expect(w.hlavicky['https://alfa.test/feed']!['if-none-match']).toBe('"v1"');
    expect(Object.values(s2.texty).reduce((a, b) => a + b, 0)).toBe(0);
    // druhý beh stiahol iba kanály (robots.txt je v cache 24 h)
    expect(w.volania.slice(clankovPred).sort()).toEqual(['https://alfa.test/feed', 'https://beta.test/rss', 'https://beta.test/rss/domov']);
    expect(await n(`SELECT COUNT(*) AS n FROM dokumenty`)).toBe(6);
    const p = await stavPrijmu(db);
    expect(p.duplicity).toMatchObject({ url_duplicit: 0, obsahovych_duplikatov: 1 });
  });

  it('podcast: text je popis z kanála, stránka ani zvuk sa nesťahujú', async () => {
    const volania: string[] = [];
    const fetcher = (async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      volania.push(url);
      if (url === 'https://p.test/rss') return new Response(rss([{ link: 'https://p.test/epizoda-1.mp3', guid: 'e1', title: 'Epizóda 1' }]), { headers: { 'content-type': 'application/xml' } });
      return new Response('x', { status: 500 });
    }) as typeof fetch;
    const s = await runPrijem(db, { ...moznosti(fetcher), register: [{ id: 'p', nazov: 'Podcast', typ: 'podcast', rss: ['https://p.test/rss'], jazyk: 'sk' }] });
    expect(s.dokumenty_novych).toBe(1);
    expect(await db.prepare(`SELECT typ, text_stav FROM dokumenty`).first()).toMatchObject({ typ: 'epizoda', text_stav: 'ok' });
    expect(await n(`SELECT COUNT(*) AS n FROM dokument_texty WHERE metoda = 'rss' AND text = 'Perex Epizóda 1'`)).toBe(1);
    expect(volania).toEqual(['https://p.test/rss']);
  });

  it('šablóna: rovnaký text pod rôznymi titulkami jedného zdroja sa zmaže, krátke a epizódy nie sú duplikáty', async () => {
    const sablona = `<html><body><article>${Array.from({ length: 8 }, (_, i) => `<p>Podmienky používania osobných údajov, bod ${i}: spracúvame údaje podľa nariadenia a zákona o ochrane osobných údajov.</p>`).join('')}</article></body></html>`;
    const fetcher = (async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === 'https://alfa.test/feed') return new Response(rss([{ link: 'https://alfa.test/p1', title: 'Prvý' }, { link: 'https://alfa.test/p2', title: 'Druhý' }]), { headers: { 'content-type': 'application/xml' } });
      if (url.endsWith('robots.txt')) return new Response('', { status: 404 });
      return new Response(sablona, { headers: { 'content-type': 'text/html' } });
    }) as typeof fetch;
    const s = await runPrijem(db, { ...moznosti(fetcher), register: [REGISTER[0]!] });
    expect(s.sablony).toBe(2);
    expect(await n(`SELECT COUNT(*) AS n FROM dokumenty WHERE text_stav = 'bez_textu' AND duplikat_of IS NULL AND obsah_hash IS NULL`)).toBe(2);
    expect(await n(`SELECT COUNT(*) AS n FROM dokument_texty`)).toBe(0);
    await db.prepare(`INSERT INTO dokumenty_fts(dokumenty_fts) VALUES ('integrity-check')`).run();
  });

  it('chyba kanála a sieťová chyba článku: záznam chyby, opakovanie až po odklade', async () => {
    let padaj = true;
    const fetcher = (async (input: RequestInfo | URL) => {
      const url = String(input instanceof Request ? input.url : input);
      if (url === 'https://alfa.test/feed') return new Response(rss([{ link: 'https://alfa.test/x', guid: 'x', title: 'X' }]), { headers: { 'content-type': 'application/xml' } });
      if (url.endsWith('robots.txt')) return new Response('', { status: 404 });
      if (url === 'https://alfa.test/x') {
        if (padaj) throw new Error('ECONNRESET');
        return new Response(clanokHtml('x'), { headers: { 'content-type': 'text/html' } });
      }
      return new Response('<html>nie je kanál</html>', { headers: { 'content-type': 'text/html' } });
    }) as typeof fetch;
    const s1 = await runPrijem(db, { ...moznosti(fetcher), register: REGISTER.slice(0, 2) });
    expect(s1.kanalov_chyba).toBe(2);
    expect(s1.texty).toMatchObject({ chyba: 1 });
    const d = await db.prepare(`SELECT text_stav, text_pokusy, text_dalsi_pokus_at FROM dokumenty`).first<Record<string, unknown>>();
    expect(d).toMatchObject({ text_stav: 'chyba', text_pokusy: 1 });
    expect(String(d!.text_dalsi_pokus_at) > s1.zaciatok).toBe(true);
    padaj = false;
    const s2 = await runPrijem(db, { ...moznosti(fetcher), register: REGISTER.slice(0, 2) });
    expect(Object.keys(s2.texty)).toHaveLength(0); // odklad ešte neuplynul
    const neskor = new Date(Date.now() + 3600_000);
    const s3 = await runPrijem(db, { ...moznosti(fetcher), register: REGISTER.slice(0, 2), now: () => neskor });
    expect(s3.texty).toMatchObject({ ok: 1 });
    expect(await n(`SELECT COUNT(*) AS n FROM source_state WHERE source = 'rss' AND last_error IS NOT NULL`)).toBe(2);
  });
});
