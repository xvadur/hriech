#!/usr/bin/env node
/**
 * Overenie zdrojov do registra (XDR-296): zo `data/zdroje/seed.json` urobí `data/zdroje/register.json`.
 * Každý zdroj sa overí živým dotazom: RSS (platný feed, počet položiek, frekvencia, dĺžka textu voči článku),
 * API (testovacia URL), paywall (signály v HTML článkov), WordPress REST.
 *
 *   node scripts/zdroje-overit.mjs                 # všetky zdroje
 *   node scripts/zdroje-overit.mjs --only=sme,pravda   # iba vybrané (ostatné ostanú z existujúceho registra)
 *
 * Nič sa nezapisuje mimo `data/zdroje/`. Do siete ide iba GET.
 */
import { XMLParser } from 'fast-xml-parser';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'zdroje');
const UA = 'Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)';
const UA_BROWSER = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')));
const ONLY = args.only ? new Set(args.only.split(',')) : null;
const CONC = Number(args.conc ?? 8);
const NOW = new Date();

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseTagValue: false,
  trimValues: true,
  processEntities: { enabled: true, maxTotalExpansions: 200000, maxExpandedLength: 20_000_000 },
  htmlEntities: true,
  isArray: (n) => ['item', 'entry', 'link'].includes(n),
});

/** Rozostup medzi dotazmi na rovnakú doménu (SME/Petit Press odpovedá 429 pri rýchlych dotazoch). */
const gates = new Map();
const GAP = (dom) => (dom === 'sme.sk' ? 3500 : 250);
async function gate(url) {
  let dom;
  try {
    dom = new URL(url).hostname.split('.').slice(-2).join('.');
  } catch {
    return;
  }
  const prev = gates.get(dom) ?? Promise.resolve();
  const mine = prev.then(() => new Promise((r) => setTimeout(r, GAP(dom))));
  gates.set(dom, mine);
  await prev;
}

async function get(url, { ua = UA, timeout = 20000, max = 3_000_000, accept = '*/*' } = {}) {
  await gate(url);
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': ua, accept, 'accept-language': 'sk,cs;q=0.8,en;q=0.5' },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeout),
    });
    const reader = res.body?.getReader();
    const chunks = [];
    let size = 0;
    if (reader) {
      while (size < max) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        size += value.length;
      }
      reader.cancel().catch(() => {});
    }
    const body = Buffer.concat(chunks).toString('utf8');
    return { ok: res.ok, status: res.status, url: res.url, ctype: res.headers.get('content-type') ?? '', body, ua };
  } catch (e) {
    return { ok: false, status: 0, url, ctype: '', body: '', error: String(e?.cause?.code ?? e?.message ?? e), ua };
  }
}

/** Skúsi poctivý UA; pri odmietnutí (403/401/429/503 alebo Cloudflare výzva) skúsi prehliadač a poznačí to. */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getSmart(url, opts = {}) {
  let r = await get(url, opts);
  for (const wait of [6000, 15000]) {
    if (r.status !== 429) break;
    await sleep(wait);
    r = await get(url, opts);
  }
  const blocked = [401, 403, 429, 503].includes(r.status) || /Just a moment|cf-chl|Attention Required/i.test(r.body.slice(0, 3000));
  if (!blocked) return r;
  const r2 = await get(url, { ...opts, ua: UA_BROWSER });
  if (r2.ok && !/Just a moment|cf-chl/i.test(r2.body.slice(0, 3000))) return { ...r2, uaBlocked: true };
  return { ...r, uaBlocked: true, stillBlocked: true };
}

const stripHtml = (s) =>
  String(s ?? '')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const txt = (v) => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return txt(v[0]);
  if (typeof v === 'object') return txt(v['#text'] ?? '');
  return String(v);
};

/** Feed → {kind, title, items:[{title,link,date,textLen,descLen,full}]} alebo null. */
function parseFeed(body) {
  if (!/<(rss|feed|rdf:RDF)[\s>]/i.test(body.slice(0, 3000)) && !/<(rss|feed|rdf:RDF)[\s>]/i.test(body)) return null;
  let x;
  try {
    x = parser.parse(body);
  } catch {
    return null;
  }
  const root = x.rss?.channel ?? x.feed ?? x['rdf:RDF'];
  if (!root) return null;
  const rawItems = (x.rss?.channel?.item ?? x.feed?.entry ?? x['rdf:RDF']?.item ?? []).slice(0, 60);
  const kind = x.rss ? 'rss' : x.feed ? 'atom' : 'rdf';
  const items = rawItems.map((it) => {
    const linkRaw = it.link;
    let link = '';
    if (Array.isArray(linkRaw)) {
      const alt = linkRaw.find((l) => typeof l === 'object' && (!l['@_rel'] || l['@_rel'] === 'alternate')) ?? linkRaw[0];
      link = typeof alt === 'string' ? alt : alt?.['@_href'] ?? alt?.['#text'] ?? '';
    } else link = txt(linkRaw);
    if (!link) link = txt(it.guid);
    const full = txt(it['content:encoded'] ?? it.content ?? '');
    const desc = txt(it.description ?? it.summary ?? it['media:group']?.['media:description'] ?? it['media:description'] ?? '');
    const fullText = stripHtml(full);
    const descText = stripHtml(desc);
    const date = txt(it.pubDate ?? it.published ?? it.updated ?? it['dc:date'] ?? '');
    return {
      title: stripHtml(txt(it.title)),
      link: link.trim(),
      date: date ? new Date(date) : null,
      textLen: Math.max(fullText.length, descText.length),
      hasFull: fullText.length > 0,
      descLen: descText.length,
    };
  });
  return { kind, title: stripHtml(txt(root.title)), items };
}

function median(a) {
  if (!a.length) return 0;
  const s = [...a].sort((p, q) => p - q);
  return s[Math.floor(s.length / 2)];
}

function freq(items) {
  const d = items.map((i) => i.date).filter((x) => x && !isNaN(x)).sort((a, b) => a - b);
  if (d.length < 2) return { newest: d.at(-1) ?? null, perDay: null, days: null };
  const span = (d.at(-1) - d[0]) / 86400000;
  return { newest: d.at(-1), perDay: span > 0 ? (d.length - 1) / span : null, days: span };
}

function articleInfo(html) {
  const clean = html.replace(/<script(?![^>]*ld\+json)[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<nav[\s\S]*?<\/nav>|<footer[\s\S]*?<\/footer>|<aside[\s\S]*?<\/aside>/gi, ' ');
  const pLen = (h) => {
    let n = 0;
    for (const m of h.matchAll(/<p[\s>][\s\S]*?<\/p>/gi)) {
      const t = stripHtml(m[0]);
      if (t.length >= 40) n += t.length;
    }
    return n;
  };
  const arts = [...clean.matchAll(/<article[\s\S]*?<\/article>/gi)].map((m) => m[0]);
  const artText = arts.sort((x, y) => pLen(y) - pLen(x))[0] ?? clean;
  let len = pLen(artText);
  if (len === 0) len = pLen(clean);
  const art = artText;
  const signals = [];
  for (const m of html.matchAll(/<script[^>]+ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    if (/"isAccessibleForFree"\s*:\s*(false|"false"|"False")/.test(m[1])) signals.push('ld+json isAccessibleForFree=false');
  }
  if (/class="[^"]*(paywall|premium-content|locked-content|is-locked|content-locked)/i.test(html)) signals.push('trieda paywall/locked');
  if (/(len pre predplatiteľov|pre predplatiteľov|Odomknite (celý )?článok|Pokračovanie (článku )?(je )?(len )?pre|Čítajte ďalej s predplatným)/i.test(stripHtml(art))) signals.push('text o predplatnom');
  return { len, signals: [...new Set(signals)] };
}

const ABS = (base, href) => {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
};

function altHost(u) {
  try {
    const x = new URL(u);
    x.hostname = x.hostname.startsWith('www.') ? x.hostname.slice(4) : 'www.' + x.hostname;
    return x.toString();
  } catch {
    return null;
  }
}

async function discoverFeeds(webUrl) {
  let r = await getSmart(webUrl, { accept: 'text/html' });
  const dead = !r.ok && (r.status === 0 || r.status === 404 || r.status >= 500);
  if (dead) {
    const alt = altHost(webUrl);
    const r2 = alt ? await getSmart(alt, { accept: 'text/html' }) : null;
    if (r2?.ok) r = r2;
  }
  const out = { home: r, feeds: [], wpApi: false };
  if (!r.ok) return out;
  for (const m of r.body.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0];
    if (!/rel=["']?alternate/i.test(tag)) continue;
    if (!/type=["']?application\/(rss|atom)\+xml/i.test(tag)) continue;
    const h = tag.match(/href=["']([^"']+)["']/i)?.[1];
    if (!h) continue;
    const u = ABS(r.url, h.replace(/&amp;/g, '&'));
    if (u && !/comment/i.test(u)) out.feeds.push(u);
  }
  out.wpApi = /rel=["']https:\/\/api\.w\.org\/["']/i.test(r.body) || /\/wp-json\//i.test(r.body.slice(0, 200000));
  return out;
}

/** Odkazy na stránky „RSS“ z domovskej stránky → adresy feedov, ktoré tam sú vypísané (napr. teraz.sk/rss). */
async function feedsFromRssPages(home) {
  const found = new Set();
  const pages = new Set();
  for (const m of home.body.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)) {
    const href = m[1].replace(/&amp;/g, '&');
    const label = stripHtml(m[2]);
    if (/(^|\/)(rss|feed|atom|kanaly-rss|rss-kanaly)[\/?.-]|\/rss(\/|$|\?)|rss-info/i.test(href) || /^rss$/i.test(label)) {
      const u = ABS(home.url, href);
      if (u && new URL(u).host === new URL(home.url).host && !/\.(xml|rss)$/i.test(u)) pages.add(u);
    }
  }
  for (const pu of [...pages].slice(0, 3)) {
    const r = await getSmart(pu, { accept: 'text/html' });
    if (!r.ok) continue;
    if (parseFeed(r.body)) {
      found.add(pu);
      continue;
    }
    for (const m of r.body.matchAll(/(?:href=["']|["'\s(])((?:https?:)?\/\/[^"'\s<>\\)]+\.(?:rss|xml)|\/[^"'\s<>\\)]*\.(?:rss|xml)|[^"'\s<>\\)]*\/(?:rss|feed)\/[^"'\s<>\\)]+)/gi)) {
      const u = ABS(r.url, m[1].replace(/&amp;/g, '&'));
      if (u && !/sitemap|\.(js|css)/i.test(u)) found.add(u);
    }
  }
  return [...found].slice(0, 10);
}

const COMMON = ['/rss', '/rss/', '/feed', '/feed/', '/rss.xml', '/feed.xml', '/atom.xml', '/rss/all', '/rss/xml', '/rss/spravy'];

async function checkFeed(url) {
  const r = await getSmart(url, { accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*' });
  if (!r.ok) return { url, ok: false, why: r.status ? `HTTP ${r.status}` : r.error, r };
  const f = parseFeed(r.body);
  if (!f) return { url, ok: false, why: `nie je feed (${r.ctype.split(';')[0] || 'bez typu'})`, r };
  if (!f.items.length) return { url, ok: false, why: 'feed bez položiek', r };
  return { url, ok: true, r, feed: f };
}

const dayStr = (d) => (d ? d.toISOString().slice(0, 10) : '?');

async function probeArticles(f, n = 3) {
  const links = f.items.filter((i) => i.link.startsWith('http')).slice(0, n);
  const out = [];
  for (const it of links) {
    const r = await getSmart(it.link, { accept: 'text/html', timeout: 20000, max: 2_500_000 });
    if (!r.ok) {
      out.push({ rssLen: it.textLen, fail: r.status || r.error });
      continue;
    }
    out.push({ rssLen: it.textLen, ...articleInfo(r.body) });
  }
  return out;
}

async function probeSource(s) {
  const now = NOW.toISOString();
  const notes = [];
  const res = {
    id: s.id,
    nazov: s.nazov,
    typ: s.typ,
    url_web: s.url_web,
    rss: [],
    api: null,
    cely_text_v_rss: false,
    jazyk: s.jazyk ?? 'sk',
    kategoria: s.kategoria,
    overene_at: null,
    poznamka: '',
  };
  const hints = s.rss ?? [];
  const wantFeed = s.probe !== 'web';
  let home = null;
  let discovered = [];
  let wpApi = false;
  if (s.url_web && s.probe !== 'none' && s.probe !== 'rssonly') {
    const d = await discoverFeeds(s.url_web);
    home = d.home;
    discovered = d.feeds;
    wpApi = d.wpApi;
    if (home.ok) res.overene_at = now;
    else notes.push(`web nedostupný (${home.status ? 'HTTP ' + home.status : home.error})`);
    if (home.uaBlocked && home.ok) notes.push('web odmieta UA Netopier, pustí prehliadačový UA');
    if (home.uaBlocked && !home.ok) notes.push('web odmieta boty (403/výzva)');
  }
  let feedResults = [];
  if (wantFeed) {
    const cand = [...new Set([...hints, ...discovered])];
    const tried = new Set();
    for (const u of cand.slice(0, 8)) {
      tried.add(u);
      feedResults.push(await checkFeed(u));
    }
    if (!feedResults.some((x) => x.ok) && home?.ok) {
      for (const u of await feedsFromRssPages(home)) {
        if (tried.has(u)) continue;
        tried.add(u);
        feedResults.push(await checkFeed(u));
      }
    }
    if (!feedResults.some((x) => x.ok) && s.url_web && s.probe !== 'none' && s.probe !== 'rssonly' && (home?.ok || !home)) {
      const base = new URL(home?.ok ? home.url : s.url_web).origin;
      for (const p of COMMON) {
        const u = base + p;
        if (tried.has(u)) continue;
        const c = await checkFeed(u);
        feedResults.push(c);
        if (c.ok) break;
      }
    }
  }
  const okFeeds = feedResults.filter((x) => x.ok);
  const stale = [];
  const usable = [];
  for (const fr of okFeeds) {
    const fq = freq(fr.feed.items);
    const ageDays = fq.newest ? (NOW - fq.newest) / 86400000 : null;
    if (ageDays != null && ageDays > 30) stale.push(`${fr.url} (posledná položka ${dayStr(fq.newest)})`);
    else usable.push({ fr, fq });
  }
  if (!res.overene_at && feedResults.some((x) => x.r?.ok)) res.overene_at = now;
  // dedupe feedov s rovnakými položkami (napr. /feed a /rss/)
  const seenSig = new Set();
  const uniq = [];
  for (const u of usable) {
    const sig = u.fr.feed.items.slice(0, 3).map((i) => i.link).join('|');
    if (seenSig.has(sig)) continue;
    seenSig.add(sig);
    uniq.push(u);
  }
  res.rss = uniq.map((u) => u.fr.url);
  if (uniq.length) {
    const main = uniq[0];
    const { fr, fq } = main;
    const n = fr.feed.items.length;
    const medLen = median(fr.feed.items.map((i) => i.textLen));
    const per = fq.perDay != null ? `${fq.perDay >= 10 ? Math.round(fq.perDay) : fq.perDay.toFixed(1)}/deň` : 'frekvencia nezistená';
    notes.push(`Feed ${fr.feed.kind}: ${n} pol., ${per}, posledná ${dayStr(fq.newest)}${uniq.length > 1 ? `, feedov ${uniq.length}` : ''}`);
    if (fr.r.uaBlocked) notes.push('feed odmieta UA Netopier, pustí prehliadačový UA');
    // celý text: porovnanie s článkom
    const arts = s.typ === 'podcast' ? [] : await probeArticles(fr.feed, 3);
    let full;
    const okArts = arts.filter((a) => !a.fail && a.len > 0);
    if (s.typ === 'podcast') {
      full = false;
      const kinds = [];
      if (uniq.some((u) => /youtube\.com/.test(u.fr.url))) kinds.push('YouTube feed: iba popis videa, prepis cez yt-dlp titulky');
      if (uniq.some((u) => !/youtube\.com/.test(u.fr.url))) kinds.push('zvukový feed: zvuk (enclosure) a popis epizódy, bez prepisu');
      notes.push(kinds.join('; '));
    } else if (okArts.length) {
      const good = okArts.filter((a) => a.rssLen >= 0.75 * a.len && a.rssLen >= 500).length;
      const share = Math.round((100 * fr.feed.items.filter((i) => i.textLen >= 1000).length) / n);
      full = good >= Math.ceil(okArts.length / 2) && medLen >= 600;
      notes.push(`text v RSS: medián ${medLen} zn., ${share} % položiek ≥ 1000 zn.; oproti článku ${okArts.map((a) => `${a.rssLen}/${a.len}`).join(', ')}${good && !full ? ' (časť položiek má celý text, ale nie väčšina)' : ''}`);
    } else {
      full = medLen >= 2500;
      notes.push(`text v RSS: medián ${medLen} zn. (článok sa nepodarilo stiahnuť${arts.length ? ': ' + arts.map((a) => a.fail).join(', ') : ''}) — celý text ${full ? 'pravdepodobný' : 'nepotvrdený'}`);
    }
    res.cely_text_v_rss = full;
    if (arts.length) {
      const pw = arts.filter((a) => a.signals?.length);
      if (pw.length) notes.push(`paywall: signály u ${pw.length}/${arts.length} článkov (${[...new Set(pw.flatMap((a) => a.signals))].join('; ')})`);
      else if (okArts.length) notes.push(`paywall: nezistený (0/${okArts.length} článkov)`);
      else notes.push('paywall: neoverené (články nedostupné)');
    }
  } else if (wantFeed) {
    const why = feedResults.filter((x) => !x.ok).length ? feedResults.filter((x) => !x.ok).map((x) => `${x.url.replace(/^https?:\/\//, '')} → ${x.why}`).slice(0, 4).join('; ') : 'žiadny kandidát';
    notes.push(`RSS: nenájdený platný feed (${why})`);
  }
  if (stale.length) notes.push(`neaktívny feed: ${stale.join('; ')}`);
  // API
  const api = [];
  if (s.api) {
    if (s.api_test) {
      const t = await getSmart(s.api_test, { accept: 'application/json, application/xml, */*', max: 500_000 });
      if (t.ok) {
        api.push(s.api);
        notes.push(`API overené (${t.status}, ${t.ctype.split(';')[0]})`);
      } else notes.push(`API neoverené: ${s.api_test} → ${t.status ? 'HTTP ' + t.status : t.error}`);
    } else {
      api.push(s.api);
      notes.push('API podľa dokumentácie, neoverené živým dotazom');
    }
  }
  if (s.url_web && home?.ok && wpApi && !s.api) {
    const origin = new URL(home.url).origin;
    const wp = `${origin}/wp-json/wp/v2/posts?per_page=3`;
    const r = await get(wp, { accept: 'application/json', max: 800_000 });
    if (r.ok && r.body.trim().startsWith('[')) {
      try {
        const j = JSON.parse(r.body);
        const len = median(j.map((p) => stripHtml(p.content?.rendered ?? '').length));
        api.push(`${origin}/wp-json/wp/v2/posts`);
        notes.push(`WordPress REST otvorené (medián ${len} zn. v content.rendered)`);
      } catch {
        /* nie JSON */
      }
    }
  }
  res.api = api.length ? api.join(' | ') : null;
  if (s.mediaboard) notes.push(s.mediaboard.startsWith('2024:') ? `Mediaboard (zmluva ÚV SR 821/2024${s.mediaboard.slice(5)}; v zmluve 130/2026 už nie je)` : `Mediaboard (zmluva ÚV SR 130/2026, príloha č. 1, bod ${s.mediaboard})`);
  const seedNote = s.poznamka ? s.poznamka + ' ' : '';
  res.poznamka = (seedNote + notes.join('. ') + (notes.length ? '.' : '')).trim();
  return res;
}

async function pool(items, worker, n) {
  const out = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) {
        const k = i++;
        try {
          out[k] = await worker(items[k], k);
        } catch (e) {
          out[k] = { error: String(e) };
        }
        process.stderr.write(`\r${k + 1}/${items.length} ${items[k].id}                    `);
      }
    }),
  );
  process.stderr.write('\n');
  return out;
}

const seed = JSON.parse(readFileSync(args.seed ?? join(DIR, 'seed.json'), 'utf8'));
const regPath = args.out ?? join(DIR, 'register.json');
const old = existsSync(regPath) ? JSON.parse(readFileSync(regPath, 'utf8')) : [];
const oldById = new Map(old.map((r) => [r.id, r]));
const todo = seed.filter((s) => !ONLY || ONLY.has(s.id));
const results = await pool(todo, probeSource, CONC);
const byId = new Map(results.map((r) => [r.id, r]));
const merged = seed.map((s) => {
  const r = byId.get(s.id);
  if (r && !r.error) return r;
  if (r?.error) console.error('CHYBA', s.id, r.error);
  return oldById.get(s.id) ?? { id: s.id, nazov: s.nazov, typ: s.typ, url_web: s.url_web, rss: [], api: null, cely_text_v_rss: false, jazyk: s.jazyk ?? 'sk', kategoria: s.kategoria, overene_at: null, poznamka: 'neoverené (chyba pri overení)' };
});
writeFileSync(regPath, JSON.stringify(merged, null, 2) + '\n');
console.log(`register: ${merged.length} zdrojov, s platným RSS ${merged.filter((r) => r.rss.length).length}`);
