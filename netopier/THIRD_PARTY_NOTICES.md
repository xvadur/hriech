# Third-party notices

No third-party source code has been copied into this repository.

Runtime dependencies:

| Project | Version | License | Use |
|---|---:|---|---|
| Miniflux | 2.3.3 | Apache-2.0 | feed collection and feed health |
| pgvector | 0.8.6 | PostgreSQL License | vector storage and exact cosine search |
| FastAPI | 0.141.1 | MIT | HTTP transport adapter |
| FastEmbed | 0.8.0 | Apache-2.0 | local ONNX embeddings |
| Alembic | 1.16.5 | MIT | schema migrations |
| HTTPX | 0.28.1 | BSD-3-Clause | Miniflux API client |
| Psycopg | 3.2.13 | LGPL-3.0-only | PostgreSQL client and pool |
| Pydantic Settings | 2.11.0 | MIT | environment configuration |
| PyYAML | 6.0.3 | MIT | source and benchmark manifests |
| structlog | 25.4.0 | MIT OR Apache-2.0 | structured runtime logs |
| Uvicorn | 0.40.0 | BSD-3-Clause | local ASGI server |
| gdelt-pulse | inspected current main | MIT | architecture reference only; no copied code |

Cloud collector (`zber/`, Cloudflare Worker):

| Project | Version | License | Use |
|---|---:|---|---|
| fast-xml-parser | 5.11.1 | MIT | RSS/Atom parsing |
| fflate | 0.8.3 | MIT | unzipping the CRZ daily export |
| Wrangler / workerd | 4.128.0 | MIT OR Apache-2.0 | build, local runtime, deploy |
| Vitest + @cloudflare/vitest-plugin | 4.1 / 1.2 | MIT | tests in workerd |
| World Monitor feed catalog (koala73/worldmonitor, `src/config/feeds.ts`) | commit recorded in `zber/data/worldmonitor-feeds.json` | AGPL-3.0 (code) | only feed names, publisher URLs and languages are extracted as facts; no code is copied; feeds are read directly from publishers |

Public data sources collected by `zber/` keep their own terms: CRZ (crz.gov.sk),
TED (ted.europa.eu, EU reuse policy), ÚGKK INSPIRE WFS, ŠÚ SR DATAcube, World Monitor
`get_sources` (anonymous public tool) and the individual publishers' RSS feeds.

Transitive dependency notices remain governed by their distributions and must be
captured in a generated SBOM before release.

These notices describe third-party terms. They do not license Netopier v2 source
code itself.
