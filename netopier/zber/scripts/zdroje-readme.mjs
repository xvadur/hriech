#!/usr/bin/env node
/**
 * README registra zdrojov: čitateľný súhrn z `data/zdroje/register.json` a `seed.json`.
 * Počty sa nepíšu ručne — pri každom prepočte registra spusti `node scripts/zdroje-readme.mjs`.
 * Ručne písané časti (zmluva Mediaboardu, vysvetlivky) sú v `data/zdroje/README.hlavicka.md` a `README.pata.md`.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'zdroje');
const reg = JSON.parse(readFileSync(join(DIR, 'register.json'), 'utf8'));
const seed = JSON.parse(readFileSync(join(DIR, 'seed.json'), 'utf8'));
const seedById = new Map(seed.map((s) => [s.id, s]));
const read = (f) => (existsSync(join(DIR, f)) ? readFileSync(join(DIR, f), 'utf8').trimEnd() + '\n' : '');

const TYPY = ['medium', 'agentura', 'tv', 'radio', 'podcast', 'statny_zdroj', 'register', 'ine'];
const cnt = (arr, f) => arr.filter(f).length;
const table = (rows, head) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.join(' | ')} |`)].join('\n');

const hasRss = (r) => r.rss.length > 0;
const rows = TYPY.map((t) => {
  const g = reg.filter((r) => r.typ === t);
  return [t, g.length, cnt(g, hasRss), cnt(g, (r) => r.cely_text_v_rss), cnt(g, (r) => r.api), cnt(g, (r) => r.overene_at)];
}).filter((r) => r[1] > 0);
rows.push(['**spolu**', reg.length, cnt(reg, hasRss), cnt(reg, (r) => r.cely_text_v_rss), cnt(reg, (r) => r.api), cnt(reg, (r) => r.overene_at)]);

const kat = new Map();
for (const r of reg) kat.set(r.kategoria, (kat.get(r.kategoria) ?? 0) + 1);
const katRows = [...kat.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => [k, n, cnt(reg.filter((r) => r.kategoria === k), hasRss)]);

// čo sa nedá zbierať
const has = (r, re) => re.test(r.poznamka);
const blokovane = reg.filter((r) => has(r, /odmieta boty|web nedostupný/i) && !hasRss(r));
const bezRss = reg.filter((r) => !hasRss(r) && !has(r, /odmieta boty|web nedostupný/i) && r.overene_at && (r.typ !== 'register') && !r.api);
const nedostupne = reg.filter((r) => !r.overene_at);
const paywall = reg.filter((r) => has(r, /paywall: signály/));
const uaBlok = reg.filter((r) => has(r, /odmieta UA Netopier/));

const list = (arr, note) => (arr.length ? arr.map((r) => `- **${r.nazov}** (\`${r.id}\`)${note ? ' — ' + note(r) : ''}`).join('\n') : '_žiadne_');
const short = (r) => r.poznamka.replace(/^.*?(web nedostupný[^.]*\.|web odmieta[^.]*\.)/, '$1').slice(0, 160);

// Mediaboard
const mb = seed.filter((s) => s.mediaboard);
const mbReg = mb.map((s) => reg.find((r) => r.id === s.id)).filter(Boolean);
const mbRows = mb.map((s) => {
  const r = reg.find((x) => x.id === s.id);
  return [s.nazov, s.mediaboard, r?.rss.length ? 'áno' : 'nie', r?.cely_text_v_rss ? 'áno' : 'nie'];
});

const out = `${read('README.hlavicka.md')}
## Počty

Stav: ${reg[0]?.overene_at ? reg.map((r) => r.overene_at).filter(Boolean).sort().at(-1).slice(0, 10) : 'neoverené'}. „RSS“ = zdroj má aspoň jeden živý feed overený dotazom (platné XML, čerstvá položka).
„Celý text“ = text v RSS zodpovedá aspoň ~75 % textu článku (test na 3 článkoch); „API“ = zdroj má API alebo export.

${table(rows, ['typ', 'zdrojov', 's RSS', 'celý text v RSS', 's API', 'overené živým dotazom'])}

Podľa kategórie:

${table(katRows, ['kategória', 'zdrojov', 's RSS'])}

## Mediaboard — zmluva Úradu vlády SR

${table(mbRows, ['zdroj v zmluve', 'bod prílohy č. 1', 'RSS v registri', 'celý text v RSS'])}

Zdroje zo zmluvy s RSS: ${cnt(mbReg, hasRss)} z ${mb.length} položiek zaradených do registra.
${read('README.mediaboard.md')}
## Čo sa nedá (alebo nedá bez ďalšieho) zbierať

### Web alebo feed blokuje boty / je nedostupný
${list(blokovane, short)}

### Web funguje, ale nenašiel sa platný feed
${list(bezRss, short)}

### Neoverené (web neodpovedal)
${list(nedostupne, short)}

### Paywall (signály v HTML článkov)
${list(paywall, (r) => (r.poznamka.match(/paywall: signály[^.]*\\./) ?? [''])[0])}

### Odmietajú UA Netopier, ale pustia prehliadačový UA
${list(uaBlok)}

${read('README.pata.md')}`;
writeFileSync(join(DIR, 'README.md'), out);
console.log(`README: ${out.length} znakov`);
