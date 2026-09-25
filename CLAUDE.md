# hriech — XVADUR spravodajská služba: web a publikácia

@AGENTS.md
@PRODUCT.md
@STATUS.md
@STACK.md

Hriech je frontend a publikácia (web hriech.xvadur.com). Backend je Netopier v `netopier/` (vlastný `CLAUDE.md`).

Príkazy: dev `pnpm dev` · check `pnpm check` · test `pnpm test` · build `pnpm build` · qa `pnpm qa` · deploy `pnpm run deploy` (externá mutácia, iba na pokyn).

Kde čo je:
- `src/` — Astro web: stránky, komponenty, obsah (`src/content/`), dáta mapy (`src/data/`)
- `research/newsrooms/` + `scripts/merge-newsroom-fragments.mjs` — podklady a skladanie mapy redakcií
- `contracts/media/` — schéma dát mapy · `test/` — testy · `docs/PUBLISHING.md` — postup publikovania
- `DESIGN.md` — uzamknutý vizuál (ružový, Rubik + Source Sans 3) · `PRODUCT.md` — koncepcia
- `netopier/` — backend (Netopier v2)

Mimo repozitára: drafty článkov v `xvadur_core/07_texty/drafty/`, case files a výskum v `xvadur_core/zdroje/hriech/`, dokumenty minulých verzií v `xvadur_core/zdroje/hriech/archiv-2026-09/`.
