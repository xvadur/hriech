-- Netopier v2 — základ nad archívom (krok I0, XDR-275): normalizovaný čas publikácie,
-- entity z registrov, fulltext, kartičky zdrojov, počty, meranie médií.
-- Odvodené vrstvy; records, runs a source_state sa nemenia (iba pridaný stĺpec).
-- Beží lokálne (miniflare D1 = SQLite); rovnaká schéma platí pre zobrazovaciu D1 v cloude.

-- 1. Čas publikácie v UTC (plní derive:normalize; záznamy bez dátumu ostávajú NULL).
ALTER TABLE records ADD COLUMN published_at_utc TEXT;
CREATE INDEX records_published_utc ON records (published_at_utc);

-- 2. Kartička zdroja (redakcia, agentúra, register…); v1 iba fakty, bias/faktickost ostávajú neurcene (D8).
CREATE TABLE zdroje (
  id TEXT PRIMARY KEY,                                           -- 'dennikn' | 'wm-bbc-world' | 'crz' | 'ted' | 'kataster' | 'statistika'
  nazov TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('medium','agentura','register','institucia','thinktank','agregator')),
  rozsah TEXT NOT NULL CHECK (rozsah IN ('lokalny','narodny','medzinarodny')),
  krajina TEXT, jazyk TEXT, url TEXT,
  outlet_id TEXT,                                                -- src/data/editorial-organization-map.json outlets[].id
  vlastnik TEXT, vlastnik_ico TEXT,
  bias TEXT NOT NULL DEFAULT 'neurcene' CHECK (bias IN ('lavy','stred_lavy','stred','stred_pravy','pravy','neurcene')),
  faktickost TEXT NOT NULL DEFAULT 'neurcene' CHECK (faktickost IN ('vysoka','zmiesana','nizka','neurcene')),
  hodnotenie_zdroje TEXT NOT NULL DEFAULT '[]',                  -- JSON [{url, poznamka}]
  hodnotil TEXT, hodnotene_at TEXT,
  wm_category TEXT,                                              -- kategória z katalógu World Monitor
  sledovany INTEGER NOT NULL DEFAULT 1,                          -- 1 = počíta sa do pokrytia SK redakcií
  pozastaveny_at TEXT,
  verejny INTEGER NOT NULL DEFAULT 0
);

-- Redakcia má viac kanálov (Denník N + Minúta); podiel a „prvý“ sa počítajú per zdroj_id.
CREATE TABLE zdroj_kanaly (
  zdroj_id TEXT NOT NULL REFERENCES zdroje(id),
  feed_id TEXT NOT NULL,                                         -- data/media-feeds.json / worldmonitor-feeds.json id = records.channel
  family TEXT, verified_at TEXT,
  PRIMARY KEY (zdroj_id, feed_id)
);
CREATE UNIQUE INDEX zdroj_kanaly_feed ON zdroj_kanaly (feed_id);

-- Pokrytie po dňoch (Media Cloud „attention over time“); udalosti a prvy sa plnia od I3.
CREATE TABLE zdroj_pokrytie_denne (
  zdroj_id TEXT NOT NULL REFERENCES zdroje(id), den TEXT NOT NULL,
  zaznamov INTEGER NOT NULL, udalosti INTEGER NOT NULL DEFAULT 0, prvy INTEGER NOT NULL DEFAULT 0,
  podiel REAL NOT NULL,                                          -- zaznamov / Σ zaznamov sledovaných SK redakcií v ten deň
  PRIMARY KEY (zdroj_id, den)
);

-- 3. Entity (IČO z registrov; fyzické osoby verejne nikdy, D14).
CREATE TABLE entity (
  id TEXT PRIMARY KEY,                                           -- 'ico:00156752' | 'osoba:<slug>' | 'organ:<slug>'
  druh TEXT NOT NULL CHECK (druh IN ('statny_organ','obec','firma','fyzicka_osoba','neznamy')),
  nazov TEXT NOT NULL, ico TEXT,
  verejne INTEGER NOT NULL DEFAULT 1,
  map_person_id TEXT, map_outlet_id TEXT,
  sledovane INTEGER NOT NULL DEFAULT 0, sledovane_dovod TEXT,
  prvy_vyskyt TEXT NOT NULL, posledny_vyskyt TEXT NOT NULL
);
CREATE INDEX entity_ico ON entity (ico);
CREATE INDEX entity_sledovane ON entity (sledovane);

CREATE TABLE entity_alias (                                      -- vstup pre derive:zmienky (fulltext podľa aliasov)
  entity_id TEXT NOT NULL REFERENCES entity(id), alias TEXT NOT NULL,
  zdroj TEXT NOT NULL CHECK (zdroj IN ('crz','klucove_slova','rpo','rucne')),
  PRIMARY KEY (entity_id, alias)
);

CREATE TABLE record_entity (
  record_id INTEGER NOT NULL REFERENCES records(id), entity_id TEXT NOT NULL REFERENCES entity(id),
  rola TEXT NOT NULL CHECK (rola IN ('strana_a','strana_b','objednavatel','dodavatel','obstaravatel','vitaz','akter','zmienka')),
  PRIMARY KEY (record_id, entity_id, rola)
);
CREATE INDEX record_entity_entity ON record_entity (entity_id);

-- 4. Fulltext s externým obsahom (DELETE funguje, riadky sa nezdvojujú, export D1 ostáva čitateľný).
-- Obsahová tabuľka je pohľad: records nemá stĺpec summary (je v data JSON), 'rebuild' ho číta z pohľadu.
CREATE VIEW records_text AS SELECT id, title, json_extract(data, '$.summary') AS summary FROM records;
CREATE VIRTUAL TABLE records_fts USING fts5(
  title, summary, content='records_text', content_rowid='id', tokenize='unicode61 remove_diacritics 2'
);
CREATE TRIGGER records_fts_ai AFTER INSERT ON records BEGIN
  INSERT INTO records_fts(rowid, title, summary) VALUES (new.id, new.title, json_extract(new.data, '$.summary'));
END;
CREATE TRIGGER records_fts_ad AFTER DELETE ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, title, summary) VALUES ('delete', old.id, old.title, json_extract(old.data, '$.summary'));
END;
CREATE TRIGGER records_fts_au AFTER UPDATE OF title, data ON records BEGIN
  INSERT INTO records_fts(records_fts, rowid, title, summary) VALUES ('delete', old.id, old.title, json_extract(old.data, '$.summary'));
  INSERT INTO records_fts(rowid, title, summary) VALUES (new.id, new.title, json_extract(new.data, '$.summary'));
END;
INSERT INTO records_fts(records_fts) VALUES ('rebuild');

-- 5. Počty bez plného skenu records (pre /health a terminál).
CREATE TABLE pocty (
  source TEXT NOT NULL, channel TEXT NOT NULL, riadkov INTEGER NOT NULL, posledny_at TEXT,
  PRIMARY KEY (source, channel)
);

-- 6. Číselníky CRZ (rezort, typ, druh, stav) — kód bez riadku sa vypíše ako kód; zdroj_url povinný.
CREATE TABLE crz_ciselniky (
  druh TEXT NOT NULL CHECK (druh IN ('rezort','typ','druh','stav')), kod TEXT NOT NULL, nazov TEXT NOT NULL,
  zdroj_url TEXT NOT NULL, PRIMARY KEY (druh, kod)
);

-- 7. Meranie médií (register C): dlhý formát, každá hodnota s detailom a verziou politiky.
CREATE TABLE meranie (
  rozsah TEXT NOT NULL CHECK (rozsah IN ('zdroj','autor')),
  kluc TEXT NOT NULL,                                            -- zdroj_id alebo 'zdroj_id|autor'
  den TEXT NOT NULL,                                             -- YYYY-MM-DD (Bratislava) alebo '*' za celé okno
  metrika TEXT NOT NULL,
  hodnota REAL NOT NULL,
  detail TEXT,                                                   -- JSON: počty, slová, id záznamov
  algoritmus TEXT NOT NULL,                                      -- 'meranie-v1/politika-<verzia>'
  vypocitane_at TEXT NOT NULL,
  PRIMARY KEY (rozsah, kluc, den, metrika)
);
CREATE INDEX meranie_den ON meranie (den, metrika);
