import { archiveChannel, getCursor, health, type ArchiveSummary } from './archive';
import { plan, planAll } from './plan';
import { collectCrz } from './sources/crz';
import { collectKataster } from './sources/kataster';
import { collectRss } from './sources/rss';
import { collectStatistika } from './sources/statistika';
import { collectTed } from './sources/ted';
import { collectWorldMonitor } from './sources/worldmonitor';
import { SOURCE_IDS, type CollectContext, type Connector, type Env, type Job, type SourceId } from './types';

export const CONNECTORS: Record<SourceId, Connector> = {
  rss: collectRss,
  worldmonitor: collectWorldMonitor,
  crz: collectCrz,
  ted: collectTed,
  kataster: collectKataster,
  statistika: collectStatistika,
};

const DEFAULT_UA = 'Netopier/2 (+https://hriech.xvadur.com; zber verejnych zdrojov)';

/** Globálny fetch zavolaný ako metóda iného objektu padá vo Workeri na „Illegal invocation“. */
const globalFetch: typeof fetch = (input, init) => fetch(input, init);

export function contextFor(env: Env, source: SourceId, fetcher: typeof fetch = globalFetch, now = new Date()): CollectContext {
  return {
    fetch: fetcher,
    now,
    userAgent: env.USER_AGENT ?? DEFAULT_UA,
    getCursor: (channel) => getCursor(env.DB, source, channel),
  };
}

/** Spustí jednu úlohu: konektor → archív. Chyba celého konektora sa zapíše ako chybný beh a vyhodí (fronta zopakuje). */
export async function runJob(env: Env, job: Job, fetcher: typeof fetch = globalFetch, now = new Date()): Promise<ArchiveSummary[]> {
  const connector = CONNECTORS[job.source];
  if (!connector) throw new Error(`Neznámy zdroj ${job.source}`);
  const startedAt = new Date();
  let results;
  try {
    results = await connector(job, contextFor(env, job.source, fetcher, now));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await archiveChannel(env, job.source, { channel: job.channel ?? '*', records: [], error: message }, startedAt);
    throw error;
  }
  const summaries: ArchiveSummary[] = [];
  for (const result of results) {
    summaries.push(await archiveChannel(env, job.source, result, startedAt));
    for (const followUp of result.followUps ?? []) await env.JOBS.send(followUp);
  }
  return summaries;
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });
}

function authorized(request: Request, env: Env): boolean {
  if (!env.ZBER_TOKEN) return false;
  return request.headers.get('authorization') === `Bearer ${env.ZBER_TOKEN}`;
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      // Počty sú verejné; texty chýb (môžu obsahovať úryvky odpovedí zdrojov) iba s tokenom.
      const { failing_channels, ...counts } = await health(env.DB);
      return json({
        service: 'netopier-zber',
        now: new Date().toISOString(),
        ...counts,
        failing_channels: authorized(request, env) ? failing_channels : failing_channels.length,
      });
    }
    // Ručné spustenie: POST /run (všetko do fronty) alebo POST /run/<zdroj>?channel=&batch=&sync=1
    if (request.method === 'POST' && url.pathname.startsWith('/run')) {
      if (!authorized(request, env)) return json({ error: 'unauthorized' }, 401);
      const source = url.pathname.split('/')[2] as SourceId | undefined;
      if (!source) {
        const jobs = planAll();
        await env.JOBS.sendBatch(jobs.map((body) => ({ body })));
        return json({ queued: jobs.length });
      }
      if (!SOURCE_IDS.includes(source)) return json({ error: `neznámy zdroj ${source}` }, 404);
      const job: Job = {
        source,
        channel: url.searchParams.get('channel') ?? undefined,
        batch: url.searchParams.has('batch') ? Number(url.searchParams.get('batch')) : undefined,
      };
      if (url.searchParams.get('sync') === '1') return json({ job, results: await runJob(env, job) });
      await env.JOBS.send(job);
      return json({ queued: job });
    }
    return json({ error: 'not found' }, 404);
  },

  async scheduled(controller, env): Promise<void> {
    const jobs = plan(controller.cron, new Date(controller.scheduledTime));
    if (jobs.length) await env.JOBS.sendBatch(jobs.map((body) => ({ body })));
  },

  async queue(batch, env): Promise<void> {
    for (const message of batch.messages) {
      try {
        const summaries = await runJob(env, message.body);
        console.log(JSON.stringify({ job: message.body, summaries }));
        message.ack();
      } catch (error) {
        console.error(JSON.stringify({ job: message.body, error: error instanceof Error ? error.message : String(error) }));
        message.retry({ delaySeconds: 300 });
      }
    }
  },
} satisfies ExportedHandler<Env, Job>;
