import watched from '../../data/statistika-datasety.json';
import type { ChannelResult, CollectContext, CollectedRecord, Connector } from '../types';
import { errorMessage, fetchChecked } from '../util';

/**
 * Štátne dáta — Štatistický úrad SR, DATAcube API v2 (data.statistics.sk, JSON-stat).
 * Kanál `katalog`: celý zoznam datasetov s dátumom aktualizácie (nová verzia záznamu =
 * ŠÚ SR dataset aktualizoval). Sledované datasety (data/statistika-datasety.json) sa
 * sťahujú celé, keď sa ich dátum aktualizácie zmení.
 */
export const DATACUBE = 'https://data.statistics.sk/api/v2';
/** Väčší JSON-stat ostane iba v R2, do D1 ide súhrn. */
export const MAX_INLINE_JSONSTAT = 1_000_000;

export const WATCHED: { code: string; name: string }[] = watched.datasets;

export interface CatalogEntry {
  code: string;
  label: string;
  update: string | null;
  href: string;
  dimensions: string[];
}

export function parseCatalog(collection: any): CatalogEntry[] {
  const items: any[] = collection?.link?.item ?? [];
  return items
    .filter((item) => item.class === 'dataset' && typeof item.href === 'string')
    .map((item) => {
      const path = new URL(item.href).pathname.split('/').filter(Boolean);
      const at = path.indexOf('dataset');
      const code = path[at + 1] ?? '';
      return {
        code,
        label: item.label ?? code,
        update: item.update ?? null,
        href: item.href,
        dimensions: path.slice(at + 2),
      };
    })
    .filter((entry) => entry.code);
}

export function dataUrl(entry: CatalogEntry): string {
  const all = entry.dimensions.map(() => 'all').join('/');
  return `${DATACUBE}/dataset/${entry.code}/${all}?lang=sk`;
}

function catalogRecord(entry: CatalogEntry): CollectedRecord {
  return {
    externalId: `katalog:${entry.code}`,
    url: entry.href,
    title: entry.label,
    publishedAt: entry.update,
    upstreamVersion: entry.update,
    data: { ...entry },
  };
}

async function collectDataset(entry: CatalogEntry, ctx: CollectContext): Promise<ChannelResult> {
  const channel = entry.code;
  try {
    const url = dataUrl(entry);
    const response = await fetchChecked(ctx, url, { timeoutMs: 60_000 });
    const body = await response.text();
    const jsonstat = JSON.parse(body) as { label?: string; update?: string; id?: string[]; size?: number[]; dimension?: Record<string, any> };
    const dimensions = Object.fromEntries(
      (jsonstat.id ?? []).map((id) => [id, { note: jsonstat.dimension?.[id]?.note ?? null, values: Object.keys(jsonstat.dimension?.[id]?.category?.index ?? {}).length }]),
    );
    return {
      channel,
      cursor: entry.update,
      raw: { body, contentType: 'application/json', ext: 'json' },
      records: [
        {
          externalId: `dataset:${entry.code}`,
          url,
          title: jsonstat.label ?? entry.label,
          publishedAt: entry.update,
          upstreamVersion: entry.update,
          data: {
            code: entry.code,
            label: jsonstat.label ?? entry.label,
            update: entry.update,
            size: jsonstat.size ?? null,
            dimensions,
            jsonstat: body.length <= MAX_INLINE_JSONSTAT ? jsonstat : null,
            jsonstat_bytes: body.length,
          },
        },
      ],
    };
  } catch (error) {
    return { channel, records: [], error: errorMessage(error) };
  }
}

export const collectStatistika: Connector = async (job, ctx) => {
  const response = await fetchChecked(ctx, `${DATACUBE}/collection?lang=sk`, { timeoutMs: 60_000 });
  const body = await response.text();
  const catalog = parseCatalog(JSON.parse(body));
  const results: ChannelResult[] = [
    { channel: 'katalog', records: catalog.map(catalogRecord), raw: { body, contentType: 'application/json', ext: 'json' } },
  ];
  const targets = job.channel ? WATCHED.filter((w) => w.code === job.channel) : WATCHED;
  for (const target of targets) {
    const entry = catalog.find((e) => e.code === target.code);
    if (!entry) {
      results.push({ channel: target.code, records: [], error: `Dataset ${target.code} v katalógu ŠÚ SR chýba` });
      continue;
    }
    const cursor = await ctx.getCursor(target.code);
    if (!job.channel && cursor && cursor === entry.update) continue;
    results.push(await collectDataset(entry, ctx));
  }
  return results;
};
