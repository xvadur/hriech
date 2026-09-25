# STACK — hriech
prefix: HRI

## Zámok
Framework: Astro + React islands · Štýl: Tailwind 4 + shadcn/ui (radix, lucide) + Tailark bloky · Fonty: Newsreader (serif titulky), Inter / Geist (text) · Hosting: Cloudflare Worker `hriech-web` (`wrangler.jsonc`)
Dizajnový smer: **zamknutý 5. 9.** — svetlé neutrálne plochy, ružová iba ako akcent v logu, serifové titulky, kompaktné dátové UI, pôvodné logo a dáta zachované (DESIGN.md). Žiadna ďalšia „príliš custom“ verzia.

## Príkazy
dev: `pnpm dev`
build: `pnpm build`
test: `pnpm qa` (check + test + build)
deploy: `pnpm run deploy` (externá mutácia — poverenie)
proof: `pnpm qa`; destination-verified = `curl -sI https://hriech.xvadur.com` + readback titulku

## Hranice
`private/` = drafty, case files, zdravotné údaje (Karol) — nepublikovať, neuploadovať, nesyntetizovať do verejného textu bez rozhodnutia o anonymizácii. Každé tvrdenie v článku má zdroj v sourcebooku.
