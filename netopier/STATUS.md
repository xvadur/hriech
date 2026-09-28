# STATUS — netopier

## Živé
- **Lokálny režim (28. 9., XDR-275, krok I0):** Netopier beží nad lokálnou D1 na Macu (`zber/.wrangler/state`, 14 299 záznamov zo zberu 26. 9.). Migrácia `0002_zaklad.sql` aplikovaná, odvodenie prebehlo: 13 479 záznamov s `published_at_utc` (820 bez dátumu: World Monitor inventár 742, RSS 78), 2 024 entít podľa IČO (firma 674, obec 467, štátny orgán 378, neurčené 505), 4 700 väzieb `record_entity` (CRZ strana_a 2 358, strana_b 2 034, TED obstarávateľ 205, víťaz 103), fulltext `records_fts` (`MATCH 'zmluva'` = 2 296), 163 kartičiek zdrojov (3 SK redakcie, 155 kanálov World Monitor, 5 registrov), pokrytie a meranie 3 SK redakcií a 18 autorov nad 55 SK záznamami z 26. 9. (312 riadkov `meranie`)
- Ako spustiť: `cd netopier/zber && npx -y pnpm@11.19.0 install && pnpm run db:migrate:local && node scripts/zber-node.mjs crz && pnpm run derive`; fulltext `node scripts/derive-node.mjs hladaj '"Robert Fico"'`; počty `pnpm run db:pocty`. Testy: `cd netopier/redakcia && pnpm run qa` (23) a `cd netopier/zber && pnpm run qa` (34)
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
- XDR-279: Netopier ako služba na Macu (zber každých 2–5 min + `derive` po zbere) — LaunchAgent iba na pokyn
- I2: migrácie 0003–0005 (udalosti, zvody, redakcia), seed zvodov (D6, Adam škrtá), rozšírenie SK zdrojov (D7: SME, TASR, HN, TA3, Markíza, JOJ, STVR, Postoj, Štandard, Refresher, Startitup, Trend — dnes iba Denník N, Aktuality, Pravda), sledované entity a aliasy (`entity_alias`) pre `derive:zmienky`
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
