import type { ChannelResult, CollectContext, CollectedRecord, Connector } from '../types';
import { errorMessage, fetchChecked } from '../util';

/**
 * World Monitor (worldmonitor.app) — inventár zdrojov cez verejný MCP nástroj `get_sources`.
 * Bez kľúča je dostupný iba tento nástroj (10 volaní/min/IP); živé dáta (briefy, udalosti)
 * vyžadujú platený API kľúč. Svetové správy z katalógu World Monitor zbiera konektor `rss`
 * (sada `worldmonitor`) priamo od vydavateľov.
 */
export const WORLDMONITOR_MCP = 'https://worldmonitor.app/mcp';

interface Query {
  channel: string;
  args: Record<string, unknown>;
}

/** 7 volaní na beh — pod limitom 10/min. */
export const INVENTORY_QUERIES: Query[] = [
  { channel: 'summary', args: { view: 'summary' } },
  { channel: 'outlets-tier-1', args: { view: 'outlets', tier: 1, limit: 200 } },
  { channel: 'outlets-tier-2', args: { view: 'outlets', tier: 2, limit: 200 } },
  { channel: 'outlets-tier-3', args: { view: 'outlets', tier: 3, limit: 200 } },
  { channel: 'outlets-tier-4', args: { view: 'outlets', tier: 4, limit: 200 } },
  { channel: 'providers-structured', args: { view: 'providers', kind: 'structured', limit: 200 } },
  { channel: 'providers-feed-structured', args: { view: 'providers', kind: 'feed+structured', limit: 200 } },
];

export async function callGetSources(ctx: CollectContext, args: Record<string, unknown>): Promise<{ body: string; content: any }> {
  const response = await fetchChecked(ctx, WORLDMONITOR_MCP, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/call', params: { name: 'get_sources', arguments: args } }),
    retries: 1,
  });
  const body = await response.text();
  const message = JSON.parse(body) as { result?: { structuredContent?: unknown }; error?: { message?: string } };
  if (message.error) throw new Error(`World Monitor MCP: ${message.error.message ?? 'chyba'}`);
  if (!message.result?.structuredContent) throw new Error('World Monitor MCP: chýba structuredContent');
  return { body, content: message.result.structuredContent };
}

export function inventoryRecords(channel: string, content: any): CollectedRecord[] {
  const view = content.view as string;
  if (view === 'summary') {
    return [{ externalId: 'summary', title: 'World Monitor — súhrn zdrojov', url: 'https://www.worldmonitor.app/', data: content.summary }];
  }
  if (view === 'outlets') {
    return (content.outlets as any[]).map((outlet) => ({
      externalId: `outlet:${outlet.name}`,
      title: outlet.name,
      data: { ...outlet, matched: content.matched, returned: content.returned, query: channel },
    }));
  }
  if (view === 'providers') {
    return (content.providers as any[]).map((provider) => ({
      externalId: `provider:${provider.host}`,
      title: provider.provider ?? provider.host,
      url: `https://${provider.host}/`,
      data: { ...provider, matched: content.matched, returned: content.returned, query: channel },
    }));
  }
  throw new Error(`World Monitor MCP: neznámy pohľad ${view}`);
}

export const collectWorldMonitor: Connector = async (_job, ctx) => {
  const results: ChannelResult[] = [];
  for (const query of INVENTORY_QUERIES) {
    try {
      const { body, content } = await callGetSources(ctx, query.args);
      results.push({
        channel: query.channel,
        records: inventoryRecords(query.channel, content),
        raw: { body, contentType: 'application/json', ext: 'json' },
      });
    } catch (error) {
      results.push({ channel: query.channel, records: [], error: errorMessage(error) });
    }
  }
  return results;
};
