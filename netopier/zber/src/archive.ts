import type { ChannelResult, CollectedRecord, Env, SourceId } from './types';
import { chunk, sha256Hex, stableStringify } from './util';

/** Koľko INSERT-ov ide do jedného D1 batchu. */
const INSERT_BATCH = 50;

export interface ArchiveSummary {
  source: SourceId;
  channel: string;
  status: 'ok' | 'error';
  seen: number;
  inserted: number;
  rawKey: string | null;
  error?: string;
}

export async function contentHash(record: CollectedRecord): Promise<string> {
  return sha256Hex(
    stableStringify({
      externalId: record.externalId,
      url: record.url ?? null,
      title: record.title ?? null,
      publishedAt: record.publishedAt ?? null,
      upstreamVersion: record.upstreamVersion ?? null,
      data: record.data,
    }),
  );
}

export async function getCursor(db: D1Database, source: SourceId, channel: string): Promise<string | null> {
  const row = await db
    .prepare('SELECT cursor FROM source_state WHERE source = ? AND channel = ?')
    .bind(source, channel)
    .first<{ cursor: string | null }>();
  return row?.cursor ?? null;
}

function rawKey(source: SourceId, channel: string, now: Date, hash: string, ext: string): string {
  const day = now.toISOString().slice(0, 10).replaceAll('-', '/');
  const safeChannel = channel.replace(/[^a-zA-Z0-9._-]+/g, '_');
  return `raw/${source}/${safeChannel}/${day}/${hash.slice(0, 16)}.${ext}`;
}

/** Zapíše výsledok jedného kanála: surový payload do R2, záznamy do D1, beh a kurzor. */
export async function archiveChannel(env: Env, source: SourceId, result: ChannelResult, startedAt: Date, now = new Date()): Promise<ArchiveSummary> {
  const collectedAt = now.toISOString();
  const run = await env.DB.prepare(
    'INSERT INTO runs (source, channel, started_at, status) VALUES (?, ?, ?, ?) RETURNING id',
  )
    .bind(source, result.channel, startedAt.toISOString(), 'running')
    .first<{ id: number }>();
  const runId = run!.id;

  let storedRawKey: string | null = null;
  if (result.raw && env.RAW && !result.error) {
    const hash = await sha256Hex(result.raw.body);
    storedRawKey = rawKey(source, result.channel, now, hash, result.raw.ext);
    await env.RAW.put(storedRawKey, result.raw.body, {
      httpMetadata: { contentType: result.raw.contentType },
      customMetadata: { source, channel: result.channel, collected_at: collectedAt, sha256: hash },
    });
  }

  let inserted = 0;
  const insert = env.DB.prepare(
    `INSERT OR IGNORE INTO records
       (source, channel, external_id, upstream_version, url, title, published_at, collected_at, content_hash, data, raw_key, run_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  for (const group of chunk(result.records, INSERT_BATCH)) {
    const statements = await Promise.all(
      group.map(async (record) =>
        insert.bind(
          source,
          result.channel,
          record.externalId,
          record.upstreamVersion ?? null,
          record.url ?? null,
          record.title ?? null,
          record.publishedAt ?? null,
          collectedAt,
          await contentHash(record),
          JSON.stringify(record.data),
          storedRawKey,
          runId,
        ),
      ),
    );
    const outcomes = await env.DB.batch(statements);
    inserted += outcomes.reduce((sum, outcome) => sum + (outcome.meta.changes ?? 0), 0);
  }

  const status = result.error ? 'error' : 'ok';
  const finishedAt = new Date().toISOString();
  const stateUpdate = result.error
    ? env.DB.prepare(
        `INSERT INTO source_state (source, channel, last_error_at, last_error) VALUES (?, ?, ?, ?)
         ON CONFLICT (source, channel) DO UPDATE SET last_error_at = excluded.last_error_at, last_error = excluded.last_error`,
      ).bind(source, result.channel, finishedAt, result.error)
    : env.DB.prepare(
        `INSERT INTO source_state (source, channel, cursor, last_success_at) VALUES (?, ?, ?, ?)
         ON CONFLICT (source, channel) DO UPDATE SET
           cursor = COALESCE(excluded.cursor, source_state.cursor),
           last_success_at = excluded.last_success_at`,
      ).bind(source, result.channel, result.cursor ?? null, finishedAt);
  await env.DB.batch([
    env.DB.prepare('UPDATE runs SET finished_at = ?, status = ?, seen = ?, inserted = ?, raw_key = ?, error = ? WHERE id = ?').bind(
      finishedAt,
      status,
      result.records.length,
      inserted,
      storedRawKey,
      result.error ?? null,
      runId,
    ),
    stateUpdate,
  ]);

  return { source, channel: result.channel, status, seen: result.records.length, inserted, rawKey: storedRawKey, error: result.error };
}

export async function health(db: D1Database) {
  const [records, runs, errors] = await db.batch([
    db.prepare('SELECT source, COUNT(*) AS records, MAX(collected_at) AS last_collected_at FROM records GROUP BY source ORDER BY source'),
    db.prepare(
      `SELECT source, COUNT(*) AS runs, SUM(status = 'ok') AS ok, SUM(status = 'error') AS errors, MAX(finished_at) AS last_run_at
       FROM runs WHERE started_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day') GROUP BY source ORDER BY source`,
    ),
    db.prepare(
      `SELECT source, channel, last_error_at, substr(last_error, 1, 200) AS last_error FROM source_state
       WHERE last_error_at IS NOT NULL AND (last_success_at IS NULL OR last_error_at > last_success_at)
       ORDER BY last_error_at DESC LIMIT 20`,
    ),
  ]);
  return { records: records!.results, runs_24h: runs!.results, failing_channels: errors!.results };
}
