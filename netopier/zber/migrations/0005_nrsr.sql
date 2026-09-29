-- Netopier v2 — Národná rada SR (XDR-297): poslanci, kluby a výbory s históriou členstva, schôdze, parlamentné tlače,
-- hlasovania s hlasmi po poslancoch, vystúpenia v rozprave (prepis + odkaz na video).
-- Plní `pnpm run nrsr` (src/nrsr/, scripts/nrsr-node.mjs): oficiálne JSON API www.nrsr.sk/opendata/1/sk a HTML stránky
-- www.nrsr.sk / tv.nrsr.sk (hlasy poslancov, zmeny v zložení, prepisy). Idempotentné.
-- Poslanci sa viažu na `entity` ako `osoba:<slug>` (rovnaké id ako kandidáti z volieb).

-- 1. Poslanci. `id` je mpId z NR SR (stabilné naprieč obdobiami; v HTML ako PoslanecID / PoslanecMasterID).
CREATE TABLE nrsr_poslanci (
  id INTEGER PRIMARY KEY,
  meno TEXT NOT NULL, priezvisko TEXT NOT NULL, titul TEXT, titul_za TEXT,
  narodeny TEXT, narodnost TEXT, pohlavie TEXT CHECK (pohlavie IN ('M','Z')),  -- narodeny YYYY-MM-DD
  kluc TEXT,                                                       -- personKey z NR SR, napr. „Martina.Holeckovai“
  entity_id TEXT REFERENCES entity(id),                            -- 'osoba:<slug meno priezvisko>'
  url TEXT NOT NULL, foto_url TEXT,
  profil_zber TEXT,                                                -- NULL = videný iba v hlasovaní/zmenách, profil z API sa ešte nestiahol
  prvy_zber TEXT NOT NULL, posledny_zber TEXT NOT NULL
);
CREATE INDEX nrsr_poslanci_entity ON nrsr_poslanci (entity_id);
CREATE INDEX nrsr_poslanci_priezvisko ON nrsr_poslanci (priezvisko, meno);

-- Poslanec v jednom volebnom období: za koho kandidoval, bydlisko (obec a kraj), kontakt, posledný klub.
CREATE TABLE nrsr_mandaty (
  poslanec_id INTEGER NOT NULL REFERENCES nrsr_poslanci(id),
  obdobie INTEGER NOT NULL,
  kandidoval_za TEXT, kandidoval_za_kluc TEXT,                     -- „Kresťanskodemokratické hnutie“ / „PolitickeStrany.KDH“
  bydlisko TEXT, kraj TEXT, email TEXT,
  posledny_klub TEXT,                                              -- skratka posledného klubu (lastClubAbbr)
  zber TEXT NOT NULL,
  PRIMARY KEY (poslanec_id, obdobie)
) WITHOUT ROWID;

-- História členstva a funkcií: kluby, výbory, delegácie … s dátumami od–do (UTC). Poslanec, ktorý zmenil klub, má dva riadky.
CREATE TABLE nrsr_funkcie (
  poslanec_id INTEGER NOT NULL REFERENCES nrsr_poslanci(id),
  obdobie INTEGER NOT NULL,
  organ_kluc TEXT NOT NULL, organ TEXT NOT NULL,                   -- 'NRSR.Kluby.KDH' / 'Klub KDH'
  druh TEXT NOT NULL CHECK (druh IN ('klub','vybor','ine')),
  funkcia_kluc TEXT NOT NULL, funkcia TEXT,                        -- 'NRSR.Kluby.KDH.Predseda' / 'predsedníčka'
  od TEXT NOT NULL, do TEXT,                                       -- do NULL = trvá
  zber TEXT NOT NULL,
  PRIMARY KEY (poslanec_id, funkcia_kluc, od)
) WITHOUT ROWID;
CREATE INDEX nrsr_funkcie_organ ON nrsr_funkcie (organ_kluc, obdobie);

CREATE VIEW nrsr_clenstvo_aktualne AS
  SELECT poslanec_id, obdobie, organ_kluc, organ, druh, funkcia, od FROM nrsr_funkcie WHERE do IS NULL;

-- Zmeny v zložení NR SR: vznik a zánik mandátu, nastúpenie náhradníka, sľub.
CREATE TABLE nrsr_zmeny (
  obdobie INTEGER NOT NULL, datum TEXT NOT NULL,                   -- YYYY-MM-DD
  poslanec_id INTEGER NOT NULL REFERENCES nrsr_poslanci(id),
  strana TEXT,                                                     -- skratka v zátvorke pri mene, napr. „HLAS - SD“
  druh TEXT NOT NULL,                                              -- „Mandát náhradníka získaný“ …
  dovod TEXT,
  PRIMARY KEY (obdobie, datum, poslanec_id, druh)
) WITHOUT ROWID;
CREATE INDEX nrsr_zmeny_poslanec ON nrsr_zmeny (poslanec_id, datum);

-- 2. Orgány: poslanecké kluby a výbory.
CREATE TABLE nrsr_organy (
  id TEXT PRIMARY KEY,                                             -- 'klub:59' | 'vybor:172' (ID z NR SR)
  druh TEXT NOT NULL CHECK (druh IN ('klub','vybor')),
  obdobie INTEGER NOT NULL, kluc TEXT NOT NULL, nazov TEXT NOT NULL, skratka TEXT,
  od TEXT, do TEXT,                                                -- vznik a zánik (UTC)
  email TEXT, clenov_celkom INTEGER, clenov_aktualne INTEGER, farba TEXT,
  zber TEXT NOT NULL
);
CREATE INDEX nrsr_organy_kluc ON nrsr_organy (kluc, obdobie);

-- Klub poslanca v čase hlasovania tak, ako ho ukazuje „Hlasovanie podľa klubov“ (skrátený názov bloku, nezávislí majú vlastný).
CREATE TABLE nrsr_kluby (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  obdobie INTEGER NOT NULL, nazov TEXT NOT NULL,
  UNIQUE (obdobie, nazov)
);

-- 3. Schôdze a hlasovania.
CREATE TABLE nrsr_schodze (
  obdobie INTEGER NOT NULL, cislo INTEGER NOT NULL,
  popis TEXT, od TEXT, do TEXT,                                    -- od/do YYYY-MM-DD (do NULL = trvá alebo nie je uvedené)
  program_id INTEGER,                                              -- MeetingProgram v API
  url TEXT NOT NULL, zber TEXT NOT NULL,
  vystupenia_kompletne TEXT,                                       -- kedy sa naposledy prešli všetky strany vystúpení (ďalší beh stačí od najnovších)
  PRIMARY KEY (obdobie, cislo)
) WITHOUT ROWID;

CREATE TABLE nrsr_hlasovania (
  id INTEGER PRIMARY KEY,                                          -- ID hlasovania z NR SR (sid=schodze/hlasovanie/hlasovanie&ID=…)
  obdobie INTEGER NOT NULL, schodza INTEGER NOT NULL,
  cislo INTEGER NOT NULL,                                          -- poradové číslo hlasovania na schôdzi
  cas_utc TEXT NOT NULL,                                           -- ISO 8601 UTC
  den TEXT NOT NULL,                                               -- YYYY-MM-DD v Bratislave
  nazov TEXT NOT NULL,
  cpt INTEGER,                                                     -- číslo parlamentnej tlače (NULL = hlasovanie nie je k tlači)
  typ TEXT,                                                        -- štandardné | tajné | hromadné hlasovanie (tajné a hromadné = voľby lístkami, hlasy po poslancoch nemajú)
  tajne INTEGER NOT NULL DEFAULT 0,                                -- 1 = tajné (hlasy poslancov sa nezverejňujú)
  ustavne INTEGER NOT NULL DEFAULT 0,                              -- 1 = ústavný zákon (3/5 väčšina)
  vysledok TEXT,                                                   -- „Návrh prešiel“ | „Návrh neprešiel“ | „Parlament nebol uznášaniaschopný“
  pritomni INTEGER, hlasujuci INTEGER, za INTEGER, proti INTEGER, zdrzali INTEGER, nehlasovali INTEGER, nepritomni INTEGER,
  url TEXT NOT NULL, zber TEXT NOT NULL
);
CREATE INDEX nrsr_hlasovania_schodza ON nrsr_hlasovania (obdobie, schodza, cislo);
CREATE INDEX nrsr_hlasovania_cpt ON nrsr_hlasovania (cpt);
CREATE INDEX nrsr_hlasovania_cas ON nrsr_hlasovania (cas_utc);

-- Hlas poslanca: Z za, P proti, ? zdržal sa, N nehlasoval, 0 neprítomný.
CREATE TABLE nrsr_hlasy (
  hlasovanie_id INTEGER NOT NULL REFERENCES nrsr_hlasovania(id),
  poslanec_id INTEGER NOT NULL REFERENCES nrsr_poslanci(id),
  hlas TEXT NOT NULL CHECK (hlas IN ('Z','P','?','N','0')),
  klub_id INTEGER REFERENCES nrsr_kluby(id),
  PRIMARY KEY (hlasovanie_id, poslanec_id)
) WITHOUT ROWID;
CREATE INDEX nrsr_hlasy_poslanec ON nrsr_hlasy (poslanec_id, hlasovanie_id);

-- Klub poslanca podľa hlasovaní (kedy prvýkrát a naposledy hlasoval za daný klub) — kontrola k nrsr_funkcie.
CREATE VIEW nrsr_klub_historia AS
  SELECT h.poslanec_id, k.obdobie, k.nazov AS klub, MIN(v.den) AS od, MAX(v.den) AS do, COUNT(*) AS hlasovani
  FROM nrsr_hlasy h JOIN nrsr_kluby k ON k.id = h.klub_id JOIN nrsr_hlasovania v ON v.id = h.hlasovanie_id
  GROUP BY h.poslanec_id, h.klub_id;

-- 4. Parlamentné tlače (návrhy zákonov a iné materiály), na ktoré sa viažu hlasovania a vystúpenia.
CREATE TABLE nrsr_tlace (
  obdobie INTEGER NOT NULL, cpt INTEGER NOT NULL,
  id_nrsr INTEGER,
  typ_id INTEGER, typ TEXT,                                        -- Návrh zákona | Iný typ | Správa | Medzinárodná zmluva | Informácia
  nazov TEXT,
  doruceny TEXT, pridelena TEXT,                                   -- YYYY-MM-DD
  url TEXT NOT NULL, zber TEXT NOT NULL,
  PRIMARY KEY (obdobie, cpt)
) WITHOUT ROWID;
CREATE INDEX nrsr_tlace_typ ON nrsr_tlace (obdobie, typ_id);

-- 5. Vystúpenia v rozprave: prepis (autorizovaný alebo bez jazykovej úpravy) + odkaz na video.
CREATE TABLE nrsr_vystupenia (
  id TEXT PRIMARY KEY,                                             -- 'v<video_id>' ak má video, inak 'h<hash>'
  obdobie INTEGER NOT NULL, schodza INTEGER,
  den_popis TEXT,                                                  -- „61. schôdza NR SR - 9.deň - B. popoludní“
  cas_od_utc TEXT, cas_do_utc TEXT,
  cpt INTEGER,
  recnik TEXT NOT NULL,                                            -- „Priezvisko, Meno“ tak, ako je v prepise
  poslanec_id INTEGER REFERENCES nrsr_poslanci(id),                -- iba ak sa dá spárovať s poslancom (ministri a hostia NULL)
  funkcia TEXT,                                                    -- „predseda NR SR“, „poslankyňa NR SR“ …
  typ TEXT,                                                        -- „Vystúpenie v rozprave“, „Vystúpenie s faktickou poznámkou“ …
  upraveny INTEGER NOT NULL DEFAULT 0,                             -- 1 = prešlo jazykovou úpravou (autorizované)
  text TEXT NOT NULL,
  video_id INTEGER,                                                -- ID vystúpenia na tv.nrsr.sk
  video_url TEXT,                                                  -- krátky klip vystúpenia (tv.nrsr.sk/archiv/schodza/<obdobie>/<schodza>?id=<video_id>); NULL kým záznam nie je zverejnený
  video_schodza_url TEXT,                                          -- celý záznam rokovania
  hash TEXT NOT NULL, zber TEXT NOT NULL
);
CREATE INDEX nrsr_vystupenia_poslanec ON nrsr_vystupenia (poslanec_id, cas_od_utc);
CREATE INDEX nrsr_vystupenia_schodza ON nrsr_vystupenia (obdobie, schodza, cas_od_utc);
CREATE INDEX nrsr_vystupenia_cpt ON nrsr_vystupenia (cpt);

CREATE VIEW nrsr_vystupenia_text AS SELECT rowid AS id, recnik, text FROM nrsr_vystupenia;
CREATE VIRTUAL TABLE nrsr_vystupenia_fts USING fts5(
  recnik, text, content='nrsr_vystupenia_text', content_rowid='id', tokenize='unicode61 remove_diacritics 2'
);
CREATE TRIGGER nrsr_vystupenia_fts_ai AFTER INSERT ON nrsr_vystupenia BEGIN
  INSERT INTO nrsr_vystupenia_fts(rowid, recnik, text) VALUES (new.rowid, new.recnik, new.text);
END;
CREATE TRIGGER nrsr_vystupenia_fts_ad AFTER DELETE ON nrsr_vystupenia BEGIN
  INSERT INTO nrsr_vystupenia_fts(nrsr_vystupenia_fts, rowid, recnik, text) VALUES ('delete', old.rowid, old.recnik, old.text);
END;
CREATE TRIGGER nrsr_vystupenia_fts_au AFTER UPDATE OF recnik, text ON nrsr_vystupenia BEGIN
  INSERT INTO nrsr_vystupenia_fts(nrsr_vystupenia_fts, rowid, recnik, text) VALUES ('delete', old.rowid, old.recnik, old.text);
  INSERT INTO nrsr_vystupenia_fts(rowid, recnik, text) VALUES (new.rowid, new.recnik, new.text);
END;
