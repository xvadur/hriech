# State-reading editorial brief

**Status:** product and investigation brief; no ingestion implementation yet
**Date:** 2026-09-03
**Boundary:** public-source data only; an alert is not an allegation

## Editorial thesis

Netopier should detect relevant public action directly from official records as
well as from publisher coverage. A newsroom that only reads articles sees the
state after somebody has already selected and framed an event. Public contracts,
registries, procurement records, corporate filings, and justice datasets can
expose the underlying acts earlier and in a form that supports longitudinal
comparison.

The initial investigation question is an information-capacity comparison:

> What machine-readable monitoring does the Slovak state purchase or operate to
> understand media coverage, and what comparable systems do newsrooms use to
> monitor the state's own public acts?

The existence of a media-monitoring contract is not evidence of wrongdoing.
Relevant evidence would describe scope, cost, delivery latency, recipients,
renewal history, and documented use, then compare it with the observable
state-reading capacity of newsrooms. Claims about intent or internal editorial
knowledge require separate evidence.

## Founding case to verify

A reported property discovery involving journalist Tomas Kysel and politician
Lubos Blaha is the first case study, not yet a publishable Netopier finding. It
raises two testable questions:

1. Was the discovery produced by a documented general method or by manual
   monitoring of selected people?
2. Did the published evidence include unnecessary location detail that allowed
   the subject to shift the public argument from the property and political
   consistency to privacy and personal safety?

The original article body, the full interview describing the method, the full
response, and subsequent coverage must be captured and compared before reaching
a conclusion. No private addresses belong in the research artifact or product.

## Proposed source lanes

Each adapter needs a separate source and legal review. A candidate lane is not a
claim that a stable public API exists.

| Lane | Public act to detect | Stable join candidates | Required source check |
|---|---|---|---|
| Central Register of Contracts | new, changed, or cancelled public contracts | organisation ID, contract ID, supplier | official export format, revision semantics, attachments, terms |
| Register of Public Sector Partners | partner and beneficial-owner changes | organisation ID, partner ID | official API/schema, effective dates, historical coverage |
| Business and financial registers | officers, ownership signals, filings, accounts | organisation ID, register entry | access method, reuse terms, update cadence |
| Justice open data | decisions, hearings, judges, published proceedings | case and court identifiers | dataset scope, publication delay, legal-status semantics |
| Public procurement | notices, awards, buyers, suppliers, amendments | notice ID, organisation ID | official feeds, EU/SK identifiers, lifecycle states |
| Cadastre | legally accessible ownership-change signals | parcel/title identifiers; conservative person matching | current access law, authentication, bulk-access limits, privacy review |

## Evidence contract

Every captured state record should retain:

- source system, canonical public URL, collection time, and source publication
  or effective time when supplied;
- untouched raw payload or document, content hash, media type, and parser
  version;
- immutable revisions and an explicit relation between replacement,
  correction, cancellation, and ordinary update;
- source-native identifiers and separately derived entity links;
- the exact rule or model feature that created an alert;
- uncertainty and competing entity matches;
- human disposition: routine, monitor, research, merge, split, dismiss, or
  escalate.

Derived links and anomaly scores are research leads. They cannot overwrite raw
records, silently merge people, or become public accusations without source
review, contextual reporting, a right-of-reply step where appropriate, and
operator ratification.

## Product integration

```text
official public records ─> source adapters ─> immutable raw revisions
                                                |
                                                v
publisher feeds ─────────> article archive ─> entity + event candidates
                                                |
                                                v
                               private editorial research queue
                                                |
                               evidence pack + human decision
                                                |
                              public event or curated article
```

This extends the event engine; it does not replace its boundaries. Official
records become another evidence class alongside articles. Event confidence,
public consequence, and operator relevance remain separate judgments.

## Bounded first slice

1. Verify and document one official source contract end to end.
2. Capture daily immutable revisions without publishing alerts.
3. Resolve organisations by official identifiers; defer ambiguous person
   matching.
4. Produce a private change feed with exact source receipts and reasons.
5. Manually label routine changes, useful leads, false positives, and missed
   changes for a fixed trial period.
6. Only then define anomaly rules or a public projection.

Success is not the number of records collected. The first slice succeeds when a
human can reproduce a surfaced change from the official source, understand why
it was selected, correct a bad entity link without losing lineage, and decide
not to publish it without deleting the evidence.
