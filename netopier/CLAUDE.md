# netopier — backend XVADUR spravodajskej služby

@AGENTS.md
@STATUS.md
@STACK.md

Netopier v2 je backend Hriechu: monitoring verejných zdrojov, archív článkov, príbehy a udalosti, korpusy. Frontend a publikácia sú v nadradenom `../` (Hriech).

Príkazy: runtime `docker compose up` (`compose.yaml`) · testy `pytest` (Python 3.12) · migrácie `alembic` · CLI `bin/netopier` · korpus Fikiho `python3 fiki/fiki.py search|sync|stats`.

Kde čo je:
- `src/netopier/` — Miniflux ingest, archív, príbehy, udalosti, feed, FastAPI, CLI
- `migrations/` + `alembic.ini` — schéma Postgres · `ops/` — init databáz · `compose.yaml`, `Dockerfile`
- `sources/slovak-core.yaml` — register zdrojov · `contracts/` — API kontrakty
- `fiki/` + `data/fiki/` — korpus Fiki Unchained (titulky s časmi, FTS)
- `data/realitny-trh/` — dáta o realitnom trhu (mimo gitu)
- `docs/ARCHITECTURE.md`, `docs/DECISIONS.md`

Spustenie trvalého workera = externá mutácia, iba na pokyn.
