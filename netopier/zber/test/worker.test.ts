import { createScheduledController } from 'cloudflare:test';
import { env as workerEnv } from 'cloudflare:workers';
import { zipSync } from 'fflate';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import worker, { runJob } from '../src/index';
import type { Env, Job } from '../src/types';
import { fixtures } from './fixtures';

const env = workerEnv as unknown as Env;

type Route = [RegExp, (request: Request) => Response | Promise<Response>];

function stubFetch(routes: Route[]): typeof fetch & { calls: string[] } {
  const calls: string[] = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    calls.push(`${request.method} ${request.url}`);
    for (const [pattern, respond] of routes) if (pattern.test(request.url)) return respond(request);
    return new Response('not found', { status: 404 });
  }) as typeof fetch & { calls: string[] };
  fn.calls = calls;
  return fn;
}

const text = (body: string, type = 'application/xml') => () => new Response(body, { headers: { 'content-type': type } });

async function count(sql: string, ...params: unknown[]): Promise<number> {
  const row = await env.DB.prepare(sql).bind(...params).first<{ n: number }>();
  return row?.n ?? 0;
}

beforeEach(async () => {
  await env.DB.batch([env.DB.prepare('DELETE FROM records'), env.DB.prepare('DELETE FROM runs'), env.DB.prepare('DELETE FROM source_state')]);
});

describe('archív', () => {
  it('RSS: prvý zber zapíše záznamy, rovnaký obsah druhýkrát nie, zmena vytvorí novú verziu', async () => {
    const job: Job = { source: 'rss', channel: 'media', batch: 0 };
    const feedRoute: Route = [/./, text(fixtures.rss)];
    const first = await runJob(env, job, stubFetch([feedRoute]));
    expect(first.length).toBeGreaterThanOrEqual(4);
    expect(first.every((s) => s.status === 'ok' && s.seen === 2 && s.inserted === 2)).toBe(true);
    const total = await count(`SELECT COUNT(*) AS n FROM records WHERE source = 'rss'`);
    expect(total).toBe(first.length * 2);

    const again = await runJob(env, job, stubFetch([feedRoute]));
    expect(again.every((s) => s.inserted === 0)).toBe(true);

    const changed: string = fixtures.rss.replace('Krátky popis.', 'Opravený popis.');
    const third = await runJob(env, job, stubFetch([[/./, text(changed)]]));
    expect(third.every((s) => s.inserted === 1)).toBe(true);
    expect(await count(`SELECT COUNT(*) AS n FROM records WHERE source = 'rss'`)).toBe(total + first.length);

    const row = await env.DB.prepare(`SELECT * FROM records WHERE source = 'rss' ORDER BY id LIMIT 1`).first<Record<string, string>>();
    expect(row).toMatchObject({ channel: 'dennikn_minuty_all', url: 'https://example.sk/1001/vlada-schvalila-rozpocet/' });
    expect(row!.content_hash).toMatch(/^[0-9a-f]{64}$/);
    expect(row!.collected_at).toMatch(/Z$/);
    expect(JSON.parse(row!.data!)).toMatchObject({ feed_id: 'dennikn_minuty_all', categories: ['Domov', 'Politika'] });
  });

  it('chyba jedného kanála nezastaví ostatné a zapíše sa do stavu', async () => {
    const summaries = await runJob(
      env,
      { source: 'rss', channel: 'media', batch: 0 },
      stubFetch([
        [/dennikn\.sk\/feed/, () => new Response('gone', { status: 410 })],
        [/./, text(fixtures.rss)],
      ]),
    );
    const failed = summaries.filter((s) => s.status === 'error');
    expect(failed.map((s) => s.channel)).toEqual(['dennikn']);
    expect(failed[0]!.error).toMatch(/HTTP 410/);
    const state = await env.DB.prepare(`SELECT last_error FROM source_state WHERE source = 'rss' AND channel = 'dennikn'`).first<{ last_error: string }>();
    expect(state!.last_error).toMatch(/HTTP 410/);
    expect(await count(`SELECT COUNT(*) AS n FROM runs WHERE status = 'ok'`)).toBe(summaries.length - 1);
  });

  it('CRZ: stiahne export včerajška, uloží ZIP do R2, posunie kurzor a pri sklze zaradí ďalší deň', async () => {
    const zip = zipSync({ 'export.xml': new TextEncoder().encode(fixtures.crzExport) });
    const fetcher = stubFetch([[/crz\.gov\.sk\/export\/\d{4}-\d{2}-\d{2}\.zip$/, () => new Response(zip)]]);
    const send = vi.spyOn(env.JOBS, 'send').mockResolvedValue(undefined as never);
    const now = new Date('2026-09-26T05:20:00Z');

    const [summary] = await runJob(env, { source: 'crz' }, fetcher, now);
    expect(fetcher.calls).toEqual(['GET https://www.crz.gov.sk/export/2026-09-25.zip']);
    expect(summary).toMatchObject({ status: 'ok', seen: 2, inserted: 2 });
    expect(summary!.rawKey).toMatch(/^raw\/crz\/export\/\d{4}\/\d{2}\/\d{2}\/[0-9a-f]{16}\.zip$/);
    expect(await env.RAW!.head(summary!.rawKey!)).not.toBeNull();
    const state = await env.DB.prepare(`SELECT cursor FROM source_state WHERE source = 'crz'`).first<{ cursor: string }>();
    expect(state!.cursor).toBe('2026-09-25');
    expect(send).not.toHaveBeenCalled();

    await env.DB.prepare(`UPDATE source_state SET cursor = '2026-09-20' WHERE source = 'crz'`).run();
    await runJob(env, { source: 'crz' }, fetcher, now);
    expect(fetcher.calls.at(-1)).toBe('GET https://www.crz.gov.sk/export/2026-09-21.zip');
    expect(send).toHaveBeenCalledWith({ source: 'crz' });
    send.mockRestore();
  });

  it('TED: dopyt na slovenských obstarávateľov od kurzora, záznamy a kurzor podľa dátumu publikácie', async () => {
    const bodies: unknown[] = [];
    const fetcher = stubFetch([
      [
        /api\.ted\.europa\.eu/,
        async (request) => {
          bodies.push(await request.json());
          return new Response(fixtures.tedPage, { headers: { 'content-type': 'application/json' } });
        },
      ],
    ]);
    const [summary] = await runJob(env, { source: 'ted' }, fetcher, new Date('2026-09-26T05:20:00Z'));
    expect(bodies[0]).toMatchObject({ query: 'buyer-country=SVK AND publication-date>=20260919 SORT BY publication-number', page: 1 });
    expect(summary).toMatchObject({ status: 'ok', seen: 2, inserted: 2 });
    const state = await env.DB.prepare(`SELECT cursor FROM source_state WHERE source = 'ted'`).first<{ cursor: string }>();
    expect(state!.cursor).toMatch(/^2026-09-2\d$/);
  });

  it('štatistika: katalóg každý deň, sledovaný dataset iba pri zmene dátumu aktualizácie', async () => {
    const fetcher = stubFetch([
      [/\/collection\?/, text(fixtures.statistikaKatalog, 'application/json')],
      [/\/dataset\/nu1061qs\/all\/all\/all/, text(fixtures.statistikaDataset, 'application/json')],
    ]);
    const first = await runJob(env, { source: 'statistika' }, fetcher);
    const byChannel = Object.fromEntries(first.map((s) => [s.channel, s]));
    expect(byChannel.katalog).toMatchObject({ status: 'ok', seen: 2, inserted: 2 });
    expect(byChannel.nu1061qs).toMatchObject({ status: 'ok', inserted: 1 });
    expect(byChannel.kz1020rs).toMatchObject({ status: 'error' });

    const datasetCalls = () => fetcher.calls.filter((c) => c.includes('/dataset/nu1061qs')).length;
    const before = datasetCalls();
    const second = await runJob(env, { source: 'statistika' }, fetcher);
    expect(datasetCalls()).toBe(before);
    expect(second.find((s) => s.channel === 'katalog')!.inserted).toBe(0);
  });

  it('kataster: parcely oblasti, stránkovanie končí pri neúplnej strane', async () => {
    const fetcher = stubFetch([[/inspirews\.skgeodesy\.sk/, text(fixtures.katasterWfs, 'application/json')]]);
    const summaries = await runJob(env, { source: 'kataster', channel: 'bratislava-urad-vlady' }, fetcher);
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({ channel: 'bratislava-urad-vlady', status: 'ok', seen: 2, inserted: 2 });
    expect(fetcher.calls).toHaveLength(1);
  });

  it('World Monitor: 7 dopytov na get_sources, výpadok jedného nezhodí ostatné', async () => {
    let n = 0;
    const fetcher = stubFetch([
      [/worldmonitor\.app\/mcp/, () => (++n === 3 ? new Response('{"error":"x"}', { status: 403 }) : new Response(fixtures.worldmonitorOutlets))],
    ]);
    const summaries = await runJob(env, { source: 'worldmonitor' }, fetcher);
    expect(summaries).toHaveLength(7);
    expect(summaries.filter((s) => s.status === 'error')).toHaveLength(1);
  });

  it('úplné zlyhanie konektora zapíše chybný beh a vyhodí chybu (fronta zopakuje)', async () => {
    const fetcher = stubFetch([[/./, () => new Response('down', { status: 503 })]]);
    await expect(runJob(env, { source: 'statistika' }, fetcher)).rejects.toThrow(/HTTP 503/);
    expect(await count(`SELECT COUNT(*) AS n FROM runs WHERE source = 'statistika' AND status = 'error'`)).toBe(1);
  });
});

describe('Worker', () => {
  it('cron zaradí úlohy do fronty', async () => {
    const sendBatch = vi.spyOn(env.JOBS, 'sendBatch').mockResolvedValue(undefined as never);
    await worker.scheduled(createScheduledController({ cron: '20 5 * * *', scheduledTime: Date.parse('2026-09-26T05:20:00Z') }), env);
    expect([...sendBatch.mock.calls[0]![0]].map((m) => m.body.source)).toEqual(['crz', 'ted', 'statistika', 'kataster', 'worldmonitor']);
    sendBatch.mockRestore();
  });

  it('/health vráti počty a /run bez tokenu odmietne', async () => {
    const health = await worker.fetch(new Request('https://zber.test/health'), env);
    expect(health.status).toBe(200);
    expect(await health.json()).toMatchObject({ service: 'netopier-zber', records: [], runs_24h: [], failing_channels: 0 });
    const privateHealth = await worker.fetch(new Request('https://zber.test/health', { headers: { authorization: 'Bearer test-token' } }), env);
    expect(await privateHealth.json()).toMatchObject({ failing_channels: [] });
    const run = await worker.fetch(new Request('https://zber.test/run/crz', { method: 'POST' }), env);
    expect(run.status).toBe(401);
    const send = vi.spyOn(env.JOBS, 'send').mockResolvedValue(undefined as never);
    const queued = await worker.fetch(new Request('https://zber.test/run/crz', { method: 'POST', headers: { authorization: 'Bearer test-token' } }), env);
    expect(await queued.json()).toEqual({ queued: { source: 'crz' } });
    expect(send).toHaveBeenCalledWith({ source: 'crz' });
    send.mockRestore();
  });
});
