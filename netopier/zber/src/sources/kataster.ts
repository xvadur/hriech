import areasConfig from '../../data/kataster-oblasti.json';
import type { ChannelResult, CollectedRecord, Connector } from '../types';
import { errorMessage, fetchChecked, sha256Hex } from '../util';

/**
 * Kataster — parcely registra C z otvorenej INSPIRE WFS služby ÚGKK SR
 * (inspirews.skgeodesy.sk, vrstva CP.CadastralParcel). Sleduje zvolené oblasti:
 * číslo parcely, výmeru, platnosť, verziu a geometriu. Zmena verzie alebo geometrie
 * vytvorí v archíve novú verziu záznamu. Vlastníci (list vlastníctva) otvorené dáta
 * nie sú a konektor ich nezbiera.
 */
export const KATASTER_WFS = 'https://inspirews.skgeodesy.sk/geoserver/cp/ows';
export const KATASTER_PAGE_SIZE = 1000;

export interface Area {
  id: string;
  name: string;
  bbox: number[];
}

export const AREAS: Area[] = areasConfig.areas;

export function wfsUrl(area: Area, startIndex: number): string {
  const params = new URLSearchParams({
    service: 'WFS',
    version: '2.0.0',
    request: 'GetFeature',
    typeNames: 'cp:CP.CadastralParcel',
    outputFormat: 'application/json',
    count: String(KATASTER_PAGE_SIZE),
    startIndex: String(startIndex),
    sortBy: 'nationalCadastralReference',
    bbox: `${area.bbox.join(',')},urn:ogc:def:crs:OGC:1.3:CRS84`,
  });
  return `${KATASTER_WFS}?${params}`;
}

function nil(value: unknown): unknown {
  return value && typeof value === 'object' && '@nil' in (value as object) ? null : value;
}

export async function parcelToRecord(area: Area, feature: any): Promise<CollectedRecord | null> {
  const p = feature?.properties ?? {};
  const reference: string | undefined = p.nationalCadastralReference ?? p.inspireId?.localId;
  if (!reference) return null;
  const point = p.referencePoint?.coordinates as [number, number] | undefined;
  const geometry = feature.geometry ?? null;
  return {
    externalId: reference,
    url: point ? `https://zbgis.skgeodesy.sk/mkzbgis/sk/kataster?pos=${point[1]},${point[0]},19` : null,
    title: `Parcela ${p.label ?? reference}`,
    publishedAt: (nil(p.validFrom) as string | null) ?? null,
    upstreamVersion: p.inspireId?.versionId ?? null,
    data: {
      oblast: area.id,
      parcela: p.label ?? null,
      register: reference.split('.').pop() ?? null,
      katastralne_uzemie: reference.split('_')[0] ?? null,
      vymera_m2: p.areaValue?.value ?? null,
      platne_od: nil(p.validFrom),
      platne_do: nil(p.validTo),
      verzia: p.inspireId?.versionId ?? null,
      referencny_bod: point ?? null,
      geometria_hash: geometry ? await sha256Hex(JSON.stringify(geometry)) : null,
      geometria: geometry,
    },
  };
}

export const collectKataster: Connector = async (job, ctx) => {
  const areas = job.channel ? AREAS.filter((a) => a.id === job.channel) : AREAS;
  const results: ChannelResult[] = [];
  for (const area of areas) {
    try {
      const records: CollectedRecord[] = [];
      const pages: string[] = [];
      for (let start = 0; start < 50_000; start += KATASTER_PAGE_SIZE) {
        const response = await fetchChecked(ctx, wfsUrl(area, start), { timeoutMs: 60_000 });
        const body = await response.text();
        pages.push(body);
        const collection = JSON.parse(body) as { features?: unknown[] };
        const features = collection.features ?? [];
        for (const feature of features) {
          const record = await parcelToRecord(area, feature);
          if (record) records.push(record);
        }
        if (features.length < KATASTER_PAGE_SIZE) break;
      }
      results.push({
        channel: area.id,
        records,
        raw: { body: `[${pages.join(',')}]`, contentType: 'application/json', ext: 'json' },
      });
    } catch (error) {
      results.push({ channel: area.id, records: [], error: errorMessage(error) });
    }
  }
  return results;
};
