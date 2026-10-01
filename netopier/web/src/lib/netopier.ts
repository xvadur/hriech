// Čítanie z data/netopier.sqlite (iba čítanie). Príjem zapisuje každých 5 min, WAL dovolí čítať počas zápisu.
import { existsSync, openSync, readSync, fstatSync, closeSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const DATA = resolve(process.env.NETOPIER_DATA ?? resolve(process.cwd(), '../data'));
const DB_CESTA = resolve(DATA, 'netopier.sqlite');
const LOG_CESTA = resolve(DATA, 'log/prijem.jsonl');

let db: DatabaseSync | null = null;
function spojenie(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_CESTA, { readOnly: true });
    db.exec('PRAGMA busy_timeout = 3000');
  }
  return db;
}

export type OblastId = 'svet' | 'europa' | 'slovensko';
export const OBLASTI: Array<{ id: OblastId; nazov: string; popis: string }> = [
  { id: 'svet', nazov: 'Svet', popis: 'agentúry, USA, Blízky východ, inštitúcie' },
  { id: 'europa', nazov: 'Európa', popis: 'európske a české redakcie' },
  { id: 'slovensko', nazov: 'Slovensko', popis: 'celoštátne a regionálne médiá' },
];

/** Oblasť zdroja: World Monitor „europe“ a české redakcie = Európa, ostatné zahraničie = Svet. */
const OBLAST_SQL = `CASE
  WHEN z.wm_category = 'europe' OR z.kategoria IN ('svet europe', 'zahranicne') THEN 'europa'
  WHEN z.rozsah = 'medzinarodny' OR z.kategoria LIKE 'svet%' THEN 'svet'
  ELSE 'slovensko' END`;

/** Čas správy: publikované, ak je rozumné (nie z budúcnosti), inak kedy ju Netopier videl. */
const CAS_SQL = `CASE WHEN d.published_at_utc IS NOT NULL AND d.published_at_utc <= d.prvy_zaznam_at
  THEN d.published_at_utc ELSE d.prvy_zaznam_at END`;

export interface Polozka {
  id: number;
  cas: string;
  zdroj: string;
  zdrojId: string;
  jazyk: string | null;
  titulok: string;
  perex: string | null;
  url: string | null;
  typ: string;
  kluce: string[];
}

export interface Tema {
  kluc: string;
  slovo: string;
  zdrojov: number;
  sprav: number;
}

export interface Oblast {
  id: OblastId;
  nazov: string;
  popis: string;
  hodiny: number[];
  /** odkedy Netopier oblasť sleduje celú (medián prvého záznamu jej zdrojov); skôr sú hodiny neúplné */
  sledujeOd: string;
  zaHodinu: number;
  priemerHodina: number;
  zdrojov24h: number;
  temy: Tema[];
  polozky: Polozka[];
}

export interface Teraz {
  generovane: string;
  prijem: { koniec: string; trvanieS: number; kanalov: number; kanalovOk: number; novych: number } | null;
  oblasti: Oblast[];
}

const iso = (d: Date) => d.toISOString();

function bezHtml(s: string | null): string | null {
  if (!s) return null;
  const t = s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
  return t || null;
}

/** Google News pridáva k titulku „ - AP News“. */
function cistyTitulok(t: string, url: string | null): string {
  const s = bezHtml(t) ?? '';
  return url && /news\.google\./.test(url) ? s.replace(/\s[-–|]\s[^-–|]{2,40}$/, '') : s;
}

// Slová bez obsahu v jazykoch, ktoré Netopier číta. Témy sa počítajú z titulkov, nie z textov.
const STOP = new Set(
  `a aj ako ale alebo ani ak až bez bol bola boli bolo byť by či do ešte ho i ich im je jeho jej k ku kde keď kto len ma má majú mal mala mali medzi mi môže na nad nie nič no o od on ona oni po pod podľa pre pred pri pričom prečo s sa si so som sú svoj sme ste tak tam tento to toho tom tu tú už v vo však z za zo že žiadny ktorý ktorá ktoré ktorí ktorého viac ešte roku rok rokov dnes včera zajtra teraz nový nová nové novú prvý prvá jeden jedna dva dve tri sme bude budú môžu mohol musí treba tiež aké aký aká takto preto teda podľa okolo
  jak jako jsou jsem není nebo než pro při před přes který která které kteří také tak ještě již už když kde být bylo byla byl bude budou může mohou svůj své jeho její jejich tom tato tento toto této proti podle kvůli roce letos
  the a an and or but of to in on at for from by with without about after before over under into out up down is are was were be been being has have had will would can could should may might must not no yes this that these those it its he she they we you his her their our your who whom which what when where why how than then there here new news says said say live update updates more most over amid after video watch latest first last year years day week
  der die das den dem des ein eine einer eines einem und oder aber nicht ist sind war waren wird werden wurde wurden hat haben mit von vom zum zur für auf aus bei nach über unter vor gegen ohne um als wie wenn dass auch noch nur schon sich sein seine ihr ihre ihren neue neuen mehr jetzt heute
  le la les un une des du de et ou mais pas est sont été avec pour par sur dans aux au ce cette ces qui que quoi plus selon après avant contre entre
  el los las una unos unas del al y o pero no es son fue con para por sobre en que como más tras ante entre según este esta estos
  il lo gli dei delle della dello degli nel nella nei sul sulla per con che non è sono era dopo prima tra fra anche più come questo questa
  i w z na do od po za przez dla nie jest są był była było się że jak oraz ale lub czy już tym tego jego jej ich który która które po przy pod nad roku
  az egy és vagy de nem is meg már még hogy ez azt mint után előtt között szerint volt lesz van lett csak
  het een en of maar niet is zijn was waren met voor door op in uit naar over na bij
  och att det som en ett är var med för på av till från om efter inte
  și în la cu de pe din pentru care este sunt după prin despre
  και για από στην στον στη στο στα στις των της του τον την που μετά είναι τους ότι με σε
  и в во на с со по за от до из к у о об что это как не но для после также при будет было были его ее их
  fost fiind într printre τώρα ελληνική όλα όσα πώς ποιος μέσα ακόμα έως
  million millions billion billions milliárd millió miliard miliardy milión milióna miliónov eur eura euro
  international government ministry minister talks says amid report reports video photos photo watch analysis opinion week weekend today
  aktuálne foto minúta správy komentár rozhovor anketa`
    .split(/\s+/)
    .filter(Boolean),
);
/** Šport podľa adresy (sport.aktuality.sk, bild.de/sport/, …) — do „čo sa deje“ nepatrí. */
const SPORT = /(^|[\/.-])(sport|sports|šport|sporty|fussball|futbal|football|calcio|deportes|spor|hokej|formel1|f1)([\/.-]|$)/i;
const SLOVO = /[\p{L}][\p{L}\p{M}'’-]*[\p{L}]/gu;

/** Kľúč slova: malé písmená, pri dlhých slovách prvých 5 znakov (Ukrajina, Ukrajiny, Ukrajine → ukraj). */
function kluc(slovo: string): string | null {
  const s = slovo.toLocaleLowerCase('sk').replace(/['’]s$/, '');
  if (s.length < 4 || STOP.has(s) || /^\p{N}+$/u.test(s)) return null;
  return s.length >= 7 ? s.slice(0, 5) : s;
}

function klucePolozky(titulok: string): string[] {
  const out = new Set<string>();
  for (const m of titulok.matchAll(SLOVO)) {
    const k = kluc(m[0]);
    if (k) out.add(k);
  }
  return [...out];
}

/** Titulok písaný Title Case (väčšina dlhších slov s veľkým písmenom) nehovorí, čo je vlastné meno. */
function titleCase(titulok: string): boolean {
  const slova = titulok.match(SLOVO)?.filter((w) => w.length >= 4) ?? [];
  return slova.length >= 3 && slova.filter((w) => /^\p{Lu}/u.test(w)).length / slova.length > 0.6;
}

/**
 * Témy: kľúče, ktoré za posledné hodiny opakuje najviac rôznych redakcií.
 * Vlastné mená (veľké písmeno uprostred vety) vážia viac než všeobecné slová;
 * v Európe pomáha, keď kľúč používa viac jazykov.
 */
function temy(polozky: Polozka[], odIso: string, minZdrojov: number, jazykyVahou: boolean): Tema[] {
  const zdroje = new Map<string, Set<string>>();
  const jazyky = new Map<string, Set<string>>();
  const pocet = new Map<string, number>();
  const vlastne = new Map<string, [number, number]>();
  const tvary = new Map<string, Map<string, number>>();
  for (const p of polozky) {
    if (p.cas < odIso) continue;
    const tc = titleCase(p.titulok);
    let i = 0;
    for (const m of p.titulok.matchAll(SLOVO)) {
      const k = kluc(m[0]);
      const prve = i++ === 0;
      if (!k) continue;
      if (!zdroje.has(k)) zdroje.set(k, new Set());
      zdroje.get(k)!.add(p.zdrojId);
      if (!jazyky.has(k)) jazyky.set(k, new Set());
      jazyky.get(k)!.add(p.jazyk ?? '?');
      if (!tc && !prve) {
        const v = vlastne.get(k) ?? [0, 0];
        v[0] += /^\p{Lu}/u.test(m[0]) ? 1 : 0;
        v[1] += 1;
        vlastne.set(k, v);
      }
      const t = tvary.get(k) ?? new Map<string, number>();
      t.set(m[0], (t.get(m[0]) ?? 0) + 1);
      tvary.set(k, t);
    }
    for (const k of p.kluce) pocet.set(k, (pocet.get(k) ?? 0) + 1);
  }
  return [...zdroje.entries()]
    .map(([k, z]) => {
      const tvar = [...(tvary.get(k) ?? new Map()).entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? k;
      const [vel, spolu] = vlastne.get(k) ?? [0, 0];
      const meno = spolu ? vel / spolu : /^\p{Lu}/u.test(tvar) ? 0.5 : 0;
      const jaz = jazyky.get(k)?.size ?? 1;
      const vaha = z.size * (0.4 + meno) * (jazykyVahou ? Math.min(3, jaz) : 1);
      return { kluc: k, slovo: tvar, zdrojov: z.size, sprav: pocet.get(k) ?? 0, vaha };
    })
    .filter((t) => t.zdrojov >= minZdrojov)
    .sort((a, b) => b.vaha - a.vaha || b.sprav - a.sprav)
    .slice(0, 14)
    .map(({ vaha: _v, ...t }) => t);
}

function poslednyBeh(): Teraz['prijem'] {
  if (!existsSync(LOG_CESTA)) return null;
  const fd = openSync(LOG_CESTA, 'r');
  try {
    const velkost = fstatSync(fd).size;
    const dlzka = Math.min(velkost, 256 * 1024);
    const buf = Buffer.alloc(dlzka);
    readSync(fd, buf, 0, dlzka, velkost - dlzka);
    const riadky = buf.toString('utf8').trim().split('\n');
    const r = JSON.parse(riadky[riadky.length - 1]!);
    return {
      koniec: r.koniec,
      trvanieS: Math.round((Date.parse(r.koniec) - Date.parse(r.zaciatok)) / 1000),
      kanalov: r.kanalov,
      kanalovOk: (r.kanalov_ok ?? 0) + (r.kanalov_304 ?? 0),
      novych: r.dokumenty_novych ?? 0,
    };
  } catch {
    return null;
  } finally {
    closeSync(fd);
  }
}

export function teraz(): Teraz {
  const d = spojenie();
  const now = new Date();
  const od24 = iso(new Date(now.getTime() - 24 * 3600_000));
  const od1 = iso(new Date(now.getTime() - 3600_000));
  const od3 = iso(new Date(now.getTime() - 3 * 3600_000));

  const riadky = d
    .prepare(
      `SELECT * FROM (
         SELECT d.id, ${CAS_SQL} AS cas, z.nazov AS zdroj, z.id AS zdroj_id, COALESCE(d.jazyk, z.jazyk) AS jazyk,
                d.titulok, d.perex, d.url, d.typ, ${OBLAST_SQL} AS oblast,
                ROW_NUMBER() OVER (PARTITION BY ${OBLAST_SQL} ORDER BY ${CAS_SQL} DESC, d.id DESC) AS poradie
         FROM dokumenty d JOIN zdroje z ON z.id = d.zdroj_id
         JOIN (SELECT zdroj_id, MIN(prvy_zaznam_at) AS p FROM dokumenty GROUP BY zdroj_id) pz ON pz.zdroj_id = d.zdroj_id
         WHERE d.prvy_zaznam_at >= ? AND d.typ IN ('clanok', 'minuta') AND d.titulok IS NOT NULL AND d.duplikat_of IS NULL
           -- správa bez dátumu z prvého behu zdroja je starý obsah kanála, nie novinka
           AND NOT (d.published_at_utc IS NULL AND d.prvy_zaznam_at < strftime('%Y-%m-%dT%H:%M:%fZ', pz.p, '+15 minutes'))
       ) WHERE cas >= ? AND poradie <= 400`,
    )
    .all(iso(new Date(now.getTime() - 72 * 3600_000)), od24) as Array<Record<string, string | number | null>>;

  const hodinove = d
    .prepare(
      `SELECT ${OBLAST_SQL} AS oblast, CAST((julianday(?) - julianday(${CAS_SQL})) * 24 AS INTEGER) AS pred,
              COUNT(*) AS n, COUNT(DISTINCT d.zdroj_id) AS z
       FROM dokumenty d JOIN zdroje z ON z.id = d.zdroj_id
       WHERE d.prvy_zaznam_at >= ? AND ${CAS_SQL} >= ? AND d.typ IN ('clanok', 'minuta') AND d.duplikat_of IS NULL
       GROUP BY 1, 2`,
    )
    .all(iso(now), iso(new Date(now.getTime() - 72 * 3600_000)), od24) as Array<{ oblast: OblastId; pred: number; n: number }>;

  const zdrojov = d
    .prepare(
      `SELECT ${OBLAST_SQL} AS oblast, COUNT(DISTINCT d.zdroj_id) AS n
       FROM dokumenty d JOIN zdroje z ON z.id = d.zdroj_id
       WHERE d.prvy_zaznam_at >= ? AND ${CAS_SQL} >= ? AND d.typ IN ('clanok', 'minuta') GROUP BY 1`,
    )
    .all(iso(new Date(now.getTime() - 72 * 3600_000)), od24) as Array<{ oblast: OblastId; n: number }>;

  const prveZaznamy = d
    .prepare(
      `SELECT ${OBLAST_SQL} AS oblast, MIN(d.prvy_zaznam_at) AS prvy
       FROM dokumenty d JOIN zdroje z ON z.id = d.zdroj_id
       WHERE d.typ IN ('clanok', 'minuta') GROUP BY z.id`,
    )
    .all() as Array<{ oblast: OblastId; prvy: string }>;
  const sledujeOd = (id: OblastId) => {
    const v = prveZaznamy.filter((r) => r.oblast === id).map((r) => r.prvy).sort();
    return v[Math.floor(v.length / 2)] ?? iso(now);
  };

  const oblasti: Oblast[] = OBLASTI.map((o) => {
    const polozky: Polozka[] = riadky
      .filter((r) => r.oblast === o.id && !SPORT.test(String(r.url ?? '')))
      .map((r) => {
        const titulok = cistyTitulok(String(r.titulok), r.url as string | null);
        const perex = bezHtml(r.perex as string | null);
        return {
          id: Number(r.id),
          cas: String(r.cas),
          zdroj: String(r.zdroj),
          zdrojId: String(r.zdroj_id),
          jazyk: (r.jazyk as string | null)?.toLowerCase() ?? null,
          titulok,
          perex: perex && perex !== titulok && !titulok.startsWith(perex.slice(0, 40)) ? perex.slice(0, 320) : null,
          url: r.url as string | null,
          typ: String(r.typ),
          kluce: klucePolozky(titulok),
        };
      });
    const hodiny = Array.from({ length: 24 }, () => 0);
    for (const h of hodinove) if (h.oblast === o.id && h.pred >= 0 && h.pred < 24) hodiny[23 - h.pred] += h.n;
    const zaHodinu = polozky.filter((p) => p.cas >= od1).length;
    const od = sledujeOd(o.id);
    // priemer iba z celých hodín, ktoré oblasť naozaj sledovala
    const plnych = Math.min(23, Math.floor((now.getTime() - Date.parse(od)) / 3600_000) - 1);
    const ukoncene = plnych > 0 ? hodiny.slice(23 - plnych, 23) : [];
    const priemerHodina = ukoncene.length >= 6 ? ukoncene.reduce((a, b) => a + b, 0) / ukoncene.length : 0;
    return {
      ...o,
      hodiny,
      sledujeOd: od,
      zaHodinu,
      priemerHodina,
      zdrojov24h: zdrojov.find((z) => z.oblast === o.id)?.n ?? 0,
      temy: temy(polozky, od3, o.id === 'slovensko' ? 3 : 2, o.id === 'europa'),
      polozky,
    };
  });

  return { generovane: iso(now), prijem: poslednyBeh(), oblasti };
}

/** Fulltext nad titulkami, perexmi a celými textmi (FTS5, bez diakritiky). */
export function hladaj(dotaz: string): Array<Polozka & { oblast: OblastId }> {
  const slova = dotaz.match(/[\p{L}\p{N}]+/gu)?.slice(0, 8) ?? [];
  if (!slova.length) return [];
  const match = slova.map((s) => `"${s}"*`).join(' ');
  const r = spojenie()
    .prepare(
      `SELECT d.id, ${CAS_SQL} AS cas, z.nazov AS zdroj, z.id AS zdroj_id, COALESCE(d.jazyk, z.jazyk) AS jazyk,
              d.titulok, d.perex, d.url, d.typ, ${OBLAST_SQL} AS oblast
       FROM dokumenty_fts f JOIN dokumenty d ON d.id = f.rowid JOIN zdroje z ON z.id = d.zdroj_id
       WHERE dokumenty_fts MATCH ? AND d.typ IN ('clanok', 'minuta', 'tlacova_sprava')
       ORDER BY cas DESC LIMIT 120`,
    )
    .all(match) as Array<Record<string, string | number | null>>;
  return r.map((x) => {
    const titulok = cistyTitulok(String(x.titulok ?? ''), x.url as string | null);
    const perex = bezHtml(x.perex as string | null);
    return {
      id: Number(x.id),
      cas: String(x.cas),
      zdroj: String(x.zdroj),
      zdrojId: String(x.zdroj_id),
      jazyk: (x.jazyk as string | null)?.toLowerCase() ?? null,
      titulok,
      perex: perex && perex !== titulok ? perex.slice(0, 320) : null,
      url: x.url as string | null,
      typ: String(x.typ),
      kluce: [],
      oblast: x.oblast as OblastId,
    };
  });
}

// ── Vydanie: udalosti napísané redaktorom (src/data/vydania/*.json) + živé počty z Netopiera ──

const VYDANIA = resolve(process.cwd(), 'src/data/vydania');

export interface Tvrdenie {
  text: string;
  zdroj: string;
}

export interface Udalost {
  id: string;
  oblast: OblastId;
  kicker: string;
  titulok: string;
  perex: string;
  vieme: Tvrdenie[];
  nevieme: string[];
  hladaj: string;
  zivo: { sprav: number; zdrojov: number; zaHodinu: number; prva: string | null; posledne: Polozka[] };
}

export interface Vydanie {
  cislo: number;
  uzavierka: string;
  autorstvo: string;
  udalosti: Udalost[];
  minuta: Polozka[];
  prijem: Teraz['prijem'];
}

function zivo(hladaj: string, now: Date): Udalost['zivo'] {
  const d = spojenie();
  const od = iso(new Date(now.getTime() - 48 * 3600_000));
  const od1 = iso(new Date(now.getTime() - 3600_000));
  try {
    const riadky = d
      .prepare(
        `SELECT d.id, ${CAS_SQL} AS cas, z.nazov AS zdroj, z.id AS zdroj_id, COALESCE(d.jazyk, z.jazyk) AS jazyk, d.titulok, d.url, d.typ
         FROM dokumenty_fts f JOIN dokumenty d ON d.id = f.rowid JOIN zdroje z ON z.id = d.zdroj_id
         WHERE dokumenty_fts MATCH ? AND d.prvy_zaznam_at >= ? AND d.typ IN ('clanok', 'minuta', 'tlacova_sprava')
         ORDER BY cas DESC`,
      )
      .all(`{titulok perex} : (${hladaj})`, od) as Array<Record<string, string | number | null>>;
    const videne = new Set<string>();
    const posledne: Polozka[] = [];
    for (const r of riadky) {
      const titulok = cistyTitulok(String(r.titulok ?? ''), r.url as string | null);
      const k = titulok.toLowerCase().slice(0, 60);
      if (!titulok || videne.has(k)) continue;
      videne.add(k);
      posledne.push({
        id: Number(r.id),
        cas: String(r.cas),
        zdroj: String(r.zdroj),
        zdrojId: String(r.zdroj_id),
        jazyk: (r.jazyk as string | null)?.toLowerCase() ?? null,
        titulok,
        perex: null,
        url: r.url as string | null,
        typ: String(r.typ),
        kluce: [],
      });
      if (posledne.length >= 4) break;
    }
    return {
      sprav: riadky.length,
      zdrojov: new Set(riadky.map((r) => r.zdroj_id)).size,
      zaHodinu: riadky.filter((r) => String(r.cas) >= od1).length,
      prva: riadky.length ? String(riadky[riadky.length - 1]!.cas) : null,
      posledne,
    };
  } catch {
    return { sprav: 0, zdrojov: 0, zaHodinu: 0, prva: null, posledne: [] };
  }
}

/** Posledné vydanie (podľa názvu súboru) so živými počtami ku každej udalosti. */
export function vydanie(): Vydanie {
  const subory = readdirSync(VYDANIA).filter((f) => f.endsWith('.json')).sort();
  const data = JSON.parse(readFileSync(resolve(VYDANIA, subory[subory.length - 1]!), 'utf8'));
  const now = new Date();
  const minuta = spojenie()
    .prepare(
      `SELECT d.id, ${CAS_SQL} AS cas, z.nazov AS zdroj, z.id AS zdroj_id, d.titulok, d.perex, d.url
       FROM dokumenty d JOIN zdroje z ON z.id = d.zdroj_id
       WHERE d.typ = 'minuta' AND d.prvy_zaznam_at >= ? ORDER BY cas DESC LIMIT 25`,
    )
    .all(iso(new Date(now.getTime() - 24 * 3600_000))) as Array<Record<string, string | number | null>>;
  return {
    cislo: data.cislo,
    uzavierka: data.uzavierka,
    autorstvo: data.autorstvo,
    udalosti: data.udalosti.map((u: Omit<Udalost, 'zivo'>) => ({ ...u, zivo: zivo(u.hladaj, now) })),
    minuta: minuta.map((r) => ({
      id: Number(r.id),
      cas: String(r.cas),
      zdroj: String(r.zdroj),
      zdrojId: String(r.zdroj_id),
      jazyk: 'sk',
      titulok: cistyTitulok(String(r.titulok ?? ''), null),
      perex: bezHtml(r.perex as string | null),
      url: r.url as string | null,
      typ: 'minuta',
      kluce: [],
    })),
    prijem: poslednyBeh(),
  };
}
