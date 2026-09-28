-- Netopier v2 — voľby do orgánov samosprávy obcí a samosprávnych krajov 24. 10. 2026 (XDR-276).
-- Územie (kraje, okresy, obce), kandidáti s väzbou na strany a na entity (osoby), prieskumy, kalendár kampane.
-- Plní `pnpm run volby` (seed z data/volby/*.json + oficiálne zoznamy kandidátov). Idempotentné.

-- 1. Územie. Kódy krajov a okresov sú kódy ŠÚ SR (IDN4 1–8, IDN3 101–811), rovnaké ako v GeoJSON v data/volby/geo/.
CREATE TABLE volby_kraje (
  id TEXT PRIMARY KEY,                                           -- 'BA' | 'TT' | 'TN' | 'NR' | 'ZA' | 'BB' | 'PO' | 'KE'
  kod INTEGER NOT NULL UNIQUE,                                   -- ŠÚ SR IDN4
  nuts3 TEXT NOT NULL,
  nazov TEXT NOT NULL,                                           -- 'Bratislavský samosprávny kraj'
  skratka TEXT NOT NULL,                                         -- 'BSK'
  sidlo_obec_id TEXT NOT NULL,                                   -- volby_obce.id krajského mesta
  poslancov INTEGER,                                             -- počet poslancov zastupiteľstva volených 2026
  volebnych_obvodov INTEGER,
  url TEXT,                                                      -- web kraja (sekcia voľby)
  geo_subor TEXT                                                 -- data/volby/geo/kraje.geo.json (feature s rovnakým kod)
);

CREATE TABLE volby_okresy (
  kod INTEGER PRIMARY KEY,                                       -- ŠÚ SR IDN3 (101 Bratislava I … 811 Trebišov)
  nazov TEXT NOT NULL,
  kraj_id TEXT NOT NULL REFERENCES volby_kraje(id),
  vymera_ha INTEGER,
  geo_subor TEXT
);
CREATE INDEX volby_okresy_kraj ON volby_okresy (kraj_id);

CREATE TABLE volby_obce (
  id TEXT PRIMARY KEY,                                           -- 'bratislava' | 'kosice' | 'bratislava-stare-mesto' | 'kosice-sever' …
  nazov TEXT NOT NULL,
  druh TEXT NOT NULL CHECK (druh IN ('krajske_mesto','mesto','obec','mestska_cast')),
  kraj_id TEXT NOT NULL REFERENCES volby_kraje(id),
  okres_kod INTEGER REFERENCES volby_okresy(kod),
  nadradena_obec_id TEXT REFERENCES volby_obce(id),              -- mestská časť → mesto
  poslancov INTEGER,
  url TEXT                                                       -- oficiálna stránka (sekcia voľby)
);
CREATE INDEX volby_obce_kraj ON volby_obce (kraj_id);
CREATE INDEX volby_obce_nadradena ON volby_obce (nadradena_obec_id);

-- 2. Strany, hnutia a koalície. Názvy zo zoznamov sa normalizujú (src/volby/parse.ts) na kanonické id.
CREATE TABLE volby_strany (
  id TEXT PRIMARY KEY,                                           -- 'smer' | 'ps' | 'kdh' | 'kosicka-strana' …
  nazov TEXT NOT NULL,
  skratka TEXT,
  parlamentna INTEGER NOT NULL DEFAULT 0
);

-- 3. Kandidáti. Jeden riadok = jedna kandidatúra (osoba môže kandidovať na viac postov).
CREATE TABLE volby_kandidati (
  id TEXT PRIMARY KEY,                                           -- '<volba>:<uzemie>:<slug mena>'
  volba TEXT NOT NULL CHECK (volba IN ('predseda_kraja','poslanec_kraja','primator','starosta','poslanec_obce')),
  kraj_id TEXT NOT NULL REFERENCES volby_kraje(id),
  obec_id TEXT REFERENCES volby_obce(id),                        -- NULL pre krajské voľby
  obvod INTEGER,                                                 -- volebný obvod (poslanci)
  poradie INTEGER,                                               -- poradové číslo na hlasovacom lístku
  meno TEXT NOT NULL, priezvisko TEXT NOT NULL, tituly TEXT,
  vek INTEGER, zamestnanie TEXT, bydlisko TEXT,
  navrhovatel TEXT,                                              -- text zo zoznamu (strany oddelené čiarkou) alebo 'nezávislý kandidát'
  nezavisly INTEGER NOT NULL DEFAULT 0,
  stav TEXT NOT NULL DEFAULT 'registrovany' CHECK (stav IN ('ohlaseny','registrovany','vzdal_sa','odvolany')),
  stav_poznamka TEXT,
  entity_id TEXT REFERENCES entity(id),                          -- osoba v entitách (XDR-277 sledované osoby)
  zdroj_druh TEXT NOT NULL CHECK (zdroj_druh IN ('oficialny','media')),
  zdroj_url TEXT NOT NULL, zdroj_datum TEXT,                     -- dátum zverejnenia zoznamu / článku
  prvy_zber TEXT NOT NULL, posledny_zber TEXT NOT NULL
);
CREATE INDEX volby_kandidati_volba ON volby_kandidati (volba, kraj_id, obec_id);
CREATE INDEX volby_kandidati_entity ON volby_kandidati (entity_id);

CREATE TABLE volby_kandidat_strany (
  kandidat_id TEXT NOT NULL REFERENCES volby_kandidati(id),
  strana_id TEXT NOT NULL REFERENCES volby_strany(id),
  poradie INTEGER NOT NULL,                                      -- poradie v koalícii podľa zoznamu
  PRIMARY KEY (kandidat_id, strana_id)
);
CREATE INDEX volby_kandidat_strany_strana ON volby_kandidat_strany (strana_id);

-- 4. Prieskumy k voľbám (hlavička + hodnoty; hodnota má kandidáta, ak sa dá priradiť).
CREATE TABLE volby_prieskumy (
  id TEXT PRIMARY KEY,                                           -- 'sanep-2026-05-bsk-predseda'
  agentura TEXT NOT NULL, objednavatel TEXT,
  volba TEXT NOT NULL CHECK (volba IN ('predseda_kraja','primator','starosta')),
  kraj_id TEXT NOT NULL REFERENCES volby_kraje(id), obec_id TEXT REFERENCES volby_obce(id),
  zber_od TEXT, zber_do TEXT, zverejnene TEXT,
  vzorka INTEGER, metoda TEXT,
  nerozhodnuti REAL, ucast REAL,
  zdroj_url TEXT NOT NULL, poznamka TEXT
);
CREATE INDEX volby_prieskumy_uzemie ON volby_prieskumy (kraj_id, obec_id, zverejnene);

CREATE TABLE volby_prieskum_hodnoty (
  prieskum_id TEXT NOT NULL REFERENCES volby_prieskumy(id),
  meno TEXT NOT NULL,                                            -- ako v prieskume ('Juraj Droba', 'iný kandidát')
  percenta REAL NOT NULL,
  kandidat_id TEXT REFERENCES volby_kandidati(id),
  PRIMARY KEY (prieskum_id, meno)
);

-- 5. Kalendár kampane: zákonné termíny (zákon 180/2014, 181/2014, rozhodnutie 145/2026, harmonogram MV SR) + debaty, tlačovky.
CREATE TABLE volby_kalendar (
  id TEXT PRIMARY KEY,
  datum TEXT NOT NULL,                                           -- YYYY-MM-DD
  cas TEXT,                                                      -- HH:MM (Bratislava), NULL = celý deň
  druh TEXT NOT NULL CHECK (druh IN ('zakon','debata','tlacovka','ine')),
  nazov TEXT NOT NULL, popis TEXT,
  kraj_id TEXT REFERENCES volby_kraje(id), obec_id TEXT REFERENCES volby_obce(id),
  pravny_zaklad TEXT,                                            -- '§ 171 ods. 1 zákona 180/2014'
  zdroj_url TEXT
);
CREATE INDEX volby_kalendar_datum ON volby_kalendar (datum);

-- 6. Zdroje zoznamov kandidátov a ich posledné stiahnutie (pre log „čo pribudlo“ a STATUS).
CREATE TABLE volby_zdroje (
  id TEXT PRIMARY KEY,                                           -- 'kosice-primator'
  volba TEXT NOT NULL, kraj_id TEXT NOT NULL, obec_id TEXT,
  url TEXT NOT NULL, druh TEXT NOT NULL CHECK (druh IN ('oficialny','media')),
  format TEXT NOT NULL CHECK (format IN ('pdf','html','json')),
  posledne_stiahnute TEXT, posledny_hash TEXT, kandidatov INTEGER, chyba TEXT
);

-- 7. entity_alias: pridaný zdroj 'volby' (tabuľka bola prázdna, preto sa iba nahrádza).
DROP TABLE entity_alias;
CREATE TABLE entity_alias (
  entity_id TEXT NOT NULL REFERENCES entity(id), alias TEXT NOT NULL,
  zdroj TEXT NOT NULL CHECK (zdroj IN ('crz','klucove_slova','rpo','rucne','volby')),
  PRIMARY KEY (entity_id, alias)
);
