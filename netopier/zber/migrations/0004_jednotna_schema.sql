-- Netopier v2 — jednotná schéma (XDR-299): zdroj, dokument s celým textom, entita, udalosť, téma, meranie.
-- Nadväzuje na 0001–0003: `records` ostáva surová vrstva (každá verzia položky zo zdroja), `dokumenty` sú
-- odvodená jednotka obsahu (jeden článok = jeden riadok bez ohľadu na to, v koľkých kanáloch sa objavil).
-- Kompatibilné s Cloudflare D1 (žiadne PRAGMA, FTS5, triggery); lokálne beží nad SQLite súborom
-- netopier/data/netopier.sqlite (STACK.md). Číslo 0005 patrí Národnej rade.

-- 1. Zdroje: stĺpce z registra zdrojov (zber/data/zdroje/register.json, XDR-296).
ALTER TABLE zdroje ADD COLUMN register_typ TEXT;                 -- typ tak, ako ho uvádza register (medium, agentura, parlament, podcast…)
ALTER TABLE zdroje ADD COLUMN kategoria TEXT;
ALTER TABLE zdroje ADD COLUMN api TEXT;                          -- URL alebo popis API, ak zdroj nejaké má
ALTER TABLE zdroje ADD COLUMN cely_text_v_rss INTEGER NOT NULL DEFAULT 0;
ALTER TABLE zdroje ADD COLUMN overene_at TEXT;
ALTER TABLE zdroje ADD COLUMN poznamka TEXT;
ALTER TABLE zdroje ADD COLUMN aktualizovane_at TEXT;

ALTER TABLE zdroj_kanaly ADD COLUMN url TEXT;                    -- URL kanála (RSS/Atom/API)
ALTER TABLE zdroj_kanaly ADD COLUMN druh TEXT NOT NULL DEFAULT 'rss';
ALTER TABLE zdroj_kanaly ADD COLUMN aktivny INTEGER NOT NULL DEFAULT 1;

-- Beh príjmu zapisuje do runs aj počty (JSON).
ALTER TABLE runs ADD COLUMN detail TEXT;

-- 2. Typy dokumentov (číselník; migrácia, ktorá potrebuje nový typ, ho pridá cez INSERT OR IGNORE).
CREATE TABLE dokument_typy (
  id TEXT PRIMARY KEY,
  nazov TEXT NOT NULL,
  popis TEXT
);
INSERT INTO dokument_typy (id, nazov, popis) VALUES
  ('clanok', 'Článok', 'text redakcie alebo agentúry'),
  ('minuta', 'Minúta po minúte', 'krátka správa v priebežnom spravodajstve'),
  ('tlacova_sprava', 'Tlačová správa', 'text inštitúcie, strany alebo firmy'),
  ('prepis', 'Prepis', 'prepis podcastu, videa, relácie alebo rozpravy'),
  ('hlasovanie', 'Hlasovanie', 'hlasovanie v parlamente alebo zastupiteľstve'),
  ('uznesenie', 'Uznesenie', 'uznesenie vlády, parlamentu, zastupiteľstva'),
  ('parlamentna_tlac', 'Parlamentná tlač', 'návrh zákona a iné tlače'),
  ('zmluva', 'Zmluva', 'zmluva z registra (CRZ)'),
  ('obstaravanie', 'Obstarávanie', 'oznámenie o obstarávaní (TED, ÚVO)'),
  ('prispevok', 'Príspevok', 'príspevok na sociálnej sieti'),
  ('epizoda', 'Epizóda podcastu', 'epizóda podcastu alebo relácie (prepis je samostatný dokument typu prepis)'),
  ('video', 'Video', 'video (YouTube a iné), popis z kanála'),
  ('ine', 'Iné', NULL);

-- 3. Dokument: jednotka obsahu naprieč zdrojmi. Deduplikácia podľa url_kanon (UNIQUE) a obsahu (obsah_hash → duplikat_of).
CREATE TABLE dokumenty (
  id INTEGER PRIMARY KEY,
  typ TEXT NOT NULL REFERENCES dokument_typy(id),
  zdroj_id TEXT NOT NULL REFERENCES zdroje(id),
  kanal TEXT,                                                    -- zdroj_kanaly.feed_id, kde sa objavil prvýkrát
  url TEXT,                                                      -- URL tak, ako ju dal zdroj
  url_kanon TEXT UNIQUE,                                         -- normalizovaná URL (bez utm_*, fbclid, fragmentu, koncovej lomky)
  external_id TEXT,                                              -- id u zdroja (guid, číslo hlasovania…)
  titulok TEXT,
  perex TEXT,
  autor TEXT,
  jazyk TEXT,
  kategorie TEXT NOT NULL DEFAULT '[]',                          -- JSON pole
  published_at_utc TEXT,
  prvy_zaznam_at TEXT NOT NULL,                                  -- kedy ho Netopier videl prvýkrát (minúta po minúte)
  aktualizovane_at TEXT NOT NULL,
  record_id INTEGER REFERENCES records(id),                      -- posledná surová verzia v archíve
  text_stav TEXT NOT NULL DEFAULT 'caka'
    CHECK (text_stav IN ('caka','ok','kratky','bez_textu','chyba','zakazane','nedostupne')),
  text_pokusy INTEGER NOT NULL DEFAULT 0,
  text_dalsi_pokus_at TEXT,
  text_chyba TEXT,
  obsah_hash TEXT,                                               -- sha256 normalizovaného celého textu
  duplikat_of INTEGER REFERENCES dokumenty(id),                  -- rovnaký text pod inou URL (preberaná agentúrna správa)
  data TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX dokumenty_published ON dokumenty (published_at_utc);
CREATE INDEX dokumenty_zdroj ON dokumenty (zdroj_id, published_at_utc);
CREATE INDEX dokumenty_prvy ON dokumenty (prvy_zaznam_at);
CREATE INDEX dokumenty_external ON dokumenty (zdroj_id, external_id);
CREATE INDEX dokumenty_text ON dokumenty (text_stav, text_dalsi_pokus_at);
CREATE INDEX dokumenty_obsah ON dokumenty (obsah_hash);
CREATE INDEX dokumenty_typ ON dokumenty (typ, published_at_utc);

-- Celý text oddelene od metadát (desiatky GB; zoznamy a počty nečítajú text).
CREATE TABLE dokument_texty (
  dokument_id INTEGER PRIMARY KEY REFERENCES dokumenty(id),
  text TEXT NOT NULL,
  znakov INTEGER NOT NULL,
  slov INTEGER NOT NULL,
  metoda TEXT NOT NULL CHECK (metoda IN ('rss','jsonld','readability','api','prepis','rucne')),
  zdroj_url TEXT,                                                -- odkiaľ sa text vzal (po presmerovaní)
  hash TEXT NOT NULL,
  verzia INTEGER NOT NULL DEFAULT 1,                             -- zvýši sa, keď redakcia text zmení
  ziskane_at TEXT NOT NULL,
  zmenene_at TEXT
);

-- V ktorých kanáloch sa dokument objavil (ten istý článok v hlavnom kanáli aj v rubrike).
CREATE TABLE dokument_vyskyty (
  dokument_id INTEGER NOT NULL REFERENCES dokumenty(id),
  kanal TEXT NOT NULL,
  record_id INTEGER REFERENCES records(id),
  prvy_at TEXT NOT NULL,
  PRIMARY KEY (dokument_id, kanal)
);
CREATE INDEX dokument_vyskyty_kanal ON dokument_vyskyty (kanal, prvy_at);

-- 4. Osoby a organizácie sú v `entity` (0002; osoby `osoba:<slug>` z 0003). Väzba na dokumenty:
CREATE TABLE dokument_entity (
  dokument_id INTEGER NOT NULL REFERENCES dokumenty(id),
  entity_id TEXT NOT NULL REFERENCES entity(id),
  rola TEXT NOT NULL,                                            -- autor | akter | zmienka | recnik | hlasujuci | predkladatel …
  pocet INTEGER NOT NULL DEFAULT 1,
  metoda TEXT,                                                   -- alias | rucne | jev …
  PRIMARY KEY (dokument_id, entity_id, rola)
);
CREATE INDEX dokument_entity_entity ON dokument_entity (entity_id);

-- 5. Udalosť: čo sa stalo (zhluk správ, hlasovanie, tlačovka, zasadnutie). Plní klastrovanie (I3) a konektory registrov.
CREATE TABLE udalosti (
  id INTEGER PRIMARY KEY,
  druh TEXT NOT NULL,                                            -- zhluk_sprav | hlasovanie | tlacovka | zasadnutie | volby | rozhodnutie …
  nazov TEXT NOT NULL,
  popis TEXT,
  zaciatok_utc TEXT,
  koniec_utc TEXT,
  miesto TEXT,
  stav TEXT NOT NULL DEFAULT 'otvorena' CHECK (stav IN ('otvorena','uzavreta','zlucena')),
  zlucena_do INTEGER REFERENCES udalosti(id),
  prvy_dokument_id INTEGER REFERENCES dokumenty(id),
  prvy_at TEXT,
  dokumentov INTEGER NOT NULL DEFAULT 0,
  zdrojov INTEGER NOT NULL DEFAULT 0,
  algoritmus TEXT,                                               -- ktorá verzia klastrovania ju vytvorila
  vytvorene_at TEXT NOT NULL,
  aktualizovane_at TEXT NOT NULL,
  data TEXT NOT NULL DEFAULT '{}'
);
CREATE INDEX udalosti_zaciatok ON udalosti (zaciatok_utc);
CREATE INDEX udalosti_druh ON udalosti (druh, zaciatok_utc);

CREATE TABLE udalost_dokumenty (
  udalost_id INTEGER NOT NULL REFERENCES udalosti(id),
  dokument_id INTEGER NOT NULL REFERENCES dokumenty(id),
  rola TEXT NOT NULL DEFAULT 'clen' CHECK (rola IN ('prvy','clen','zdroj','reakcia')),
  podobnost REAL,
  pridane_at TEXT NOT NULL,
  PRIMARY KEY (udalost_id, dokument_id)
);
CREATE INDEX udalost_dokumenty_dokument ON udalost_dokumenty (dokument_id);

CREATE TABLE udalost_entity (
  udalost_id INTEGER NOT NULL REFERENCES udalosti(id),
  entity_id TEXT NOT NULL REFERENCES entity(id),
  rola TEXT NOT NULL,
  PRIMARY KEY (udalost_id, entity_id, rola)
);
CREATE INDEX udalost_entity_entity ON udalost_entity (entity_id);

-- 6. Téma: téma dňa, kauza, oblasť, séria. Dokumenty a udalosti sa k nej priraďujú so skóre.
CREATE TABLE temy (
  id TEXT PRIMARY KEY,                                           -- slug
  nazov TEXT NOT NULL,
  popis TEXT,
  druh TEXT NOT NULL CHECK (druh IN ('tema_dna','kauza','oblast','seria')),
  klucove_slova TEXT NOT NULL DEFAULT '[]',                      -- JSON pole (FTS dopyty)
  nadradena_id TEXT REFERENCES temy(id),
  den TEXT,                                                      -- YYYY-MM-DD pre tému dňa
  aktivna INTEGER NOT NULL DEFAULT 1,
  vytvorene_at TEXT NOT NULL,
  aktualizovane_at TEXT NOT NULL
);
CREATE INDEX temy_den ON temy (den);

CREATE TABLE dokument_temy (
  dokument_id INTEGER NOT NULL REFERENCES dokumenty(id),
  tema_id TEXT NOT NULL REFERENCES temy(id),
  skore REAL,
  metoda TEXT,
  PRIMARY KEY (dokument_id, tema_id)
);
CREATE INDEX dokument_temy_tema ON dokument_temy (tema_id);

CREATE TABLE udalost_temy (
  udalost_id INTEGER NOT NULL REFERENCES udalosti(id),
  tema_id TEXT NOT NULL REFERENCES temy(id),
  skore REAL,
  PRIMARY KEY (udalost_id, tema_id)
);

-- 7. Meranie: rozsah rozšírený o dokument, udalosť, tému, entitu a deň (tabuľka sa prestavia, dáta ostávajú).
CREATE TABLE meranie_nove (
  rozsah TEXT NOT NULL CHECK (rozsah IN ('zdroj','autor','dokument','udalost','tema','entita','den')),
  kluc TEXT NOT NULL,
  den TEXT NOT NULL,
  metrika TEXT NOT NULL,
  hodnota REAL NOT NULL,
  detail TEXT,
  algoritmus TEXT NOT NULL,
  vypocitane_at TEXT NOT NULL,
  PRIMARY KEY (rozsah, kluc, den, metrika)
);
INSERT INTO meranie_nove SELECT rozsah, kluc, den, metrika, hodnota, detail, algoritmus, vypocitane_at FROM meranie;
DROP TABLE meranie;
ALTER TABLE meranie_nove RENAME TO meranie;
CREATE INDEX meranie_den ON meranie (den, metrika);

-- 8. Hostitelia: robots.txt a slušné tempo sťahovania celých textov.
CREATE TABLE hostitelia (
  host TEXT PRIMARY KEY,
  robots_txt TEXT,
  robots_stav INTEGER,                                           -- HTTP stav robots.txt (404 = bez obmedzení)
  robots_at TEXT,
  posledny_fetch_at TEXT,
  fetchov INTEGER NOT NULL DEFAULT 0,
  chyb INTEGER NOT NULL DEFAULT 0,
  posledna_chyba TEXT
);

-- 9. Fulltext nad dokumentmi s celým textom (externý obsah = pohľad, text sa neukladá dvakrát).
-- Triggery udržiavajú index pri zmene titulku, perexu aj textu; 'rebuild' ho vie kedykoľvek prepočítať.
CREATE VIEW dokumenty_fts_obsah AS
  SELECT d.id AS id, d.titulok AS titulok, d.perex AS perex, t.text AS text
  FROM dokumenty d LEFT JOIN dokument_texty t ON t.dokument_id = d.id;
CREATE VIRTUAL TABLE dokumenty_fts USING fts5(
  titulok, perex, text, content='dokumenty_fts_obsah', content_rowid='id', tokenize='unicode61 remove_diacritics 2'
);
CREATE TRIGGER dokumenty_fts_ai AFTER INSERT ON dokumenty BEGIN
  INSERT INTO dokumenty_fts(rowid, titulok, perex, text)
    VALUES (new.id, new.titulok, new.perex, (SELECT text FROM dokument_texty WHERE dokument_id = new.id));
END;
CREATE TRIGGER dokumenty_fts_au AFTER UPDATE OF titulok, perex ON dokumenty BEGIN
  INSERT INTO dokumenty_fts(dokumenty_fts, rowid, titulok, perex, text)
    VALUES ('delete', old.id, old.titulok, old.perex, (SELECT text FROM dokument_texty WHERE dokument_id = old.id));
  INSERT INTO dokumenty_fts(rowid, titulok, perex, text)
    VALUES (new.id, new.titulok, new.perex, (SELECT text FROM dokument_texty WHERE dokument_id = new.id));
END;
CREATE TRIGGER dokumenty_fts_ad AFTER DELETE ON dokumenty BEGIN
  INSERT INTO dokumenty_fts(dokumenty_fts, rowid, titulok, perex, text)
    VALUES ('delete', old.id, old.titulok, old.perex, (SELECT text FROM dokument_texty WHERE dokument_id = old.id));
END;
CREATE TRIGGER dokument_texty_fts_ai AFTER INSERT ON dokument_texty BEGIN
  INSERT INTO dokumenty_fts(dokumenty_fts, rowid, titulok, perex, text)
    SELECT 'delete', d.id, d.titulok, d.perex, NULL FROM dokumenty d WHERE d.id = new.dokument_id;
  INSERT INTO dokumenty_fts(rowid, titulok, perex, text)
    SELECT d.id, d.titulok, d.perex, new.text FROM dokumenty d WHERE d.id = new.dokument_id;
END;
CREATE TRIGGER dokument_texty_fts_au AFTER UPDATE OF text ON dokument_texty BEGIN
  INSERT INTO dokumenty_fts(dokumenty_fts, rowid, titulok, perex, text)
    SELECT 'delete', d.id, d.titulok, d.perex, old.text FROM dokumenty d WHERE d.id = old.dokument_id;
  INSERT INTO dokumenty_fts(rowid, titulok, perex, text)
    SELECT d.id, d.titulok, d.perex, new.text FROM dokumenty d WHERE d.id = new.dokument_id;
END;
CREATE TRIGGER dokument_texty_fts_ad AFTER DELETE ON dokument_texty BEGIN
  INSERT INTO dokumenty_fts(dokumenty_fts, rowid, titulok, perex, text)
    SELECT 'delete', d.id, d.titulok, d.perex, old.text FROM dokumenty d WHERE d.id = old.dokument_id;
  INSERT INTO dokumenty_fts(rowid, titulok, perex, text)
    SELECT d.id, d.titulok, d.perex, NULL FROM dokumenty d WHERE d.id = old.dokument_id;
END;
