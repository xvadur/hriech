// Register zdrojov pre príjem: formát zber/data/zdroje/register.json (XDR-296).
// Kým register neexistuje, príjem číta zálohu data/prijem-zaloha.json v tom istom formáte.
import mediaFeeds from '../../data/media-feeds.json';
import { OUTLET_PODLA_FAMILY } from '../derive/zdroje';

/** Jeden zdroj v registri (pole objektov v register.json). */
export interface ZdrojRegistra {
  id: string;
  nazov: string;
  typ: string;
  url_web?: string | null;
  rss?: string[] | null;
  api?: string | null;
  cely_text_v_rss?: boolean | null;
  jazyk?: string | null;
  kategoria?: string | null;
  overene_at?: string | null;
  poznamka?: string | null;
}

/** Kanál príjmu: jedna RSS/Atom URL jedného zdroja. */
export interface KanalPrijmu {
  zdrojId: string;
  feedId: string;
  url: string;
  jazyk: string | null;
  celyTextVRss: boolean;
  /** typ dokumentu, ktorý kanál dáva (clanok | minuta | tlacova_sprava | epizoda | video) */
  typDokumentu: string;
}

export type ZdrojTyp = 'medium' | 'agentura' | 'register' | 'institucia' | 'thinktank' | 'agregator';

/** Typ z registra → povolený typ v `zdroje` (pôvodný sa drží v `register_typ`). */
export function zdrojTyp(typ: string | null | undefined): ZdrojTyp {
  const t = (typ ?? '').toLowerCase();
  if (t.includes('agentur')) return 'agentura';
  if (t.includes('register')) return 'register';
  if (t.includes('think')) return 'thinktank';
  if (t.includes('agregator') || t.includes('agregátor')) return 'agregator';
  if (/(institu|urad|úrad|vlad|parlament|ministerst|samosprav|statn|štátn|strana|polici|sud|súd)/.test(t)) return 'institucia';
  return 'medium';
}

export function zdrojRozsah(z: ZdrojRegistra): 'lokalny' | 'narodny' | 'medzinarodny' {
  const k = `${z.kategoria ?? ''} ${z.typ ?? ''}`.toLowerCase();
  if (/(region|lokal|mestsk|krajsk)/.test(k)) return 'lokalny';
  if (z.jazyk && !['sk', 'cs', 'hu'].includes(z.jazyk.toLowerCase())) return 'medzinarodny';
  return 'narodny';
}

/** Typ dokumentu podľa kanála: minúta po minúte, tlačové správy inštitúcií, inak článok. */
export function typDokumentu(z: ZdrojRegistra, url: string): string {
  if (/\/minut[ay]\b|minuta-po-minute/i.test(url)) return 'minuta';
  const t = `${z.typ ?? ''} ${z.kategoria ?? ''}`.toLowerCase();
  if (/youtube\.com\/feeds|youtube/.test(`${url} ${t}`)) return 'video';
  if (/podcast/.test(t) || /(anchor\.fm|podcasts?\.|\/podcast)/i.test(url)) return 'epizoda';
  if (t.includes('tlacov') || t.includes('tlačov') || zdrojTyp(z.typ) === 'institucia') return 'tlacova_sprava';
  return 'clanok';
}

const EXISTUJUCE_KANALY = new Map((mediaFeeds.feeds as Array<{ id: string; url: string }>).map((f) => [f.url, f.id]));

/**
 * Kanály príjmu z registra. Id kanála = existujúce id z data/media-feeds.json (ak URL sedí),
 * inak id zdroja (prvý kanál) alebo `<id>_<n>`. Rovnaká URL v dvoch zdrojoch sa berie raz.
 */
export function kanalyZRegistra(register: ZdrojRegistra[]): KanalPrijmu[] {
  const out: KanalPrijmu[] = [];
  const videne = new Set<string>();
  const ids = new Set<string>();
  for (const z of register) {
    (z.rss ?? []).forEach((url, i) => {
      if (!url || videne.has(url)) return;
      videne.add(url);
      let feedId = EXISTUJUCE_KANALY.get(url) ?? (i === 0 ? z.id : `${z.id}_${i + 1}`);
      while (ids.has(feedId)) feedId = `${feedId}_`;
      ids.add(feedId);
      out.push({
        zdrojId: z.id,
        feedId,
        url,
        jazyk: z.jazyk ?? null,
        celyTextVRss: Boolean(z.cely_text_v_rss),
        typDokumentu: typDokumentu(z, url),
      });
    });
  }
  return out;
}

/** Riadok pre `zdroje` (outlet_id podľa mapy redakcií, ak ju zdroj má). */
export function zdrojRiadok(z: ZdrojRegistra) {
  return {
    id: z.id,
    nazov: z.nazov,
    typ: zdrojTyp(z.typ),
    rozsah: zdrojRozsah(z),
    krajina: !z.jazyk || z.jazyk === 'sk' ? 'SK' : null,
    jazyk: z.jazyk ?? null,
    url: z.url_web ?? null,
    outlet_id: OUTLET_PODLA_FAMILY[z.id] ?? null,
    register_typ: z.typ ?? null,
    kategoria: z.kategoria ?? null,
    api: z.api ?? null,
    cely_text_v_rss: z.cely_text_v_rss ? 1 : 0,
    overene_at: z.overene_at ?? null,
    poznamka: z.poznamka ?? null,
  };
}

/** Kontrola tvaru registra (chyby sa vrátia ako text, príjem ich zaloguje a zdroj preskočí). */
export function overRegister(data: unknown): { zdroje: ZdrojRegistra[]; chyby: string[] } {
  const chyby: string[] = [];
  if (!Array.isArray(data)) return { zdroje: [], chyby: ['register nie je pole objektov'] };
  const zdroje: ZdrojRegistra[] = [];
  const ids = new Set<string>();
  data.forEach((z, i) => {
    if (!z || typeof z !== 'object') return chyby.push(`#${i}: nie je objekt`);
    const r = z as ZdrojRegistra;
    if (!r.id || typeof r.id !== 'string') return chyby.push(`#${i}: chýba id`);
    if (ids.has(r.id)) return chyby.push(`${r.id}: duplicitné id`);
    if (!r.nazov) return chyby.push(`${r.id}: chýba nazov`);
    if (r.rss != null && !Array.isArray(r.rss)) return chyby.push(`${r.id}: rss nie je pole`);
    ids.add(r.id);
    zdroje.push({ ...r, typ: r.typ ?? 'medium' });
  });
  return { zdroje, chyby };
}

/**
 * Register má prednosť. Záloha (data/prijem-zaloha.json, kanály overené príjmom) dopĺňa:
 * - zdroje, ktoré v registri nie sú ani pod iným id s rovnakou RSS URL;
 * - RSS tam, kde ho register pri rovnakom id nemá (poznámka to hovorí).
 * Keď register (XDR-296) pokryje všetko, záloha sa zmaže.
 */
export function zlucRegister(register: ZdrojRegistra[], zaloha: ZdrojRegistra[]): ZdrojRegistra[] {
  const norm = (u: string) => u.replace(/\/+$/, '');
  const urls = new Set(register.flatMap((z) => z.rss ?? []).map(norm));
  const zalohaPodlaId = new Map(zaloha.map((z) => [z.id, z]));
  const zlucene = register.map((z) => {
    const zal = zalohaPodlaId.get(z.id);
    const doplnit = (zal?.rss ?? []).filter((u) => !urls.has(norm(u)));
    if (z.rss?.length || !doplnit.length) return z;
    doplnit.forEach((u) => urls.add(norm(u)));
    return { ...z, rss: doplnit, poznamka: [z.poznamka, `RSS doplnené zo zálohy príjmu (overené ${zal!.overene_at ?? '?'})`].filter(Boolean).join(' ') };
  });
  const ids = new Set(register.map((z) => z.id));
  const doplnene = zaloha.filter((z) => !ids.has(z.id) && !(z.rss ?? []).some((u) => urls.has(norm(u))));
  return [...zlucene, ...doplnene];
}
