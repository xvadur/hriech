#!/usr/bin/env node
// Národná rada SR (XDR-297) nad lokálnou databázou (netopier/data/netopier.sqlite): poslanci, kluby a výbory, zmeny v zložení, schôdze, hlasovania s hlasmi po
// poslancoch, parlamentné tlače, vystúpenia v rozprave. Idempotentné — druhý beh nič nezdvojí, log hovorí, čo pribudlo.
// Použitie:
//   pnpm run nrsr                                   # poslanci, zmeny, organy, schodze, hlasovania, tlace (aktuálne obdobie)
//   node scripts/nrsr-node.mjs hlasovania --schodza 61,62 --limit 20
//   node scripts/nrsr-node.mjs rozprava --schodza 61          # prepisy vystúpení (veľké: tisíce strán)
//   node scripts/nrsr-node.mjs pocty                          # iba počty
// Voľby: --obdobie N (default 9) · --schodza a,b,c · --limit N (strop nových záznamov) · --znova · --pauza ms medzi začiatkami požiadaviek (default 500) · --paralelne N súbežných detailov (default 4)
import { mkdir } from 'node:fs/promises';
import { build } from 'esbuild';
import { lokalneEnv } from './lib/db.mjs';

const argv = process.argv.slice(2);
const krok = argv[0] && !argv[0].startsWith('--') ? argv[0] : 'all';
const volba = (nazov) => {
  const i = argv.indexOf(`--${nazov}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const root = new URL('../', import.meta.url).pathname;
const outfile = `${root}.wrangler/tmp/nrsr-node.mjs`;
await mkdir(`${root}.wrangler/tmp`, { recursive: true });

await build({
  entryPoints: [`${root}src/nrsr/index.ts`],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  logLevel: 'warning',
});
const { NRSR_KROKY, NRSR_VSETKY_KROKY, defaultCtx, pocty, runNrsr, runNrsrAll } = await import(outfile);

const { env, dispose } = lokalneEnv();
try {
  const ctx = defaultCtx(env, {
    obdobie: Number(volba('obdobie') ?? 9),
    schodze: volba('schodza') ? volba('schodza').split(',').map(Number) : null,
    limit: volba('limit') ? Number(volba('limit')) : null,
    znova: argv.includes('--znova'),
    pauzaMs: Number(volba('pauza') ?? 500),
    paralelne: Number(volba('paralelne') ?? 4),
    log: (s) => console.log(`  ${s}`),
  });
  if (krok !== 'pocty') {
    const kroky = krok === 'all' ? NRSR_KROKY : krok === 'vsetko' ? NRSR_VSETKY_KROKY : [krok];
    const vysledky = kroky.length > 1 ? runNrsrAll(env, ctx, kroky) : runNrsr(env, kroky[0], ctx).then((s) => [s]);
    for (const s of await vysledky) console.log(`${s.krok}: ${s.status} prešlo ${s.seen} pribudlo ${s.pribudlo}${s.detail ? ` ${JSON.stringify(s.detail)}` : ''}`);
  }
  console.log(`počty: ${JSON.stringify(await pocty(env))}`);
} finally {
  await dispose();
}
