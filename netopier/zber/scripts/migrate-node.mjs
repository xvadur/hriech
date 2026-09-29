#!/usr/bin/env node
// Migrácie zber/migrations/*.sql nad lokálnym SQLite súborom (netopier/data/netopier.sqlite).
// Evidencia v tabuľke d1_migrations — rovnaký formát ako `wrangler d1 migrations apply`,
// takže súbor prevzatý z lokálnej D1 (db-z-d1.mjs) pokračuje tam, kde D1 skončila.
// Použitie: node scripts/migrate-node.mjs [--zoznam] [--po 0004]   (--po: iba migrácie do daného čísla vrátane)
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DB_CESTA, SqliteD1 } from './lib/db.mjs';

const dir = new URL('../migrations/', import.meta.url).pathname;
const db = new SqliteD1();
db.db.exec(`CREATE TABLE IF NOT EXISTS d1_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL)`);
const hotove = new Set(db.db.prepare('SELECT name FROM d1_migrations').all().map((r) => r.name));
const po = process.argv.includes('--po') ? process.argv[process.argv.indexOf('--po') + 1] : null;
const subory = readdirSync(dir)
  .filter((f) => /^\d{4}_.*\.sql$/.test(f) && (!po || f.slice(0, 4) <= po))
  .sort();
if (process.argv.includes('--zoznam')) {
  for (const f of subory) console.log(`${hotove.has(f) ? '✓' : '·'} ${f}`);
  process.exit(0);
}
let n = 0;
for (const f of subory) {
  if (hotove.has(f)) continue;
  const sql = readFileSync(join(dir, f), 'utf8');
  db.db.exec('BEGIN IMMEDIATE');
  try {
    db.db.exec(sql);
    db.db.prepare('INSERT INTO d1_migrations (name) VALUES (?)').run(f);
    db.db.exec('COMMIT');
    console.log(`migrácia ${f}: ok`);
    n++;
  } catch (e) {
    db.db.exec('ROLLBACK');
    console.error(`migrácia ${f}: CHYBA ${e.message}`);
    process.exit(1);
  }
}
console.log(`${DB_CESTA}: ${n ? `aplikované ${n}` : 'bez nových migrácií'} (${subory.length} spolu)`);
db.close();
