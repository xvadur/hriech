# STACK — netopier
prefix: NET

## Teraz (25. 9. 2026)
Backend: Python 3.12 + FastAPI · DB: PostgreSQL 17 + pgvector (Alembic) · Zber: Miniflux 2.3.3 · Embeddingy: lokálne FastEmbed/ONNX (multilingual MiniLM) · Runtime: Docker compose (`compose.yaml`) · Korpusy: SQLite + FTS5 (Fiki)
Cloudový zber (`zber/`, nenasadený): Cloudflare Worker (TypeScript) + Cron Triggers + Queues + D1 + R2, testy Vitest vo workerd.
Frontend je Hriech (`../`). Stack pre ďalšie moduly sa určí spolu s redizajnom Hriechu.

## Príkazy
dev: `docker compose up`
test: `pytest` (vyžaduje Python 3.12) · zber: `cd zber && pnpm run qa`
deploy: `cd zber && pnpm run deploy` (externá mutácia — iba na pokyn; predtým jednorazové kroky v `zber/README.md`)
proof: `pytest` + pri behu `curl -s http://127.0.0.1:8000/health` · zber: `curl https://netopier-zber.<subdoména>.workers.dev/health`

## Hranice
Cloudové spracovanie textov (OpenRouter, embedding API) zakázané — súkromie. Spustenie trvalého workera je externá zmena, iba na pokyn.
