import { XMLParser } from 'fast-xml-parser';
import mediaFeeds from '../../data/media-feeds.json';
import worldmonitorFeeds from '../../data/worldmonitor-feeds.json';
import type { ChannelResult, CollectContext, CollectedRecord, Connector, Job } from '../types';
import { chunk, errorMessage, fetchChecked, toIso } from '../util';

export interface FeedDef {
  id: string;
  name: string;
  url: string;
  lang?: string;
  category?: string;
}

/** Sady kanálov: slovenské médiá z registra Netopiera a svetové kanály z katalógu World Monitor. */
export const FEED_SETS: Record<string, FeedDef[]> = {
  media: mediaFeeds.feeds,
  worldmonitor: worldmonitorFeeds.feeds,
};

export const RSS_BATCH_SIZE = 25;

export function feedBatches(set: string): FeedDef[][] {
  return chunk(FEED_SETS[set] ?? [], RSS_BATCH_SIZE);
}

export interface FeedItem {
  guid: string | null;
  link: string | null;
  title: string | null;
  summary: string | null;
  published: string | null;
  author: string | null;
  categories: string[];
  /** celý obsah položky (content:encoded, Atom content) ako HTML; do archívu `records` sa neukladá */
  content: string | null;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  cdataPropName: false,
  processEntities: { enabled: true, maxTotalExpansions: 100000, maxExpandedLength: 10_000_000 },
  htmlEntities: true,
  trimValues: true,
  parseTagValue: false,
  isArray: (name) => ['item', 'entry', 'category', 'link'].includes(name),
});

function text(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string') return value.trim() || null;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return text(value[0]);
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    if ('#text' in obj) return text(obj['#text']);
  }
  return null;
}

const ENTITY: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

export function stripHtml(html: string | null, max = 2000): string | null {
  if (!html) return null;
  const plain = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const code = e[1]?.toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITY[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return null;
  return plain.length > max ? `${plain.slice(0, max - 1)}…` : plain;
}

function atomLink(links: unknown): string | null {
  if (!Array.isArray(links)) return text(links);
  const candidates = links as Array<Record<string, unknown> | string>;
  const alternate =
    candidates.find((l) => typeof l === 'object' && (l['@_rel'] === undefined || l['@_rel'] === 'alternate')) ??
    candidates[0];
  if (typeof alternate === 'string') return alternate;
  return alternate ? (text(alternate['@_href']) ?? text(alternate)) : null;
}

function categories(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((c) => (typeof c === 'object' && c !== null && '@_term' in c ? text((c as Record<string, unknown>)['@_term']) : text(c)))
    .filter((c): c is string => Boolean(c));
}

/** RSS 2.0, RSS 1.0 (RDF) aj Atom → jednotné položky. */
export function parseFeed(xml: string): FeedItem[] {
  const doc = parser.parse(xml) as Record<string, any>;
  const rss = doc.rss?.channel;
  const rdf = doc['rdf:RDF'];
  const atom = doc.feed;
  if (rss || rdf) {
    const items: any[] = (rss ?? rdf).item ?? rdf?.item ?? [];
    return items.map((item) => ({
      guid: text(item.guid),
      link: atomLink(item.link),
      title: stripHtml(text(item.title), 500),
      summary: stripHtml(text(item.description) ?? text(item['content:encoded'])),
      published: toIso(text(item.pubDate) ?? text(item['dc:date']) ?? text(item.published)),
      author: text(item['dc:creator']) ?? text(item.author),
      categories: categories(item.category),
      content: text(item['content:encoded']),
    }));
  }
  if (atom) {
    const entries: any[] = atom.entry ?? [];
    return entries.map((entry) => ({
      guid: text(entry.id),
      link: atomLink(entry.link),
      title: stripHtml(text(entry.title), 500),
      summary: stripHtml(text(entry.summary) ?? text(entry.content) ?? text(entry['media:group']?.['media:description'])),
      published: toIso(text(entry.published) ?? text(entry.updated)),
      author: text(entry.author?.name) ?? text(entry.author),
      categories: categories(entry.category),
      content: text(entry.content),
    }));
  }
  throw new Error('Neznámy formát kanála (nie je RSS ani Atom)');
}

export function itemToRecord(feed: FeedDef, item: FeedItem): CollectedRecord | null {
  const externalId = item.guid ?? item.link;
  if (!externalId) return null;
  return {
    externalId: `${feed.id}:${externalId}`,
    url: item.link,
    title: item.title,
    publishedAt: item.published,
    data: {
      feed_id: feed.id,
      feed_name: feed.name,
      feed_url: feed.url,
      lang: feed.lang ?? null,
      category: feed.category ?? null,
      guid: item.guid,
      summary: item.summary,
      author: item.author,
      categories: item.categories,
    },
  };
}

export async function collectFeed(feed: FeedDef, ctx: CollectContext): Promise<ChannelResult> {
  try {
    const response = await fetchChecked(ctx, feed.url, {
      headers: { accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.5' },
      timeoutMs: 20_000,
      retries: 1,
    });
    const items = parseFeed(await response.text());
    const records = items.map((item) => itemToRecord(feed, item)).filter((r): r is CollectedRecord => r !== null);
    return { channel: feed.id, records };
  } catch (error) {
    return { channel: feed.id, records: [], error: errorMessage(error) };
  }
}

/** Dávka kanálov; beží po 6 naraz (limit súbežných spojení Workera). */
export const collectRss: Connector = async (job: Job, ctx) => {
  const set = job.channel ?? 'media';
  const batches = feedBatches(set);
  const feeds = batches[job.batch ?? 0];
  if (!feeds) throw new Error(`Neznáma dávka ${set}#${job.batch}`);
  const results: ChannelResult[] = [];
  for (const group of chunk(feeds, 6)) {
    results.push(...(await Promise.all(group.map((feed) => collectFeed(feed, ctx)))));
  }
  return results;
};
