# STATUS — netopier

## Živé
- **Lokálny režim (28. 9., XDR-275, krok I0):** Netopier beží nad lokálnou D1 na Macu (`zber/.wrangler/state`, 14 299 záznamov zo zberu 26. 9.). Migrácia `0002_zaklad.sql` aplikovaná, odvodenie prebehlo: 13 479 záznamov s `published_at_utc` (820 bez dátumu: World Monitor inventár 742, RSS 78), 2 024 entít podľa IČO (firma 674, obec 467, štátny orgán 378, neurčené 505), 4 700 väzieb `record_entity` (CRZ strana_a 2 358, strana_b 2 034, TED obstarávateľ 205, víťaz 103), fulltext `records_fts` (`MATCH 'zmluva'` = 2 296), 163 kartičiek zdrojov (3 SK redakcie, 155 kanálov World Monitor, 5 registrov), pokrytie a meranie 3 SK redakcií a 18 autorov nad 55 SK záznamami z 26. 9. (312 riadkov `meranie`)
- Ako spustiť: `cd netopier/zber && npx -y pnpm@11.19.0 install && pnpm run db:migrate:local && node scripts/zber-node.mjs crz && pnpm run derive`; fulltext `node scripts/derive-node.mjs hladaj '"Robert Fico"'`; počty `pnpm run db:pocty`. Testy: `cd netopier/redakcia && pnpm run qa` (23) a `cd netopier/zber && pnpm run qa` (40)

## Voľby 24. 10. 2026 (XDR-276, stav 28. 9.)
- Migrácia `0003_volby.sql` aplikovaná lokálne; `pnpm run volby` (idempotentný, druhý beh „pribudlo 0“) naplnil: **8 krajov**, **79 okresov**, **47 obcí** (8 krajských miest, 17 MČ Bratislavy, 22 MČ Košíc), **104 kandidatúr** (predsedovia krajov 56: BA 7, TT 7, TN 4, NR 7, ZA 7, BB 7, PO 11, KE 6; primátori 48: Bratislava 6 z toho 2 sa vzdali, Trnava 6, Trenčín 4, Nitra 4, Žilina 8, B. Bystrica 6, Prešov 6, Košice 8), 39 strán s väzbou, **16 prieskumov** (58 hodnôt, 43 priradených kandidátom), **14 zákonných termínov** v kalendári, **103 osôb** v `entity` (`osoba:<slug>`, `verejne = 0`) so 103 aliasmi `volby` — Kotleba kandiduje 2× (predseda BBSK aj primátor B. Bystrice)
- Zdroje kandidátov: oficiálne zoznamy (44 riadkov, stiahnuté 28. 9.): ŽSK predseda (zilina.sk, 9. 9.), BBSK predseda (bbsk.sk, 8. 9.), primátori Košice (9. 9.), Nitra (7. 9.), Trenčín (7. 9.), Žilina (5. 9.), B. Bystrica (10. 9.); médiá (60 riadkov): predsedovia BA, TT, TN, NR, PO, KE z noviny.sk (16. 9., krížovo stavkynavolby.sk 22. 9.), primátori Bratislava (STVR, aktualizované 28. 9.: Winkler a Heredoš sa vzdali), Trnava (trnava-live.sk 7. 9.), Prešov (presovak.sk). Bratislavský oficiálny zoznam je sken bez textu (bratislava.sk, 7. 9.)
- Prieskumy: SANEP/ta3 (máj: BSK, KSK, primátor BA a KE; jún a september: ŽSK), AKO (KSK február a apríl, objednané tímami kandidátov), SCIO/Startitup (11. 9., všetkých 8 krajov, malé vzorky). Zákaz zverejňovania od 10. 10.
- Kalendár (zákon 180/2014, 181/2014, rozhodnutie 145/2026, harmonogram MV SR): vyhlásenie a začiatok kampane 24. 6., listiny do 25. 8., registrácia do 9. 9., delegovanie do 17. 9., zoznamy kandidátov a oznámenie voličom do 29. 9., zákaz prieskumov od 10. 10., koniec kampane 22. 10. 0:00, vzdanie sa kandidatúry do 22. 10. 7:00, voľby 24. 10. 7:00–20:00, výsledky ŠÚ SR do 25. 10., ustanovujúce zasadnutia do 23. 11. Debaty a tlačovky zatiaľ žiadne (dopíšu sa do `data/volby/kalendar.json`)
- Geo: `zber/data/volby/geo/kraje.geo.json` (8) a `okresy.geo.json` (79), ZBGIS cez drakh/slovakia-gps-data, EPSG:4326, 212 kB + 598 kB
- Čo sa doplní po 29. 9. (zverejnenie zoznamov MV SR, harmonogram úloha 6): URL oficiálnych zoznamov predsedov BA, TT, TN, NR, PO, KE a primátorov Bratislavy (ak bude textové PDF), Trnavy a Prešova do `data/volby/zdroje.json`, potom poslanci krajov (po obvodoch) a poslanci krajských miest — parser to už číta (`obvod` v tabuľke); starostovia MČ Bratislavy a Košíc, ak Adam rozhodne
- Balík `redakcia/` (`@netopier/redakcia`): skóre zvodov (port openclaw `scoring.js` + `status.js`, paritný test 1:1 nad 20 článkami z api.openclaw.lu vrátane stavov a prechodov), normalizácia dátumov (5 formátov), entity z CRZ a TED, meranie médií (lexika, stavba titulkov: otázka, dvojbodka, citácia, čísla, veľké písmená; poplašné a vatové slová podľa verzovanej politiky `data/politika-merania.json` v1)
- Zber `zber/` (26. 9., XDR-228/229): konektory `rss` (4 SK kanály + 155 World Monitor), `worldmonitor`, `crz`, `ted`, `kataster`, `statistika`; beží lokálne (`scripts/zber-node.mjs`, `wrangler dev`); Worker sa nenasadzuje
- Korpus Fiki Unchained (25. 9.): `fiki/fiki.py` + `data/fiki/` — 93 videí (35,4 h), titulky 92, 3 630 odsekov, FTS s časom a odkazom; vystúpenia mimo kanála (26. 9., XDR-265): 53 vystúpení z 33 kanálov, titulky má 5, 48 čaká
- Dáta o realitnom trhu: `data/realitny-trh/` (18 súborov, 27. 6. – 1. 8. 2026, mimo gitu)
- Python vrstva `src/netopier/` (Miniflux, Postgres, FastAPI): nebeží od 7. 9., neoživuje sa (port čistých modulov v I3, archív v I10)

## Rozhodnutia
- 2026-09-28 — Claude smie čítať verejné texty médií celé; prepisy cez entitný a fulltextový filter, celé iba označené (STACK.md) [A]
- 2026-09-28 — openclaw je kontrola mechaniky zvodov, nie definícia skóre: server api.openclaw.lu (`/api/scores`, `/api/prediction-scores`) dáva iné čísla než klientsky `scoring.js`; parita platí pre `scoring.js`. Vlastné skóre = meranie médií podľa registra + tri oddelené skóre udalostí (B10) [zistenie, čaká na Adama]
- 2026-09-27 — Netopier ostáva lokálne na Macu (zber, odvodenie, EKG, redakčná linka, terminál na localhost); do cloudu zadarmo iba verejné riadky pre web; Workers Paid a nasadenie zberu odložené (XDR-258) [A]
- 2026-09-27 — Python vrstva sa neoživuje; čisté moduly (events.py, text.py) sa portujú do TypeScriptu, embeddingy odpadajú [návrh]
- 2026-08-30 — teardown „Minút po minúte“ a HotInfo; v2 na OSS komponentoch [A]
- 2026-09-01 — AI autorstvo sa nemaskuje, robí sa kvalitným [A]
- 2026-09-07 — Hriech = autorstvo a publikácia, Netopier = monitoring a dôkazy [A]
- 2026-09-25 — Netopier je backend Hriechu vo workspace; v0 zmazaný; minulé koncepcie archivované do `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/` [A]

## Ďalší krok
- Brána a čítanie (rozhodnuté 29. 9., XDR-283): matica filtra XVADUR v1 (`redakcia/data/filter-xvadur.json`), klient Jevu cez OpenRouter, čítanie označených cez Gemini 2.5 Flash-Lite, test na 50 slovenských textoch; čaká na kľúč (XDR-284). Adresa API na overenie: dokumentácia uvádza `api/alpha/decisions` + `typesafe/jev-1.13`, vzorové skripty `api/v1/systemone` + `jev-1.13`
- Voľby: rozšírenie podľa XDR-282 (kandidáti verejní menom, mestá nad 20 000, mestské časti BA a KE)
- XDR-279: Netopier ako služba na Macu (zber každých 2–5 min + `derive` po zbere) — LaunchAgent iba na pokyn
- Voľby (XDR-276): po 29. 9. doplniť oficiálne zoznamy do `zber/data/volby/zdroje.json` a pustiť `pnpm run volby`; potom sledované osoby (XDR-277) nad `entity` `osoba:*`
- I2: migrácie 0004–0006 (udalosti, zvody, redakcia; 0003 je voľby), seed zvodov (D6, Adam škrtá), rozšírenie SK zdrojov (D7: SME, TASR, HN, TA3, Markíza, JOJ, STVR, Postoj, Štandard, Refresher, Startitup, Trend — dnes iba Denník N, Aktuality, Pravda), sledované entity a aliasy (`entity_alias`) pre `derive:zmienky`
- I3: udalosti z RSS (port `events.py`, `text.py` do `derive/udalosti.ts`), potom B10 tri skóre udalostí a B9 filter relevancie s `why_surfaced`
- Meranie médií rozšíriť podľa registra C: čomu sa venujú vs. čo sa stalo (registre ↔ médiá), otázky, naratívy, sentiment, vata podľa umiestnenia, nepresnosti proti registrom — potrebuje celé texty (rozhodnuté 28. 9.) a udalosti (I3)
- Zobrazovacia D1 Free + zápis verejných riadkov z Macu (Minúta, vydania) — založenie DB je externá zmena, na pokyn

## Blokované
- Parita s openclaw nad rámec `scoring.js` (serverové skóre openclaw.sk sa nedá z verejných dát reprodukovať) — Adam rozhodne, či stačí parita s klientskym vzorcom
- Nasadenie zberu do cloudu odložené (XDR-258); World Monitor živé dáta iba s plateným kľúčom (D12: nie)

## Inbox
- `školstv*` vo fulltexte = 0: SK RSS má iba 55 záznamov z jedného dňa (26. 9.); počty porastú so službou (XDR-279) a s D7
- Heuristika druhu entity: 505 z 2 024 „neurčené“ (napr. „Združenie obcí …“, „Športové centrum polície“) — ručná oprava v termináli alebo RPO (V9)
- Fiki vystúpenia: 48 čaká na titulky — YouTube blokoval IP Macu; dotiahnuť `python3 fiki/fiki.py vystupenia --sleep 5`; 1 video vekovo obmedzené (RSmA1OmMa0w)
- Obstarávania: podlimitné zákazky (vestník ÚVO) nemajú otvorené API; TED pokrýva iba nadlimitné
- Kataster: sledované oblasti sú dve pilotné (Úrad vlády, Hrad a NR SR) — ktoré oblasti sledovať, určí Adam
