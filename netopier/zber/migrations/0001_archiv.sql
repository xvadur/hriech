-- Netopier v2 — archív cloudového zberu (Cloudflare D1).
-- Surová vrstva: každý záznam nesie zdroj, kanál, URL, čas publikácie, čas zberu,
-- hash obsahu a odkaz na surový payload v R2. Odvodené vrstvy (príbehy, skóre)
-- sem nepatria.

-- Jeden riadok = jedna verzia záznamu zo zdroja. Zmena obsahu u zdroja vytvorí
-- novú verziu (nový content_hash), rovnaký obsah sa nezapíše druhýkrát.
CREATE TABLE records (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,            -- konektor: rss, worldmonitor, crz, ted, kataster, statistika
  channel TEXT NOT NULL,           -- kanál v rámci zdroja (id RSS kanála, dátum exportu, dataset…)
  external_id TEXT NOT NULL,       -- identifikátor u zdroja (guid, ID zmluvy, číslo oznámenia…)
  upstream_version TEXT,           -- verzia, ktorú uvádza zdroj (ak ju uvádza)
  url TEXT,                        -- zdrojová URL záznamu
  title TEXT,
  published_at TEXT,               -- čas publikácie podľa zdroja (ISO 8601)
  collected_at TEXT NOT NULL,      -- čas zberu (ISO 8601, UTC)
  content_hash TEXT NOT NULL,      -- sha256 normalizovaného záznamu
  data TEXT NOT NULL,              -- normalizovaný záznam (JSON)
  raw_key TEXT,                    -- kľúč surového payloadu v R2 (ak sa ukladá)
  run_id INTEGER,
  UNIQUE (source, external_id, content_hash)
);

CREATE INDEX records_source_collected ON records (source, collected_at);
-- (source, external_id) pokrýva UNIQUE index vyššie; ďalší index by iba zvyšoval počet zapísaných riadkov v D1.
CREATE INDEX records_published ON records (published_at);

-- Jeden riadok = jeden beh konektora nad jedným kanálom.
CREATE TABLE runs (
  id INTEGER PRIMARY KEY,
  source TEXT NOT NULL,
  channel TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL,            -- ok | error
  seen INTEGER NOT NULL DEFAULT 0, -- koľko záznamov zdroj vrátil
  inserted INTEGER NOT NULL DEFAULT 0, -- koľko bolo nových (alebo nových verzií)
  raw_key TEXT,
  error TEXT
);

CREATE INDEX runs_source_started ON runs (source, started_at);

-- Kurzor a posledný úspech pre každý zdroj a kanál.
CREATE TABLE source_state (
  source TEXT NOT NULL,
  channel TEXT NOT NULL,
  cursor TEXT,
  last_success_at TEXT,
  last_error_at TEXT,
  last_error TEXT,
  PRIMARY KEY (source, channel)
);
