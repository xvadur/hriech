# Netopier v2

Clean, local-first Slovak public-source news-intelligence backend. Netopier v2
replaced the retired v0 implementation. It lives in the Hriech project at
`xvadur_workspace/projekty/hriech/netopier/` and is the backend of
[hriech.xvadur.com](https://hriech.xvadur.com).

## Local state — 2026-09-07

This is the retained, usable v2 foundation. The retired v0 was deleted separately;
its code and runtime must not be restored into this project.

The Mac cleanup intentionally removed Colima and stopped the local container
runtime. The addresses below describe the configured services; they are not
currently running. The private database recovery export is preserved in
`/Users/xvadur_mac/Archive/mac-cleanup-2026-09-07/docker-recovery/`.
Starting the stack again requires an explicit decision to provision a container
engine. Previous integration reports are archived in `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/`.

`bin/netopier` now resolves the project directory when called from another folder.
The local CLI routing and secret scan were checked on 2026-09-07; a new live
RSS-to-feed verification awaits the container runtime. The Python package requires
Python 3.12; the system Python 3.9 is insufficient for the application tests.

Architecture and decisions: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/DECISIONS.md`](docs/DECISIONS.md).

## Runtime

- Miniflux 2.3.3 collects RSS/Atom/JSON Feed.
- PostgreSQL 17 + pgvector 0.8.6 stores provenance, embeddings, stories and revisions.
- FastEmbed produces local multilingual embeddings.
- FastAPI exposes read-only JSON interfaces.
- One worker reconciles Miniflux, archives articles and assigns stories.

## Start

```bash
cp .env.example .env
# Replace every change-me value in .env.
docker compose up -d postgres miniflux
docker compose run --rm api alembic upgrade head
docker compose run --rm api netopier sources import sources/slovak-core.yaml
docker compose run --rm api netopier sources bootstrap-miniflux sources/slovak-core.yaml
docker compose up -d api
```

This safe default leaves the embedding worker off. Run one bounded batch with
`bin/netopier once`. Enable continuous reconciliation explicitly with
`bin/netopier worker-on`; stop it with `bin/netopier worker-off`. Continuous
mode processes at most 20 entries every five minutes and the worker container is
limited to one CPU and 1 GiB RAM.

The local interfaces are:

- Miniflux: `http://127.0.0.1:8088`
- Netopier API health: `http://127.0.0.1:8090/health`
- Feed: `http://127.0.0.1:8090/feed`
- Events: `http://127.0.0.1:8090/events`

## Verify

```bash
docker compose run --rm api netopier reconcile
docker compose run --rm api netopier process
bin/netopier test
bin/netopier smoke
bin/netopier snapshot-smoke
bin/netopier contracts
bin/netopier secret-scan
bin/netopier model-manifest
```

See [architecture](docs/ARCHITECTURE.md), [decisions](docs/DECISIONS.md), and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Benchmark inputs and reports from
September 2026 are archived in `xvadur_core/zdroje/hriech/archiv-2026-09/netopier/benchmarks/`.
