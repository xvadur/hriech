# STACK — netopier
prefix: NET

## Teraz (25. 9. 2026)
Backend: Python 3.12 + FastAPI · DB: PostgreSQL 17 + pgvector (Alembic) · Zber: Miniflux 2.3.3 · Embeddingy: lokálne FastEmbed/ONNX (multilingual MiniLM) · Runtime: Docker compose (`compose.yaml`) · Korpusy: SQLite + FTS5 (Fiki)
Frontend je Hriech (`../`). Stack pre ďalšie moduly sa určí spolu s redizajnom Hriechu.

## Príkazy
dev: `docker compose up`
test: `pytest` (vyžaduje Python 3.12)
deploy: — (runtime zatiaľ nebeží)
proof: `pytest` + pri behu `curl -s http://127.0.0.1:8000/health`

## Hranice
Cloudové spracovanie textov (OpenRouter, embedding API) zakázané — súkromie. Spustenie trvalého workera je externá zmena, iba na pokyn.
