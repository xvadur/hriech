# netopier — backend XVADUR spravodajskej služby

@AGENTS.md
@STATUS.md
@STACK.md

Netopier v2 je backend Hriechu: zber verejných zdrojov, archív, odvodenie (entity, fulltext, meranie médií, skóre zvodov), korpusy. Beží lokálne na Macu nad lokálnou D1 (rozhodnutie 27. 9. 2026, `../docs/redakcia/ROZHODNUTIE.md`). Frontend a publikácia sú v nadradenom `../` (Hriech).

Príkazy: testy `cd redakcia && pnpm run qa` a `cd zber && pnpm run qa` · migrácie `cd zber && pnpm run db:migrate:local` · zber `cd zber && node scripts/zber-node.mjs <zdroj>` · odvodenie `cd zber && pnpm run derive` · voľby `cd zber && pnpm run volby` · fulltext `node scripts/derive-node.mjs hladaj '…'` · korpus Fikiho `python3 fiki/fiki.py search|sync|stats` · web `cd web && npx -y pnpm@11.19.0 dev` → http://localhost:4400 (pnpm: `npx -y pnpm@11.19.0`).

Kde čo je:
- `zber/` — zber (médiá, World Monitor, CRZ, TED, kataster, ŠÚ SR) a odvodenie `zber/src/derive/` nad lokálnou D1 (`zber/.wrangler/state`); migrácie `zber/migrations/`; príkazy v `zber/README.md`
- `web/` — okno „čo sa deje teraz“: Astro (server, `@astrojs/node`) + Tailwind 4 nad `data/netopier.sqlite` iba na čítanie; Svet, Európa, Slovensko, témy naprieč redakciami, fulltext; dáta `web/src/lib/netopier.ts`
- `redakcia/` — balík `@netopier/redakcia`: skóre zvodov (port openclaw ako kontrola), normalizácia, entity, meranie médií; politika merania `redakcia/data/politika-merania.json`
- `sources/slovak-core.yaml` — register zdrojov · `contracts/` — API kontrakty (events-v1, historická referencia)
- `src/netopier/`, `migrations/` (Alembic), `compose.yaml`, `Dockerfile`, `ops/` — Python vrstva, nebeží a neoživuje sa (port čistých modulov v I3, archív v I10)
- `fiki/` + `data/fiki/` — korpus Fiki Unchained (titulky s časmi, FTS)
- `data/realitny-trh/` — dáta o realitnom trhu (mimo gitu)
- `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

Spustenie trvalej služby (LaunchAgent), deploy `zber/` aj založenie zobrazovacej D1 = externá mutácia, iba na pokyn.
