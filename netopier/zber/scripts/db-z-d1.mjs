#!/usr/bin/env node
// Jednorazový prechod: skopíruje lokálnu D1 (zber/.wrangler/state/v3/d1/…sqlite) do netopier/data/netopier.sqlite.
// Pôvodný súbor ostáva nedotknutý ako záloha. Ak cieľ existuje, nič neurobí (--prepis ho nahradí).
// Použitie: node scripts/db-z-d1.mjs [--prepis]
import { existsSync, readdirSync, renameSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { DB_CESTA } from './lib/db.mjs';

const d1Dir = new URL('../.wrangler/state/v3/d1/miniflare-D1DatabaseObject/', import.meta.url).pathname;
const zdroj = existsSync(d1Dir)
  ? readdirSync(d1Dir).filter((f) => f.endsWith('.sqlite') && f !== 'metadata.sqlite').map((f) => join(d1Dir, f))[0]
  : null;
if (!zdroj) {
  console.error(`Lokálna D1 sa nenašla v ${d1Dir}`);
  process.exit(1);
}
if (existsSync(DB_CESTA)) {
  if (!process.argv.includes('--prepis')) {
    console.log(`${DB_CESTA} už existuje — nič sa nekopíruje (--prepis ho nahradí, starý sa odloží ako .pred-prepisom).`);
    process.exit(0);
  }
  renameSync(DB_CESTA, `${DB_CESTA}.pred-prepisom`);
}
const src = new DatabaseSync(zdroj, { readOnly: true });
src.prepare('VACUUM INTO ?').run(DB_CESTA);
src.close();
const db = new DatabaseSync(DB_CESTA);
const pocty = db.prepare(`SELECT (SELECT COUNT(*) FROM records) AS records, (SELECT COUNT(*) FROM entity) AS entity, (SELECT group_concat(name, ', ') FROM d1_migrations) AS migracie`).get();
db.close();
console.log(`skopírované ${zdroj} → ${DB_CESTA}: ${JSON.stringify(pocty)}`);
