#!/usr/bin/env node
// Lokálny zber jedného zdroja mimo workerd: rovnaký kód konektorov a archívu nad lokálnym
// SQLite súborom (netopier/data/netopier.sqlite, rozhranie D1) a surovými payloadmi v netopier/data/raw/.
// Použitie: node scripts/zber-node.mjs <zdroj> [kanal] [davka]
// Slúži na lokálne overenie a dobehnutie zdrojov, na ktorých lokálny workerd padá
// (napr. TLS data.statistics.sk). V cloude beží zber vo Workeri.
import { build } from 'esbuild';
import { lokalneEnv } from './lib/db.mjs';

const [source, channel, batch] = process.argv.slice(2);
if (!source) {
  console.error('Použitie: node scripts/zber-node.mjs <zdroj> [kanal] [davka]');
  process.exit(2);
}
const outfile = new URL('../.wrangler/tmp/zber-node.mjs', import.meta.url).pathname;
await build({ entryPoints: [new URL('../src/index.ts', import.meta.url).pathname], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'warning' });
const { runJob } = await import(outfile);
const { env, nasledne, dispose } = lokalneEnv();
try {
  const job = { source, ...(channel ? { channel } : {}), ...(batch ? { batch: Number(batch) } : {}) };
  const summaries = await runJob(env, job);
  for (const s of summaries) console.log(`${s.source}/${s.channel}: ${s.status} videné ${s.seen} nové ${s.inserted}${s.error ? ` — ${s.error}` : ''}`);
  for (const j of nasledne) console.log(`nasledná úloha (spusti ručne): ${JSON.stringify(j)}`);
} finally {
  await dispose();
}
