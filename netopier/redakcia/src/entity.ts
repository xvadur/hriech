// Entity z registrov: IČO z CRZ a TED → riadky entity + record_entity.
// CRZ strany sa vedú ako strana_a (objednávateľ v exporte) a strana_b (dodávateľ),
// kým sa sémantika exportu neoverí (návrh architektúry, V1). Fyzické osoby bez IČO
// sa nezakladajú (D14: mená fyzických osôb verejne nikdy).

export type DruhEntity = 'statny_organ' | 'obec' | 'firma' | 'fyzicka_osoba' | 'neznamy';
export type RolaEntity = 'strana_a' | 'strana_b' | 'objednavatel' | 'dodavatel' | 'obstaravatel' | 'vitaz' | 'akter' | 'zmienka';

export interface Entita {
  id: string;
  druh: DruhEntity;
  nazov: string;
  ico: string | null;
}

export interface VazbaEntity {
  entita: Entita;
  rola: RolaEntity;
}

/** IČO: iba číslice, doplnené na 8 miest; neplatné → null. */
export function normalizujIco(value: unknown): string | null {
  if (value == null) return null;
  const digits = String(value).replace(/\D/g, '');
  if (!digits || digits.length > 8 || /^0+$/.test(digits)) return null;
  return digits.padStart(8, '0');
}

const FIRMA = ['s. r. o.', 's.r.o.', 's.r.o', 'a. s.', 'a.s.', 'a.s', 'š. p.', 'š.p.', 'štátny podnik', 'n. o.', 'n.o.', 'o. z.', 'o.z.', 'k. s.', 'k.s.', 'v. o. s.', 'v.o.s.', 'družstvo', 'spol.', 'holding'];
const OBEC = ['obec ', 'mesto ', 'mestská časť ', 'mestska cast '];
const STATNY = [
  'ministerstvo', 'úrad', 'urad', 'štátn', 'statn', 'národn', 'narodn', 'univerzita', 'nemocnica', 'škola', 'skola', 'riaditeľstvo', 'riaditelstvo',
  'inšpekcia', 'inspekcia', 'správa', 'sprava', 'kancelária', 'kancelaria', 'prokuratúra', 'prokuratura', 'súd', 'sud', 'polícia', 'policia',
  'agentúra', 'agentura', 'fond', 'slovenská republika', 'slovenska republika', 'samosprávny kraj', 'samospravny kraj',
];

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Slovo zo zoznamu na začiatku slova v texte (bez ohľadu na veľkosť písmen, s diakritikou). */
function obsahuje(text: string, zoznam: readonly string[], naZaciatku = false): boolean {
  const lower = text.toLowerCase();
  return zoznam.some((slovo) => new RegExp(`${naZaciatku ? '^' : '(?<!\\p{L})'}${escapeRegex(slovo)}`, 'u').test(lower));
}

/** Druh entity z názvu (heuristika; ručná oprava v termináli). */
export function druhZNazvu(nazov: string): DruhEntity {
  if (!nazov) return 'neznamy';
  if (obsahuje(nazov, OBEC, true)) return 'obec';
  if (obsahuje(nazov, FIRMA)) return 'firma';
  if (obsahuje(nazov, STATNY)) return 'statny_organ';
  return 'neznamy';
}

function entita(ico: string, nazov: unknown): Entita {
  const meno = typeof nazov === 'string' && nazov.trim() ? nazov.trim() : `IČO ${ico}`;
  return { id: `ico:${ico}`, druh: druhZNazvu(meno), nazov: meno, ico };
}

/** Väzby entít z jedného záznamu podľa zdroja; iné zdroje → []. */
export function entityZoZaznamu(source: string, data: Record<string, unknown>): VazbaEntity[] {
  const out: VazbaEntity[] = [];
  if (source === 'crz') {
    const a = normalizujIco(data.objednavatel_ico);
    const b = normalizujIco(data.dodavatel_ico);
    if (a) out.push({ entita: entita(a, data.objednavatel), rola: 'strana_a' });
    if (b) out.push({ entita: entita(b, data.dodavatel), rola: 'strana_b' });
  } else if (source === 'ted') {
    const ids = Array.isArray(data.obstaravatel_id) ? data.obstaravatel_id : [];
    const o = ids.map(normalizujIco).find((x): x is string => x !== null);
    if (o) out.push({ entita: entita(o, data.obstaravatel), rola: 'obstaravatel' });
    const vitazi = Array.isArray(data.vitaz_id) ? data.vitaz_id : [];
    const mena = Array.isArray(data.vitaz) ? data.vitaz : typeof data.vitaz === 'string' ? [data.vitaz] : [];
    vitazi.forEach((v, i) => {
      const ico = normalizujIco(v);
      if (ico && ico !== o) out.push({ entita: entita(ico, mena[i] ?? mena[0]), rola: 'vitaz' });
    });
  }
  return out;
}
