import type { CollectedRecord, Connector } from '../types';
import { addDays, fetchChecked, isoDate } from '../util';

/**
 * Verejné obstarávanie — TED (Tenders Electronic Daily, EÚ), anonymné Search API v3.
 * Zbiera oznámenia so slovenským verejným obstarávateľom (buyer-country=SVK): výzvy,
 * výsledky, víťazov a hodnoty. Nadlimitné zákazky; podlimitné (vestník ÚVO) nepokrýva.
 * Kurzor = posledný deň publikácie; každý beh opakuje posledné 2 dni (neskoré publikácie),
 * duplicity odfiltruje archív podľa hashu.
 */
export const TED_SEARCH = 'https://api.ted.europa.eu/v3/notices/search';
export const TED_PAGE_SIZE = 250;
export const TED_MAX_PAGES = 20;

export const TED_FIELDS = [
  'publication-number',
  'notice-title',
  'buyer-name',
  'buyer-identifier',
  'publication-date',
  'notice-type',
  'procedure-type',
  'classification-cpv',
  'total-value',
  'total-value-cur',
  'estimated-value-glo',
  'estimated-value-cur-glo',
  'winner-name',
  'winner-identifier',
  'deadline-receipt-tender-date-lot',
  'place-of-performance',
];

function lang(value: unknown, prefer = ['slk', 'eng']): string | null {
  if (!value || typeof value !== 'object') return typeof value === 'string' ? value : null;
  const obj = value as Record<string, unknown>;
  for (const key of [...prefer, ...Object.keys(obj)]) {
    const v = obj[key];
    if (typeof v === 'string') return v;
    if (Array.isArray(v) && typeof v[0] === 'string') return v.join('; ');
  }
  return null;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return [...new Set(value.map(String))];
  if (value === null || value === undefined) return [];
  return [String(value)];
}

function tedDate(value: unknown): string | null {
  const s = Array.isArray(value) ? value[0] : value;
  if (typeof s !== 'string') return null;
  const m = s.match(/^(\d{4}-\d{2}-\d{2})(?:Z|([+-]\d{2}:\d{2}))?/);
  return m ? `${m[1]}T00:00:00${m[2] ?? 'Z'}` : null;
}

export function noticeToRecord(notice: Record<string, unknown>): CollectedRecord | null {
  const number = notice['publication-number'];
  if (typeof number !== 'string') return null;
  return {
    externalId: number,
    url: `https://ted.europa.eu/sk/notice/-/detail/${number}`,
    title: lang(notice['notice-title']),
    publishedAt: tedDate(notice['publication-date']),
    data: {
      cislo_oznamenia: number,
      typ_oznamenia: notice['notice-type'] ?? null,
      typ_postupu: notice['procedure-type'] ?? null,
      obstaravatel: lang(notice['buyer-name']),
      obstaravatel_id: list(notice['buyer-identifier']),
      cpv: list(notice['classification-cpv']),
      hodnota_spolu: notice['total-value'] ?? null,
      hodnota_spolu_mena: list(notice['total-value-cur'])[0] ?? null,
      odhadovana_hodnota: notice['estimated-value-glo'] ?? null,
      odhadovana_hodnota_mena: list(notice['estimated-value-cur-glo'])[0] ?? null,
      vitaz: lang(notice['winner-name']),
      vitaz_id: list(notice['winner-identifier']),
      lehota_ponuk: list(notice['deadline-receipt-tender-date-lot']),
      miesto_plnenia: list(notice['place-of-performance']),
      xml: `https://ted.europa.eu/en/notice/${number}/xml`,
    },
  };
}

export const collectTed: Connector = async (_job, ctx) => {
  const cursor = await ctx.getCursor('svk');
  const today = isoDate(ctx.now);
  const from = cursor ? addDays(cursor, -1) : addDays(today, -7);
  const query = `buyer-country=SVK AND publication-date>=${from.replaceAll('-', '')} SORT BY publication-number`;
  const records: CollectedRecord[] = [];
  const pages: unknown[] = [];
  let latest = cursor ?? from;
  for (let page = 1; page <= TED_MAX_PAGES; page++) {
    const response = await fetchChecked(ctx, TED_SEARCH, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({ query, fields: TED_FIELDS, limit: TED_PAGE_SIZE, page, paginationMode: 'PAGE_NUMBER' }),
      timeoutMs: 60_000,
    });
    const body = (await response.json()) as { notices?: Record<string, unknown>[]; totalNoticeCount?: number };
    pages.push(body);
    const notices = body.notices ?? [];
    for (const notice of notices) {
      const record = noticeToRecord(notice);
      if (!record) continue;
      records.push(record);
      const published = record.publishedAt?.slice(0, 10);
      if (published && published > latest) latest = published;
    }
    if (notices.length < TED_PAGE_SIZE || page * TED_PAGE_SIZE >= (body.totalNoticeCount ?? 0)) break;
  }
  return [
    {
      channel: 'svk',
      records,
      raw: { body: JSON.stringify({ query, pages }), contentType: 'application/json', ext: 'json' },
      cursor: latest,
    },
  ];
};
