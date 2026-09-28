# netopier-zber — zber a odvodenie Netopiera v2

Zber verejných zdrojov do archívu a odvodenie nad ním. Od 27. 9. 2026 beží **lokálne na Macu**
(rozhodnutie v `../../docs/redakcia/ROZHODNUTIE.md`): rovnaký TypeScript kód ako Cloudflare Worker,
ale pracovná databáza je lokálna D1 (SQLite v `.wrangler/state`) a surové payloady lokálne R2.
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

Lokálny zber (reálne zdroje, lokálne D1/R2/Queues v `.wrangler/state`):

```bash
printf 'ZBER_TOKEN=lokalny-test-token\n' > .dev.vars
pnpm run db:migrate:local
pnpm dev                                                   # http://localhost:8787
curl -X POST -H 'Authorization: Bearer lokalny-test-token' 'http://localhost:8787/run/crz?sync=1'
curl -X POST -H 'Authorization: Bearer lokalny-test-token' http://localhost:8787/run   # všetko cez frontu
curl 'http://localhost:8787/__scheduled?cron=*/30+*+*+*+*'                            # simulácia cronu
node scripts/zber-node.mjs statistika                      # ten istý kód mimo workerd (pozri nižšie)
npx wrangler d1 execute netopier-zber --local --command "SELECT source, COUNT(*) FROM records GROUP BY source"
```

## Odvodenie nad lokálnou D1 (krok I0, XDR-275)

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
pnpm run db:migrate:local                                  # 0001 + 0002
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
