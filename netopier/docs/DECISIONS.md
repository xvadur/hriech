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

## ADR-009: Netopier runs locally on the Mac; cloud holds only public rows (2026-09-27, accepted)

Adam's decision of 2026-09-27 (`../docs/redakcia/ROZHODNUTIE.md`) supersedes ADR-008 as the
runtime target: collection, derivation, scoring, media measurement, the editorial line and the
terminal run on the Mac against a local D1 (SQLite in `zber/.wrangler/state`, same schema and
migrations as the Worker). The Cloudflare Free tier holds only a display D1 with public rows for
hriech.xvadur.com. No paid services, no GitHub Actions, no cloud routine. The Worker code stays
deployable; deployment is deferred (XDR-258). Step I0 (XDR-275) delivered migration 0002,
`zber/src/derive/` and the `@netopier/redakcia` package over the 14 299 local records.

## ADR-010: openclaw is a control, not the definition of the score (2026-09-28, finding)

The prediction scoring of openclaw.sk (`scoring.js`, `status.js`) is ported 1:1 into
`redakcia/src/skore.ts` and covered by a parity test on 20 articles. The server side of openclaw
(`api.openclaw.lu/api/scores`, `realization_score` in `/api/prediction-scores`, which the site
displays) yields different numbers than `scoring.js` over the same signals (0 of 43 predictions
equal on 2026-09-28, 220 signal days), so parity is claimed only for the client formula. Netopier's
own score is media measurement per the function register (lexicon, headline structure, coverage vs
what happened, questions, narratives, sentiment, filler, inaccuracies, alarmism) plus the three
separate event scores (B10); the openclaw formula remains the EKG mechanics for hypotheses (zvody).

## ADR-011: Claude may read public media texts in full (2026-09-28, accepted)

Adam decided on 2026-09-28 that Claude may read public media texts (RSS, full articles at public
URLs, public transcripts) in full. Transcripts are not read wholesale: an entity and full-text
filter (known people, topics, cases) marks what is discussed and who is present; only marked
segments are read in full. The ban stays for cloud text processing of private data (Fiki raw
transcripts, `xvadur_core`, real-estate data, health) and for publishing whole protected texts.
