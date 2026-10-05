# STACK — netopier
prefix: NET

## Teraz (5. 10. 2026)
- **Úložisko:** jeden SQLite súbor `data/netopier.sqlite` cez `node:sqlite` (Node 26, FTS5) s rozhraním D1
  (`zber/scripts/lib/db.mjs`); schéma kompatibilná s Cloudflare D1 (migrácie `zber/migrations/`).
- **Príjem:** `zber/src/prijem/` + `scripts/prijem-node.mjs` (RSS, celé texty cez JSON-LD a Readability,
  robots.txt, deduplikácia), LaunchAgent každých 5 min.
- **Konektory:** CRZ, TED, kataster, ŠÚ SR, NR SR (`scripts/nrsr-node.mjs`), voľby (`scripts/volby-node.mjs`).
- **Odvodenie:** `zber/src/derive/` (dátumy, entity, fulltext, meranie); témy a pokrytie
  (`scripts/pokrytie-node.mjs`, TF-IDF klastrovanie, bez modelu).
- **Prepisy:** mlx-whisper (large-v3-turbo) v `.venv` (Python 3.14), `podcasty/prepis.py`.
- **Balík `redakcia/`:** TypeScript, čisté funkcie merania, politika merania `redakcia/data/politika-merania.json`.

## Kandidáti pre verejný povrch (rozhodne Adam)
- Mapa: MapLibre GL JS (BSD-3) + deck.gl (MIT), podklad PMTiles + Protomaps.
- Slovník obcí: GeoNames SK (CC BY 4.0), hranice obcí ZBGIS (CC BY 4.0).
- Dátový model peňazí a moci: FollowTheMoney (MIT).
- Prepisy: slovenský Whisper NaiveNeuron (MIT), rozlíšenie rečníkov pyannote-audio (MIT).
- Otvorené dáta: Datasette (Apache-2.0).

## Hranice
- Lokálne na Macu; do cloudu iba výber verejných riadkov (zobrazovacia D1 Free má limit 500 MB).
- Nasadenie, Workers Paid, nové kľúče a platené API iba na Adamov pokyn.
- `pnpm` nie je v PATH: `npx -y pnpm@11.19.0`.
