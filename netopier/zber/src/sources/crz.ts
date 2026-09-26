import { unzipSync } from 'fflate';
import type { CollectedRecord, Connector } from '../types';
import { addDays, bratislavaToIso, fetchChecked, isoDate } from '../util';

/**
 * Centrálny register zmlúv (crz.gov.sk) — oficiálny denný export zmlúv zverejnených
 * v daný deň: https://www.crz.gov.sk/export/YYYY-MM-DD.zip (XML v ZIP-e, vzniká po polnoci).
 * Kanál = dátum exportu. Kurzor = posledný spracovaný deň; zmeškané dni sa dobiehajú
 * po jednom (každý deň je samostatná úloha vo fronte).
 */
export const CRZ_EXPORT = 'https://www.crz.gov.sk/export';
/** Koľko dní dozadu sa najviac dobieha, keď zber vypadne. */
export const CRZ_MAX_CATCHUP_DAYS = 14;

const XML_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };

export function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&(#\d+|#x[0-9a-fA-F]+|amp|lt|gt|quot|apos);/g, (_m, e: string) => {
      if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
      return XML_ENTITIES[e]!;
    })
    .trim();
}

function fields(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/<([a-zA-Z_][\w]*)>([\s\S]*?)<\/\1>|<([a-zA-Z_][\w]*)\/>/g)) {
    if (m[3]) out[m[3]] = '';
    else out[m[1]!] = decodeXml(m[2]!);
  }
  return out;
}

function money(value: string | undefined): number | null {
  if (value === undefined || value === '') return null;
  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function day(value: string | undefined): string | null {
  return value && !value.startsWith('0000') ? value : null;
}

export interface CrzAttachment {
  id: string;
  name: string;
  file: string | null;
  size: number | null;
  url: string | null;
}

/** XML denného exportu → záznamy. Rýchly regex parser: štruktúra exportu je plochá. */
export function parseCrzExport(xml: string): CollectedRecord[] {
  const records: CollectedRecord[] = [];
  for (const m of xml.matchAll(/<zmluva>([\s\S]*?)<\/zmluva>/g)) {
    const block = m[1]!;
    const attachmentsBlock = block.match(/<prilohy>([\s\S]*?)<\/prilohy>/)?.[1] ?? '';
    const f = fields(block.replace(/<prilohy>[\s\S]*?<\/prilohy>/, ''));
    const attachments: CrzAttachment[] = [...attachmentsBlock.matchAll(/<priloha>([\s\S]*?)<\/priloha>/g)].map((a) => {
      const p = fields(a[1]!);
      const file = p.dokument1 || p.dokument || null;
      return {
        id: p.ID ?? '',
        name: p.nazov ?? '',
        file,
        size: money(p.velkost1 || p.velkost),
        url: file ? `https://www.crz.gov.sk/data/att/${file}` : null,
      };
    });
    const id = f.ID;
    if (!id) continue;
    records.push({
      externalId: id,
      url: `https://www.crz.gov.sk/${id}/`,
      title: f.predmet || f.nazov || null,
      publishedAt: bratislavaToIso(f.datum_zverejnene),
      upstreamVersion: f.chan || null,
      data: {
        cislo: f.nazov || null,
        predmet: f.predmet || null,
        popis_predmetu: f.popis_predmetu || null,
        objednavatel: f.zs1 || null,
        objednavatel_ico: f.ico1 || null,
        objednavatel_sidlo: f.sidlo1 || null,
        dodavatel: f.zs2 || null,
        dodavatel_ico: f.ico || null,
        dodavatel_sidlo: f.sidlo || null,
        suma_zmluva: money(f.suma_zmluva),
        suma_spolu: money(f.suma_spolu),
        datum_uzavretia: day(f.datum),
        datum_ucinnost: day(f.datum_ucinnost),
        datum_platnost_do: day(f.datum_platnost_do),
        datum_zverejnene: f.datum_zverejnene || null,
        rezort: f.rezort || null,
        typ: f.typ || null,
        druh: f.druh || null,
        stav: f.stav || null,
        uvo: f.uvo || null,
        poznamka: f.poznamka || null,
        zmenene: f.chan || null,
        prilohy: attachments,
      },
    });
  }
  return records;
}

/** Vyberie XML z ZIP-u exportu. */
export function unzipExport(zip: Uint8Array): string {
  const files = unzipSync(zip, { filter: (file) => file.name.endsWith('.xml') });
  const name = Object.keys(files)[0];
  if (!name) throw new Error('CRZ export neobsahuje XML');
  return new TextDecoder().decode(files[name]);
}

/** Ktorý deň spracovať: explicitný kanál, inak deň po kurzore, inak včerajšok. */
export function nextCrzDay(cursor: string | null, now: Date): string | null {
  const yesterday = addDays(isoDate(now), -1);
  if (!cursor) return yesterday;
  const earliest = addDays(yesterday, -CRZ_MAX_CATCHUP_DAYS + 1);
  const next = addDays(cursor, 1);
  if (next > yesterday) return null;
  return next < earliest ? earliest : next;
}

export const collectCrz: Connector = async (job, ctx) => {
  const cursor = await ctx.getCursor('export');
  const target = job.channel ?? nextCrzDay(cursor, ctx.now);
  if (!target) return [{ channel: 'export', records: [], cursor }];
  const response = await fetchChecked(ctx, `${CRZ_EXPORT}/${target}.zip`, { timeoutMs: 60_000 });
  const zip = new Uint8Array(await response.arrayBuffer());
  const records = parseCrzExport(unzipExport(zip));
  const yesterday = addDays(isoDate(ctx.now), -1);
  const newCursor = cursor && cursor > target ? cursor : target;
  return [
    {
      channel: 'export',
      records: records.map((r) => ({ ...r, data: { ...r.data, export_den: target } })),
      raw: { body: zip, contentType: 'application/zip', ext: 'zip' },
      cursor: newCursor,
      followUps: newCursor < yesterday ? [{ source: 'crz' }] : [],
    },
  ];
};
