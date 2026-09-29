// Celý text článku: JSON-LD articleBody, inak Readability nad DOM (linkedom). Dekódovanie znakovej sady.
import { Readability } from '@mozilla/readability';
import { parseHTML } from 'linkedom';
import { sha256Hex } from '../util';

const ENTITY: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', bdquo: '„', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', laquo: '«', raquo: '»' };

export function dekodujEntity(s: string): string {
  return s.replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
    if (e[0] === '#') {
      const code = e[1]?.toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code < 0x110000 ? String.fromCodePoint(code) : m;
    }
    return ENTITY[e.toLowerCase()] ?? m;
  });
}

/** HTML → text s odsekmi (blokové prvky = nový riadok, odseky oddelené prázdnym riadkom). */
export function htmlNaText(html: string | null | undefined): string {
  if (!html) return '';
  const s = html
    .replace(/<(script|style|noscript|iframe|svg|figure|figcaption|aside|nav|form|button)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li|blockquote|section|article|tr|pre|ul|ol|table)>/gi, '\n\n')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, ' ');
  return upravText(dekodujEntity(s));
}

/** Zjednotí medzery: v riadku jedna medzera, najviac jeden prázdny riadok medzi odsekmi. */
export function upravText(s: string): string {
  return s
    .replace(/\r/g, '')
    .replace(/[ \t\f\v  -​  　]+/g, ' ')
    .split('\n')
    .map((r) => r.trim())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Normalizácia pre hash obsahu (deduplikácia): malé písmená, bez interpunkcie a bielych znakov. */
export function normalizujPreHash(text: string): string {
  return text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

export async function obsahHash(text: string): Promise<string> {
  return sha256Hex(normalizujPreHash(text));
}

export function pocetSlov(text: string): number {
  const m = text.match(/[\p{L}\p{N}]+/gu);
  return m ? m.length : 0;
}

/** Znaková sada z Content-Type alebo z <meta charset> v prvých 2 kB; bajty → text. */
export function dekodujTelo(bytes: Uint8Array, contentType: string | null): string {
  let charset = contentType?.match(/charset=["']?([\w-]+)/i)?.[1] ?? null;
  if (!charset) {
    const hlava = new TextDecoder('latin1').decode(bytes.subarray(0, 2048));
    charset =
      hlava.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1] ??
      hlava.match(/<\?xml[^>]+encoding=["']([\w-]+)/i)?.[1] ??
      null;
  }
  try {
    return new TextDecoder(charset ?? 'utf-8').decode(bytes);
  } catch {
    return new TextDecoder('utf-8').decode(bytes);
  }
}

const TYPY_CLANKU = /^(NewsArticle|Article|ReportageNews|AnalysisNewsArticle|OpinionNewsArticle|BlogPosting|LiveBlogPosting|ReviewNewsArticle|BackgroundNewsArticle|Report|ScholarlyArticle|TechArticle)$/;

function jeClanok(o: Record<string, unknown>): boolean {
  const t = o['@type'];
  const typy = Array.isArray(t) ? t : [t];
  return typy.some((x) => typeof x === 'string' && TYPY_CLANKU.test(x));
}

function najdiClanky(node: unknown, out: Array<Record<string, unknown>>) {
  if (Array.isArray(node)) return node.forEach((n) => najdiClanky(n, out));
  if (!node || typeof node !== 'object') return;
  const o = node as Record<string, unknown>;
  if (jeClanok(o)) out.push(o);
  if (o['@graph']) najdiClanky(o['@graph'], out);
  if (o.mainEntity) najdiClanky(o.mainEntity, out);
}

/** articleBody (a autor) zo všetkých <script type="application/ld+json"> na stránke. */
export function jsonLdClanok(html: string): { text: string; autor: string | null; publikovane: string | null; platene: boolean } | null {
  const clanky: Array<Record<string, unknown>> = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      najdiClanky(JSON.parse(m[1]!.trim()), clanky);
    } catch {
      // poškodený JSON-LD sa preskočí
    }
  }
  let najlepsi: { text: string; autor: string | null; publikovane: string | null; platene: boolean } | null = null;
  // platená stena: isAccessibleForFree = false (bool alebo text) na ktoromkoľvek článku stránky
  const platene = clanky.some((c) => c.isAccessibleForFree === false || String(c.isAccessibleForFree).toLowerCase() === 'false');
  for (const c of clanky) {
    const body = typeof c.articleBody === 'string' ? c.articleBody : null;
    if (!body) continue;
    const text = /<[a-z][^>]*>/i.test(body) ? htmlNaText(body) : upravText(dekodujEntity(body));
    const a = c.author;
    const autori = (Array.isArray(a) ? a : [a])
      .map((x) => (typeof x === 'string' ? x : x && typeof x === 'object' ? (x as Record<string, unknown>).name : null))
      .filter((x): x is string => typeof x === 'string' && x.length > 0);
    const kandidat = { text, autor: autori.length ? autori.join(', ') : null, publikovane: typeof c.datePublished === 'string' ? c.datePublished : null, platene };
    if (!najlepsi || kandidat.text.length > najlepsi.text.length) najlepsi = kandidat;
  }
  return najlepsi ?? (platene ? { text: '', autor: null, publikovane: null, platene } : null);
}

export interface VytiahnutyText {
  text: string;
  metoda: 'jsonld' | 'readability';
  autor: string | null;
  titulok: string | null;
  /** stránka hlási platenú stenu (JSON-LD isAccessibleForFree = false): text je iba verejná časť */
  platene: boolean;
}

/** Minimálna dĺžka JSON-LD textu, aby sme mu verili (kratší býva iba perex alebo platená stena). */
export const JSONLD_MIN = 400;

/** Celý text zo stránky článku: JSON-LD articleBody (ak je dosť dlhý), inak Readability; dlhší z oboch. */
export function vytiahniText(html: string, url: string): VytiahnutyText | null {
  const ld = jsonLdClanok(html);
  const platene = ld?.platene ?? false;
  if (ld && ld.text.length >= JSONLD_MIN * 4) return { text: ld.text, metoda: 'jsonld', autor: ld.autor, titulok: null, platene };
  let rd: { text: string; titulok: string | null; autor: string | null } | null = null;
  try {
    const { document } = parseHTML(html);
    try {
      // linkedom nemá baseURI z adresy; Readability ho používa iba na relatívne odkazy
      Object.defineProperty(document, 'baseURI', { value: url });
    } catch {
      // nevadí
    }
    const clanok = new Readability(document as unknown as ConstructorParameters<typeof Readability>[0], { charThreshold: 300 }).parse();
    if (clanok?.content) rd = { text: htmlNaText(clanok.content), titulok: clanok.title ?? null, autor: clanok.byline ?? null };
  } catch {
    rd = null;
  }
  const ldOk = ld && ld.text.length >= JSONLD_MIN ? ld : null;
  if (ldOk && (!rd || ldOk.text.length >= rd.text.length * 0.8)) return { text: ldOk.text, metoda: 'jsonld', autor: ldOk.autor, titulok: null, platene };
  if (rd && rd.text) return { text: rd.text, metoda: 'readability', autor: rd.autor, titulok: rd.titulok, platene };
  if (ld && ld.text) return { text: ld.text, metoda: 'jsonld', autor: ld.autor, titulok: null, platene };
  return null;
}
