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

## Spoločný základ pre weby Hriech, Lucia, Jakub (výskum 25. 9. 2026 — návrh, nerozhodnuté)
- Jeden repozitár `xvadur-weby` (pnpm workspaces): `packages/ui` (komponenty, vizuál cez CSS premenné), `packages/booking` (Google kalendár + Resend), `packages/content` (schémy obsahu), `sites/<web>` — každý vlastný vizuál a vlastný Cloudflare Worker.
- Astro + Cloudflare Workers (Workers Paid 5 €/mes.) · obsah Markdown/JSON v gite, bez CMS · Resend (3 000 e-mailov/mes. zadarmo) · Cloudflare Web Analytics · R2 · Supabase Auth (Jakub/BrokerOS), better-auth inde. Spolu ≈ 5 €/mes., pri 10× raste 85–100 €.
- Úpravy obsahu agentom (Haiku cez Telegram/OpenClaw): vetva → commit → pull request → Cloudflare náhľad → Adam schváli → merge → deploy. Rollback = revert.
- Spoločná vrstva pohybu a ikon: Motion, GSAP + ScrollTrigger, Lenis, NumberFlow, Phosphor, Magic UI + React Bits.
- Dizajnový systém každého webu ako samostatný GitHub repo pre Claude Design (Import → From GitHub): `DESIGN.md` (9 sekcií), `tokens/`, `components/ui/`, `reference/`. Vzor `xvadur/brand-identity`; zbierka vzorov `VoltAgent/awesome-claude-design`.
- Otvorené: jeden repozitár áno/nie (aj xvadur.com?), kde beží Python backend Netopiera.

## Výskum pre Hriech (25. 9. 2026 — návrh pre redizajn)
- Mapy: MapLibre GL (11,7 tis. ★) + deck.gl (14,6 tis. ★) na dátové vrstvy; Martin na vlastné dlaždice SK dát.
- Dashboardy: Tremor (16,5 tis. ★, posledný push 1/2025) na KPI karty; visx (Airbnb, 21 tis. ★) na grafy, časové osi a vlastné vizualizácie; NumberFlow na živé počítadlá; D3 na EKG.
- Chronos: vis-timeline; TimelineJS3 na jednotlivé príbehy.
- Písmo: editoriálny serif + IBM Plex Mono na dáta.
- Stavať vlastné (nič hotové neexistuje): volebná kalkulačka, analýza zaujatosti v slovenčine (metodika BABE, UnBIAS), EKG.
- Vzory: The Pudding, Ground News, Bellingcat, ProPublica, WorldMonitor (worldmonitor.app — živý OSINT dashboard, koala73/worldmonitor).
- Backend: Neon Postgres + pgvector (zadarmo do 0,5 GB, ~5–8 €/mes. pri raste); R2 na korpusy; Miniflux ostáva. Aplikácia (FastAPI, Miniflux, embeddingy) potrebuje hosting — otvorené (Fly.io od 5 $ alebo prepis na Workers).
