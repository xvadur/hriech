# netopier-zber — zber a odvodenie Netopiera v2

Zber verejných zdrojov do archívu a odvodenie nad ním. Od 27. 9. 2026 beží **lokálne na Macu**
(rozhodnutie v `../../docs/redakcia/ROZHODNUTIE.md`): rovnaký TypeScript kód ako Cloudflare Worker,
ale pracovná databáza je od 29. 9. jeden SQLite súbor `../data/netopier.sqlite` (mimo gitu) s rozhraním D1
(`scripts/lib/db.mjs`, `node:sqlite`) a surové payloady sú v `../data/raw/` (zdôvodnenie v `../STACK.md`).
Pôvodná lokálna D1 v `.wrangler/state` ostáva ako záloha; `pnpm run db:z-d1` ju raz skopíruje do súboru.
Worker sa do cloudu nenasadzuje, kým lokálny režim nie je zabehnutý (postup nižšie ostáva pre ten deň).
Surová vrstva: každý záznam nesie zdroj, kanál, zdrojovú URL, čas publikácie, čas zberu, hash obsahu
a odkaz na surový payload. Odvodené vrstvy (`derive/`) sú oddelené a dajú sa prepočítať.

```text
cron (*/30, denne 05:20 UTC) ─► fronta netopier-zber-jobs ─► konzument (1 správa = 1 úloha)
                                        │                          │
                                        └── retry 3×, potom DLQ    ├─► konektor zdroja (fetch, parse)
                                                                   ├─► R2 netopier-archiv (surový payload)
                                                                   └─► D1 netopier-zber (records, runs, source_state)
```

## Zdroje

| Zdroj | Konektor | Čo zbiera | Kedy | Kľúč |
|---|---|---|---|---|
| Slovenské médiá | `rss` / sada `media` | 4 kanály z `../sources/slovak-core.yaml` | každých 30 min | nie |
| World Monitor — správy | `rss` / sada `worldmonitor` | 155 svetových kanálov z katalógu World Monitor (politics, europe, middleeast, gov, thinktanks, crisis), čítané priamo od vydavateľov | každé 2 h | nie |
| World Monitor — inventár | `worldmonitor` | MCP `get_sources`: súhrn, outlety podľa tieru (s propagandistickým rizikom), štruktúrovaní poskytovatelia | denne | nie (10 volaní/min) |
| Zmluvy | `crz` | denný export CRZ (`crz.gov.sk/export/YYYY-MM-DD.zip`): zmluvy zverejnené alebo zmenené v daný deň, strany, IČO, sumy, prílohy | denne, dobieha až 14 dní | nie |
| Obstarávania | `ted` | TED Search API v3, obstarávateľ zo SR: výzvy, výsledky, víťazi, hodnoty, CPV | denne | nie |
| Kataster | `kataster` | INSPIRE WFS ÚGKK: parcely registra C v sledovaných oblastiach (`data/kataster-oblasti.json`), verzia, výmera, geometria | denne | nie |
| Štátne dáta | `statistika` | ŠÚ SR DATAcube: katalóg ~680 datasetov s dátumom aktualizácie + celé sledované datasety (`data/statistika-datasety.json`) pri zmene | denne | nie |

Zmena obsahu u zdroja vytvorí novú verziu záznamu (nový `content_hash`), rovnaký
obsah sa druhýkrát nezapíše. RSS sa do R2 neukladá (objem); ostatné zdroje áno.

Medzery: podlimitné zákazky (vestník ÚVO) nemajú použiteľné otvorené API a nezbierajú sa;
živé dáta World Monitor (briefy, udalosti, riziká krajín) vyžadujú platený kľúč
(API Starter 99,99 $/mes.); vlastníci parciel (LV) nie sú otvorené dáta.

## Príkazy

```bash
npx -y pnpm@11.19.0 install        # závislosti (pnpm nie je v PATH)
pnpm run check                     # wrangler types + tsc
pnpm test                          # vitest vo workerd, D1 s migráciami, bez siete
pnpm run qa                        # check + test + wrangler deploy --dry-run
pnpm run sync:zdroje               # obnoví data/*-feeds.json z registra a z World Monitor
```

Lokálny zber (reálne zdroje; `pnpm dev` beží nad lokálnou D1/R2/Queues v `.wrangler/state`, `scripts/*-node.mjs` nad `../data/netopier.sqlite`):

```bash
printf 'ZBER_TOKEN=lokalny-test-token\n' > .dev.vars
pnpm run db:migrate:d1                                     # migrácie lokálnej D1 pre `pnpm dev`
pnpm dev                                                   # http://localhost:8787
curl -X POST -H 'Authorization: Bearer lokalny-test-token' 'http://localhost:8787/run/crz?sync=1'
curl -X POST -H 'Authorization: Bearer lokalny-test-token' http://localhost:8787/run   # všetko cez frontu
curl 'http://localhost:8787/__scheduled?cron=*/30+*+*+*+*'                            # simulácia cronu
node scripts/zber-node.mjs statistika                      # ten istý kód mimo workerd (pozri nižšie)
sqlite3 ../data/netopier.sqlite "SELECT source, COUNT(*) FROM records GROUP BY source"
```

## Odvodenie nad lokálnou databázou (krok I0, XDR-275)

Migrácia `migrations/0002_zaklad.sql` pridáva `records.published_at_utc`, `zdroje`, `zdroj_kanaly`,
`zdroj_pokrytie_denne`, `entity`, `entity_alias`, `record_entity`, fulltext `records_fts` (FTS5 s externým
obsahom cez pohľad `records_text`, triggery na INSERT/UPDATE/DELETE), `pocty`, `crz_ciselniky`, `meranie`.
Kroky v `src/derive/` (čisté funkcie sú v `../redakcia/`, balík `@netopier/redakcia`):

| Krok | Čo robí |
|---|---|
| `normalize` | `published_at` (5 formátov) → `published_at_utc`; bez dátumu ostáva NULL |
| `entity` | IČO z CRZ (strana_a, strana_b) a TED (obstarávateľ, víťaz) → `entity`, `record_entity` |
| `zdroje` | kartičky zdrojov zo seedov (`data/media-feeds.json`, `data/worldmonitor-feeds.json`, registre) a mapovanie kanál → redakcia |
| `fts` | `rebuild` + `integrity-check` fulltextu |
| `pocty` | počty riadkov per zdroj a kanál |
| `pokrytie` | záznamov per SK redakcia a deň (Bratislava), podiel z dňa |
| `zmienky` | aliasy entít so `sledovane = 1` → fulltext → `record_entity` (zmienka); entitný filter z rozhodnutia 28. 9. |
| `meranie` | meranie médií nad SK RSS: lexika, stavba titulkov, poplašné a vatové slová, per redakcia × deň a autor |

```bash
pnpm run db:migrate:local                                  # všetky migrácie nad ../data/netopier.sqlite
pnpm run derive                                            # všetky kroky v poradí
node scripts/derive-node.mjs normalize                     # jeden krok
node scripts/derive-node.mjs hladaj '"Robert Fico"'        # fulltext (FTS5: slovo, "fráza", prefix*)
pnpm run db:pocty
npx wrangler d1 execute netopier-zber --local --command "SELECT rozsah, kluc, metrika, hodnota FROM meranie WHERE den = '*' AND metrika = 'poplasne_podiel'"
```

Stav po behu 28. 9. 2026 nad 14 299 záznamami: 13 479 `published_at_utc`, 2 024 entít, 4 700 väzieb,
`MATCH 'zmluva'` = 2 296, 163 zdrojov, meranie 3 SK redakcií a 18 autorov (55 SK záznamov z 26. 9.).
Každý beh kroku je riadok v `runs` (`source = 'derive'`).

Lokálny workerd nenadviaže TLS s `data.statistics.sk` (Apache so starým TLS 1.2, reťazec
Sectigo R46) — `fetch` padá na „internal error“. Node aj curl fungujú, preto
`scripts/zber-node.mjs` spustí rovnaké konektory a archív nad rovnakým lokálnym D1/R2
cez Node. Či to prejde v produkcii, sa overí hneď po nasadení (krok 8).

## Príjem RSS s celými textmi (XDR-299)

Príkaz pre službu (každých 2–5 minút; LaunchAgent iba na pokyn, XDR-279):

```sh
pnpm run db:migrate:local            # raz: schéma 0004 (jednotná schéma)
pnpm run prijem                      # kanály + celé texty; log na výstup a do ../data/log/prijem.jsonl
node scripts/prijem-node.mjs --bez-textov            # iba kanály
node scripts/prijem-node.mjs --max-textov 300 --max-na-host 40 --rozostup 1500 --hosty 6
pnpm run prijem:stav                 # počty: dokumenty, texty podľa stavu, po zdrojoch, duplicity
sqlite3 ../data/netopier.sqlite "SELECT d.titulok, d.url FROM dokumenty_fts f JOIN dokumenty d ON d.id = f.rowid WHERE dokumenty_fts MATCH 'skolstvo' LIMIT 20"
```

Register zdrojov: `data/zdroje/register.json` (XDR-296, pole `{id, nazov, typ, url_web, rss:[url], api, cely_text_v_rss,
jazyk, kategoria, overene_at, poznamka}`). Záloha `data/prijem-zaloha.json` (19 SK zdrojov, 27 kanálov overených 29. 9.)
dopĺňa zdroje, ktoré register nemá, a RSS tam, kde ho register pri rovnakom id nemá; po dokončení registra sa zmaže.

Beh (`src/prijem/index.ts`):
1. **Zdroje** z registra → `zdroje`, `zdroj_kanaly` (id kanála: existujúce z `media-feeds.json`, inak id zdroja / `<id>_<n>`).
2. **Kanály** po hostoch (rôzne hosty paralelne, jeden host sekvenčne s rozostupom), podmienený GET (ETag / Last-Modified
   v `source_state.cursor`, 304 = nič nové), znaková sada z hlavičky alebo XML.
3. **Surový archív** `records` (ako doteraz: rovnaký obsah sa nezapíše druhýkrát) + `runs` po kanáloch.
4. **Dokumenty**: kanonická URL (bez `www.`, fragmentu, `utm_*`, `fbclid`…, koncovej lomky) je UNIQUE; ten istý článok
   z ďalšieho kanála pridá iba riadok `dokument_vyskyty`. Titulok a perex mení iba kanál, kde sa dokument objavil prvý.
5. **Celé texty**: ak RSS dáva celý text (`content:encoded` ≥ 1 500 znakov, alebo `cely_text_v_rss`), berie sa z RSS;
   inak sa stiahne stránka: `robots.txt` (cache 24 h v `hostitelia`, Crawl-delay predĺži rozostup), JSON-LD `articleBody`,
   inak Readability (linkedom). Stavy: `ok` (≥ 600 znakov; minúta po minúte hocijako krátka), `kratky` (kratší alebo
   platená stena podľa JSON-LD `isAccessibleForFree = false`, vtedy `data.platene = 1`), `bez_textu`, `zakazane` (robots),
   `nedostupne` (4xx), `chyba` (sieť, 429, 5xx: opakuje sa s odkladom 10, 20, 40… min, najviac 4 pokusy; 429 zastaví host
   do ďalšieho behu). Najviac 300 textov za beh, 40 z jedného hosta.
6. **Obsahová deduplikácia**: `obsah_hash` = sha256 normalizovaného textu; rovnaký text pod inou URL (preberaná agentúrna
   správa) dostane `duplikat_of` = najstarší dokument.
7. Beh je riadok v `runs` (`source = 'prijem'`, počty v `detail`). Zámok `../data/prijem.lock` bráni prekrytiu behov.

Fulltext `dokumenty_fts` (titulok, perex, celý text; bez diakritiky) je externý obsah nad pohľadom — text sa neukladá dvakrát,
triggery na `dokumenty` a `dokument_texty` ho udržiavajú, `INSERT INTO dokumenty_fts(dokumenty_fts) VALUES ('rebuild')` ho prepočíta.

## Voľby 24. 10. 2026 (XDR-276)

Migrácia `0003_volby.sql`: `volby_kraje`, `volby_okresy`, `volby_obce` (krajské mestá + mestské časti
Bratislavy a Košíc), `volby_strany`, `volby_kandidati` + `volby_kandidat_strany`, `volby_prieskumy` +
`volby_prieskum_hodnoty`, `volby_kalendar`, `volby_zdroje`; `entity_alias` dostal zdroj `'volby'`.
Geo hranice krajov a okresov (ZBGIS cez drakh/slovakia-gps-data, EPSG:4326, 5 desatinných miest)
sú v `data/volby/geo/*.geo.json`, kódy krajov (IDN4) a okresov (IDN3) sú kódy ŠÚ SR.

```sh
pnpm run volby                          # všetky kroky: uzemie, kalendar, kandidati, prieskumy, entity + počty
node scripts/volby-node.mjs kandidati   # iba jeden krok; `pocty` vypíše počty bez zápisu
```

Kroky (`src/volby/index.ts`, každý idempotentný, riadok v `runs` so `source = 'volby'`; log hovorí, čo pribudlo):
- `uzemie` — 8 krajov a 47 obcí z `data/volby/uzemie.json`, 79 okresov z GeoJSON, slovník 40 strán (`STRANY` v `parse.ts`).
- `kalendar` — zákonné termíny z `data/volby/kalendar.json` (zákon 180/2014, 181/2014, rozhodnutie 145/2026, harmonogram MV SR); debaty a tlačovky sa dopisujú do toho istého súboru.
- `kandidati` — stiahne oficiálne zoznamy z `data/volby/zdroje.json` (PDF → text cez PDFKit/osascript na Macu, pri neúplnom
  certifikačnom reťazci úradu padá na `curl`), rozparsuje jednotný vzor MV SR (`src/volby/parse.ts`: „1. Meno PRIEZVISKO,
  tituly, NN r., zamestnanie, [obec,] navrhovateľ“) a upsertne; potom kandidáti z médií (`data/volby/kandidati-media.json`).
  Oficiálny zdroj prepíše mediálny riadok, mediálny nikdy neprepíše oficiálny. Id kandidatúry
  `<volba>:<územie>:<slug mena>` je stabilné, preto druhý beh nič nezdvojí.
- `prieskumy` — `data/volby/prieskumy.json`; hodnoty sa priradia ku kandidátom podľa mena v území (mená bez kandidatúry ostanú bez väzby).
- `entity` — každý kandidát dostane `entity` riadok `osoba:<slug>` (`fyzicka_osoba`, `verejne = 0`) a alias so zdrojom `volby`
  pre `derive:zmienky` a sledované osoby (XDR-277); `volby_kandidati.entity_id` naň ukazuje.

Po 29. 9. 2026 (zverejnenie zoznamov MV SR) sa do `zdroje.json` doplnia URL ostatných krajov a miest (aj poslanci
s `obvod`), `pnpm run volby` ich stiahne a mediálne riadky nahradí oficiálnymi. Bratislavský zoznam primátora je sken
bez textovej vrstvy — parser vráti 0 a riadok v `volby_zdroje` nesie chybu; kandidáti ostávajú z médií.

## Nasadenie do cloudu (odložené — iba na Adamov pokyn, XDR-258)

Predpoklad: **Workers Paid** (5 $/mes.) na účte. Na Free pláne má cron a konzument 10 ms CPU
(export CRZ má 3,4 MB XML) a D1 100 tis. zapísaných riadkov denne (svetové kanály ich pri
indexoch vyčerpajú). Plán: dash.cloudflare.com → Workers & Pages → Plans.

```bash
cd netopier/zber
npx -y pnpm@11.19.0 install
npx wrangler login                                      # ak wrangler nie je prihlásený

# 1. zdroje v Cloudflare (jednorazovo)
npx wrangler d1 create netopier-zber                    # database_id vložiť do wrangler.jsonc, commitnúť
npx wrangler r2 bucket create netopier-archiv
npx wrangler queues create netopier-zber-jobs
npx wrangler queues create netopier-zber-dlq

# 2. schéma a token
npx wrangler d1 migrations apply netopier-zber --remote
openssl rand -hex 32 | tee /dev/tty | npx wrangler secret put ZBER_TOKEN   # token si ulož do Kľúčenky

# 3. nasadenie
pnpm run deploy                                         # qa + wrangler deploy (crony sa zapnú s ním)

# 4. prvý zber a overenie štatistiky v produkcii
URL=https://netopier-zber.<subdoména>.workers.dev
curl -X POST -H "Authorization: Bearer $ZBER_TOKEN" "$URL/run/statistika?sync=1"
curl -X POST -H "Authorization: Bearer $ZBER_TOKEN" "$URL/run"
curl "$URL/health"
npx wrangler tail netopier-zber                         # živé logy konzumenta
```

Overenie „beží bez Macu 48 h“: `curl $URL/health` po 1 h, 24 h a 48 h — počty v `records`
rastú, `runs_24h` má pre `rss` ~48 behov × kanály a pre denné zdroje po jednom behu.
Priamo v D1: `npx wrangler d1 execute netopier-zber --remote --command "SELECT source, COUNT(*), MAX(collected_at) FROM records GROUP BY source"`.

Rollback: `npx wrangler rollback` (predchádzajúca verzia) alebo zastavenie zberu
`npx wrangler delete netopier-zber` (D1, R2 a fronty ostanú).

## Objem a limity

- Prvý beh lokálne (26. 9. 2026): 14 299 záznamov — RSS 9 109 (153 kanálov), CRZ 3 026 (export 25. 9.),
  World Monitor 742, štatistika 684, kataster 533, TED 205.
- Ustálený stav odhadom 10–25 tis. nových záznamov denne, väčšina zo svetových RSS. D1 má strop
  10 GB na databázu — pri tomto tempe zhruba na rok; potom archivácia starších mesiacov do R2.
- Queues: ~140 správ denne (~420 operácií), hlboko pod bezplatnými 10 tis. operáciami denne.
