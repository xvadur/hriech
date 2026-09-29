#!/usr/bin/env node
// Príjem RSS s celými textmi (XDR-299) nad lokálnym SQLite súborom. Príkaz pre službu (každých 2–5 minút).
// Register: zber/data/zdroje/register.json (XDR-296); kým neexistuje, zber/data/prijem-zaloha.json.
// Log: riadok na výstup + JSON riadok do netopier/data/log/prijem.jsonl. Zámok: netopier/data/prijem.lock (beh sa neprekrýva).
// Použitie:
//   node scripts/prijem-node.mjs                     # kanály + celé texty
//   node scripts/prijem-node.mjs --bez-textov        # iba kanály
//   node scripts/prijem-node.mjs --max-textov 300 --max-na-host 40 --rozostup 1500
//   node scripts/prijem-node.mjs --stav              # iba počty v databáze
//   node scripts/prijem-node.mjs --register <súbor>  # iný register (napr. zmrazená kópia)
import { appendFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { build } from 'esbuild';
import { DB_CESTA, lokalneEnv } from './lib/db.mjs';

const args = process.argv.slice(2);
const cislo = (meno, predvolene) => {
  const i = args.indexOf(meno);
  return i >= 0 && args[i + 1] ? Number(args[i + 1]) : predvolene;
};
const zber = new URL('../', import.meta.url).pathname;
const dataDir = dirname(DB_CESTA);
const zamok = join(dataDir, 'prijem.lock');
const logSubor = join(dataDir, 'log', 'prijem.jsonl');

function nacitajRegister(overRegister, zlucRegister) {
  const i = args.indexOf('--register');
  const registerCesta = i >= 0 && args[i + 1] ? args[i + 1] : join(zber, 'data/zdroje/register.json');
  const zalohaCesta = join(zber, 'data/prijem-zaloha.json');
  const nacitaj = (cesta) => {
    if (!existsSync(cesta)) return [];
    const { zdroje, chyby } = overRegister(JSON.parse(readFileSync(cesta, 'utf8')));
    for (const c of chyby) console.warn(`${cesta.replace(zber, '')}: ${c}`);
    return zdroje;
  };
  const register = nacitaj(registerCesta);
  const zaloha = nacitaj(zalohaCesta);
  if (!register.length && !zaloha.length) throw new Error(`Register zdrojov chýba (${registerCesta})`);
  const spolu = zlucRegister(register, zaloha);
  return { zdroje: spolu, popis: `register ${register.length}, záloha doplnila ${spolu.length - register.length}` };
}

function beziIny() {
  if (!existsSync(zamok)) return false;
  const pid = Number(readFileSync(zamok, 'utf8'));
  try {
    process.kill(pid, 0);
    return pid;
  } catch {
    return false; // zámok po spadnutom behu
  }
}

mkdirSync(join(dataDir, 'log'), { recursive: true });
const outfile = join(zber, '.wrangler/tmp/prijem-node.mjs');
await build({ entryPoints: [join(zber, 'src/prijem/index.ts')], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'warning' });
const { overRegister, zlucRegister, runPrijem, stavPrijmu } = await import(outfile);

const { env, dispose } = lokalneEnv();
try {
  if (args.includes('--stav')) {
    console.log(JSON.stringify(await stavPrijmu(env.DB), null, 2));
  } else {
    const iny = beziIny();
    if (iny) {
      console.log(`${new Date().toISOString()} príjem už beží (pid ${iny}), tento beh sa preskočil`);
      process.exit(0);
    }
    writeFileSync(zamok, String(process.pid));
    try {
      const { zdroje, popis } = nacitajRegister(overRegister, zlucRegister);
      const s = await runPrijem(env.DB, {
        register: zdroje,
        fetch: (u, i) => fetch(u, i),
        userAgent: env.USER_AGENT,
        bezTextov: args.includes('--bez-textov'),
        maxTextov: cislo('--max-textov', 300),
        maxNaHost: cislo('--max-na-host', 40),
        rozostupMs: cislo('--rozostup', 1500),
        sucasneHosty: cislo('--hosty', 6),
        log: (r) => console.log(r),
      });
      const stav = await stavPrijmu(env.DB);
      const trvanie = ((Date.parse(s.koniec) - Date.parse(s.zaciatok)) / 1000).toFixed(1);
      console.log(
        `${s.koniec} príjem (${popis}): kanály ${s.kanalov_ok}/${s.kanalov} ok, 304 ${s.kanalov_304}, chyba ${s.kanalov_chyba} · ` +
          `položiek ${s.poloziek} · nové records ${s.records_novych} · dokumenty nové ${s.dokumenty_novych}, už boli ${s.dokumenty_uz_boli}, zmenené ${s.dokumenty_zmenene} · ` +
          `texty z RSS ${s.texty_z_rss}, stiahnuté ${JSON.stringify(s.texty)} · obsahové duplikáty ${s.duplikaty_obsahu}, šablóny ${s.sablony} · ${trvanie} s`,
      );
      console.log(`databáza: ${JSON.stringify(stav.spolu)} · duplicity ${JSON.stringify(stav.duplicity)}`);
      appendFileSync(logSubor, `${JSON.stringify({ ...s, databaza: stav.spolu, duplicity: stav.duplicity })}\n`);
    } finally {
      try {
        unlinkSync(zamok);
      } catch {
        // nevadí
      }
    }
  }
} finally {
  await dispose();
}
