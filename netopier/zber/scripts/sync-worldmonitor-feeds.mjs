#!/usr/bin/env node
// Vytiahne zoznam svetových RSS kanálov z kurátorovaného katalógu World Monitor
// (koala73/worldmonitor, src/config/feeds.ts, AGPL-3.0) do data/worldmonitor-feeds.json.
// Preberajú sa iba fakty (názov kanála, URL vydavateľa, jazyk), nie kód.
// Netopier potom číta kanály priamo od vydavateľov, nie cez World Monitor.
import { writeFile } from 'node:fs/promises';

const REPO = 'koala73/worldmonitor';
const CATEGORIES = ['politics', 'europe', 'middleeast', 'gov', 'thinktanks', 'crisis'];
const UA = 'Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)';

const commit = await (await fetch(`https://api.github.com/repos/${REPO}/commits/main`, { headers: { 'user-agent': UA } })).json();
const sha = commit.sha;
const src = await (await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/src/config/feeds.ts`, { headers: { 'user-agent': UA } })).text();

export function extractFeeds(source, categories) {
  const start = source.indexOf('export const FULL_FEEDS');
  const end = source.indexOf('\n};', start);
  if (start < 0 || end < 0) throw new Error('FULL_FEEDS sa v feeds.ts nenašlo');
  const block = source.slice(start, end);
  const out = [];
  let category = null;
  const entry = /\{\s*name:\s*(['"])((?:(?!\1).)*)\1,\s*url:\s*(?:\w+\()?\s*(['"])((?:(?!\3).)*)\3\s*\)?\s*(?:,\s*lang:\s*['"](\w+)['"])?/;
  for (const line of block.split('\n')) {
    const cat = line.match(/^ {2}([a-zA-Z]+): \[/);
    if (cat) { category = cat[1]; continue; }
    if (!category || !categories.includes(category)) continue;
    const m = line.match(entry);
    if (!m) continue;
    out.push({ category, name: m[2], url: m[4], lang: m[5] ?? 'en' });
  }
  return out;
}

const feeds = extractFeeds(src, CATEGORIES);
const seen = new Set();
const unique = feeds.filter((f) => (seen.has(f.url) ? false : seen.add(f.url)));
const slug = (s) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ids = new Set();
const withIds = unique.map((f) => {
  let id = `wm-${slug(f.name)}`;
  while (ids.has(id)) id += '-2';
  ids.add(id);
  return { id, ...f };
});

await writeFile(
  new URL('../data/worldmonitor-feeds.json', import.meta.url),
  JSON.stringify(
    {
      source: `https://github.com/${REPO}/blob/${sha}/src/config/feeds.ts`,
      license_note: 'Katalóg URL kanálov prevzatý z World Monitor (AGPL-3.0); kód sa nepreberá, kanály sa čítajú priamo od vydavateľov.',
      categories: CATEGORIES,
      synced_at: new Date().toISOString(),
      feeds: withIds,
    },
    null,
    2,
  ) + '\n',
);
console.log(`worldmonitor-feeds.json: ${withIds.length} kanálov (${CATEGORIES.join(', ')}) z ${sha.slice(0, 7)}`);
