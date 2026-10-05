# netopier — prístroj na vyšetrenie Slovenska (backend Hriechu)

@SMER.md
@AGENTS.md
@STATUS.md
@STACK.md

Smer od 5. 10. 2026 je `SMER.md`. Staré texty sú v `docs/archiv-2026-10-05/` (iba história, nie zadanie).
Verejný povrch je Hriech v nadradenom `../`.

Kde čo je:
- `data/netopier.sqlite` — archív (mimo gitu); `data/log/` — logy príjmu
- `zber/` — príjem RSS a konektory (CRZ, TED, kataster, ŠÚ SR, NR SR, voľby), odvodenie, skripty
  `scripts/*-node.mjs`; register zdrojov `zber/data/zdroje/register.json`; geodáta `zber/data/volby/geo/`
- `redakcia/` — balík `@netopier/redakcia` (normalizácia, entity, meranie médií, politika merania)
- `podcasty/prepis.py` — prepisy relácií lokálne (mlx-whisper v `.venv`)
- `fiki/` + `data/fiki/` — korpus titulkov Fiki Unchained
- `web/` — lokálne Astro okno nad databázou (1. 10. odmietnuté ako čítačka; infraštruktúra ostáva)
- `data/matica/`, `data/pokrytie/`, `data/prepisy/`, `data/podcasty/`, `data/navrh/` — merania a podklady (mimo gitu)
- `src/netopier/`, `migrations/`, `compose.yaml`, `Dockerfile` — stará Python vrstva, nebeží, neoživuje sa

Príkazy: testy `cd redakcia && pnpm run qa`, `cd zber && pnpm run qa` · príjem `cd zber && pnpm run prijem`
· stav `pnpm run prijem:stav` · voľby `pnpm run volby` · NR SR `node scripts/nrsr-node.mjs` · pokrytie
`node scripts/pokrytie-node.mjs --dni 2` a `node scripts/pokrytie-strana.mjs` · prepis
`.venv/bin/python podcasty/prepis.py prepis <relacia> --pocet N` · pnpm `npx -y pnpm@11.19.0`.

LaunchAgent, nasadenie, zobrazovacia D1, platené služby a kľúče = externé zmeny, iba na Adamov pokyn.
