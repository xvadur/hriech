# AI redakcia XVADUR — výsledný návrh (Hriech + Netopier ako jeden celok)

Základ: backend **B1-cloudflare** (víťaz všetkých troch porôt), frontend **F2-astro-ssr** (víťaz dvoch porôt) s graftmi z F3-two-surfaces (víťaz tretej), B2, B3 a F1 presne podľa zoznamov poroty. Rozpory vyriešené takto:

| Rozpor | Rozhodnutie | Dôvod |
|---|---|---|
| Jeden Worker (F2) vs. dva Workery (B1, F3) | **Dva Workery: `netopier-zber` (zber, odvodenie, API) a `hriech-web` (verejný web aj terminál)**, spoločná D1 | porota F2 sama žiadala poistku „pri incidente rozdeliť“; B1 a F3 ju majú od začiatku; chybný deploy webu nezhodí zber |
| Terminál ako template stringy vo Workeri (B1) vs. SPA (F3) vs. Astro SSR (F2) | **Astro SSR `/t/*` v `hriech-web` na hoste `netopier.hriech.xvadur.com`** | graft porôt F3 aj B; jeden typový systém, žiadny sync tokenov, žiadna druhá aplikácia |
| Čítanie dát cez Service Binding (B1) vs. priamo z D1 (F2) | **Čítanie priamo z D1 cez spoločný balík `@netopier/redakcia` (rovnaké dopyty pre stránky, verejný JSON aj API); zápis iba cez `netopier-zber /api/*`** | jeden zdroj tvarov = „rovnaké tabuľky, rovnaké JSON“; jeden autoritatívny zapisovateľ = stavový stroj sa nedá obísť |
| Premenovanie `zber/`→`worker/`, D1 → `netopier` (B1) | **Nič sa nepremenúva** (`netopier/zber`, D1 `netopier-zber`, Worker `hriech-web`) | graft B3; premenovanie `hriech-web` by vyžadovalo presun domény |
| Vlastný `REDAKCIA_TOKEN` (B1) vs. Access Service Token (F3) | **Cloudflare Access na celom API hoste; agenti Service Token, Adam e-mail OTP; identita v JWT je aktér** | jeden mechanizmus, o jeden secret menej |
| Verejné JSON API na `api.hriech` (B1) | **Verejný JSON iba z `hriech-web` (`/api/*.json` cez tie isté dopyty); `api.hriech.xvadur.com` je celé za Access** | web nič verejné nepotrebuje z API; menej plôch na ochranu |

Overené v repozitári 27. 9. 2026: root `wrangler.jsonc` má iba `assets` + custom domain, `astro.config.mjs` je `output: "static"`, `astro 7.2.2`, `ajv` v devDependencies; root `pnpm-workspace.yaml` obsahuje iba `allowBuilds` (žiadne `packages`); `netopier/zber` je samostatný pnpm balík s vlastným lockfile, `wrangler.jsonc` s `database_id` placeholder a `workers_dev: true`, `src/index.ts` má `/health`, `POST /run`, `scheduled`, `queue`, `runJob`, `CONNECTORS`; `Job = {source, channel?, batch?}`; jediná migrácia `0001_archiv.sql`. Súbory openclaw (`scoring.js`, `status.js`, `evidence.json`, `signal.json`, `predictions.json`, `narrative.json`, `threat.json`, `api.js`, `config.js`) sú iba v dočasnom scratchpade.

---

## A. Rozhodnutia, ktoré musí urobiť Adam (východisková voľba tučne)

| # | Rozhodnutie | Východisko | Blokuje |
|---|---|---|---|
| D1 | Workers Paid (5 $/mes.), `wrangler d1 create netopier-zber`, R2, fronty, Access, deploy `netopier-zber` (XDR-258, XDR-228) | **áno, teraz** | I1 a všetko po ňom |
| D2 | Smie Claude Code (agenti) spracúvať **verejné** texty médií a registrov (RSS titulky a súhrny, CRZ, TED, ŠÚ SR)? Zákaz v `netopier/STACK.md` sa písal pre súkromie. | **áno pre verejné texty (ADR-011); zákaz ostáva pre Fiki raw, `xvadur_core`, realitný trh, zdravie; Worker LLM nikdy nevolá; embeddingy sa nepoužívajú** | Z4 (linka); do rozhodnutia beží režim bez LLM |
| D3 | Kde beží denný beh agentov: Claude Code cloud routine / ručne z hlavnej session / Paperclip (XDR-226) / Mac | **cloud routine (08:30, 18:30, nedeľa 09:00 Europe/Bratislava); prvé dva týždne ručne `/redakcia`; Paperclip nie, Mac nie** | Z8 |
| D4 | Domény `api.hriech.xvadur.com` (API, Access) a `netopier.hriech.xvadur.com` (terminál, Access) | **áno obe** | I6 |
| D5 | Print vizuál v2: Source Serif 4 (titulky, čítanie) + Source Sans 3 (text, UI) + IBM Plex Mono (čísla, časy, terminál), papier `#f8f5ef`, ružová iba wordmark a pripnutý stav; DESIGN.md v2. Alternatíva B: Rubik ostáva na titulkoch, pribudne iba IBM Plex Mono. | **v2 so serifom** | Z7 |
| D6 | Sada zvodov v1: 6 kategórií (VLA vláda a zmluvy, PEN peniaze štátu a obstarávania, MED médiá a vlastníctvo, SUD súdy a polícia, EU/BEZ zahraničie a bezpečnosť, EKO ekonomika a demografia) + SWAN; 4–6 hypotéz na kategóriu; po zverejnení zamknuté | **agent navrhne 30 do 15. 10., Adam škrtne a zamkne pred Z3** | Z3 |
| D7 | Rozšíriť `sources/slovak-core.yaml` o SME, TASR, HN, TA3, Markíza, JOJ, STVR, Postoj, Štandard, .týždeň; zúžiť World Monitor RSS na kategórie `europe` + `gov` | **áno obidve** | I8 |
| D8 | Kartička zdroja: v1 iba fakty (typ, rozsah, vlastník z mapy, pokrytie 30 dní, kto priniesol prvý); `bias`/`faktickost` ostávajú `neurcene`, kým nevznikne `docs/METODIKA-ZDROJE.md`, potom označené ako interpretácia so zdrojmi hodnotenia | **áno** | Z6 |
| D9 | Schvaľovateľ `schvalil` je iba Adam Rudavský (Access identita); agent nikdy, ani pri oprave preklepu; automatické vydanie bez redaktora nesmie ísť von do Živé | **áno** | — |
| D10 | Python vrstva `netopier/src/netopier/` + Alembic + Docker: archivovať do `xvadur_core/zdroje/hriech/archiv-2026-09/netopier-python/` a zmazať z verejného repozitára po porte čistých modulov (ADR-010) | **áno, po I3** | I12 |
| D11 | Kataster: ostať pri 2 pilotných oblastiach do Vianoc; geometria parciel do R2, v D1 iba hash + referenčný bod | **áno** | V7 |
| D12 | World Monitor API Starter (99,99 $/mes.) | **nie** | — |
| D13 | Cloudflare Web Analytics na Hriechu (bez cookies, malý JS beacon) | **zapnúť** | Z7 |
| D14 | Mená fyzických osôb z CRZ: interne v termináli áno, verejne nikdy (`entity.verejne=0`) | **áno** | — |

D1 blokuje všetko okrem prvého kroku. D2 a D3 sú potrebné do Z4/Z8 (november).

## B. Prvý krok, ktorý sa dá začať hneď lokálne, a jeho dôkaz

**Scope:** základná migrácia a deterministická normalizácia nad lokálnou D1 (14 299 záznamov z 26. 9.), bez Paid, bez rozhodnutí Adama.

Kroky:
1. Skopírovať openclaw súbory zo scratchpadu do `netopier/redakcia/test/fixtures/openclaw/` (scratchpad je dočasný).
2. Root `pnpm-workspace.yaml`: `packages: ["netopier/zber", "netopier/redakcia"]`; nový balík `netopier/redakcia` (`@netopier/redakcia`, TypeScript, vitest); zmazať `netopier/zber/pnpm-workspace.yaml` a `pnpm-lock.yaml` (jeden lockfile v koreni).
3. `netopier/redakcia/src/skore.ts` = port `scoring.js` + `status.js`; test `skore.test.ts` spustí pôvodný `scoring.js` z fixtures nad `evidence.json` (SEC-05, 143 položiek) a porovná skóre, istotu a odporúčaný stav 1:1.
4. `netopier/zber/migrations/0002_zaklad.sql` (časť 2): `records.published_at_utc` + index, `entity`, `record_entity`, `records_fts` (FTS5), `zdroje`, `zdroj_pokrytie_denne`, `crz_ciselniky`.
5. `netopier/zber/src/derive/normalize.ts` (5 formátov dátumu → UTC) a `derive/entity.ts` (IČO z CRZ/TED do `record_entity`), typ `DeriveJob`, `scripts/derive-node.mjs` na lokálny beh.

**Hotové keď (dôkaz):**
- `npx -y pnpm@11.19.0 -r test` zelené (zber 27 + nové; redakcia parity test);
- `npx wrangler d1 execute netopier-zber --local --command "SELECT count(*) FROM records WHERE published_at_utc IS NOT NULL"` ≥ 13 400 (všetko okrem 820 bez dátumu);
- `SELECT count(*) FROM record_entity` ≥ 4 000 a `SELECT count(*) FROM records_fts WHERE records_fts MATCH 'zmluva'` > 0 (FTS5 v miniflare D1 overené);
- commit v `hriech` s číslom úlohy v Lineari (nová úloha v projekte Hriech: „0002 základ a normalizácia nad lokálnou D1“, štítok Agent).

---

## 1. Stack a kde čo beží

| Vrstva | Služba | Názov / súbor | Plán, cena (mesačne) |
|---|---|---|---|
| Zber, odvodenie, API | Cloudflare Worker | `netopier-zber` (`netopier/zber/`), host `api.hriech.xvadur.com` | Workers Paid 5 $ ≈ 4,6 € (jediná platba; kryje oba Workery) |
| Verejný web + terminál | Cloudflare Worker | `hriech-web` (koreň repozitára), Astro 7.2.2 + `@astrojs/cloudflare` (peer `astro ^7.2.0`, overené porotou); hosty `hriech.xvadur.com`, `netopier.hriech.xvadur.com` | v cene |
| Databáza | D1 | `netopier-zber` (jedna DB, binding `DB` v oboch Workeroch) | v Paid: 5 GB v cene, strop 10 GB/DB, 25 mld. čítaní, 50 mil. zapísaných riadkov |
| Surové dáta, archív URL, zálohy, snapshoty | R2 | `netopier-archiv`, prefixy `raw/`, `archiv/`, `zalohy/`, `export/`, `snapshots/`, `redakcia/` | free 10 GB-mes., egress 0 |
| Fronta | Queues | `netopier-zber-jobs` + DLQ `netopier-zber-dlq` (existujú vo wrangler.jsonc) | v cene |
| Plánovanie | Cron Triggers | `*/30 * * * *`, `20 5 * * *` (existujú), nové `20 6 * * *` (denné odvodenie a rollup), `10 3 * * 0` (záloha), `10 3 1 * *` (archivácia mesiaca) | v cene |
| Prístup | Cloudflare Access (Zero Trust Free) | aplikácia `Netopier terminál` (`netopier.hriech.xvadur.com`, politika e-mail OTP Adam), aplikácia `Netopier API` (`api.hriech.xvadur.com`, politiky: Adam OTP + Service Token `netopier-agenti`; bypass pre `GET /health`) | 0 € |
| Spoločný kód | pnpm balík | `@netopier/redakcia` (`netopier/redakcia/`): typy, dopyty, stavový stroj, skóre, autorstvo, overenie JWT, kontrakty | — |
| Redakčná linka (LLM) | Claude Code | agent `hriech` + subagenti v `_claude/agents/hriech-*.md` (workspace repo, súkromný), skill `_claude/skills/redakcia/`, cloud routines `hriech-redakcia-rano|vecer|tyzden` | v Adamovom predplatnom |
| Fonty | npm | existujúce `@fontsource-variable/rubik`, `source-sans-3`; nové `@fontsource-variable/source-serif-4`, `@fontsource/ibm-plex-mono` | 0 € |
| Analytika | Cloudflare Web Analytics | beacon v `BaseLayout.astro` (D13) | 0 € |

Spolu ≈ 5 €/mes. Mimo: World Monitor (D12, nie), Workers AI/Vectorize (až po vyhodnotení kvality udalostí, nie do Vianoc).

Kde čo beží:
- **`netopier-zber`**: `fetch` (`/health`, `/run*`, `/api/*`), `scheduled` (plán zberu + odvodenie), `queue` (zber aj `derive`, `archiv`, `zaloha` úlohy). Žiadne HTML, žiadne LLM.
- **`hriech-web`**: statické stránky (články, prípady, mapy, O Hriechu) z buildu; živé stránky (`/`, `/minuta*`, `/udalosti*`, `/zvody*`, `/vydanie*`, `/zdroje*`, `/seizmograf`, `/api/*.json`) s `prerender = false` čítajú D1 cez `Astro.locals.runtime.env.DB`; terminál `/t/*` na druhom hoste za Access; zápisy posiela cez Service Binding `NETOPIER` na `netopier-zber /api/*` s preposlaným `Cf-Access-Jwt-Assertion`.
- **Claude Code routine**: číta a píše iba `https://api.hriech.xvadur.com/api/*` so Service Tokenom (`CF-Access-Client-Id/Secret` ako secrets routine) a hlavičkou `X-Agent: <meno>`.
- **Mac**: iba Fiki korpus (`netopier/fiki/`) a ručné `wrangler` príkazy na pokyn. Nič trvalé.

Lokálny vývoj: `hriech-web` `astro dev` s `platformProxy: { enabled: true, configPath: "wrangler.jsonc", persist: { path: "./netopier/zber/.wrangler/state" } }`, takže web aj zber čítajú tú istú lokálnu D1 s reálnymi dátami.

`wrangler.jsonc` (koreň, `hriech-web`) po zmene:

```jsonc
{
  "name": "hriech-web",
  "main": "./dist/_worker.js/index.js",
  "compatibility_date": "2026-09-03",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": "./dist", "binding": "ASSETS", "html_handling": "drop-trailing-slash", "not_found_handling": "404-page" },
  "routes": [
    { "pattern": "hriech.xvadur.com", "custom_domain": true },
    { "pattern": "netopier.hriech.xvadur.com", "custom_domain": true }
  ],
  "d1_databases": [{ "binding": "DB", "database_name": "netopier-zber", "database_id": "<po d1 create>" }],
  "services": [{ "binding": "NETOPIER", "service": "netopier-zber" }],
  "vars": { "PUBLIC_HOST": "hriech.xvadur.com", "TERMINAL_HOST": "netopier.hriech.xvadur.com",
            "ACCESS_TEAM": "<team>.cloudflareaccess.com", "ACCESS_AUD_TERMINAL": "<aud>" },
  "observability": { "enabled": true }
}
```

`netopier/zber/wrangler.jsonc` pribudne: `"routes": [{ "pattern": "api.hriech.xvadur.com", "custom_domain": true }]`, `"workers_dev": false`, cron `20 6 * * *`, `10 3 * * 0`, `10 3 1 * *`, vars `ACCESS_TEAM`, `ACCESS_AUD_API`, `ACCESS_AUD_TERMINAL`, `"limits": { "cpu_ms": 60000 }`. Secrets: `ZBER_TOKEN` (existuje). Žiadny iný secret vo Workeroch.

Príkazy (koreň): `pnpm dev`, `pnpm check`, `pnpm test` (node --test + `pnpm -r test`), `pnpm build` (`astro build && node scripts/verify-public-build.mjs`), `pnpm smoke` (`node scripts/smoke-live.mjs`, `wrangler dev` nad lokálnou D1), `pnpm qa` (check + test + build + smoke), `pnpm run deploy` (iba na pokyn), `pnpm db:migrate:local|remote` (deleguje do `netopier/zber`), `pnpm seed` (`node netopier/zber/scripts/seed.mjs --local|--remote`). pnpm nie je v PATH: `npx -y pnpm@11.19.0`.

---

## 2. Dátový model (D1, SQLite dialekt, migrácie `netopier/zber/migrations/`)

Zásady: JSON iba ako TEXT (`json_extract`), bez polí a vektorov; **CHECK na každom enum stĺpci** (graft B2); každý odvodený riadok má `vytvoril` (`pravidlo:<názov>` | `algoritmus:<verzia>` | `agent:<meno>` | `adam` | `system`) a `beh_id` (→ `runs.id` alebo `behy_redakcie.id`); zmena stavu = riadok v `desk_prechody` alebo `zvod_stav_historia`; zmena obsahu = riadok v `revizie`; nikdy UPDATE bez revízie. `records`, `runs`, `source_state` ostávajú bez zmeny.

### 0002_zaklad.sql

```sql
ALTER TABLE records ADD COLUMN published_at_utc TEXT;            -- ISO UTC, plní derive:normalize (5 formátov, 820 NULL ostáva NULL)
CREATE INDEX records_published_utc ON records(published_at_utc);

CREATE TABLE zdroje (                                            -- kartička zdroja (Ground News/NewsGuard), v1 iba fakty
  id TEXT PRIMARY KEY,                                           -- 'dennikn' | 'wm-bbc-world' | 'crz' | 'ted' | 'kataster' | 'statistika'
  nazov TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('medium','agentura','register','institucia','thinktank','agregator')),
  rozsah TEXT NOT NULL CHECK (rozsah IN ('lokalny','narodny','medzinarodny')),
  krajina TEXT, jazyk TEXT, url TEXT, rss_feed_id TEXT,          -- data/media-feeds.json / worldmonitor-feeds.json id
  outlet_id TEXT,                                                -- src/data/editorial-organization-map.json outlets[].id (10 médií)
  vlastnik TEXT, vlastnik_ico TEXT,
  bias TEXT NOT NULL DEFAULT 'neurcene' CHECK (bias IN ('lavy','stred_lavy','stred','stred_pravy','pravy','neurcene')),
  faktickost TEXT NOT NULL DEFAULT 'neurcene' CHECK (faktickost IN ('vysoka','zmiesana','nizka','neurcene')),
  hodnotenie_zdroje TEXT NOT NULL DEFAULT '[]',                  -- JSON [{url, poznamka}] – bez zdroja ostáva neurcene (D8)
  hodnotil TEXT, hodnotene_at TEXT,
  wm_tier INTEGER, wm_risk TEXT,                                 -- z inventára World Monitor
  sledovany INTEGER NOT NULL DEFAULT 1,                          -- 1 = počíta sa do pokrytia SK redakcií
  pozastaveny_at TEXT,                                           -- kanál s 3 chybami po sebe
  verejny INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE zdroj_pokrytie_denne (                              -- attention over time (Media Cloud) + kto priniesol prvý
  zdroj_id TEXT NOT NULL REFERENCES zdroje(id), den TEXT NOT NULL,
  zaznamov INTEGER NOT NULL, udalosti INTEGER NOT NULL, prvy INTEGER NOT NULL,
  podiel REAL NOT NULL,                                          -- zaznamov / Σ zaznamov sledovaných SK médií v ten deň
  PRIMARY KEY (zdroj_id, den)
);
CREATE TABLE entity (
  id TEXT PRIMARY KEY,                                           -- 'ico:00156752' | 'osoba:<slug>' | 'organ:<slug>'
  druh TEXT NOT NULL CHECK (druh IN ('statny_organ','obec','firma','fyzicka_osoba','neznamy')),
  nazov TEXT NOT NULL, ico TEXT,
  verejne INTEGER NOT NULL DEFAULT 1,                            -- fyzicka_osoba = 0; verejné dopyty filtrujú verejne=1 (D14)
  map_person_id TEXT, map_outlet_id TEXT,                        -- väzba na mapu redakcií
  sledovane INTEGER NOT NULL DEFAULT 0, sledovane_dovod TEXT,
  prvy_vyskyt TEXT NOT NULL, posledny_vyskyt TEXT NOT NULL
);
CREATE INDEX entity_ico ON entity(ico);
CREATE TABLE record_entity (
  record_id INTEGER NOT NULL REFERENCES records(id), entity_id TEXT NOT NULL REFERENCES entity(id),
  rola TEXT NOT NULL CHECK (rola IN ('objednavatel','dodavatel','obstaravatel','vitaz','akter','zmienka')),
  PRIMARY KEY (record_id, entity_id, rola)
);
CREATE INDEX record_entity_entity ON record_entity(entity_id);
CREATE VIRTUAL TABLE records_fts USING fts5(title, summary, content='', tokenize='unicode61 remove_diacritics 2');
-- rowid = records.id; plní archive.ts pri INSERT; overené v prvom kroku, fallback LIKE nad title
CREATE TABLE crz_ciselniky (                                     -- rezort, typ, druh, stav (kódy bez číselníka v exporte)
  druh TEXT NOT NULL CHECK (druh IN ('rezort','typ','druh','stav')), kod TEXT NOT NULL, nazov TEXT NOT NULL,
  zdroj_url TEXT, PRIMARY KEY (druh, kod)
);
```

`record_entity` sa plní v `archiveChannel` hneď pri INSERT (crz: `data.objednavatel_ico`, `data.dodavatel_ico`; ted: `data.obstaravatel_id[0]`, `data.vitaz_id[]`), pre existujúce riadky jednorazovo `derive:entity`. `entity.druh='fyzicka_osoba'` sa nastaví, keď IČO chýba a názov nie je organizácia (heuristika + ručná oprava v termináli).

### 0003_udalosti.sql

```sql
CREATE TABLE udalosti (
  id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE,             -- '2026-11-05-ms-sr-dodatok-plan-obnovy'
  verzia INTEGER NOT NULL DEFAULT 1,
  titulok TEXT NOT NULL, zhrnutie_md TEXT,                       -- zhrnutie s citáciami [^c<claim_id>], píše redaktor
  akteri TEXT NOT NULL DEFAULT '[]', organizacie TEXT NOT NULL DEFAULT '[]', entity_ids TEXT NOT NULL DEFAULT '[]',
  miesto TEXT, miesto_presnost TEXT NOT NULL DEFAULT 'neznama' CHECK (miesto_presnost IN ('adresa','obec','okres','kraj','stat','neznama')),
  cas_od TEXT, cas_do TEXT, cas_presnost TEXT NOT NULL DEFAULT 'neznama' CHECK (cas_presnost IN ('minuta','hodina','den','tyzden','mesiac','neznama')),
  typy_akcie TEXT NOT NULL DEFAULT '[]',                         -- schvalil|oslobodil|obvinil|vysetruje|povedal|zautocil|vymenoval|odvolal|reported_development|…
  institucionalny_stav TEXT,
  istota REAL NOT NULL DEFAULT 0,
  novost TEXT NOT NULL DEFAULT 'new' CHECK (novost IN ('new','update')),
  sila_dokazov TEXT NOT NULL DEFAULT 'single_source' CHECK (sila_dokazov IN ('single_source','corroborated','register')),
  pocet_zaznamov INTEGER NOT NULL DEFAULT 0, pocet_zdrojov INTEGER NOT NULL DEFAULT 0, pocet_nezavislych INTEGER NOT NULL DEFAULT 0,
  prvy_record_id INTEGER REFERENCES records(id), prvy_zdroj_id TEXT REFERENCES zdroje(id), prvy_at TEXT,
  pokrytie_podiel REAL NOT NULL DEFAULT 0,                       -- sledované SK redakcie, ktoré pokryli / všetky sledované
  blindspot TEXT CHECK (blindspot IN ('bez_pokrytia','bez_udalosti','asymetria')),
  blindspot_skore REAL NOT NULL DEFAULT 0,                       -- |pokrytie_registre − pokrytie_media| / max(1, …)
  rozsah TEXT NOT NULL DEFAULT 'narodny' CHECK (rozsah IN ('lokalny','narodny','medzinarodny')),
  krivka TEXT NOT NULL DEFAULT 'media' CHECK (krivka IN ('media','registre','obe')),
  algoritmus TEXT NOT NULL,                                      -- 'udalosti-ts-v1'
  stav_zivota TEXT NOT NULL DEFAULT 'active' CHECK (stav_zivota IN ('active','superseded','split_source')),
  verejna INTEGER NOT NULL DEFAULT 0,                            -- 1 = desk položka typu udalost je vydane
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX udalosti_cas ON udalosti(cas_od); CREATE INDEX udalosti_verejna ON udalosti(verejna, cas_od);
CREATE TABLE udalost_dokazy (
  id INTEGER PRIMARY KEY, udalost_id INTEGER NOT NULL REFERENCES udalosti(id), record_id INTEGER NOT NULL REFERENCES records(id),
  zdroj_id TEXT REFERENCES zdroje(id),
  vztah TEXT NOT NULL CHECK (vztah IN ('syndicated_copy','same_event','event_update','same_topic','unrelated')),
  vyrez TEXT, vyrez_od INTEGER, vyrez_do INTEGER, typ_akcie TEXT, cas TEXT,
  skore REAL, priznaky TEXT, dovod TEXT,
  povod TEXT NOT NULL DEFAULT 'algorithm' CHECK (povod IN ('algorithm','human')),
  stav TEXT NOT NULL DEFAULT 'accepted' CHECK (stav IN ('accepted','rejected','suggested')),
  verzia_prahov TEXT NOT NULL, decided_at TEXT NOT NULL,
  UNIQUE (udalost_id, record_id)
);
CREATE INDEX udalost_dokazy_record ON udalost_dokazy(record_id);
CREATE TABLE udalost_pokrytie (                                  -- základ pre „kto priniesol prvý“, podiel, porovnanie titulkov, rebríček
  udalost_id INTEGER NOT NULL REFERENCES udalosti(id), zdroj_id TEXT NOT NULL REFERENCES zdroje(id),
  prvy_record_id INTEGER NOT NULL, prvy_at TEXT NOT NULL, pocet INTEGER NOT NULL, titulok TEXT,
  PRIMARY KEY (udalost_id, zdroj_id)
);
CREATE TABLE udalost_rodokmen (
  rodic_id INTEGER NOT NULL, dieta_id INTEGER NOT NULL,
  operacia TEXT NOT NULL CHECK (operacia IN ('merge','split','event_update')),
  dovod TEXT, povod TEXT NOT NULL CHECK (povod IN ('algorithm','human')), kto TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE register_udalosti (                                 -- „čo sa stalo“ – typované, deterministické (graft B2)
  id INTEGER PRIMARY KEY, record_id INTEGER NOT NULL UNIQUE REFERENCES records(id),
  druh TEXT NOT NULL CHECK (druh IN ('crz_zmluva','crz_dodatok','crz_zmena','ted_vyhlasenie','ted_vysledok','ted_zmena','kataster_nova_verzia','statistika_aktualizacia')),
  entity_ids TEXT NOT NULL DEFAULT '[]', suma REAL, nastalo_at TEXT NOT NULL,
  cas_presnost TEXT NOT NULL CHECK (cas_presnost IN ('minuta','den','mesiac','neznama')),
  miesto TEXT, miesto_presnost TEXT NOT NULL CHECK (miesto_presnost IN ('parcela','obec','okres','kraj','stat','neznama')),
  popis TEXT NOT NULL, pravidlo TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX register_udalosti_cas ON register_udalosti(nastalo_at);
CREATE TABLE udalost_registre (                                  -- spojenie mediálnej udalosti s registrom = krivka 'obe'
  udalost_id INTEGER NOT NULL REFERENCES udalosti(id), register_udalost_id INTEGER NOT NULL REFERENCES register_udalosti(id),
  vztah TEXT NOT NULL CHECK (vztah IN ('rovnake_ico','rovnaka_zmluva','rovnaka_parcela','rucne')),
  vytvoril TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY (udalost_id, register_udalost_id)
);
```

### 0004_zvody.sql (EKG podľa openclaw `scoring.js` / `status.js`, dve krivky)

```sql
CREATE TABLE zvody (
  id TEXT PRIMARY KEY,                                           -- 'VLA-01'
  kategoria TEXT NOT NULL CHECK (kategoria IN ('VLA','PEN','MED','SUD','EU','EKO','SWAN')),
  nazov TEXT NOT NULL, hypoteza TEXT NOT NULL, popis TEXT, plain_popis TEXT,
  stav TEXT NOT NULL DEFAULT 'nepotvrdene' CHECK (stav IN ('nepotvrdene','vznikajuce','potvrdene','vyvratene')),
  stav_zmeneny_at TEXT, zamknute_at TEXT, verejny INTEGER NOT NULL DEFAULT 0,
  skore INTEGER NOT NULL DEFAULT 0, istota TEXT NOT NULL DEFAULT 'insufficient' CHECK (istota IN ('insufficient','low','medium','high')),
  pocet_signalov INTEGER NOT NULL DEFAULT 0,
  vytvoril TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TRIGGER zvody_zamok BEFORE UPDATE OF hypoteza, nazov, kategoria ON zvody
  WHEN OLD.zamknute_at IS NOT NULL BEGIN SELECT RAISE(ABORT, 'zvod je zamknuty'); END;
CREATE TABLE zvod_stav_historia (
  zvod_id TEXT NOT NULL REFERENCES zvody(id), zo_stavu TEXT, do_stavu TEXT NOT NULL, skore INTEGER, istota TEXT, dovod TEXT,
  povod TEXT NOT NULL CHECK (povod IN ('algorithm','human')), kto TEXT NOT NULL, at TEXT NOT NULL
);
CREATE TABLE signaly (
  id TEXT PRIMARY KEY,                                           -- 'YYYYMMDD-KAT-NNN'
  titulok TEXT NOT NULL, popis TEXT,
  source_fact TEXT NOT NULL, implication TEXT,                   -- fakt oddelený od výkladu (Semafor)
  zdroj_id TEXT REFERENCES zdroje(id), zdroj_nazov TEXT NOT NULL, zdroj_url TEXT NOT NULL,
  zdroj_typ TEXT NOT NULL CHECK (zdroj_typ IN ('primarny','sekundarny','agregator')),
  zdroj_published_date TEXT, zdroj_rozsah TEXT CHECK (zdroj_rozsah IN ('lokalny','narodny','medzinarodny')),
  scan_date TEXT NOT NULL, event_date TEXT, event_date_known INTEGER NOT NULL DEFAULT 0,
  cas_presnost TEXT CHECK (cas_presnost IN ('minuta','hodina','den','tyzden','mesiac','neznama')),
  miesto TEXT, miesto_presnost TEXT CHECK (miesto_presnost IN ('adresa','obec','okres','kraj','stat','neznama')),
  krivka TEXT NOT NULL CHECK (krivka IN ('registre','media')),
  record_id INTEGER REFERENCES records(id), udalost_id INTEGER REFERENCES udalosti(id), register_udalost_id INTEGER REFERENCES register_udalosti(id),
  archiv_id INTEGER,
  istota TEXT NOT NULL CHECK (istota IN ('high','medium','low')),
  tagy TEXT NOT NULL DEFAULT '[]',
  stav TEXT NOT NULL DEFAULT 'navrh' CHECK (stav IN ('navrh','potvrdeny','zamietnuty')),   -- registre: hneď potvrdeny (primárny zdroj)
  vytvoril TEXT NOT NULL, overil TEXT, beh_id TEXT, created_at TEXT NOT NULL,
  UNIQUE (record_id, vytvoril)
);
CREATE INDEX signaly_scan ON signaly(scan_date, krivka);
CREATE TABLE signal_zvody (                                      -- prediction_links
  signal_id TEXT NOT NULL REFERENCES signaly(id), zvod_id TEXT NOT NULL REFERENCES zvody(id),
  relevancia TEXT NOT NULL CHECK (relevancia IN ('direct','supporting','tangential')),      -- 2 / 1 / 0.3
  smer TEXT NOT NULL CHECK (smer IN ('confirming','contradicting','neutral')),              -- +1 / −1 / 0
  sila TEXT NOT NULL CHECK (sila IN ('strong','moderate','weak')),                          -- 3 / 1.5 / 0.5
  odovodnenie TEXT, klasifikoval TEXT NOT NULL,
  PRIMARY KEY (signal_id, zvod_id)
);
CREATE TABLE zvod_skore_denne (                                  -- EKG rad; jeden riadok na zvod × deň × krivka
  zvod_id TEXT NOT NULL REFERENCES zvody(id), den TEXT NOT NULL,
  krivka TEXT NOT NULL CHECK (krivka IN ('spolu','registre','media')),
  skore INTEGER NOT NULL, pocet INTEGER NOT NULL, confirming INTEGER NOT NULL, contradicting INTEGER NOT NULL, neutral INTEGER NOT NULL,
  raw_weighted_sum REAL NOT NULL, total_weight REAL NOT NULL,
  istota TEXT NOT NULL CHECK (istota IN ('insufficient','low','medium','high')),
  odporucany_stav TEXT NOT NULL, pohyb TEXT NOT NULL CHECK (pohyb IN ('up','down','flat')),
  algoritmus TEXT NOT NULL,                                      -- 'openclaw-scoring-v1'
  PRIMARY KEY (zvod_id, den, krivka)
);
CREATE TABLE rollup_denne (                                      -- signal.json + narrative.json + threat + momentum
  den TEXT PRIMARY KEY,
  category_scores TEXT NOT NULL,                                 -- JSON {KAT:{score,movement,signal_count}} pre spolu/registre/media
  summary TEXT NOT NULL,                                         -- JSON {total_signals, by_category, by_direction, predictions_affected, headline}
  narrative TEXT,                                                -- JSON {headline, summary, claims:[{statement,type,signal_ids}], confidence}; redaktor, po schválení
  threat_level TEXT NOT NULL CHECK (threat_level IN ('calm','elevated','high')), threat_reason TEXT,
  momentum TEXT NOT NULL,                                        -- JSON per zvod {this_week, previous_week, trend: spike|rising|stable|falling}
  nalezy TEXT NOT NULL DEFAULT '[]', verzia TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE nalezy (                                            -- rozdiel dvoch kriviek + skoky = vstup triáže
  id INTEGER PRIMARY KEY, den TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('blindspot','pokrytie_bez_udalosti','skok','prva_zmienka','zmena_registra','asymetria_pokrytia')),
  udalost_id INTEGER, register_udalost_id INTEGER, zvod_id TEXT, entity_id TEXT,
  popis TEXT NOT NULL, skore REAL NOT NULL, dokaz TEXT NOT NULL,   -- JSON {record_ids, pocty}
  stav TEXT NOT NULL DEFAULT 'novy' CHECK (stav IN ('novy','v_triazi','zamietnuty','spracovany')),
  created_at TEXT NOT NULL
);
CREATE INDEX nalezy_den ON nalezy(den, stav);
```

Vzorec (`@netopier/redakcia/src/skore.ts`, port `scoring.js`): `w = sila × relevancia × istota`; ak `scan_date` starší než 30 dní, `w ×= 0,5`; `d = w × smer`; `skore = round(clamp(Σd / (9 × n) × 100, −100, 100))`; `istota`: `n ≥ 10 ∧ (confirming+contradicting) ≥ 5 → high`, `n ≥ 5 → medium`, `n ≥ 1 → low`, inak `insufficient`; odporúčaný stav: `n < 3 → bez zmeny`, `≥ 50 ∧ istota ≠ low → potvrdene`, `≤ −50 → vyvratene`, `|skore| ≥ 20 → vznikajuce`; povolené prechody presne ako `status.js`. Krivka `spolu` = všetky potvrdené signály, `registre` = `krivka='registre'`, `media` = `krivka='media'`. Nálezy: `blindspot` = zvod alebo entita so signálom `registre` za 7 dní a 0 dokazov `media` k tej istej entite; `pokrytie_bez_udalosti` = opačne; `skok` = zmena `spolu` o ≥ 15 bodov za deň; `prva_zmienka` = entita z `sledovane` prvý raz v RSS; `zmena_registra` = `register_udalosti` so sledovanou entitou.

### 0005_redakcia.sql (desk ako stavový stroj, tvrdenia, archív, Minúta, vydania, behy)

```sql
CREATE TABLE archiv (                                            -- Auto Archiver: každé citované URL
  id INTEGER PRIMARY KEY, url TEXT NOT NULL, kanonicka_url TEXT NOT NULL,
  sha256 TEXT NOT NULL, r2_key TEXT NOT NULL,                    -- archiv/RRRR/MM/DD/<sha16>.<ext>
  content_type TEXT, status_code INTEGER, velkost INTEGER, titulok TEXT,
  captured_at TEXT NOT NULL, record_id INTEGER, prva_verzia_id INTEGER, vytvoril TEXT NOT NULL,
  UNIQUE (kanonicka_url, sha256)
);
CREATE TABLE claims (
  id INTEGER PRIMARY KEY, desk_id INTEGER NOT NULL, poradie INTEGER NOT NULL,
  text TEXT NOT NULL,
  typ TEXT NOT NULL CHECK (typ IN ('fakt','interpretacia','medzera')),
  udalost_id INTEGER, signal_id TEXT,
  zdroj_record_id INTEGER REFERENCES records(id), zdroj_url TEXT, archiv_id INTEGER REFERENCES archiv(id),
  zdroj_typ TEXT CHECK (zdroj_typ IN ('primarny','sekundarny')),
  citacia_vyrez TEXT, citacia_od INTEGER, citacia_do INTEGER,   -- presný výrez zo zdroja (graft B2/F3)
  stav TEXT NOT NULL DEFAULT 'neoverene' CHECK (stav IN ('neoverene','overene','nepravda','nerozhodnute')),
  overenie TEXT,                                                 -- JSON {metoda, primarna_url, citat, poznamka}
  overil TEXT, overene_at TEXT, vytvoril TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE INDEX claims_desk ON claims(desk_id, stav);
CREATE TABLE desk (                                              -- Superdesk desk/stage
  id INTEGER PRIMARY KEY,
  typ TEXT NOT NULL CHECK (typ IN ('udalost','zvod','minuta','clanok','vydanie','narativ')),
  ref_id TEXT NOT NULL,                                          -- udalosti.slug | zvody.id | minuta_posty.slug | slug článku | vydania.den | rollup_denne.den
  stav TEXT NOT NULL DEFAULT 'ingest' CHECK (stav IN ('ingest','kandidat','overene','napisane','schvalene','vydane','zamietnute','stiahnute')),
  dovod_triaze TEXT, priorita INTEGER NOT NULL DEFAULT 5,
  podklad TEXT,                                                  -- JSON od reportéra {fakty:[claim_id], signaly:[id], registre:[register_udalost_id], porovnanie_titulkov:[…], otvorene_otazky:[…]}
  draft_md TEXT, ai_autorstvo TEXT,
  autor_agent TEXT, model TEXT, prompt_version TEXT,             -- povinné pri stave napisane (API odmietne bez nich)
  schvalil TEXT, schvalene_at TEXT, vydane_at TEXT, vydane_url TEXT,
  beh_id TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  UNIQUE (typ, ref_id)
);
CREATE INDEX desk_stav ON desk(stav, updated_at);
CREATE TABLE desk_prechody (desk_id INTEGER NOT NULL, z TEXT NOT NULL, do TEXT NOT NULL, kto TEXT NOT NULL, poznamka TEXT, beh_id TEXT, at TEXT NOT NULL);
CREATE TABLE schvalenia (                                        -- Adamovo rozhodnutie dohľadateľné jedným dopytom (graft B3)
  id INTEGER PRIMARY KEY, desk_id INTEGER NOT NULL, typ TEXT NOT NULL, ref_id TEXT NOT NULL,
  rozhodnutie TEXT NOT NULL CHECK (rozhodnutie IN ('schvalene','vratene','zamietnute')),
  kto TEXT NOT NULL, poznamka TEXT, at TEXT NOT NULL
);
CREATE TABLE revizie (                                           -- generické verzie (graft F3): udalost | minuta | vydanie | zvod | claim | narativ
  entita_typ TEXT NOT NULL, entita_id TEXT NOT NULL, verzia INTEGER NOT NULL,
  snapshot TEXT NOT NULL, kto TEXT NOT NULL, dovod TEXT NOT NULL, at TEXT NOT NULL,
  PRIMARY KEY (entita_typ, entita_id, verzia)
);
CREATE TABLE minuta_posty (                                      -- Live Blog: post = atomická jednotka
  id INTEGER PRIMARY KEY, slug TEXT NOT NULL UNIQUE,             -- '2026-11-05-1432-ms-sr-dodatok'
  cas TEXT NOT NULL,                                             -- ISO s posunom Europe/Bratislava
  prva_veta TEXT NOT NULL, text TEXT NOT NULL, text_dalej TEXT, slova INTEGER NOT NULL,
  stitky TEXT NOT NULL DEFAULT '[]', pripnuty INTEGER NOT NULL DEFAULT 0, pripnuty_do TEXT,
  udalost_id INTEGER, zvod_ids TEXT NOT NULL DEFAULT '[]', desk_id INTEGER NOT NULL,
  claim_ids TEXT NOT NULL DEFAULT '[]',                          -- všetky typu fakt musia byť overene
  autor TEXT NOT NULL, ai_autorstvo TEXT NOT NULL, schvalil TEXT,
  stav TEXT NOT NULL DEFAULT 'draft' CHECK (stav IN ('draft','schvalene','vydane','stiahnute')),
  vydane_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE INDEX minuta_stav_cas ON minuta_posty(stav, cas);
CREATE TABLE vydania (                                           -- denná titulka ako vydanie
  den TEXT PRIMARY KEY, cislo INTEGER NOT NULL, titulok TEXT NOT NULL, uvodnik_md TEXT, suhrn_md TEXT,
  hlavna_udalost_id INTEGER, polozky TEXT NOT NULL,              -- JSON [{typ, ref_id, poradie, rubrika}]
  rollup_den TEXT REFERENCES rollup_denne(den),
  stav TEXT NOT NULL DEFAULT 'draft' CHECK (stav IN ('draft','schvalene','vydane')),
  schvalil TEXT, vydane_at TEXT, uzavierka_at TEXT, ai_autorstvo TEXT NOT NULL,
  snapshot_r2_key TEXT, snapshot_sha256 TEXT,                    -- nemenný snapshot vydania v R2 (graft F1)
  created_at TEXT NOT NULL
);
CREATE TABLE behy_redakcie (                                     -- proveniencia agentov
  id TEXT PRIMARY KEY,                                           -- 'redakcia-2026-11-05-0830-triaz'
  agent TEXT NOT NULL CHECK (agent IN ('triaz','reporter','overovatel','redaktor','archivar','orchestrator')),
  model TEXT NOT NULL, prompt_version TEXT NOT NULL,             -- git hash súboru _claude/agents/hriech-<agent>.md
  spustil TEXT NOT NULL,                                         -- 'routine:rano' | 'routine:vecer' | 'routine:tyzden' | 'adam' | 'hlavna-session'
  vstup_r2_key TEXT, vystup_r2_key TEXT,                         -- redakcia/<den>/<agent>-vstup.json / -vystup.json
  vstup_ids TEXT, vystup_ids TEXT, tokens_in INTEGER, tokens_out INTEGER,
  pokusy INTEGER NOT NULL DEFAULT 1,                             -- validácia schémy: max 2 opakovania
  started_at TEXT NOT NULL, finished_at TEXT,
  stav TEXT NOT NULL CHECK (stav IN ('bezi','ok','chyba','dry_run')), chyba TEXT
);
CREATE TABLE archiv_mesiace (mesiac TEXT PRIMARY KEY, r2_key TEXT NOT NULL, records INTEGER NOT NULL, sha256 TEXT NOT NULL, exported_at TEXT NOT NULL, zmazane_at TEXT);
CREATE TABLE zalohy (id INTEGER PRIMARY KEY, r2_prefix TEXT NOT NULL, tabulky TEXT NOT NULL, riadkov INTEGER NOT NULL, created_at TEXT NOT NULL, overene_at TEXT);
```

### Neskôr (Vianoce)

- `0006_moduly.sql`: `kalendar(id, nazov, datum, typ CHECK IN ('volby','rozpocet','sud','nrsr','eu','lehota_ted','ucinnost_crz','statistika','iny'), zdroj_url, zdroj_record_id, vytvoril)`, `statistika_rady(kod, dimenzie TEXT JSON, obdobie, hodnota REAL, update, PRIMARY KEY(kod, dimenzie, obdobie))` (rozbalený JSON-stat), `prieskumy(id, agentura, datum_zberu, datum_publikacie, strana, percento REAL, vzorka INTEGER, zdroj_url, archiv_id, vytvoril)`.
- `0007_ftm.sql`: `ftm_entity(id, schema CHECK IN ('Person','Company','PublicBody','Organization','Event','Document'), props TEXT JSON, zdroj_record_ids TEXT)`, `ftm_vztah(id, schema CHECK IN ('Ownership','Directorship','Payment','Membership','Mention'), subjekt_id, objekt_id, props TEXT, zdroj_record_id)`, `sledovane(zoznam, entity_id, dovod, pridal, at)`.

### Verzie a proveniencia (reťaz)

verejný text → `claims` (`typ`, `citacia_vyrez`, `stav`) → `archiv` (sha256, čas, R2 objekt s `customMetadata`) a `records` (`content_hash`, `raw_key` → surový payload v R2) → `runs`. Každý odvodený riadok: `vytvoril`, `beh_id`; každá zmena obsahu: `revizie`; každý prechod: `desk_prechody` + `schvalenia`; každý beh agenta: `behy_redakcie` s plným vstupom a výstupom v R2.

Seedy v gite (zdroj pravdy, `netopier/zber/data/`): `zvody-seed.json` (`{version, locked_at, kategorie, zvody:[{id, kategoria, nazov, hypoteza, plain_popis, klucove_slova, entity_ids, registre}]}`), `zdroje-seed.json` (12 SK médií + 6 registrov + 155 WM s `outlet_id` väzbou na mapu), `derive-kanaly.json` (svetové kanály pre udalosti: `lang ∈ {sk, cs, hu, pl, de, en}`, `category ∈ {europe, gov}`), `crz-ciselniky.json`, `klucove-slova.json`. `scripts/seed.mjs` zapíše `INSERT OR REPLACE` lokálne aj remote.

---

## 3. API a dáta

### 3.1 Spoločný balík `@netopier/redakcia` (`netopier/redakcia/src/`)

| Modul | Obsah | Používa |
|---|---|---|
| `schema.ts` | TS typy všetkých tabuliek a JSON tvarov (`Udalost`, `Post`, `Zvod`, `Signal`, `Vydanie`, `Zdroj`, `Claim`, `DeskPolozka`, `Nalez`) | oba Workery, testy |
| `dopyty/*.ts` | `getMinuta(db, {limit, before, stitok, verejne})`, `getPost(db, slug)`, `getUdalosti(db, filtre)`, `getUdalost(db, slug)`, `getZvody(db)`, `getZvod(db, id, dni)`, `getEkg(db, dni)`, `getVydanie(db, den)`, `getZdroj(db, id, dni)`, `getRollup(db, den)`, `getNalezy`, `getZaznamy`, `getEntity`, `getDesk` — parameter `verejne: true` vynúti `stav='vydane'`, `verejna=1`, `verejny=1`, `entity.verejne=1` v SQL | stránky, `/api/*.json`, API |
| `stavovy-stroj.ts` | povolené prechody desk (ingest→kandidat→overene→napisane→schvalene→vydane; zamietnute; stiahnute), pravidlá aktérov, pravidlo „0 claims typu fakt so stavom ≠ overene“ pre `overene`, prechody zvodov podľa `status.js` | API |
| `skore.ts` | vzorec, istota, odporúčaný stav, momentum, category_scores | derive, terminál |
| `autorstvo.ts` | `aiAutorstvo(behy, claims, schvalenie)` → text; pevná formula ako fallback | API, stránky |
| `pristup.ts` | overenie `Cf-Access-Jwt-Assertion` (jose, JWKS `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`, cache 1 h), akceptované AUD: API aj terminál; výsledok `Aktor = {typ:'adam'|'agent'|'system', id, email?}` | oba Workery |
| `format.ts` | `formatDate`, `formatTime` (HH:MM, Europe/Bratislava), `formatNumber` (sk-SK), `slug()` | stránky, terminál |
| `kontrakty/*.schema.json` | JSON Schema 2020-12 pre všetky tvary v 3.2 a 3.3 a pre výstupy agentov (`triaz`, `reporter`, `overovatel`, `redaktor`), validácia Ajv v testoch oboch Workerov a v `scripts/redakcia/validate.mjs` | všetci |

### 3.2 Verejný JSON (`hriech-web`, `src/pages/api/*.ts`, `prerender = false`, `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`, iba `verejne: true`)

| Endpoint | Tvar |
|---|---|
| `GET /api/minuta.json?before=<cas>&limit=50&stitok=` | `{ pripnute:[Post], items:[Post], next }`; `Post = {slug, cas, prva_veta, text, text_dalej, slova, stitky, pripnuty, udalost_slug, zvod_ids, autor, ai_autorstvo, schvalil, url}` |
| `GET /api/udalosti/<slug>.json` | `Udalost` = stĺpce + `dokazy:[{record_id, zdroj_id, vztah, vyrez, cas, url, published_at, archiv_sha}]`, `pokrytie:[{zdroj_id, nazov, pocet, prvy_at, titulok}]`, `podiel:{pokryli, zo}`, `blindspot`, `porovnanie_titulkov`, `casova_os:[{cas, typ_akcie, record_id}]`, `claims:[{id, typ, text, citacia_vyrez, zdroj_url, archiv_sha, stav}]`, `registre:[RegisterUdalost]`, `proveniencia:{behy:[{agent, model, finished_at}], schvalil, schvalene_at}` |
| `GET /api/zvody.json`, `GET /api/zvody/<id>.json?dni=90` | katalóg / zvod + `historia:[{den, krivka, skore, pocet, istota}]`, `signaly:[{id, scan_date, krivka, smer, sila, relevancia, zdroj_nazov, zdroj_url, odovodnenie}]`, `stav_historia` |
| `GET /api/ekg.json?dni=30` | `{dni:[{den, category_scores, threat_level}], momentum, nalezy_verejne}` |
| `GET /api/vydanie/<den>.json`, `/api/vydanie/latest.json` | vydanie + rozbalené položky + `snapshot_sha256` |
| `GET /api/zdroje/<id>.json?dni=30` | kartička + `pokrytie_denne` + `rebricek:{poradie, prvy, podiel}` |
| `GET /minuta.xml`, `GET /vydanie.xml` | RSS 2.0 (`src/lib/xml.ts`), `<dc:creator>` = `autor`, `<category>ai-asistovane</category>` |

### 3.3 Interné API (`netopier-zber`, `src/api/*.ts`, host `api.hriech.xvadur.com`, za Access; `Cache-Control: private, no-store`)

Aktér z JWT: `adam` (e-mail), `agent:<X-Agent>` (Service Token `netopier-agenti`), alebo `adam` preposlaný z terminálu cez Service Binding (JWT AUD terminálu). Odpovede a telá validujú kontrakty z 3.1.

| Metóda a cesta | Telo → odpoveď | Smie |
|---|---|---|
| `GET /health` | ako dnes + `derive:{udalosti, register_udalosti, signaly, nalezy_novy, desk_by_stav, posledny_rollup}` | verejné (Access bypass) |
| `POST /run`, `POST /run/<zdroj>` | ako dnes, Bearer `ZBER_TOKEN` | adam, hlavná session |
| `GET /api/zaznamy?source=&channel=&after=<id>&since=&q=&entity=&limit≤200` · `GET /api/zaznamy/:id` | `{items:[Zaznam s data JSON], next}` · záznam + `verzie[]` + `entity[]` + `raw_url` | adam, agent |
| `GET /api/raw/:key` | stream z R2 | adam, agent |
| `GET /api/entity/:id` | `{entity, zaznamy, udalosti, register_udalosti, signaly}` (aj `verejne=0`) | adam, agent |
| `GET /api/udalosti?since=&stav=&krivka=&min_nezavislych=&blindspot=&limit` · `GET /api/udalosti/:slug` | tvar ako 3.2, bez filtra `verejna` + `dokazy.stav`, `priznaky`, `suggested[]`, `revizie[]` | adam, agent |
| `GET /api/register-udalosti?since=&druh=&entity=` | `{items:[RegisterUdalost]}` | adam, agent |
| `GET /api/zvody`, `/api/zvody/:id`, `GET /api/signaly?den=&krivka=&stav=`, `GET /api/rollup/:den|latest`, `GET /api/nalezy?den=&stav=&typ=` | ako 3.2 bez verejného filtra | adam, agent |
| `GET /api/desk?stav=&typ=` · `GET /api/desk/:id` | `{items:[DeskPolozka]}` · položka + `claims` + `prechody` + `behy` | adam, agent |
| `GET /api/desk/triaz-vstup?den=` | `{nalezy, skoky, prve_zmienky, zmeny_registrov, udalosti_24h:[{slug, titulok, pocet_zdrojov, pokrytie_podiel, prvy_zdroj}], rollup}` — jeden vstup pre triáž, spočítaný v TS | agent:triaz, adam |
| `POST /api/signaly` | `{signal, zvody:[{zvod_id, relevancia, smer, sila, odovodnenie}]}` → `{id}` (`stav='navrh'`, `vytvoril='agent:…'`) | agent, adam |
| `POST /api/signaly/:id/stav` | `{stav:'potvrdeny'|'zamietnuty', dovod}` | agent:overovatel, adam |
| `POST /api/desk` | `{typ, ref_id, dovod_triaze, priorita}` → `kandidat` (≤ 10 na deň pre agenta) | agent:triaz, adam |
| `POST /api/desk/:id/podklad` | `{podklad, claims:[{text, typ, zdroj_url, zdroj_record_id, citacia_vyrez}]}` | agent:reporter, adam |
| `POST /api/archiv` | `{url, record_id?}` → Worker stiahne, sha256, R2 `archiv/`, riadok → `{id, sha256, r2_key}` | agent, adam |
| `POST /api/claims/:id/overenie` | `{stav, overenie:{metoda, primarna_url, citat, poznamka}, archiv_id}` | agent:overovatel, adam |
| `POST /api/desk/:id/draft` | `{draft_md, minuta_post?, udalost_zhrnutie_md?, vydanie?, narativ?, autor_agent, model, prompt_version, beh_id}` → `napisane` (odmietne bez autorstva alebo s neovereným faktom) | agent:redaktor, adam |
| `POST /api/desk/:id/prechod` | `{do:'schvalene'|'vratene'|'zamietnute'|'vydane'|'stiahnute', poznamka}` → `desk_prechody` + `schvalenia`; `schvalene`/`vydane` iba `adam`; `vydane` nastaví `minuta_posty.stav`, `udalosti.verejna`, `vydania.stav` a zapíše snapshot vydania do R2 | adam |
| `POST /api/udalosti/:id/merge`, `/split`, `PATCH /api/udalosti/:id` | ľudská korekcia → `udalost_rodokmen povod='human'`, `revizie` | adam |
| `POST /api/zvody`, `POST /api/zvody/:id/stav`, `POST /api/zvody/:id/zamknut` | nový zvod, ľudský override stavu (`povod='human'`), zamknutie | adam |
| `PATCH /api/zdroje/:id`, `PATCH /api/entity/:id` | hodnotenie so zdrojmi, `sledovane`, `druh` | adam |
| `POST /api/behy` · `PATCH /api/behy/:id` | zápis behu agenta (vstup/výstup kľúče, tokeny, stav) | agent, adam |
| `POST /api/run/derive?krok=&den=` | zaradí `DeriveJob` | adam |

Terminálové formuláre: `hriech-web` `src/pages/t/api/[...cesta].ts` prijme `application/x-www-form-urlencoded` POST, prevedie na JSON a zavolá `env.NETOPIER.fetch(new Request('https://netopier-zber/api/' + cesta, {headers:{'Cf-Access-Jwt-Assertion': pôvodná}}))`; po odpovedi 303 späť na stránku. Bez JS.

---

## 4. Redakčná linka

Deterministické kroky bežia vo Workeri (fronta a cron), jazykové kroky v Claude Code. Worker nikdy nevolá LLM; táto veta ide do `netopier/STACK.md` a ADR-011.

### 4.1 Deterministická časť (`netopier/zber/src/derive/`)

| Krok | Súbor | Spúšťač | Vstup | Výstup |
|---|---|---|---|---|
| zber | `src/sources/*.ts`, `archive.ts` (bez zmeny okrem `record_entity` a `records_fts`) | cron `*/30`, `20 5` | zdroje | `records`, `runs`, `source_state`, R2 raw |
| normalize | `derive/normalize.ts` | po každom behu zberu (`runJob` zaradí `{kind:'derive', krok:'normalize', since}`) | nové `records` | `published_at_utc` |
| entity | `derive/entity.ts` | v `archiveChannel`; jednorazovo backfill | `data.*_ico` | `entity`, `record_entity` |
| udalosti | `derive/udalosti.ts` (port `events.py`: `ACTION_RULES` rozšírené z 8 na ≥ 30 slovies, `STATUS_RULES`, kandidáti s presnými offsetmi, `RelationshipDecider` bez embeddingu: `skore = 0,35·lex + 0,30·entity + 0,15·cas + 0,10·akcia + 0,05·miesto + 0,05·titulok`; `same_event` prijaté ≥ 0,85, `suggested` ≥ 0,62 nikdy nezlučuje; syndikát pri zhode URL/hash; okno ±72 h, ≤ 20 klastrov), `derive/text.ts` (port `text.py`) | po každej RSS dávke médií, dávky po 100 záznamov, kurzor `source_state('derive','udalosti')` | SK RSS + kanály z `derive-kanaly.json` | `udalosti`, `udalost_dokazy`, `udalost_pokrytie`, `revizie`, `prvy_*`, `pokrytie_podiel` |
| registre | `derive/registre.ts` | cron `20 6` | nové crz/ted/kataster/statistika | `register_udalosti`, `udalost_registre` (zhoda IČO/zmluvy s mediálnymi udalosťami za 14 dní), `udalosti.krivka` |
| signály z pravidiel | `derive/pravidla.ts`: `crz_suma_nad_limit` (≥ 1 M €), `crz_dodatok_navysenie`, `ted_vitaz_jediny`, `ted_bez_sutaze`, `kataster_nova_verzia`, `statistika_aktualizacia`, `sledovana_entita`, `klucove_slovo` (per zvod) | cron `20 6` | `register_udalosti`, `records` | `signaly` (`krivka='registre'`, `stav='potvrdeny'`, `vytvoril='pravidlo:…'`), `signal_zvody` iba s pevným zvodom |
| skóre a rollup | `derive/rollup.ts` + `@netopier/redakcia/skore.ts` | cron `20 6` a po každom `POST /api/signaly/:id/stav` | `signaly` potvrdené za 90 dní | `zvod_skore_denne` (3 krivky), `zvody.skore/istota` + `zvod_stav_historia povod='algorithm'`, `rollup_denne` (bez `narrative`), `zdroj_pokrytie_denne` |
| nálezy | `derive/nalezy.ts` | cron `20 6` | dve krivky, pokrytie | `nalezy` |
| archív URL | `api/archiv.ts` | `POST /api/archiv` | URL | R2 `archiv/`, `archiv` |
| záloha | `derive/zaloha.ts` | cron `10 3 * * 0` | všetky tabuľky okrem `records`, `runs`, `source_state` | R2 `zalohy/RRRR-MM-DD/<tabulka>.jsonl.gz`, `zalohy` riadok; `records` kryje D1 Time Travel (30 dní) + archivácia mesiacov |
| archivácia mesiaca | `derive/archiv-mesiac.ts` | cron `10 3 1 * *` (mesiace staršie než 6) | `records` | R2 `export/records/RRRR-MM.jsonl.gz`, `archiv_mesiace`, DELETE až po overení sha256 a s výnimkou záznamov naviazaných na `udalost_dokazy`/`signaly`/`claims` |

### 4.2 Agenti (Claude Code)

Súbory: `_claude/agents/hriech-triaz.md`, `hriech-reporter.md`, `hriech-overovatel.md`, `hriech-redaktor.md`, `hriech-archivar.md` (workspace repo, súkromný, `model: inherit`); orchestrácia v existujúcom agentovi `hriech` a skill `_claude/skills/redakcia/SKILL.md` (`/redakcia [den] [rano|vecer|tyzden] [--dry-run]`). Verejné v `hriech`: `docs/HLAS.md` (hlas Hriechu), `docs/REDAKCIA.md` (postup, stavy, kto smie čo), `contracts/redakcia/v1/*.schema.json`, `scripts/redakcia/validate.mjs`. Každý výstup agenta prejde schémou; neplatný výstup sa opakuje najviac 2×, potom beh končí `stav='chyba'` v `behy_redakcie`. Plný vstup a výstup každého behu ide do R2 `redakcia/<den>/<agent>-vstup.json|vystup.json` (cez `POST /api/behy`). `prompt_version` = git hash súboru agenta.

Behy (D3): `hriech-redakcia-rano` 08:30 Europe/Bratislava (po `20 6 UTC` rollupe), `hriech-redakcia-vecer` 18:30 (iba udalosti dňa → signály → posty Minúty), `hriech-redakcia-tyzden` nedeľa 09:00 (momentum, threat history, návrh zmien stavov zvodov s odôvodnením → Adam). Secrets routine: `CF_ACCESS_CLIENT_ID`, `CF_ACCESS_CLIENT_SECRET`. Prvé dva týždne ručne z hlavnej session. Vstup pre agentov delený na dávky po 200 záznamov.

| Agent | Vstup | Výstup | Podmienka postupu |
|---|---|---|---|
| **triáž** | `GET /api/desk/triaz-vstup?den=`, `GET /api/zvody` | ≤ 10 × `POST /api/desk` s `dovod_triaze` jednou vetou s číslom („CRZ 11,14 M €, 0 z 12 redakcií“); pre mediálne udalosti `POST /api/signaly` (`krivka='media'`, `stav='navrh'`) s klasifikáciou do zvodov a `odovodnenie` | – |
| **reportér** (1 subagent na položku, paralelne) | `GET /api/udalosti/:slug`, `/api/entity/:id`, `/api/zaznamy/:id`, `/api/register-udalosti`, `/api/zvody/:id` | `POST /api/desk/:id/podklad`: centrálne fakty ako `claims` (každý `zdroj_record_id` alebo `zdroj_url` + `citacia_vyrez`), signály po zdrojoch, „čo hovoria registre“, porovnanie titulkov, otvorené otázky | každý claim má zdroj a výrez |
| **archivár** | claims bez `archiv_id`, citované URL | `POST /api/archiv` → `archiv_id` na claim; týždenne overí hash proti R2 | – |
| **overovateľ** (nezávislý kontext, nevidí draft) | claims `neoverene`, `GET /api/raw/:key`, archívne snímky | `POST /api/claims/:id/overenie` (`overene` iba ak primárny zdroj výrez doslova potvrdzuje; inak `nerozhodnute`/`nepravda` s dôvodom); `POST /api/signaly/:id/stav` | položka → `overene` iba ak 0 claims typu `fakt` mimo `overene` (vynucuje API) |
| **redaktor** | podklad, overené claims, `docs/HLAS.md` | `POST /api/desk/:id/draft`: post Minúty (čas, tučná prvá veta, 1–2 vety, zvyšok, štítky), `zhrnutie_md` udalosti s `[^c<id>]`, návrh `vydania` dňa (18:30 alebo ráno na predošlý deň), `narrative` rollupu, draft článku ako `research/<slug>/draft.md` iba na pokyn | → `napisane` |
| **Adam** | terminál `/t/desk` | `POST /api/desk/:id/prechod` (Access identita) | → `schvalene` → `vydane` automaticky Workerom |

Ako Adam schvaľuje: `/t/desk` stĺpce podľa stavu; `/t/desk/<id>` ukazuje draft, každý claim (text · typ · výrez · zdroj · stav overenia · hash archívu · odkaz na `/api/raw`), porovnanie titulkov, náhľad postu; tri tlačidlá (formulár POST): Schváliť / Vrátiť s poznámkou / Zamietnuť. Adam môže text upraviť pred schválením (formulár → `revizie`). Alternatíva bez prehliadača: `pnpm desk approve <id>` z hlavnej session (Service Token Adama). Články ostávajú Markdown v gite: `status: published` + `approvedBy` + push/deploy na pokyn (`docs/PUBLISHING.md`).

Režim bez LLM (kým Adam nerozhodne D2): triáž = `nalezy` (deterministické), reportér a redaktor = Adam vo formulári `/t/desk/novy` (post Minúty s claims), overovateľ = archivár (hash + dostupnosť), `ai_autorstvo = "Bez AI: napísal Adam Rudavský."`.

AI autorstvo: `autorstvo.ts` generuje z behov: „Podklad zostavil agent reportér (Claude, `<model>`, beh #418), 6 tvrdení overil agent overovateľ proti primárnym zdrojom (beh #419), text napísal agent redaktor (beh #420). Schválil Adam Rudavský 20. 11. 2026 14:02.“ Byline: „Hriech — AI redakcia · schválil Adam Rudavský · 14:02“. Komponent `Autorstvo.astro` (zovšeobecnený blok z `ArticleView`) pod každým postom, udalosťou, vydaním a článkom; `Proveniencia.astro` („Ako vznikol tento text“: reťaz behov, počet overených tvrdení, archívy). Stránka `/o-hriechu/redakcia` s číslami z `behy_redakcie`. Fakt / interpretácia / medzera: `claims.typ` → `Tvrdenie.astro` s triedou `.tvrdenie--fakt|--interpretacia|--medzera` (plná, prerušovaná, bodkovaná linka a prefixy „Výklad:“, „Nevieme:“). `signaly.implication` nikdy nevstupuje do textu ako fakt.

Paperclip (XDR-226): nie je potrebný; uzavrieť ako „prehodnotiť po Vianociach“.

---

## 5. Plochy

### 5.1 Verejný Hriech (print)

Tokeny v2 (`src/styles/global.css`, D5): `--paper:#f8f5ef`, `--ink:#161412`, `--muted:#5f5850`, `--rule:#d9d2c5` (1 px), `--rule-thick:3px`, `--pink:#f18fa0` iba `.wordmark` a `.post--pripnuty`; `--font-serif: 'Source Serif 4 Variable'`, `--font-sans: 'Source Sans 3 Variable'`, `--font-mono: 'IBM Plex Mono'`; `font-variant-numeric: tabular-nums` na číslach; `--radius: 0`, žiadne tiene (plastické `.button`, `.chip`, `.org-node` ostávajú iba v `/mapy/*`). Mriežka `.vydanie-grid` 12 stĺpcov na ≥ 1100 px s `column-rule`, 6 na 800–1100, 1 pod 800; hierarchia veľkosťami 44/32/24/20/18/15. `src/styles/print.css` pre `@media print`. Všetko bez JS; JS iba `FilterScript` na zoznamoch, hash-otváranie `details`, voliteľný ostrov `minuta-refresh.ts` (2 KB, dopĺňa posty z `/api/minuta.json` každých 60 s) a Web Analytics beacon.

| Trasa | Súbor | Render | Komponenty (`src/components/`) | Dáta (dopyty) |
|---|---|---|---|---|
| `/` titulka = dnešné vydanie | `src/pages/index.astro` (prepis; legacy hash redirect `#outlet-…` zrušený, kotvy ostávajú na `/mapy/redakcie`) | SSR, cache 60 s | `vydanie/Zahlavie` (HRIECH, dátum, „Vydanie č. N“, uzávierka, threat level slovom), `vydanie/Mriezka` (hlavná udalosť 7/12, stĺpec Minúta 3/12, zvody 2/12), `vydanie/HlavnaUdalost`, `minuta/Stlpec` (12 postov, pripnuté hore), `zvod/EkgMini`, `vydanie/Registre` (dnes v CRZ N zmlúv za X €, TED, kataster), `vydanie/Nalezy` (blindspoty dňa), existujúce `PublicationRows`, `MapCallout` | `getVydanie(latest)`, `getMinuta`, `getZvody`, `getRollup` |
| `/vydanie`, `/vydanie/[den]` | `src/pages/vydanie/…` | SSR | tá istá mriežka; archívny deň renderuje zo snapshotu R2 (`snapshot_sha256` v tiráži) | `getVydanie(den)` |
| `/minuta`, `/minuta/strana/[n]`, `/minuta/[slug]`, `/minuta.xml` | `src/pages/minuta/…` | SSR | `minuta/Post` (čas mono, tučná prvá veta, 1–2 vety, `<details>` „čítať ďalej · N slov“, štítky, trvalý odkaz `#post-<slug>`, pripnutý pás), `minuta/Suhrn` (súhrn dňa z `vydania.suhrn_md`), `Autorstvo` | `getMinuta`, `getPost` |
| `/udalosti`, `/udalosti/[slug]` | `src/pages/udalosti/…` | SSR | `udalost/Hlavicka` (titulok, čas + presnosť, miesto + presnosť, sila dôkazov), `udalost/PrvyPriniesol` („Prvý priniesol Denník N 09:14, o 41 min skôr“), `udalost/Pokrytie` (CSS pruhy podľa redakcií, `podiel.pokryli/zo`), `udalost/Blindspot`, `udalost/PorovnanieTitulkov` (tabuľka zdroj · titulok · čas · archív), `udalost/Tvrdenia` (`Tvrdenie` s `<sup>` → `#c<id>`), `udalost/Registre` („čo hovoria registre“), `udalost/CasovaOs` (`<ol>`), `udalost/Zdroje` (zovšeobecnený `SourceRefs`: id, publisher, url, capturedAt, sha), `Proveniencia`, `Autorstvo` | `getUdalosti`, `getUdalost` |
| `/zvody`, `/zvody/[id]` | `src/pages/zvody/…` | SSR | `zvod/Stav` (stav + zamknutie + história), `zvod/Ekg` (inline SVG: `spolu` atrament, `registre` plná tmavá, `media` ružová, pásma ±20/±50 hairline, rozdiel vyšrafovaný = nález, posledný bod s číslom mono, `<title>` popisky bez JS), `zvod/Rozklad` (n, confirming/contradicting/neutral, istota), `zvod/SignalRiadok` (dátum · smer +/−/○ · sila · relevancia · zdroj s rozsahom · odôvodnenie), `zvod/Momentum` | `getZvody`, `getZvod` |
| `/seizmograf` (XDR-232) | `src/pages/seizmograf.astro` | SSR | `seizmograf/Kategorie` (category_scores × 30 dní), `seizmograf/Threat` (úroveň, dôvod, história), `seizmograf/Narativ` (claims → signály), `vydanie/Nalezy` | `getEkg`, `getRollup` |
| `/zdroje`, `/zdroje/[id]` | `src/pages/zdroje/…` | SSR | `zdroj/Karticka` (typ, rozsah, vlastník s odkazom `/mapy/redakcie/<outlet>`, bias/faktickosť iba so zdrojmi, WM tier/risk, pokrytie 30 d, prvý N×, blindspoty), `zdroj/Sparkline` (SVG), `zdroj/Rebricek` | `getZdroj`, `getZdroje` |
| `/archiv/[sha]` | `src/pages/archiv/[sha].astro` | SSR | metadata, hash, čas, odkaz na kópiu | `getArchiv` |
| `/o-hriechu/redakcia` | `src/pages/o-hriechu/redakcia.astro` | SSR | linka, vzorec EKG, čísla z `behy_redakcie` | `getBehyStatistika` |
| `/publikacie/*`, `/pripady/*`, `/mapy/*`, `/o-hriechu`, `/rss.xml`, `/sitemap.xml`, `/search.json` | existujúce | prerender | `ArticleView` s `Autorstvo` a `Tvrdenia` (claims cez `claimIds` vo frontmatteri) | git |
| Vianoce: `/stat`, `/stat/crz|ted|kataster|su-sr`, `/kalendar`, `/mapa`, `/demografia`, `/volby`, `/chronos`, `/opus` | `src/pages/…` | SSR / prerender | `stat/Tabulka` (z `.finance-table`), `stat/Sparkline`, `stat/Stlpce` (SVG), `kalendar/Odpocet` (server-side), `chronos/Os` (SVG), `mapa/Vrstvy` (MapLibre ostrov, bez JS zoznam parciel) | `statistika_rady`, `kalendar`, `records` kataster, `prieskumy`, `udalosti` |

`BaseLayout.astro`: navigácia Vydanie · Minúta · Udalosti · Zvody · Seizmograf · Zdroje · Publikácie · Mapy · O Hriechu; `data-theme="print"`. `Icon.astro` + `clock`, `pin`, `pulse`, `calendar`, `source`, `check`, `archive`.

### 5.2 Terminál (interný, `netopier.hriech.xvadur.com`, za Access)

Astro SSR v `hriech-web`, `src/layouts/TerminalLayout.astro`, `src/styles/terminal.css`: pozadie `#0b0b0c`, text `#e8e2d6`, amber `#f2a900` na stavy a čísla, ružová iba krivka „médiá“, IBM Plex Mono 13 px, riadok 1,3; tri hustoty `data-density="1|2|3"` cez cookie (formulár `POST /t/nastavenia`); číslo pri každej položke (id, čas, počty, skóre, vek v minútach). Všetko formulármi a `<details>` bez JS; jediný ostrov `src/islands/terminal-klavesy.ts` (j/k riadky, Enter detail, `/` hľadanie, `a` schváliť, `x` zamietnuť, `d` hustota) je voliteľné vylepšenie. `src/middleware.ts`: podľa `Host` — terminálový host vyžaduje platný JWT (`pristup.ts`), inak 403; verejný host vracia 404 na `/t/*`; SSR verejné trasy dostanú cache hlavičky.

| Trasa | Obsah |
|---|---|
| `/t` | zber `health` (records za 24 h po zdroji, runs, `failing_channels` červeno), desk počty podľa stavu, EKG obe krivky 7 dní, threat level, posledné behy agentov, veľkosť D1 |
| `/t/desk`, `/t/desk/[id]`, `/t/desk/novy` | stavový stroj, položka s podkladom, claims, prechody, náhľad; formuláre Schváliť / Vrátiť / Zamietnuť; ručný post (režim bez LLM) |
| `/t/zaznamy`, `/t/zaznamy/[id]` | River: filtre zdroj/kanál/entita/FTS `q`/dátum, keyset stránkovanie, verzie, `data` ako tabuľka, raw z R2 |
| `/t/udalosti`, `/t/udalosti/[id]` | všetky stavy, `suggested` rozhodnutia so skóre, formuláre merge/split, väzby na registre |
| `/t/registre` | `register_udalosti` s číslami (sumy, CPV, výmery), číselníky CRZ |
| `/t/zvody`, `/t/zvody/[id]` | tabuľka skóre po krivkách, EKG 90 dní, signály, ručná zmena stavu s dôvodom, zamknutie |
| `/t/signaly` | denný zoznam `navrh`/`potvrdeny`, úprava `signal_zvody` |
| `/t/nalezy` | nálezy dňa podľa druhu, prijať / zamietnuť |
| `/t/entity`, `/t/entity/[id]` | IČO/osoba, záznamy CRZ/TED/kataster, udalosti, `sledovane` prepínač, `druh` oprava (fyzická osoba viditeľná iba tu) |
| `/t/zdroje` | kartičky, editácia hodnotenia so zdrojmi, štatistika, pozastavené kanály |
| `/t/archiv` | `archiv` riadky, overenie hashu, stiahnutie |
| `/t/behy` | `runs`, `behy_redakcie` s tokenmi a odkazmi na R2 vstup/výstup, DLQ, `zalohy`, `archiv_mesiace` |

---

## 6. Rozloženie súborov

### `hriech/` (koreň, `hriech-web`)

Pribudne:
```
pnpm-workspace.yaml            packages: [netopier/zber, netopier/redakcia]  (allowBuilds ostáva)
netopier/redakcia/             package.json (@netopier/redakcia), tsconfig, vitest.config.ts,
                               src/{schema,stavovy-stroj,skore,autorstvo,pristup,format}.ts, src/dopyty/*.ts,
                               kontrakty/*.schema.json, test/{skore,stavovy-stroj,dopyty,autorstvo}.test.ts,
                               test/fixtures/openclaw/{scoring.js,status.js,evidence.json,signal.json,predictions.json,narrative.json,threat.json}
src/worker-configuration.d.ts  (wrangler types) Env: DB, ASSETS, NETOPIER, vars
src/env.d.ts                   App.Locals extends Runtime<Env> + locals.aktor
src/middleware.ts              host routing, Access JWT, cache SSR
src/lib/db.ts                  tenký obal: env.DB → dopyty z @netopier/redakcia s verejne:true
src/lib/ekg.ts                 body → SVG path (čistá funkcia, test)
src/lib/sources.ts             zovšeobecnený SourceRef
src/layouts/TerminalLayout.astro
src/styles/print.css, src/styles/terminal.css
src/components/{Autorstvo,Proveniencia,Tvrdenie}.astro
src/components/vydanie/{Zahlavie,Mriezka,HlavnaUdalost,Registre,Nalezy}.astro
src/components/minuta/{Post,Stlpec,Suhrn}.astro
src/components/udalost/{Hlavicka,PrvyPriniesol,Pokrytie,Blindspot,PorovnanieTitulkov,Tvrdenia,Registre,CasovaOs,Zdroje}.astro
src/components/zvod/{Ekg,EkgMini,Stav,Rozklad,SignalRiadok,Momentum}.astro
src/components/seizmograf/{Kategorie,Threat,Narativ}.astro
src/components/zdroj/{Karticka,Sparkline,Rebricek}.astro
src/components/terminal/{Tabulka,DeskPolozka,Prechody,Filtre}.astro
src/pages/{vydanie,minuta,udalosti,zvody,zdroje,archiv}/…, seizmograf.astro, o-hriechu/redakcia.astro, minuta.xml.ts, vydanie.xml.ts
src/pages/api/{minuta.json,ekg.json,zvody.json}.ts, api/udalosti/[slug].json.ts, api/zvody/[id].json.ts, api/vydanie/[den].json.ts, api/zdroje/[id].json.ts
src/pages/t/{index,desk/index,desk/[id],desk/novy,zaznamy/index,zaznamy/[id],udalosti/index,udalosti/[id],registre,zvody/index,zvody/[id],signaly,nalezy,entity/index,entity/[id],zdroje,archiv,behy,nastavenia}.astro
src/pages/t/api/[...cesta].ts
src/islands/{minuta-refresh,terminal-klavesy}.ts
contracts/redakcia/v1/{triaz,reporter,overovatel,redaktor}.schema.json
scripts/{smoke-live.mjs,seed-dev.mjs,desk.mjs}, scripts/redakcia/validate.mjs
test/{ekg,middleware,smoke-rules}.test.mjs
docs/{REDAKCIA.md,HLAS.md,METODIKA-ZDROJE.md (prázdna kostra),VYDANIE.md}, docs/adr/{009-dva-workery-jedna-d1,010-python-archivovany,011-verejne-texty-a-llm}.md
```
Zmení sa: `astro.config.mjs` (adapter cloudflare, platformProxy persist), `wrangler.jsonc` (časť 1), `package.json` (`@astrojs/cloudflare`, `jose`, fonty, skripty), `src/layouts/BaseLayout.astro`, `src/styles/global.css` (tokeny v2), `src/pages/index.astro`, `src/lib/content.ts` (`formatTime` z `@netopier/redakcia/format`), `src/content.config.ts` (`claimIds` vo frontmatteri), `src/components/{ArticleView,SourceRefs,Icon}.astro`, `scripts/verify-public-build.mjs` (preskočí `dist/_worker.js`, kontroluje iba prerender HTML; limit 40 000 B pre `/` sa presúva do smoke), `docs/PUBLISHING.md`, `DESIGN.md` (v2), `STACK.md` (rozhodnuté), `STATUS.md`, `.gitignore` (`work/`).
Zmaže sa: `docs/design-direction.md`, `src/pages/__preview/` (ak prázdny), legacy hash redirect v `index.astro` → archív v jadre.

### `hriech/netopier/zber/` (`netopier-zber`)

Pribudne: `migrations/0002_zaklad.sql … 0005_redakcia.sql` (0006, 0007 neskôr); `src/api/{router,pristup,zaznamy,entity,udalosti,register-udalosti,zvody,signaly,rollup,nalezy,desk,claims,archiv,behy,derive}.ts`; `src/derive/{index,normalize,entity,text,udalosti,registre,pravidla,rollup,nalezy,pokrytie,zaloha,archiv-mesiac}.ts`; `data/{zvody-seed,zdroje-seed,derive-kanaly,crz-ciselniky,klucove-slova}.json`; `scripts/{seed.mjs,derive-node.mjs}`; `test/{api,derive-udalosti,derive-registre,derive-pravidla,rollup,zaloha}.test.ts` (fixtures z lokálnej D1).
Zmení sa: `wrangler.jsonc` (routes, crons, vars, limits, `workers_dev:false`), `src/types.ts` (`Job = ZberJob | DeriveJob | ArchivJob | ZalohaJob`, `Env` + vars), `src/plan.ts` (denné odvodenie), `src/index.ts` (router `/api/*`, `runJob` pre nové druhy, zaradenie `derive` po zbere), `src/archive.ts` (`record_entity`, `records_fts`), `README.md`, `package.json` (závislosť `@netopier/redakcia: workspace:*`, `jose`).
Zmaže sa: `pnpm-workspace.yaml`, `pnpm-lock.yaml` (lockfile v koreni).

### `hriech/netopier/` (ostatné)

Ostáva: `contracts/` (events-v1 ako historická referencia), `sources/slovak-core.yaml` (rozšíri sa, D7), `fiki/`, `data/`, `docs/`, `STATUS.md`, `STACK.md` (hranica: Worker nikdy nevolá LLM; ADR-009/010/011), `AGENTS.md`, `CLAUDE.md`.
Presunie sa do `xvadur_core/zdroje/hriech/archiv-2026-09/netopier-python/` a zmaže z repozitára (I12, D10): `src/netopier/`, `migrations/` (Alembic), `tests/`, `alembic.ini`, `pyproject.toml`, `compose.yaml`, `Dockerfile` (rozbitý: `COPY benchmarks`), `ops/`, `bin/`, `artifacts/`, `scripts/*.py`.

### Workspace `_claude/`

`agents/hriech-{triaz,reporter,overovatel,redaktor,archivar}.md`, `skills/redakcia/SKILL.md`, úprava `agents/hriech.md` (orchestrácia denného behu).

---

## 7. Poradie stavby

Každý krok = úloha v Lineari (projekt Hriech, štítok Kto, „Hotové keď“, závislosti); commit s číslom úlohy. Kroky [A] vyžadujú Adama.

### Míľnik Infra — 31. 10. 2026

| # | Krok | Kto | Hotové keď | Dôkaz |
|---|---|---|---|---|
| I0 | Prvý krok (časť B): workspace, `@netopier/redakcia` + `skore.ts` parity, `0002_zaklad.sql`, normalize + entity nad lokálnou D1, FTS5 overené | Agent | testy zelené, počty podľa B | výstup `pnpm -r test`, `wrangler d1 execute --local` |
| I1 [A] | D1: Workers Paid, `d1 create`, R2, fronty, secret `ZBER_TOKEN`, `database_id` do oboch `wrangler.jsonc`, deploy `netopier-zber` (XDR-258, XDR-228) | Adam rozhodne, agent nasadí na pokyn | `/health` 48 h po sebe, `runs` bez systémových chýb | `/health` po 1/24/48 h |
| I2 | Migrácie 0003–0005 lokálne + remote; seedy `zdroje`, `crz_ciselniky`; `slovak-core.yaml` ≥ 12 SK kanálov, WM zúžený (D7); `DeriveJob` vo fronte | Agent | `SELECT count(*) FROM zdroje` ≥ 170; RSS ≥ 300 SK záznamov denne; `failing_channels` bez SK kanálov | `/health`, `wrangler d1 execute` |
| I3 | `derive/udalosti.ts` + `derive/text.ts` (port `events.py`, `text.py`, testy `test_events.py` 1:1 do vitestu, ≥ 30 slovies), `udalost_pokrytie`, `prvy_*`; benchmark na archivovaných pároch z jadra | Agent | z 24 h SK RSS vznikne ≤ 40 % udalostí na počet záznamov; 0 falošných zlúčení na benchmark páre | `derive-udalosti.test.ts`, `GET /api/udalosti?since=-24h` |
| I4 | `derive/registre.ts`, `derive/pravidla.ts`, `derive/rollup.ts`, `derive/nalezy.ts`, `derive/pokrytie.ts`, cron `20 6` | Agent | `rollup_denne` má riadok 7 dní po sebe; `register_udalosti` > 0 pre každý zdroj | `GET /api/rollup/latest`, počty |
| I5 | Interné API `/api/*` (čítanie aj zápis), `pristup.ts` (JWT), kontrakty, `api.test.ts` (Ajv + nepovolené prechody + agent nesmie `schvalene`) | Agent | všetky cesty z 3.3 odpovedajú a validujú; `curl` bez JWT 403 | test log, curl |
| I6 [A] | Domény `api.hriech.xvadur.com`, `netopier.hriech.xvadur.com`, Access aplikácie + Service Token (D4) | Adam v dashboarde, agent konfiguráciu | OTP prihlásenie funguje; Service Token dostane 200 na `/api/zvody` | screenshot, curl |
| I7 | `hriech-web`: `@astrojs/cloudflare`, `src/worker` cez adapter, bindingy, middleware, `TerminalLayout`, `/t`, `/t/zaznamy`, `/t/udalosti`, `/t/registre`, `/t/behy`; `smoke-live.mjs` v `pnpm qa` | Agent | `pnpm qa` zelené; `wrangler dev` renderuje `/t/zaznamy` z lokálnej D1; 403 bez JWT | qa log, screenshot |
| I8 | `derive/zaloha.ts` + cron; obnova vyskúšaná (D1 Time Travel na kópiu + import `zalohy/`) | Agent | prvý `zalohy` riadok, obnova na test DB prešla | `/t/behy`, výpis obnovy |
| I9 | Agenti + `/redakcia --dry-run` nad lokálnou D1 (bez zápisu, JSON validuje) | Agent | dry-run dá ≤ 10 kandidátov s dôvodmi a podklad s claims pre 1 udalosť | výstup v hlavnej session, `validate.mjs` OK |
| I10 | Python vrstva archivovaná do jadra a zmazaná; ADR-009/010; `netopier/STATUS.md`, `README.md`, `STACK.md` prepísané (D10) | Agent | `ls netopier` bez `src/`, `pnpm -r qa` zelené | commit |

### Míľnik Živé — 30. 11. 2026

| # | Krok | Termín | Hotové keď | Dôkaz |
|---|---|---|---|---|
| Z1 | Desk API, `claims`, `archiv`, `schvalenia`, `revizie`; `/t/desk`, `/t/desk/[id]`, `/t/desk/novy`; `pnpm desk` | 5. 11. | Adam schváli testovací post formulárom; `schvalenia` má riadok `kto='adam…'`; agent dostane 403 na `schvalene` | riadky D1, test |
| Z2 | Minúta live: `minuta_posty`, `/minuta*`, `/minuta.xml`, stĺpec na titulke, `Autorstvo`, `Proveniencia` | 8. 11. | prvý schválený post je na hriech.xvadur.com do 60 s bez buildu, bez JS, s bylinou AI + Adam | URL, `curl` s vypnutým JS |
| Z3 [A] | Zvody v1 (D6): `zvody-seed.json` schválený a zamknutý; `signal_zvody` z kľúčových slov a entít; `zvod_skore_denne` denne | 12. 11. | 7 dní po sebe riadky pre každý zvod × 3 krivky | `SELECT count(DISTINCT den)` = 7 |
| Z4 [A] | Redakčná linka (D2): agenti, `/redakcia`, `behy_redakcie` s R2 vstupom/výstupom, validácia, prvé ručné behy | 18. 11. | 5 po sebe idúcich dní beh ok a Adam schválil ≥ 1 post denne | `/t/behy`, `schvalenia` |
| Z5 | Udalosť ako Ground News: `/udalosti/[slug]` s pokrytím, prvým zdrojom, blindspotom, porovnaním titulkov, claims s archívom | 18. 11. | ≥ 10 udalostí `verejna=1` s ≥ 2 nezávislými zdrojmi; `SELECT count(*) FROM claims WHERE typ='fakt' AND stav<>'overene' AND desk_id IN (vydane)` = 0 | URL, SQL |
| Z6 | Prvé články (XDR-231): CRZ článok a „Fico nemusí čítať vaše články“ cez linku (claims + archív), `claimIds` vo frontmatteri, `ArticleView` s `Tvrdenia` | 20. 11. | 2 články `published` s `approvedBy`, každé tvrdenie overené | URL, `pnpm qa` |
| Z7 [A] | Print redizajn (D5, D13): tokeny v2, mriežka, serif, mono, `print.css`, `DESIGN.md` v2; kartičky zdrojov `/zdroje/[id]` v1 fakty (D8) | 25. 11. | Adam schválil vizuál na živom webe; Lighthouse a11y ≥ 95; mobil 375 px bez horizontálneho scrollu; 10 kartičiek s vlastníkom z mapy | screenshoty, Lighthouse |
| Z8 [A] | Seizmograf (XDR-232, D3): `/zvody`, `/zvody/[id]` s EKG (dve krivky), `/seizmograf`, routine `hriech-redakcia-rano|vecer|tyzden` | 27. 11. | modul živý s dátami 7 dní, ≥ 1 zvod `vznikajuce` s odôvodnenými signálmi, 3 behy routine za sebou ok | URL, `/t/behy` |
| Z9 | Denná titulka ako vydanie: `vydania`, `/`, `/vydanie/[den]`, snapshot do R2, RSS vydania | 30. 11. | 7 po sebe idúcich vydaní schválených Adamom; každý archívny deň má `snapshot_sha256` | `/vydanie`, R2 objekty |

### Míľnik Vianoce — 31. 12. 2026

| # | Krok | Hotové keď | Dôkaz |
|---|---|---|---|
| V1 | Štátny dashboard `/stat/*`: `statistika_rady` (rozbalený JSON-stat 6 datasetov), CRZ po rezortoch (číselník), TED filter SK obstarávateľ, kataster verzie; overená sémantika objednávateľ/dodávateľ proti XML | 6 tabuliek live, čísla sedia s `wrangler d1 execute` kontrolou | URL, porovnanie |
| V2 | Rebríček redakcií `/zdroje` (prvý, podiel, blindspoty, normalizovaná pozornosť za 30 dní) | rebríček live s 30 dňami | URL |
| V3 | Kalendár a odpočet `/kalendar` (`kalendar` z TED lehôt, CRZ účinností, ručné termíny NR SR/voľby), odpočet na titulke server-side | ≥ 20 termínov so zdrojom | URL |
| V4 | Demografia `/demografia` (om2019rs, om2801ms, kz1020rs → SVG) | 3 grafy live | URL |
| V5 | Chronos `/chronos` (udalosti + kalendár + zvody + `udalost_rodokmen` na jednej SVG osi) + článok Zeitgeber (XDR-197) cez linku | os live, článok `published` | URL |
| V6 | Voľby a prieskumy `/volby`: `prieskumy` (ručný seed s URL a archívom na každý riadok, agent dopĺňa z verejných zdrojov) | ≥ 10 prieskumov s citáciou | URL |
| V7 | Mapa s vrstvami `/mapa`: kataster GeoJSON z R2 (D11), miesta udalostí; MapLibre ako jediný JS ostrov, bez JS zoznam parciel a tabuľka | 2 oblasti + vrstva udalostí live | URL |
| V8 | Opus Major `/opus`: statická kolekcia z exportu Notionu (rozcestník) | stránka live | URL |
| V9 | OSINT vrstva: `0007_ftm.sql`, konektory `rpo.ts` (REST), `ruz.ts`, `rpvs.ts`, `sledovane`, nález `zmena_registra`, `/t/entity` rozšírený | 100 entít so vzťahmi, 1 nález z krížovej kontroly | D1 počty, terminál |
| V10 | Archivácia mesiacov `records` → R2 (`archiv-mesiac.ts`), retencia raw, ľudské merge/split udalostí (`/t/udalosti/[id]`) | mesiac 2026-09 v R2 s hashom, D1 < 3 GB; 1 merge + 1 split cez formulár | `/t/behy`, `udalost_rodokmen` |

### Moduly XDR-230 v poradí (hotové keď: návrh + úlohy v Lineari + Adam schválil)

| # | Modul | Dáta | Plocha | Krok |
|---|---|---|---|---|
| 1 | Mapa s vrstvami | `records` kataster (R2 GeoJSON), `udalosti.miesto` | `/mapa` | V7 |
| 2 | Štátny dashboard | `register_udalosti`, `statistika_rady`, `crz_ciselniky` | `/stat/*` | V1 |
| 3 | Voľby a prieskumy | `prieskumy` | `/volby` | V6 |
| 4 | Kalendár a odpočet | `kalendar` | `/kalendar`, titulka | V3 |
| 5 | Minúta po minúte | `minuta_posty` | `/minuta*`, stĺpec titulky | Z2 |
| 6 | Analýza spravodajstva | `udalosti`, `udalost_pokrytie`, `nalezy`, `zdroj_pokrytie_denne` | `/udalosti*`, `/seizmograf` (blindspoty), Seizmograf/zvody XDR-232 | Z5, Z8 |
| 7 | Rebríček redakcií | `zdroje`, `zdroj_pokrytie_denne` | `/zdroje` | Z7 (kartičky), V2 (rebríček) |
| 8 | Chronos | `udalosti`, `kalendar`, `zvod_stav_historia`, `udalost_rodokmen` | `/chronos` | V5 |
| 9 | Demografia | `statistika_rady` | `/demografia` | V4 |
| 10 | Opus Major | export Notionu (git) | `/opus` | V8 |

Poradie stavby sa riadi termínmi v Lineari (XDR-231 20. 11., XDR-232 27. 11., XDR-197 31. 12.), preto Minúta, udalosti a zvody idú pred modulmi 1–4.

---

## 8. Čo sa použije a čo zahodí

**Použije sa:**

| Kód | Ako | Dôvod |
|---|---|---|
| `netopier/zber/` celý: 6 konektorov, `archive.ts`, `plan.ts`, `util.ts`, `types.ts`, `data/*.json`, 27 testov, `zber-node.mjs`, migrácia 0001 | rozšíri sa o `derive/`, `api/`, nové migrácie; mená ostávajú | hotové, lokálne overené, lokálna D1 s 14 299 záznamami je testovací dataset |
| `src/index.ts` `runJob`, `CONNECTORS`, `/health`, `/run` | zaradí `DeriveJob` po zbere; `/health` rozšírený | vzor batch dopytov |
| Python čisté moduly: `text.py`, `events.py` (pravidlá, príznaky, prahy), `benchmark.py` (evaluate), `test_events.py` | port 1:1 do `derive/text.ts`, `derive/udalosti.ts`, `derive-udalosti.test.ts` | prenositeľné bez DB; testy sa nestrácajú |
| `contracts/events.example.json` (events-v1) | názvy polí `udalosti`, filtre API | konzistencia |
| openclaw `scoring.js`, `status.js`, tvary `signal/predictions/narrative/evidence.json` | `skore.ts`, `stavovy-stroj.ts`, tabuľky 0004, parity test | presný model EKG; scratchpad je dočasný, preto kópia v I0 |
| Hriech: `BaseLayout`, `publication-policy.mjs`, `content.config.ts`, `ArticleView`, `PublicationFeed/Rows`, `FilterScript`, `.records/.record`, `.relation-line`, `.finance-table`, `SourceRefs` (zovšeobecnený), `newsrooms.ts` (evidenceState štítky, vlastnícka reťaz), `verify-public-build.mjs`, `merge-newsroom-fragments.mjs` vzor, Ajv, `rss.xml.ts`/`xml.ts`, `nahlad/` mechanizmus, `Icon` | verejné plochy, terminál, kontrakty | brána `isPublic` ostáva pre články; ten istý princíp (jedna funkcia rozhoduje) je v `dopyty` s `verejne:true` |
| `editorial-organization-map.json` + kontrakt | `zdroje.outlet_id`, `entity.map_*`, vlastník na kartičke | jediné dáta o médiách |
| Fiki korpus | ostáva lokálny | súkromie surových prepisov; neskôr `records` source `fiki` iba na pokyn |

**Zahodí sa (archív v jadre), dôvod:**

| Kód | Dôvod |
|---|---|
| Python runtime: `archive.py`, `embeddings.py`, `stories.py`, `feed.py`, `api.py`, `pipeline.py`, `miniflux.py`, `sources.py` (bootstrap), `database.py`, `config.py`, Alembic 0001–0006, `compose.yaml`, `Dockerfile`, `ops/`, `artifacts/` | viazané na Postgres/pgvector/Miniflux (LATERAL, advisory locky, `vector(384)`, `text[]`), nebeží od 7. 9., Python 3.12 chýba, Dockerfile nezostaví; D1 nemá vektory; prenos = prepis, nie presun; výsledok 54 udalostí z 56 článkov nedokázal hodnotu embeddingov |
| Miniflux (ADR-002) | Worker RSS ho nahradil; dva zbery = dva archívy |
| Príbehy (`stories`, centroid 0,83, `feed_snapshots` 24 h) | jednotka je udalosť; feed nahrádza vydanie a Minúta |
| `.impeccable/`, `docs/design-direction.md`, plastické tiene na verejných plochách, legacy hash redirect | print redizajn (D5); tiene ostávajú iba v `/mapy/*` |
| STACK.md návrhy Neon Postgres, Fly.io, vis-timeline, NumberFlow, Tremor/visx, D3 | mimo Cloudflare alebo JS pre základný obsah; server-side SVG stačí; MapLibre iba `/mapa` |
| World Monitor platené dáta, Workers AI/Vectorize | D12; embeddingy až po vyhodnotení I3 |

---

## 9. Riziká a limity

| Riziko | Číslo | Opatrenie |
|---|---|---|
| D1 strop 10 GB | 1,7 KB/záznam, 10–25 tis. denne → 17–42 MB/deň → 8–16 mesiacov | WM zúžený na `europe`+`gov` (−40 %), summary WM ≤ 600 znakov, kataster geometria v R2, V10 archivácia mesiacov > 6 s DELETE po overení; index iba kde je dopyt (každý index = ďalší zapísaný riadok v limite 50 mil./mes.) |
| D1 čítania a full scan `json_extract` | latencia, riadkové účtovanie | `record_entity`, `published_at_utc`, `records_fts`; keyset stránkovanie; SSR cache 60 s; `db.batch` pre titulku |
| Workers CPU | Paid: `limits.cpu_ms` 60 000; CRZ 3,4 MB XML; derive O(n·k) | derive po dávkach 100–500 s kurzorom `source_state('derive', krok)`, každá dávka vlastná správa vo fronte; svetové RSS do udalostí iba z `derive-kanaly.json`; test vo workerd meria čas dávky |
| FTS5 v D1 | ak nefunguje, bez fulltextu | overené v I0 lokálne; fallback LIKE nad `title` + `record_entity` |
| Kvalita udalostí bez embeddingov | Python dával 1:1, aktér „Toto“, 9 miest natvrdo | ≥ 30 slovies, entity a mená z mapy ako kotvy, `same_event` ≥ 0,85, `suggested` nikdy nezlučuje, cieľ ≤ 40 % v I3, ľudský merge/split v termináli; verejná je udalosť až po `vydane` |
| Astro SSR na Cloudflare | `verify-public-build.mjs` nevidí SSR HTML; chyba D1 = 5xx | `smoke-live.mjs` v `pnpm qa` (200, `lang`, `canonical`, zakázané markery, `id="post-<slug>"`, blok `.ai-autorstvo` na poste/udalosti/vydaní, žiadny stav ≠ vydane, `/t` 403 bez JWT, `/` < 40 000 B); SSR stránka pri chybe D1 vykreslí články + „dáta dočasne nedostupné“ |
| Build Astro pri tisíckach stránok | udalosti, posty, vydania sú SSR → build nerastie; statických ~60 + články | Workers Static Assets limit 20 000 súborov nedosiahnuteľný |
| Dva Workery, jedna D1 | migrácie aplikuje iba `netopier-zber`; nesúlad verzií schémy a dopytov | `@netopier/redakcia` verzuje schému; `dopyty.test.ts` beží nad migráciami z `zber/migrations`; deploy poradie: zber (migrácie) → web |
| Service Binding obchádza Access | `hriech-web` musí overiť JWT sám | middleware overuje JWT na terminálovom hoste; `netopier-zber` overuje preposlaný JWT znova (AUD terminálu); test 403 v smoke |
| Cache 60 s | Minúta mešká do minúty | prijaté; `pripnuty` post sa mení zriedka; ostrov `minuta-refresh` dopĺňa |
| Blokovanie zdrojov | Google News proxy (AP, Reuters, CNN, Interfax), RT `internal error`, 403 Asharq/FPRI, TLS `data.statistics.sk` lokálne, YouTube IP Macu | `failing_channels` v `/t`, `zdroje.pozastaveny_at` po 3 chybách, náhrada priamymi RSS; ŠÚ SR z Cloudflare overí I1; Fiki mimo cloudu |
| CRZ sémantika a kódy | objednávateľ/dodávateľ podozrivé (Mesto Zvolen 39× dodávateľ), rezort/typ/druh/stav bez číselníka | `crz_ciselniky` seed, overenie proti XML pred V1; do overenia pravidlá iba `suma`, `dodatok`, `sledovana_entita`; na webe „strana A / strana B“ |
| TED iba nadlimitné, ÚVO bez API, LV nie sú otvorené | krivka „čo sa stalo“ neúplná | zapísané v kartičke zdroja a `/o-hriechu/redakcia`; medzera je `claims.typ='medzera'` |
| Súkromie | Claude číta verejné texty; CRZ obsahuje fyzické osoby | D2 hranica; `entity.verejne=0` vo všetkých verejných dopytoch; Fiki raw, jadro, realitný trh nikdy do API ani promptu |
| LLM klasifikácia signálov | subjektívna | `odovodnenie` + `klasifikoval` na každom linku, `stav='navrh'` až do overenia, Adam prepíše v termináli, zvody zamknuté, rollup nesie `verzia` |
| Náklady tokenov | 5 agentov, ≤ 10 položiek, 2 behy denne; odhad 0,5–1,5 mil. tokenov/deň | v predplatnom; `behy_redakcie.tokens_*` na `/t/behy`; reportér iba nad `vyrez` a summary, nie celé stránky |
| Verejný repozitár | prompty, drafty | prompty v `_claude/` (súkromný workspace repo); drafty iba v D1/R2; `research/` sa nepushuje; `smoke` a `verify` kontrolujú markery |
| Jeden človek, 10 Infra krokov do 31. 10. | tesné | I0 začína hneď; I2–I5 lineárne; I6–I10 paralelne subagentmi; terminál a agenti sú textové; Živé začína, aj keď I9/I10 preteknú |

---

## 10. Rozhodnutia pre Adama

Zoznam D1–D14 v časti A. Blokujúce hneď: D1 (Paid + deploy), do 15. 10.: D6 (zvody), do 1. 11.: D2 (verejné texty a LLM), D3 (routine), D4 (domény), D5 (vizuál). Ostatné majú východisko, s ktorým návrh počíta, a menia sa iba Adamovým slovom.