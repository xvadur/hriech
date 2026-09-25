# STATUS — netopier

## Živé
- Kód Netopiera v2 (`src/netopier/`, ~2 500 riadkov): Miniflux ingest, archív článkov s provenienciou, embeddingy, príbehy, udalosti, feed, FastAPI (read-only), CLI; 7 testovacích modulov; migrácie Alembic
- Runtime nebeží od 7. 9. 2026 (Colima odstránená pri upratovaní Macu); posledný doložený beh 3.–5. 9.: 76 článkov, 71 udalostí, 18 testov prešlo (reporty v `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/docs/reports/`)
- Korpus Fiki Unchained (25. 9.): `fiki/fiki.py` + `data/fiki/` — 93 videí (35,4 h), titulky 92, 3 630 odsekov, FTS s časom a odkazom
- Dáta o realitnom trhu: `data/realitny-trh/` (18 súborov, 27. 6. – 1. 8. 2026, mimo gitu)

## Rozhodnutia
- 2026-08-30 — teardown „Minút po minúte“ a HotInfo; v2 na OSS komponentoch [A]
- 2026-09-01 — AI autorstvo sa nemaskuje, robí sa kvalitným [A]
- 2026-09-07 — Hriech = autorstvo a publikácia, Netopier = monitoring a dôkazy [A]
- 2026-09-25 — Netopier je backend Hriechu vo workspace; v0 zmazaný; minulé koncepcie a mock „Vydanie“ archivované do `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/` [A]

## Ďalší krok
- Stack a roadmapa spolu s redizajnom Hriechu; rozhodnúť, kde a ako beží runtime

## Blokované
- nič

## Inbox
- Fiki: 1 video vekovo obmedzené (RSmA1OmMa0w) bez titulkov — potrebuje cookies prihláseného YouTube účtu
- Python 3.12 na Macu chýba (testy aplikácie ho vyžadujú)
