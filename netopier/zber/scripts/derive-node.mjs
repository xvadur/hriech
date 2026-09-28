#!/usr/bin/env node
// Odvodenie nad lokálnou D1 mimo workerd: rovnaký kód ako vo Workeri, D1 z .wrangler/state.
// Použitie:
//   node scripts/derive-node.mjs all                 # všetky kroky v poradí
//   node scripts/derive-node.mjs normalize|entity|zdroje|fts|pocty|pokrytie|zmienky|meranie
//   node scripts/derive-node.mjs hladaj "zmluva"     # fulltext (FTS5: slovo, "fráza", prefix*)
import { build } from 'esbuild';
import { getPlatformProxy } from 'wrangler';

const [krok, ...rest] = process.argv.slice(2);
if (!krok) {
  console.error('Použitie: node scripts/derive-node.mjs <all|krok|hladaj> [dopyt]');
  process.exit(2);
}
const outfile = new URL('../.wrangler/tmp/derive-node.mjs', import.meta.url).pathname;
await build({ entryPoints: [new URL('../src/derive/index.ts', import.meta.url).pathname], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'warning' });
const { DERIVE_KROKY, hladaj, runDerive } = await import(outfile);
const { env, dispose } = await getPlatformProxy({ persist: true });
try {
  if (krok === 'hladaj') {
    const dopyt = rest.join(' ');
    if (!dopyt) throw new Error('Chýba dopyt.');
    for (const r of await hladaj(env, dopyt, 20)) console.log(`${r.id}\t${r.source}/${r.channel}\t${r.published_at_utc ?? '-'}\t${r.title ?? ''}\t${r.url ?? ''}`);
  } else {
    const kroky = krok === 'all' ? DERIVE_KROKY : [krok];
    for (const k of kroky) {
      const s = await runDerive(env, k);
      console.log(`${s.krok}: ${s.status} prešlo ${s.seen} zapísalo ${s.inserted}${s.detail ? ` ${JSON.stringify(s.detail)}` : ''}`);
    }
  }
} finally {
  await dispose();
}
