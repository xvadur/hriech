# Decisions

## ADR-001: v0 is retired

The clean v2 backend replaced v0; it now lives at `xvadur_workspace/projekty/hriech/netopier/`.
Retired v0 code, runtime state, generated bundles, schedulers, and clusters
are not dependencies and must not be reintroduced. Only reviewed public source
metadata and explicitly approved evidence migrations may cross that historical
boundary.

## ADR-002: Miniflux owns collection

Miniflux is maintained, Apache-2.0 licensed, supports RSS/Atom/JSON Feed, HTTP cache
semantics, scheduling and feed health. Netopier reconciles through its documented
REST interface; it never writes Miniflux tables.

## ADR-003: one PostgreSQL system of record

Netopier uses PostgreSQL 17 with pgvector 0.8.6. Exact cosine search comes before
ANN. PostgreSQL jobs replace Redis, RabbitMQ, Kafka, Celery and Temporal during alpha.

## ADR-004: local multilingual embeddings

FastEmbed runs the versioned
`sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` ONNX model locally.
This is the only Apache-2.0 multilingual 384-dimensional text model exposed by the
installed FastEmbed 0.8.0 registry. Story formation remains operational without an
LLM. The provisional Slovak benchmark selected cosine threshold 0.83: it found five
of six labeled same-event pairs with no false merge, versus three of six for the
TF-IDF baseline. The threshold is encoded in each new assignment's algorithm
version. Adam still needs to ratify the provisional labels.

## ADR-005: deep modules

The external interfaces are `MinifluxGateway.reconcile`, `ArticleArchive.ingest`,
`StoryEngine.assign`, and `FeedProjector.snapshot`. Infrastructure details remain
inside their implementations.

## ADR-006: bounded local runtime

The continuous worker is opt-in. The default local stack starts PostgreSQL,
Miniflux and the read-only API; one-shot reconciliation is the first operational
mode. Continuous mode uses a 20-entry batch, a five-minute interval, one CPU and
1 GiB RAM so model inference cannot silently monopolize Adam's Mac.

## ADR-007: OSS-supported is not an automatic source license

The runtime is assembled from maintained open-source components and keeps their
notices. Netopier v2 itself has no public license grant. Publishing its source or
choosing an OSS license requires Adam's separate decision.

## ADR-008: cloud collection runs on Cloudflare Workers (proposal, 2026-09-26, XDR-228)

Status: proposed — awaits Adam's confirmation together with the deploy.

Netopier must collect without the Mac. The collection layer moves to a Cloudflare
Worker (`zber/`): Cron Triggers enqueue jobs into Cloudflare Queues, one consumer
invocation runs one connector, raw payloads go to R2 and normalized, versioned
records go to D1 (`records`, `runs`, `source_state`). Retries and a dead-letter queue
replace the local worker loop.

Consequences:

- For the cloud, the Worker's RSS connector replaces Miniflux as the feed poller
  (ADR-002 still holds for the local Python stack). State sources (CRZ, TED, kataster,
  ŠÚ SR, World Monitor) have no RSS and are collected only by the Worker.
- D1 is the cloud system of record for raw collected records. PostgreSQL/pgvector
  (ADR-003) stays the store for embeddings, stories and events; the Python pipeline
  reads the D1 archive in a later step instead of Miniflux.
- No text leaves for cloud processing: the Worker only fetches, parses and stores
  public records. Embeddings stay local (ADR-004).
- Requires the Workers Paid plan (CPU time for the CRZ export, D1 write volume).
