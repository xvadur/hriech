# STACK — netopier
prefix: NET

## Teraz (28. 9. 2026) — lokálny režim
Všetko beží lokálne na Macu (rozhodnutie 27. 9., `../docs/redakcia/ROZHODNUTIE.md`):
- Zber `zber/`: TypeScript, rovnaký kód ako Cloudflare Worker, lokálne cez `scripts/zber-node.mjs` alebo `wrangler dev`; pracovná databáza je **lokálna D1** (SQLite v `zber/.wrangler/state`), surové payloady v lokálnom R2.
- Odvodenie `zber/src/derive/` + `scripts/derive-node.mjs`: normalizácia dátumov, entity z registrov, fulltext (FTS5 s externým obsahom), kartičky zdrojov, pokrytie, zmienky sledovaných entít, meranie médií.
- Balík `redakcia/` (`@netopier/redakcia`): čisté funkcie — skóre zvodov (EKG, port openclaw `scoring.js` + `status.js` ako kontrola), normalizácia, entity, text, meranie médií; politika merania verzovaná v `redakcia/data/politika-merania.json`.
- Brána a čítanie (rozhodnuté 29. 9., ešte nepostavené, XDR-283): vstupný filter XVADUR cez Jev (OpenRouter), čítací model Gemini 2.5 Flash-Lite iba nad označeným; rozpočet do 10 € mesačne.
- Korpusy: SQLite + FTS5 (Fiki, `fiki/`).
- Cloud (zadarmo): Worker `hriech-web` + zobrazovacia D1 Free s verejnými riadkami (ešte nezaložená); Worker zberu `zber/` sa nenasadzuje, kým lokálny režim nie je zabehnutý.
- Python vrstva (`src/netopier/`, FastAPI, PostgreSQL + pgvector, Miniflux, Docker) sa neoživuje; čisté moduly sa portujú do TypeScriptu (I3), zvyšok ide do archívu v jadre (I10).

## Príkazy
test: `cd redakcia && pnpm run qa` (23 testov, node) · `cd zber && pnpm run qa` (40 testov vo workerd + `wrangler deploy --dry-run`)
migrácie: `cd zber && pnpm run db:migrate:local`
zber: `cd zber && node scripts/zber-node.mjs <zdroj>` (crz, ted, kataster, statistika, rss, worldmonitor)
voľby: `cd zber && pnpm run volby` (územie, kalendár, kandidáti z oficiálnych zoznamov a médií, prieskumy, entity; idempotentné)
odvodenie: `cd zber && pnpm run derive` (všetky kroky) · `node scripts/derive-node.mjs <krok>` · fulltext `node scripts/derive-node.mjs hladaj '"Robert Fico"'`
počty: `cd zber && pnpm run db:pocty` · `npx wrangler d1 execute netopier-zber --local --command "…"`
deploy: `cd zber && pnpm run deploy` (externá mutácia — iba na pokyn; zatiaľ sa nenasadzuje)
proof: testy zelené + počty v lokálnej D1 (`published_at_utc`, `record_entity`, `records_fts MATCH`, `meranie`)
pnpm nie je v PATH: `npx -y pnpm@11.19.0`.

## Hranice
- Verejné texty médií (RSS titulky a súhrny, celé články z verejných URL, verejné prepisy) Claude smie čítať celé — rozhodnutie Adama 28. 9. 2026. Prepisy (YouTube, podcasty) sa nečítajú celé plošne: entitný a fulltextový filter (známe osoby, témy, kauzy) najprv označí, o čom sa hovorí a kto tam je; celé sa číta iba označené.
- Cloudové spracovanie je povolené iba pre verejné texty médií a verejné prepisy, iba cez OpenRouter (rozhodnutie Adama 29. 9. 2026, XDR-283): brána Jev `typesafe/jev-1.13`, čítanie označených Gemini 2.5 Flash-Lite. Kľúč `OPENROUTER_API_KEY` v `netopier/.env`, nikdy v gite.
- Zakázané ostáva: posielanie súkromných dát do LLM mimo Macu — Fiki raw prepisy, `xvadur_core`, realitný trh, zdravie; embedding API nad súkromnými dátami. Celé chránené texty sa nepublikujú (archív verejne iba metadáta a výrez ≤ 300 znakov).
- Mená fyzických osôb z registrov interne áno, verejne nikdy (`entity.verejne = 0`).
- Spustenie trvalej služby (LaunchAgent, XDR-279), deploy a založenie zobrazovacej D1 sú externé zmeny, iba na pokyn.
