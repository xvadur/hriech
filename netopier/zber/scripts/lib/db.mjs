// Lokálna databáza Netopiera: jeden SQLite súbor (node:sqlite, FTS5) s rozhraním Cloudflare D1.
// Ten istý TypeScript kód (konektory, odvodenie, voľby, príjem) beží nad D1 vo Workeri aj nad týmto súborom.
// Cesta: NETOPIER_DB, inak netopier/data/netopier.sqlite (mimo gitu). Surové payloady: netopier/data/raw/.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const ZBER = new URL('../../', import.meta.url).pathname;
export const DB_CESTA = process.env.NETOPIER_DB ?? join(ZBER, '../data/netopier.sqlite');
export const RAW_CESTA = process.env.NETOPIER_RAW ?? join(ZBER, '../data/raw');

function hodnota(v) {
  if (v === undefined || v === null) return null;
  if (typeof v === 'boolean') return v ? 1 : 0;
  if (v instanceof ArrayBuffer) return new Uint8Array(v);
  return v;
}

class Prikaz {
  constructor(db, sql, params = []) {
    this.db = db;
    this.sql = sql;
    this.params = params;
  }
  bind(...params) {
    return new Prikaz(this.db, this.sql, params.map(hodnota));
  }
  #stmt() {
    return this.db.prepare(this.sql);
  }
  async first(stlpec) {
    const row = this.#stmt().get(...this.params);
    if (!row) return null;
    const obj = { ...row };
    return stlpec ? (obj[stlpec] ?? null) : obj;
  }
  async all() {
    return this._all();
  }
  _all() {
    const stmt = this.#stmt();
    // príkaz bez výsledku (INSERT bez RETURNING) nevracia riadky
    if (stmt.columns().length === 0) {
      const r = stmt.run(...this.params);
      return { results: [], success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
    }
    const results = stmt.all(...this.params).map((r) => ({ ...r }));
    return { results, success: true, meta: { changes: 0, rows_read: results.length } };
  }
  async run() {
    return this._run();
  }
  _run() {
    const stmt = this.#stmt();
    if (stmt.columns().length > 0) {
      const results = stmt.all(...this.params).map((r) => ({ ...r }));
      return { results, success: true, meta: { changes: results.length, last_row_id: 0 } };
    }
    const r = stmt.run(...this.params);
    return { results: [], success: true, meta: { changes: Number(r.changes), last_row_id: Number(r.lastInsertRowid) } };
  }
  async raw() {
    return this.#stmt()
      .all(...this.params)
      .map((r) => Object.values(r));
  }
}

/** D1Database nad jedným SQLite súborom. batch() beží v jednej transakcii ako v D1. */
export class SqliteD1 {
  constructor(cesta = DB_CESTA) {
    mkdirSync(dirname(cesta), { recursive: true });
    this.cesta = cesta;
    this.db = new DatabaseSync(cesta);
    this.db.exec(`PRAGMA journal_mode = WAL; PRAGMA synchronous = NORMAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 30000;`);
  }
  prepare(sql) {
    return new Prikaz(this.db, sql);
  }
  async batch(prikazy) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const out = prikazy.map((p) => (p.db.prepare(p.sql).columns().length > 0 ? p._all() : p._run()));
      this.db.exec('COMMIT');
      return out;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }
  async exec(sql) {
    this.db.exec(sql);
    return { count: 0, duration: 0 };
  }
  close() {
    this.db.close();
  }
}

/** R2 pre surové payloady: súbory pod data/raw/<kľúč>. */
export class SuborR2 {
  constructor(koren = RAW_CESTA) {
    this.koren = koren;
  }
  async put(kluc, telo) {
    const cesta = join(this.koren, kluc);
    mkdirSync(dirname(cesta), { recursive: true });
    writeFileSync(cesta, typeof telo === 'string' ? telo : Buffer.from(telo));
    return { key: kluc };
  }
}

/** Env ako vo Workeri: DB, RAW, JOBS (nasledné úlohy sa iba zbierajú a vypíšu), USER_AGENT. */
export function lokalneEnv() {
  const DB = new SqliteD1();
  const nasledne = [];
  const env = {
    DB,
    RAW: new SuborR2(),
    JOBS: {
      async send(job) {
        nasledne.push(job);
      },
      async sendBatch(jobs) {
        nasledne.push(...jobs.map((j) => j.body));
      },
    },
    USER_AGENT: 'Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)',
  };
  return { env, nasledne, dispose: async () => DB.close() };
}
