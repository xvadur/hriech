// Parser oficiálnych zoznamov zaregistrovaných kandidátov (jednotný vzor MV SR, § 146 ods. 2 a § 178 ods. 2
// zákona 180/2014): „1. Meno PRIEZVISKO, tituly, NN r., zamestnanie, [obec,] navrhovateľ“. Čisté funkcie bez DB a siete.
// Text z PDF (PDFKit/pdftotext) máva poradové čísla vytiahnuté pred prvé meno („1. 2. 3. Meno …“) — parser to zvláda.

export type Volba = 'predseda_kraja' | 'poslanec_kraja' | 'primator' | 'starosta' | 'poslanec_obce';

export interface Kandidat {
  poradie: number | null;
  meno: string;
  priezvisko: string;
  tituly: string | null;
  vek: number | null;
  zamestnanie: string | null;
  /** obec pobytu — uvádzajú ju iba krajské zoznamy */
  bydlisko: string | null;
  /** text navrhovateľa zo zoznamu: strany oddelené čiarkou alebo „nezávislý kandidát“ */
  navrhovatel: string;
  nezavisly: boolean;
  strany: string[];
}

export interface ParsovanyZoznam {
  /** názov volieb z hlavičky, napr. „predsedu Žilinského samosprávneho kraja“ */
  hlavicka: string | null;
  /** dátum zverejnenia zo záveru dokumentu (YYYY-MM-DD) */
  datum: string | null;
  kandidati: Kandidat[];
}

const NEZAVISLY = /^nezávisl[ýá]\s+kandidát(ka)?$/i;
const PRIEZVISKO_VELKE = /^[\p{Lu}][\p{Lu}'’-]+$/u;

/** „Anna BELOUSOVOVÁ“ → meno + priezvisko; veľké písmená priezviska sa prevedú na prvé veľké. */
export function rozdelMeno(cele: string): { meno: string; priezvisko: string } {
  const casti = cele.trim().split(/\s+/);
  const velke = casti.map((c, i) => (i > 0 && PRIEZVISKO_VELKE.test(c) ? i : -1)).filter((i) => i >= 0);
  const hranica = velke.length > 0 ? velke[0]! : Math.max(1, casti.length - 1);
  const meno = casti.slice(0, hranica).join(' ');
  const priezvisko = casti
    .slice(hranica)
    .map((c) => (PRIEZVISKO_VELKE.test(c) ? c.charAt(0) + c.slice(1).toLocaleLowerCase('sk') : c))
    .join(' ');
  return { meno, priezvisko };
}

/** Kanonické id strany podľa názvu zo zoznamu (rôzne zápisy: „Kdh - kresťanskodemokratické hnutie“, „KDH“). */
export const STRANY: Array<{ id: string; nazov: string; skratka: string | null; parlamentna: boolean; vzor: RegExp }> = [
  { id: 'smer', nazov: 'Smer – sociálna demokracia', skratka: 'Smer-SD', parlamentna: true, vzor: /\bsmer\b/i },
  { id: 'hlas', nazov: 'Hlas – sociálna demokracia', skratka: 'Hlas-SD', parlamentna: true, vzor: /\bhlas\b/i },
  { id: 'sns', nazov: 'Slovenská národná strana', skratka: 'SNS', parlamentna: true, vzor: /slovenská národná strana|^sns$/i },
  { id: 'ps', nazov: 'Progresívne Slovensko', skratka: 'PS', parlamentna: true, vzor: /progresívne slovensko|^ps$/i },
  { id: 'sas', nazov: 'Sloboda a solidarita', skratka: 'SaS', parlamentna: true, vzor: /sloboda a solidarita|^sas$/i },
  { id: 'kdh', nazov: 'Kresťanskodemokratické hnutie', skratka: 'KDH', parlamentna: true, vzor: /\bkdh\b|kresťanskodemokratické hnutie|křesťanskodemokratické/i },
  { id: 'hnutie-slovensko', nazov: 'Hnutie Slovensko', skratka: null, parlamentna: true, vzor: /hnutie slovensko|oľano|olano/i },
  { id: 'republika', nazov: 'Republika', skratka: null, parlamentna: false, vzor: /^republika$/i },
  { id: 'demokrati', nazov: 'Demokrati', skratka: null, parlamentna: false, vzor: /^demokrati$/i },
  { id: 'za-ludi', nazov: 'Za ľudí', skratka: null, parlamentna: true, vzor: /^za ľudí$/i },
  { id: 'ku', nazov: 'Konzervatívci – Kresťanská únia', skratka: 'KÚ', parlamentna: true, vzor: /kresťanská únia|konzervatívci/i },
  { id: 'nova', nazov: 'NOVA', skratka: null, parlamentna: false, vzor: /^nova$/i },
  { id: 'oks', nazov: 'Občianska konzervatívna strana', skratka: 'OKS', parlamentna: false, vzor: /občianska konzervatívna strana|^oks$/i },
  { id: 'ds-ods', nazov: 'Demokratická strana – Občianski demokrati Slovenska', skratka: 'DS-ODS', parlamentna: false, vzor: /demokratická strana|občianski demokrati slovenska/i },
  { id: 'sme-rodina', nazov: 'Sme rodina', skratka: null, parlamentna: false, vzor: /sme rodina/i },
  { id: 'kss', nazov: 'Komunistická strana Slovenska', skratka: 'KSS', parlamentna: false, vzor: /komunistická strana|^kss$/i },
  { id: 'lsns', nazov: 'Kotlebovci – Ľudová strana Naše Slovensko', skratka: 'ĽSNS', parlamentna: false, vzor: /kotlebovci|ľsns|naše slovensko/i },
  { id: 'slovexit', nazov: 'SLOVEXIT', skratka: null, parlamentna: false, vzor: /slovexit/i },
  { id: 'jednota-slovanov', nazov: 'Jednota Slovanov', skratka: null, parlamentna: false, vzor: /jednota slovanov/i },
  { id: 'pravo-na-pravdu', nazov: 'Právo na pravdu', skratka: null, parlamentna: false, vzor: /právo na pravdu/i },
  { id: 'sanik', nazov: 'Starostovia a nezávislí kandidáti', skratka: 'SaNK', parlamentna: false, vzor: /starostovia a nezávislí/i },
  { id: 'madarska-aliancia', nazov: 'Maďarská aliancia', skratka: null, parlamentna: false, vzor: /maďarská aliancia|magyar szövetség/i },
  { id: 'madarske-forum', nazov: 'Maďarské fórum', skratka: null, parlamentna: false, vzor: /maďarské fórum/i },
  { id: 'bratia-slovenska', nazov: 'Bratia Slovenska', skratka: null, parlamentna: false, vzor: /bratia slovenska/i },
  { id: 'strana-vidieka', nazov: 'Strana vidieka', skratka: null, parlamentna: false, vzor: /strana vidieka/i },
  { id: 'domov-ns', nazov: 'Domov – národná strana', skratka: null, parlamentna: false, vzor: /domov národná strana|domov - národná/i },
  { id: 'sho', nazov: 'Slovenské hnutie obrody', skratka: 'SHO', parlamentna: false, vzor: /slovenské hnutie obrody/i },
  { id: 'vlastenecky-blok', nazov: 'Vlastenecký blok', skratka: null, parlamentna: false, vzor: /vlastenecký blok/i },
  { id: 'alternativa', nazov: 'Alternatíva pre Slovensko', skratka: null, parlamentna: false, vzor: /alternatíva pre slovensko/i },
  { id: 'spolocne-obcania', nazov: 'Spoločne občania Slovenska', skratka: null, parlamentna: false, vzor: /spoločne občania/i },
  { id: 'srk', nazov: 'Strana rómskej koalície', skratka: 'SRK', parlamentna: false, vzor: /rómskej koalície/i },
  { id: 'kosicka-strana', nazov: 'Košická strana', skratka: null, parlamentna: false, vzor: /košická strana/i },
  { id: 'tim-kosice', nazov: 'Tím Košice', skratka: null, parlamentna: false, vzor: /tím košice/i },
  { id: 'tim-kraj-nitra', nazov: 'Tím kraj Nitra', skratka: null, parlamentna: false, vzor: /tím kraj nitra/i },
  { id: 'team-bratislava', nazov: 'Team Bratislava', skratka: null, parlamentna: false, vzor: /team bratislava/i },
  { id: 'trnava-pre-kazdeho', nazov: 'Trnava pre každého', skratka: null, parlamentna: false, vzor: /trnava pre každého/i },
  { id: 'dunaj', nazov: 'Dunaj', skratka: null, parlamentna: false, vzor: /^dunaj$/i },
  { id: 'pirati', nazov: 'Pirátska strana – Slovensko', skratka: null, parlamentna: false, vzor: /pirát/i },
  { id: 'myslovensko', nazov: 'MySlovensko', skratka: null, parlamentna: false, vzor: /myslovensko/i },
  { id: 'narodna-koalicia', nazov: 'Národná koalícia / Nezávislí kandidáti', skratka: null, parlamentna: false, vzor: /národná koalícia/i },
];

export function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Názov strany zo zoznamu → kanonické id (neznáme → slug názvu). */
export function stranaId(nazov: string): string {
  const n = nazov.trim();
  for (const s of STRANY) if (s.vzor.test(n)) return s.id;
  return slug(n);
}

/** Rozdelí navrhovateľa na strany; nezávislý → prázdne pole. */
export function stranyZNavrhovatela(navrhovatel: string): string[] {
  if (NEZAVISLY.test(navrhovatel.trim())) return [];
  return navrhovatel
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map(stranaId);
}

const MENO = String.raw`[\p{Lu}][\p{L}'’.-]*(?:\s[\p{L}'’.-]+){1,3}`;
const TITUL = String.raw`(?:[^,\n]{1,14},\s*){0,6}?`;
/** Riadok, ktorým začína kandidát: [číslo.] Meno PRIEZVISKO, [tituly,] NN r., … — pokračovacie riadky koalícií vek nemajú. */
const ZACIATOK = new RegExp(String.raw`^\s*(?:\d+\s*\.\s*)*(${MENO}),\s*(${TITUL})(\d{2,3})\s*r\.,\s*(.*)$`, 'u');
const DATUM = /(?:^|\n)\s*(?:V\s+)?[\p{Lu}][\p{L} .-]*,?\s+(?:[Dd]átum:\s*)?(\d{1,2})\.\s?(\d{1,2})\.\s?(\d{4})/u;
const KONIEC = /(?:^|\n)\s*(?:(?:V\s+)?[\p{Lu}][\p{L} .-]*,?\s+(?:[Dd]átum:\s*)?\d{1,2}\.\s?\d{1,2}\.\s?\d{4}|Dátum:|predsed[a-z]* volebnej komisie|podpredsed)/u;

/** Text zoznamu → kandidáti. Zvládne poradové čísla inline aj vytiahnuté pred prvé meno; obec (krajské zoznamy) rozpozná podľa polohy. */
export function parseZoznam(text: string, opts: { sObcou?: boolean } = {}): ParsovanyZoznam {
  const hlavicka = text.match(/pre voľby\s+([^\n]+?)\s*(?:\n|24\. októbra)/u)?.[1]?.trim() ?? null;
  const dm = text.match(DATUM);
  const datum = dm ? `${dm[3]}-${dm[2]!.padStart(2, '0')}-${dm[1]!.padStart(2, '0')}` : null;

  const zaciatok = text.search(/zoznam kandidátov[^:]*:|Kandidáti:/u);
  let telo = zaciatok >= 0 ? text.slice(text.indexOf(':', zaciatok) + 1) : text;
  const koniec = telo.search(KONIEC);
  if (koniec >= 0) telo = telo.slice(0, koniec);

  // riadok s vekom začína kandidáta; ostatné riadky sú pokračovanie navrhovateľa
  const zaznamy: string[] = [];
  for (const riadok of telo.split('\n')) {
    const r = riadok.trim();
    if (!r) continue;
    if (ZACIATOK.test(r)) zaznamy.push(r);
    else if (zaznamy.length > 0) zaznamy[zaznamy.length - 1] += ` ${r}`;
  }

  const sObcou = opts.sObcou ?? /predsed|zastupiteľstv[a-z]* [\p{L}]+ samosprávneho kraja/u.test(hlavicka ?? '');
  const kandidati: Kandidat[] = [];
  for (const zaznam of zaznamy) {
    const m = zaznam.replace(/\s+/g, ' ').match(ZACIATOK);
    if (!m) continue;
    const { meno, priezvisko } = rozdelMeno(m[1]!);
    const tituly = m[2]!.replace(/,\s*$/, '').trim() || null;
    const polia = m[4]!.split(',').map((s) => s.trim()).filter(Boolean);
    let navrhovatel: string;
    let zamestnanie: string | null = null;
    let bydlisko: string | null = null;
    const nezIdx = polia.findIndex((p) => NEZAVISLY.test(p));
    if (nezIdx >= 0) {
      navrhovatel = polia[nezIdx]!;
      const pred = polia.slice(0, nezIdx);
      if (sObcou && pred.length >= 2) bydlisko = pred.pop()!;
      zamestnanie = pred.join(', ') || null;
    } else {
      // zamestnanie: prvé pole a ďalšie polia písané malým písmenom; potom obec (krajské zoznamy); zvyšok strany
      let i = 1;
      while (i < polia.length && /^[\p{Ll}]/u.test(polia[i]!)) i++;
      zamestnanie = polia.slice(0, i).join(', ') || null;
      let strany = polia.slice(i);
      if (sObcou && strany.length >= 2 && stranaId(strany[0]!) === slug(strany[0]!)) {
        bydlisko = strany[0]!;
        strany = strany.slice(1);
      }
      navrhovatel = strany.join(', ');
    }
    kandidati.push({
      poradie: kandidati.length + 1,
      meno,
      priezvisko,
      tituly,
      vek: Number(m[3]),
      zamestnanie,
      bydlisko,
      navrhovatel,
      nezavisly: NEZAVISLY.test(navrhovatel),
      strany: stranyZNavrhovatela(navrhovatel),
    });
  }
  return { hlavicka, datum, kandidati };
}

/** Id kandidatúry: volba + územie + meno (stabilné medzi behmi, rovnaké pre média aj oficiálny zoznam). */
export function kandidatId(volba: Volba, uzemie: string, meno: string, priezvisko: string): string {
  return `${volba}:${uzemie}:${slug(`${meno} ${priezvisko}`)}`;
}
