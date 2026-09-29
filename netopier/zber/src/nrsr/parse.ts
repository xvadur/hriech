// Parsery HTML stránok Národnej rady SR (www.nrsr.sk, tv.nrsr.sk) pre to, čo oficiálne JSON API (api.ts) nemá:
// hlas každého poslanca v hlasovaní, zmeny v zložení a prepisy vystúpení s videom. Čisté funkcie bez DB a siete.
// nrsr.sk je ASP.NET WebForms: HTML je stabilné (XHTML 1.0), strany výsledkov sa listujú cez postback
// (__VIEWSTATE + __EVENTTARGET + __EVENTARGUMENT=Page$N), preto tu je aj čítanie polí formulára.

import { bratislavaToIso } from '../util';

export const NRSR_BASE = 'https://www.nrsr.sk/web/';

const ENTITY: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

/** HTML entity → text. */
export function dekoduj(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITY[e.toLowerCase()] ?? m;
  });
}

/** HTML fragment → čistý text s normalizovanými medzerami. */
export function text(html: string): string {
  return dekoduj(html.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/[  ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Text s odsekmi zachovanými (pre prepisy vystúpení). */
export function textOdseky(html: string): string {
  return dekoduj(html.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, ' '))
    .replace(/[  ]/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ ?\n ?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** „6. 2. 1984“ → 1984-02-06 (nulové a neplatné → null). */
export function datumSk(s: string | null | undefined): string | null {
  const m = s?.match(/(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (!m) return null;
  return `${m[3]}-${m[2]!.padStart(2, '0')}-${m[1]!.padStart(2, '0')}`;
}

/** „16.9.2026“ + „12:31:13“ (alebo „17. 9. 2026 12:31“) → ISO 8601 UTC. */
export function casSk(datum: string, cas?: string): string | null {
  const d = datumSk(datum);
  if (!d) return null;
  const c = (cas ?? datum.match(/(\d{1,2}:\d{2}(?::\d{2})?)/)?.[1] ?? '00:00:00').trim();
  const t = /^\d{1,2}:\d{2}$/.test(c) ? `${c}:00` : c;
  const iso = bratislavaToIso(`${d} ${t.padStart(8, '0')}`);
  return iso ? new Date(iso).toISOString() : null;
}

export function mena(priezviskoMeno: string): { meno: string; priezvisko: string } {
  const i = priezviskoMeno.indexOf(',');
  if (i < 0) return { meno: '', priezvisko: priezviskoMeno.trim() };
  return { priezvisko: priezviskoMeno.slice(0, i).trim(), meno: priezviskoMeno.slice(i + 1).trim() };
}

export function celeMeno(m: { meno: string; priezvisko: string }): string {
  return `${m.meno} ${m.priezvisko}`.trim();
}

// ---------------------------------------------------------------------------------------------------------------------
// Formuláre ASP.NET a stránkovanie

/** Polia formulára pre postback: hidden, text, zvolené selecty, zaškrtnuté checkboxy a radiá. Tlačidlá nie. */
export function poliaFormulara(html: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of html.matchAll(/<input\b[^>]*>/gi)) {
    const tag = m[0];
    const name = atribut(tag, 'name');
    if (!name) continue;
    const type = (atribut(tag, 'type') ?? 'text').toLowerCase();
    if (['submit', 'button', 'image', 'reset', 'file'].includes(type)) continue;
    if ((type === 'checkbox' || type === 'radio') && !/\bchecked\b/i.test(tag)) continue;
    out[name] = dekoduj(atribut(tag, 'value') ?? '');
  }
  for (const m of html.matchAll(/<select\b[^>]*\bname="([^"]+)"[^>]*>([\s\S]*?)<\/select>/gi)) {
    const options = [...m[2]!.matchAll(/<option\b([^>]*)>/gi)];
    const chosen = options.find((o) => /\bselected\b/i.test(o[1]!)) ?? options[0];
    if (chosen) out[m[1]!] = dekoduj(atribut(`<o ${chosen[1]}>`, 'value') ?? '');
  }
  return out;
}

function atribut(tag: string, name: string): string | null {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return m ? (m[1] ?? m[2] ?? '') : null;
}

/** Strany, na ktoré vedie pager (Page$N). `Last` sa ignoruje. */
export function strankyPagera(html: string): { ciel: string; strany: number[] } | null {
  const strany = new Set<number>();
  let ciel: string | null = null;
  for (const m of html.matchAll(/__doPostBack\('([^']+)','Page\$(\d+)'\)/g)) {
    ciel = m[1]!;
    strany.add(Number(m[2]));
  }
  return ciel ? { ciel, strany: [...strany].sort((a, b) => a - b) } : null;
}

// ---------------------------------------------------------------------------------------------------------------------
// Zmeny v zložení NR SR

export interface ZmenaZlozenia {
  datum: string;
  poslanecId: number;
  cele: string;
  strana: string | null;
  druh: string;
  dovod: string | null;
}

/** Tabuľka „Zmeny v zložení NR SR“. */
export function parseZmeny(html: string): ZmenaZlozenia[] {
  const out: ZmenaZlozenia[] = [];
  for (const r of html.matchAll(/<tr class="tab_zoznam_(?:nonalt|alt)">([\s\S]*?)<\/tr>/g)) {
    const bunky = [...r[1]!.matchAll(/<td>([\s\S]*?)<\/td>/g)].map((b) => b[1]!);
    if (bunky.length < 4) continue;
    const datum = datumSk(text(bunky[0]!));
    const a = bunky[1]!.match(/PoslanecID=(\d+)[^>]*>([^<]+)<\/a>\s*(?:\(([^)]*)\))?/);
    if (!datum || !a) continue;
    const strana = a[3]?.trim();
    out.push({
      datum,
      poslanecId: Number(a[1]),
      cele: text(a[2]!),
      strana: strana && strana !== '-' ? strana : null,
      druh: text(bunky[2]!),
      dovod: text(bunky[3]!) || null,
    });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------------------------------
// Hlasovanie podľa klubov

export type Hlas = 'Z' | 'P' | '?' | 'N' | '0';

export interface HlasPoslanca {
  poslanecId: number;
  cele: string;
  hlas: Hlas;
}

export interface HlasovanieDetail {
  obdobie: number | null;
  schodza: number | null;
  cas: string | null;
  cislo: number | null;
  nazov: string;
  vysledok: string | null;
  pritomni: number | null;
  hlasujuci: number | null;
  za: number | null;
  proti: number | null;
  zdrzali: number | null;
  nehlasovali: number | null;
  nepritomni: number | null;
  kluby: Array<{ nazov: string; hlasy: HlasPoslanca[] }>;
}

function cislo(html: string, popisok: RegExp): number | null {
  const m = html.match(new RegExp(`<strong>${popisok.source}</strong>\\s*<span>\\s*(\\d+)`));
  return m ? Number(m[1]) : null;
}

function hodnota(html: string, popisok: string): string | null {
  const m = html.match(new RegExp(`<strong>${popisok}</strong>\\s*<span>([\\s\\S]*?)</span>`));
  return m ? text(m[1]!) : null;
}

/** Stránka „Hlasovanie podľa klubov“ (sid=schodze/hlasovanie/hlasklub): metadáta + hlas každého poslanca a jeho klub. */
export function parseHlasKlub(html: string): HlasovanieDetail | null {
  const nazov = hodnota(html, 'Názov hlasovania');
  if (nazov === null) return null;
  const schodzaLink = html.match(/vyhladavanie_vysledok&(?:amp;)?ZakZborID=\d+&(?:amp;)?CisObdobia=(\d+)&(?:amp;)?CisSchodze=(\d+)/);
  const cas = hodnota(html, 'Dátum a čas');
  const kluby: HlasovanieDetail['kluby'] = [];
  const telo = html.split('hpo_result_block_title').slice(1);
  for (const blok of telo) {
    const nadpis = blok.match(/^"[^>]*>([^<]*)</);
    if (!nadpis) continue;
    const hlasy: HlasPoslanca[] = [];
    for (const m of blok.matchAll(/<td>\[([ZP?N0])\]\s*<a href="[^"]*PoslanecID=(\d+)[^"]*"[^>]*>([^<]+)<\/a>/g)) {
      hlasy.push({ poslanecId: Number(m[2]), cele: text(m[3]!), hlas: m[1] as Hlas });
    }
    kluby.push({ nazov: text(nadpis[1]!), hlasy });
  }
  return {
    obdobie: schodzaLink ? Number(schodzaLink[1]) : null,
    schodza: schodzaLink ? Number(schodzaLink[2]) : null,
    cas: cas ? casSk(cas) : null,
    cislo: Number(hodnota(html, 'Číslo hlasovania')) || null,
    nazov,
    vysledok: hodnota(html, 'Výsledok hlasovania'),
    pritomni: cislo(html, /Prítomní/),
    hlasujuci: cislo(html, /Hlasujúcich/),
    za: cislo(html, /\[Z\] Za hlasovalo/),
    proti: cislo(html, /\[P\] Proti hlasovalo/),
    zdrzali: cislo(html, /\[\?\] Zdržalo sa hlasovania/),
    nehlasovali: cislo(html, /\[N\] Nehlasovalo/),
    nepritomni: cislo(html, /\[0\] Neprítomní/),
    kluby,
  };
}

// ---------------------------------------------------------------------------------------------------------------------
// Vystúpenia v rozprave

export interface Vystupenie {
  casOd: string | null;
  casDo: string | null;
  schodza: number | null;
  denPopis: string | null;
  cpt: number | null;
  recnik: string;
  funkcia: string | null;
  typ: string | null;
  upraveny: boolean;
  text: string;
  videoId: number | null;
  /** klip vystúpenia — iba ak ho nrsr.sk zobrazuje (skryté odkazy = záznam ešte nie je) */
  videoUrl: string | null;
  videoSchodzaUrl: string | null;
}

export function parseVystupenia(html: string): Vystupenie[] {
  const out: Vystupenie[] = [];
  for (const it of html.matchAll(/<div class="daily_info_item">([\s\S]*?)<div class="clear"><\/div>\s*<\/div>\s*<\/td>/g)) {
    const blok = it[1]!;
    const cas = blok.match(/daily_info_speech_header_left">([\s\S]*?)<\/span>/)?.[1];
    const stred = [...blok.matchAll(/daily_info_speech_header_middle">([\s\S]*?)<\/span>/g)].map((m) => text(m[1]!));
    const spans = [...blok.matchAll(/<span class="">([\s\S]*?)<\/span>/g)].map((m) => text(m[1]!));
    const recnik = spans[0];
    const telo = blok.match(/<div class="grid_12 alpha omega"><span>([\s\S]*?)<\/span><\/div>/)?.[1];
    if (!recnik || telo === undefined) continue;
    const dt = cas ? text(cas).match(/^(\d{1,2}\.\s*\d{1,2}\.\s*\d{4})\s+(\d{1,2}:\d{2}:\d{2})(?:\s*-\s*(\d{1,2}:\d{2}:\d{2}))?/) : null;
    const den = stred[0] ?? null;
    const schodza = den?.match(/^(\d+)\.\s*sch/)?.[1];
    const cpt = blok.match(/zakony\/cpt&(?:amp;)?ZakZborID=\d+&(?:amp;)?CisObdobia=\d+&(?:amp;)?ID=(\d+)/)?.[1];
    const klip = blok.match(/<a href='(https?:\/\/tv\.nrsr\.sk\/archiv\/schodza\/\d+\/\d+\?id=(\d+))'([^>]*)>/);
    const cely = blok.match(/<a href='(https?:\/\/tv\.nrsr\.sk\/archiv\/schodza\/\d+\/\d+)'([^>]*)>/);
    const skryty = (attrs: string | undefined) => /display\s*:\s*none/i.test(attrs ?? '');
    const typ = blok.match(/<em>([^<]*)<\/em>/)?.[1];
    const poznamka = text(blok.match(/<\/em>([\s\S]*?)<\/span>\s*<\/div>/)?.[1] ?? '');
    out.push({
      casOd: dt ? casSk(dt[1]!, dt[2]) : null,
      casDo: dt?.[3] ? casSk(dt[1]!, dt[3]) : null,
      schodza: schodza ? Number(schodza) : null,
      denPopis: den,
      cpt: cpt ? Number(cpt) : null,
      recnik,
      funkcia: (spans[2] ?? '').replace(/^-\s*/, '') || null,
      typ: typ ? text(typ) : null,
      upraveny: !/neprešiel jazykovou/.test(poznamka),
      text: textOdseky(telo),
      videoId: klip ? Number(klip[2]) : null,
      videoUrl: klip && !skryty(klip[3]) ? dekoduj(klip[1]!) : null,
      videoSchodzaUrl: cely && !skryty(cely[2]) ? dekoduj(cely[1]!) : null,
    });
  }
  return out;
}
