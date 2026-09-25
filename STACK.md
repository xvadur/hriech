# STACK — hriech
prefix: HRI

## Teraz (25. 9. 2026)
Web: Astro 7 statický, vlastné CSS bez frameworku (`src/styles/global.css`) · Fonty: Rubik, Source Sans 3 · Vizuál: ružový plastický podľa loga (`DESIGN.md`) · Hosting: Cloudflare Worker `hriech-web` (`wrangler.jsonc`) · Backend: Netopier v2 (`netopier/STACK.md`)

Stack pre ďalšie moduly (mapy s vrstvami, dashboardy, live agregácia) sa určí pri redizajne.

## Príkazy
dev: `pnpm dev`
build: `pnpm build`
test: `pnpm qa` (check + test + build + overenie buildu)
deploy: `pnpm run deploy` (externá mutácia — iba na pokyn)
proof: `pnpm qa`; v cieli `curl -sI https://hriech.xvadur.com` + titulok

## Hranice
Drafty a case files sú v `xvadur_core`, nie v repozitári. Každé tvrdenie v článku má zdroj. Publikovanie iba na výslovný pokyn.
