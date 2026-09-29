#!/usr/bin/env node
// Voľby 24. 10. 2026 nad lokálnou databázou (netopier/data/netopier.sqlite): seed územia a kalendára, stiahnutie oficiálnych zoznamov kandidátov,
// prieskumy, väzba na entity. Idempotentné — druhý beh nič nezdvojí, log hovorí, čo pribudlo.
// Použitie:
//   pnpm run volby                    # všetky kroky + počty
//   node scripts/volby-node.mjs uzemie|kalendar|kandidati|prieskumy|entity|pocty
// PDF číta PDFKit cez osascript (macOS); stiahnuté súbory sa cachujú v .wrangler/state/volby/.
import { execFile } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import { build } from 'esbuild';
import { lokalneEnv } from './lib/db.mjs';

const run = promisify(execFile);
const [krok = 'all'] = process.argv.slice(2);
const root = new URL('../', import.meta.url).pathname;
const outfile = `${root}.wrangler/tmp/volby-node.mjs`;
const cache = `${root}.wrangler/state/volby`;
await mkdir(cache, { recursive: true });

await build({
  entryPoints: [`${root}src/volby/index.ts`],
  bundle: true,
  format: 'esm',
  platform: 'node',
  outfile,
  logLevel: 'warning',
});
const { VOLBY_KROKY, defaultCtx, pocty, runVolby } = await import(outfile);

const jxa = `ObjC.import('Quartz');function run(a){const d=$.PDFDocument.alloc.initWithURL($.NSURL.fileURLWithPath(a[0]));return d.isNil()?'':d.string.js;}`;
let pdfCounter = 0;
async function pdfText(bytes) {
  const file = `${cache}/stiahnute-${Date.now()}-${pdfCounter++}.pdf`;
  await writeFile(file, bytes);
  try {
    const { stdout } = await run('osascript', ['-l', 'JavaScript', '-e', jxa, file], { maxBuffer: 16 * 1024 * 1024 });
    return stdout;
  } catch (e) {
    throw new Error(`PDFKit (osascript) zlyhal: ${e.message}`);
  }
}

/** Niektoré úrady (bbsk.sk) posielajú neúplný certifikačný reťazec — Node ho neoverí, curl na macOS áno. */
async function fetchAleboCurl(url, init) {
  try {
    return await fetch(url, init);
  } catch (e) {
    if (e?.cause?.code !== 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') throw e;
    const file = `${cache}/curl-${Date.now()}-${pdfCounter++}.bin`;
    const ua = init?.headers?.['user-agent'] ?? 'Netopier/2';
    const { stdout } = await run('curl', ['-sSL', '-A', ua, '--max-time', '30', '-o', file, '-w', '%{http_code}', url]);
    return new Response(await readFile(file), { status: Number(stdout) || 500 });
  }
}

const { env, dispose } = lokalneEnv();
try {
  const ctx = defaultCtx(env, { fetch: fetchAleboCurl, pdfText: process.platform === 'darwin' ? pdfText : null });
  if (krok !== 'pocty') {
    const kroky = krok === 'all' ? VOLBY_KROKY : [krok];
    for (const k of kroky) {
      const s = await runVolby(env, k, ctx);
      console.log(`${s.krok}: ${s.status} prešlo ${s.seen} pribudlo ${s.pribudlo}${s.detail ? ` ${JSON.stringify(s.detail)}` : ''}`);
    }
  }
  const p = await pocty(env);
  console.log(`počty: ${JSON.stringify(p)}`);
} finally {
  await dispose();
}
