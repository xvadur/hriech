# STATUS — netopier

## Živé
- Kód Netopiera v2 (`src/netopier/`, ~2 500 riadkov): Miniflux ingest, archív článkov s provenienciou, embeddingy, príbehy, udalosti, feed, FastAPI (read-only), CLI; 7 testovacích modulov; migrácie Alembic
- Runtime nebeží od 7. 9. 2026 (Colima odstránená pri upratovaní Macu); posledný doložený beh 3.–5. 9.: 76 článkov, 71 udalostí, 18 testov prešlo (reporty v `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/docs/reports/`)
- Korpus Fiki Unchained (25. 9.): `fiki/fiki.py` + `data/fiki/` — 93 videí (35,4 h), titulky 92, 3 630 odsekov, FTS s časom a odkazom
- Fiki vystúpenia mimo kanála (26. 9., XDR-265): videá majú kanál zdroja (`channel`, `source`), zoznam `data/fiki/vystupenia.txt` — 53 vystúpení z 33 kanálov (Pofel, Vojna názorov, Rozhovory so Šimonom, Cigániková, Rawords, ESENCIE, PLUS 7 DNÍ, TVOTV, Temné Kecy, Rytmus a ďalšie) + zdokumentované vylúčenia; príkaz `fiki.py vystupenia`. V DB je všetkých 53, titulky má 5 (3,2 h), 48 čaká
- Dáta o realitnom trhu: `data/realitny-trh/` (18 súborov, 27. 6. – 1. 8. 2026, mimo gitu)
- Cloudový zber `zber/` (26. 9., XDR-228/229): Cloudflare Worker + Queues + D1 + R2, konektory `rss` (4 slovenské médiá + 155 svetových kanálov z katalógu World Monitor), `worldmonitor` (inventár zdrojov), `crz`, `ted`, `kataster`, `statistika`; 27 testov vo workerd; **nenasadený**
- Lokálny zber 26. 9. z každého zdroja: 14 299 záznamov — RSS 9 109, CRZ 3 026, World Monitor 742, ŠÚ SR 684, kataster 533, TED 205 (ŠÚ SR cez `scripts/zber-node.mjs`, lokálny workerd s `data.statistics.sk` nenadviaže TLS)

## Rozhodnutia
- 2026-09-26 — zber v cloude na Cloudflare Workers/Queues/D1/R2 (ADR-008, návrh — potvrdí sa nasadením) [návrh]
- 2026-08-30 — teardown „Minút po minúte“ a HotInfo; v2 na OSS komponentoch [A]
- 2026-09-01 — AI autorstvo sa nemaskuje, robí sa kvalitným [A]
- 2026-09-07 — Hriech = autorstvo a publikácia, Netopier = monitoring a dôkazy [A]
- 2026-09-25 — Netopier je backend Hriechu vo workspace; v0 zmazaný; minulé koncepcie a mock „Vydanie“ archivované do `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/` [A]

## Ďalší krok
- Nasadiť `zber/` na Adamov pokyn (postup v `zber/README.md`, časť Nasadenie), potom 48 h sledovať `/health`
- Python vrstvu (embeddingy, príbehy, udalosti) napojiť na archív v D1 namiesto Miniflux

## Blokované
- Nasadenie zberu čaká na Adama: Workers Paid (5 $/mes.) a pokyn na deploy

## Inbox
- Fiki vystúpenia: 48 čaká na titulky — YouTube 26. 9. zablokoval IP Macu („confirm you're not a bot“) po sérii vyhľadávaní. Dotiahnuť neskôr jedným príkazom `python3 fiki/fiki.py vystupenia --sleep 5` (bez cookies)
- Fiki: 1 video vekovo obmedzené (RSmA1OmMa0w) bez titulkov — potrebuje cookies prihláseného YouTube účtu
- Python 3.12 na Macu chýba (testy aplikácie ho vyžadujú)
- World Monitor: živé dáta (briefy, udalosti, riziká krajín) iba s plateným API kľúčom (API Starter 99,99 $/mes.) — rozhodnutie Adama
- Obstarávania: podlimitné zákazky (vestník ÚVO) nemajú otvorené API; TED pokrýva iba nadlimitné
- Kataster: sledované oblasti sú dve pilotné (Úrad vlády, Hrad a NR SR) — ktoré oblasti sledovať, určí Adam
