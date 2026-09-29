# STACK — netopier
prefix: NET

## Teraz (29. 9. 2026) — lokálny režim
Všetko beží lokálne na Macu (rozhodnutie 27. 9., `../docs/redakcia/ROZHODNUTIE.md`):
- **Úložisko (rozhodnuté 29. 9., XDR-299):** jeden SQLite súbor `data/netopier.sqlite` (mimo gitu) cez vstavaný `node:sqlite` (Node 26, SQLite 3.53, FTS5), s tenkou vrstvou s rozhraním D1 (`zber/scripts/lib/db.mjs`) — ten istý TypeScript kód beží nad D1 vo Workeri aj nad súborom. Surové payloady v `data/raw/`. Schéma ostáva kompatibilná s D1 (migrácie bez PRAGMA; testy ich aplikujú na D1 vo workerd; evidencia `d1_migrations` v rovnakom tvare ako wrangler). Supabase nie.
  - Prečo nie lokálna D1 (`zber/.wrangler/state`): je to emulátor miniflare — súbor pod hashom, viazaný na verziu wrangleru, nie je stavaný ako trvalé úložisko; každý beh štartuje workerd cez `getPlatformProxy` (sekundy a stovky MB RAM), čo pri behu každé 2–5 minút nedáva zmysel; príkazy idú cez proxy po jednom a `batch` nad veľkými dávkami nie je skutočná transakcia. Priamy súbor: otvorenie za milisekundy, synchrónne transakcie, WAL (terminál, `sqlite3` či Datasette čítajú počas zápisu), zálohy `VACUUM INTO` / `.backup` / Time Machine.
  - Objem: desiatky GB textov nie sú pre SQLite problém (limit 281 TB); strop 10 GB platí iba pre D1 v cloude, kam pôjdu len verejné riadky (zobrazovacia D1). Celé texty sú oddelene (`dokument_texty`), zoznamy a počty ich nečítajú; fulltext je externý obsah nad pohľadom (text sa neukladá dvakrát). Odhad pre SK médiá: ~1 000–1 500 článkov denne × ~3 kB ≈ 1,5–2 GB textu ročne + index podobnej veľkosti; desiatky GB prídu s prepismi a zahraničím.
  - Pôvodná lokálna D1 ostáva ako záloha stavu k 29. 9.; `pnpm run db:z-d1` ju raz skopíruje do súboru. `pnpm dev` (wrangler) ďalej beží nad lokálnou D1 (`pnpm run db:migrate:d1`).
- Zber `zber/`: TypeScript, rovnaký kód ako Cloudflare Worker, lokálne cez `scripts/zber-node.mjs` (nad `data/netopier.sqlite`) alebo `wrangler dev` (nad lokálnou D1).
- **Jednotná schéma (0004, XDR-299):** `zdroje` + `zdroj_kanaly` (z registra `zber/data/zdroje/register.json`), `records` (surová vrstva, verzie), `dokumenty` (jednotka obsahu: článok, minúta, tlačová správa, prepis, hlasovanie, uznesenie, parlamentná tlač, zmluva, obstarávanie, príspevok; číselník `dokument_typy`) + `dokument_texty` (celé texty s verziou) + `dokument_vyskyty` (v ktorých kanáloch), `entity` (osoby a organizácie z 0002/0003) + `dokument_entity`, `udalosti` + `udalost_dokumenty` / `udalost_entity`, `temy` + `dokument_temy` / `udalost_temy`, `meranie` (rozsah zdroj, autor, dokument, udalosť, téma, entita, deň), `hostitelia` (robots.txt, tempo), fulltext `dokumenty_fts`.
- Príjem RSS `zber/src/prijem/` + `scripts/prijem-node.mjs`: všetky kanály registra, celé texty (RSS, JSON-LD `articleBody`, Readability + linkedom), robots.txt, rozostup po hostoch, podmienené GET, deduplikácia podľa URL a obsahu; idempotentný, príkaz pre službu každých 2–5 minút (XDR-279).
- Odvodenie `zber/src/derive/` + `scripts/derive-node.mjs`: normalizácia dátumov, entity z registrov, fulltext (FTS5 s externým obsahom), kartičky zdrojov, pokrytie, zmienky sledovaných entít, meranie médií.
- Balík `redakcia/` (`@netopier/redakcia`): čisté funkcie — skóre zvodov (EKG, port openclaw `scoring.js` + `status.js` ako kontrola), normalizácia, entity, text, meranie médií; politika merania verzovaná v `redakcia/data/politika-merania.json`.
- Brána a čítanie (rozhodnuté 29. 9., ešte nepostavené, XDR-283): vstupný filter XVADUR cez Jev (OpenRouter), čítací model Gemini 2.5 Flash-Lite iba nad označeným; rozpočet do 10 € mesačne.
- Korpusy: SQLite + FTS5 (Fiki, `fiki/`).
- Cloud (zadarmo): Worker `hriech-web` + zobrazovacia D1 Free s verejnými riadkami (ešte nezaložená); Worker zberu `zber/` sa nenasadzuje, kým lokálny režim nie je zabehnutý.
- Python vrstva (`src/netopier/`, FastAPI, PostgreSQL + pgvector, Miniflux, Docker) sa neoživuje; čisté moduly sa portujú do TypeScriptu (I3), zvyšok ide do archívu v jadre (I10).

## Príkazy
test: `cd redakcia && pnpm run qa` (23 testov, node) · `cd zber && pnpm run qa` (testy vo workerd + `wrangler deploy --dry-run`)
migrácie: `cd zber && pnpm run db:migrate:local` (nad `data/netopier.sqlite`; `--po 0004` iba po dané číslo) · lokálna D1 pre `wrangler dev`: `pnpm run db:migrate:d1`
príjem RSS: `cd zber && pnpm run prijem` (príkaz pre službu, každých 2–5 min) · `pnpm run prijem:stav` · log `data/log/prijem.jsonl`
zber: `cd zber && node scripts/zber-node.mjs <zdroj>` (crz, ted, kataster, statistika, rss, worldmonitor; nad `data/netopier.sqlite`)
voľby: `cd zber && pnpm run volby` (územie, kalendár, kandidáti z oficiálnych zoznamov a médií, prieskumy, entity; idempotentné)
odvodenie: `cd zber && pnpm run derive` (všetky kroky) · `node scripts/derive-node.mjs <krok>` · fulltext `node scripts/derive-node.mjs hladaj '"Robert Fico"'`
počty: `cd zber && pnpm run db:pocty` · `sqlite3 data/netopier.sqlite "…"` (z priečinka `netopier/`)
deploy: `cd zber && pnpm run deploy` (externá mutácia — iba na pokyn; zatiaľ sa nenasadzuje)
proof: testy zelené + počty v `data/netopier.sqlite` (`published_at_utc`, `record_entity`, `records_fts MATCH`, `meranie`, `dokumenty` s `text_stav = 'ok'`, `dokumenty_fts MATCH`)
pnpm nie je v PATH: `npx -y pnpm@11.19.0`.

## Hranice
- Verejné texty médií (RSS titulky a súhrny, celé články z verejných URL, verejné prepisy) Claude smie čítať celé — rozhodnutie Adama 28. 9. 2026. Prepisy (YouTube, podcasty) sa nečítajú celé plošne: entitný a fulltextový filter (známe osoby, témy, kauzy) najprv označí, o čom sa hovorí a kto tam je; celé sa číta iba označené.
- Cloudové spracovanie je povolené iba pre verejné texty médií a verejné prepisy, iba cez OpenRouter (rozhodnutie Adama 29. 9. 2026, XDR-283): brána Jev `typesafe/jev-1.13`, čítanie označených Gemini 2.5 Flash-Lite. Kľúč `OPENROUTER_API_KEY` v `netopier/.env`, nikdy v gite.
- Zakázané ostáva: posielanie súkromných dát do LLM mimo Macu — Fiki raw prepisy, `xvadur_core`, realitný trh, zdravie; embedding API nad súkromnými dátami. Celé chránené texty sa nepublikujú (archív verejne iba metadáta a výrez ≤ 300 znakov).
- Mená fyzických osôb z registrov interne áno, verejne nikdy (`entity.verejne = 0`).
- Spustenie trvalej služby (LaunchAgent, XDR-279), deploy a založenie zobrazovacej D1 sú externé zmeny, iba na pokyn.
