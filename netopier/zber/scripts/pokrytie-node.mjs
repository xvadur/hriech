#!/usr/bin/env node
// Pokrytie príbehov (vzor Ground News): články slovenských médií za posledných N dní spojené do príbehov
// klastrovaním tém (src/temy), pri každom príbehu kto o ňom písal, podiel skupín médií podľa kategórie
// v registri (hlavný prúd, agentúry, alternatívne), kto bol prvý a slepé miesta (príbeh, o ktorom mlčí
// celá jedna skupina). Nečíta, čo je v článkoch, iba kto o čom písal a kedy. Iba čítanie databázy.
// Výstup: netopier/data/pokrytie/<den>.json (mimo gitu).
// Použitie:
//   node scripts/pokrytie-node.mjs              # posledných 7 dní k teraz
//   node scripts/pokrytie-node.mjs --dni 3
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { build } from 'esbuild';
import { DB_CESTA } from './lib/db.mjs';

const args = process.argv.slice(2);
const hodnota = (meno) => {
  const i = args.indexOf(meno);
  return i >= 0 ? args[i + 1] : undefined;
};
const DNI = Number(hodnota('--dni') ?? 7);

const zber = new URL('../', import.meta.url).pathname;
const outfile = join(zber, '.wrangler/tmp/pokrytie-temy.mjs');
await build({ entryPoints: [join(zber, 'src/temy/index.ts')], bundle: true, format: 'esm', platform: 'node', outfile, logLevel: 'warning' });
const { vektory, klastruj, klucoveSlova, casDokumentu, rodinaZdroja, kmen, tokenyTemy, POLITIKA_TEM } = await import(outfile);

// Skupiny podľa kategórie zdroja v registri (zber/data/zdroje/register.json), nie podľa nášho hodnotenia.
export const SKUPINY = {
  hlavny: { nazov: 'Hlavný prúd', kategorie: ['celostatne', 'celoštátne spravodajstvo', 'ekonomicke', 'ekonomika', 'nazorove', 'tyzdennik', 'bulvar', 'tv', 'radio'] },
  agentury: { nazov: 'Agentúry', kategorie: ['agentury'] },
  alternativne: { nazov: 'Alternatívne', kategorie: ['alternativne', 'alternatívne médium'] },
};
const skupinaKategorie = new Map(Object.entries(SKUPINY).flatMap(([id, s]) => s.kategorie.map((k) => [k, id])));

const db = new DatabaseSync(DB_CESTA, { readOnly: true });
const teraz = Date.now();
const odMs = teraz - DNI * 86400_000;
const od = new Date(odMs - 3600_000).toISOString();

const riadky = db
  .prepare(
    `SELECT d.id, d.zdroj_id, d.titulok, d.perex, d.url, d.published_at_utc, d.prvy_zaznam_at,
            substr(t.text, 1, ?) AS zac, z.nazov AS zdroj, z.kategoria
     FROM dokumenty d JOIN zdroje z ON z.id = d.zdroj_id LEFT JOIN dokument_texty t ON t.dokument_id = d.id
     WHERE d.typ IN (SELECT value FROM json_each(?)) AND z.jazyk = 'sk'
       AND z.kategoria IN (SELECT value FROM json_each(?))
       AND (d.published_at_utc >= ? OR d.prvy_zaznam_at >= ?)`,
  )
  .all(POLITIKA_TEM.text_znakov, JSON.stringify(POLITIKA_TEM.typy), JSON.stringify([...skupinaKategorie.keys()]), od, od)
  .map((r) => ({ ...r, cas: casDokumentu(r.published_at_utc, r.prvy_zaznam_at) }))
  .filter((r) => r.cas >= odMs && r.cas <= teraz && (r.titulok || r.perex));

// Spoľahlivosť času zverejnenia po zdrojoch: niektoré posielajú iba dátum (Pluska, Život), iné čas posunutý
// (Parlamentné listy o 2 h skôr, Webnoviny neskôr než ich Netopier videl). Meria sa na článkoch od štartu služby
// príjmu (každých 5 min), kde prvý záznam je blízko skutočného zverejnenia.
const START_SLUZBY = Date.parse('2026-09-30T00:00:00Z');
const median = (a) => { const b = [...a].sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; };
const casy = new Map();
for (const r of riadky) {
  const P = Date.parse(r.prvy_zaznam_at);
  const S = r.published_at_utc ? Date.parse(r.published_at_utc) : NaN;
  if (Number.isNaN(S) || P < START_SLUZBY) continue;
  const c = casy.get(r.zdroj_id) ?? { oneskorenie: [], celeHodiny: 0, n: 0 };
  c.oneskorenie.push((P - S) / 60000);
  if (r.published_at_utc.slice(14, 16) === '00') c.celeHodiny++;
  c.n++;
  casy.set(r.zdroj_id, c);
}
const nespolahlivyCas = new Set(
  [...casy].filter(([, c]) => c.n >= 5 && (median(c.oneskorenie) > 45 || median(c.oneskorenie) < -5 || c.celeHodiny / c.n > 0.6)).map(([z]) => z),
);
// čas na poradie „kto bol prvý“: čas zverejnenia (nie neskôr než prvý záznam), pri nespoľahlivom zdroji prvý záznam
for (const r of riadky) {
  const P = Date.parse(r.prvy_zaznam_at);
  const S = r.published_at_utc ? Date.parse(r.published_at_utc) : NaN;
  r.casPrvy = nespolahlivyCas.has(r.zdroj_id) || Number.isNaN(S) ? P : Math.min(S, P);
}

const podlaId = new Map(riadky.map((r) => [r.id, r]));
const docs = riadky.map((r) => ({ id: r.id, cas: r.cas, titulok: r.titulok, perex: r.perex, text: r.zac }));
const { vektory: vekt, tvary } = vektory(docs);
const zhluky = klastruj(docs, vekt);

// médium = rodina zdroja (TASR a Teraz.sk, HN a HNonline sú jedno médium)
const medium = (r) => rodinaZdroja(r.zdroj_id, null);
const nazovMedia = new Map();
for (const r of riadky) if (!nazovMedia.has(medium(r)) || r.zdroj_id === medium(r)) nazovMedia.set(medium(r), r.zdroj);
const skupinaMedia = new Map(riadky.map((r) => [medium(r), skupinaKategorie.get(r.kategoria)]));

// šport do merania pozornosti nepatrí (a alternatívne weby ho nerobia, skresľoval by slepé miesta)
const SPORT = /sport|futbal|hokej/i;
const SPORT_TITUL = /futbal|hokej|NHL|Lig[ay] (národov|majstrov)|tenis|olympi|reprezentáci|MS v |ME v |gól/i;
// prebraný článok = rovnaký titulok inde; do nezávislého pokrytia sa ráta raz
const normTitul = (t) => (t ?? '').normalize('NFD').replace(/\p{M}+/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim().slice(0, 70);

const pribehy = zhluky
  .map((k) => {
    const cleny = k.cleny.map((id) => podlaId.get(id));
    const media = new Map();
    for (const r of cleny) {
      const m = medium(r);
      const prv = media.get(m);
      if (!prv || r.casPrvy < prv.cas) media.set(m, { medium: m, nazov: nazovMedia.get(m), skupina: skupinaMedia.get(m), cas: r.casPrvy, titulok: r.titulok, url: r.url });
    }
    const zoznam = [...media.values()].sort((a, b) => a.cas - b.cas);
    const pocty = Object.fromEntries(Object.keys(SKUPINY).map((s) => [s, zoznam.filter((m) => m.skupina === s).length]));
    // titulok: ten, ktorý pokrýva najviac kľúčových slov príbehu (pri zhode bližší k centroidu), prednostne mimo
    // alternatívnych (tie často preberajú cudzie titulky)
    const kluc = klucoveSlova(k.centroid, tvary, 6);
    const kmene = new Set(kluc.map((t) => kmen(t)));
    const pokrytie = (r) => new Set(tokenyTemy(r.titulok).map((t) => t.k).filter((x) => kmene.has(x))).size;
    const kandidati = cleny
      .filter((r) => r.titulok)
      .sort((a, b) => pokrytie(b) - pokrytie(a) || (k.podobnost.get(b.id) ?? 0) - (k.podobnost.get(a.id) ?? 0));
    const titul = kandidati.find((r) => skupinaKategorie.get(r.kategoria) !== 'alternativne') ?? kandidati[0];
    const nezavisle = (s) => new Set(zoznam.filter((m) => m.skupina === s).map((m) => normTitul(m.titulok))).size;
    return {
      titulok: titul?.titulok ?? '',
      klucove_slova: kluc.slice(0, 5),
      sport: cleny.filter((r) => SPORT.test(r.url ?? '') || SPORT_TITUL.test(r.titulok ?? '')).length * 2 >= cleny.length,
      nezavislych: Object.fromEntries(Object.keys(SKUPINY).map((s) => [s, nezavisle(s)])),
      od: new Date(zoznam[0].cas).toISOString(),
      do: new Date(Math.max(...cleny.map((r) => r.cas))).toISOString(),
      medii: zoznam.length,
      clankov: cleny.length,
      pocty,
      prvy: { ...zoznam[0], cas: new Date(zoznam[0].cas).toISOString() },
      media: zoznam.map(({ medium, nazov, skupina, cas, titulok, url }) => ({ medium, nazov, skupina, cas: new Date(cas).toISOString(), titulok, url })),
    };
  })
  .filter((p) => p.medii >= 3 && !p.sport)
  .sort((a, b) => b.medii - a.medii || b.clankov - a.clankov);

// slepé miesto (rovnaké pravidlo pre obe strany): aspoň 3 médiá jednej skupiny, z toho aspoň 2 vlastným titulkom
// (nie prebraný článok), a z druhej skupiny najviac jedno médium
const slepeMiesto = (pisu, mlcia) => (p) => p.pocty[pisu] >= 3 && p.nezavislych[pisu] >= 2 && p.pocty[mlcia] <= 1;
const slepe = {
  pravidlo: 'aspoň 3 médiá jednej skupiny (aspoň 2 vlastným titulkom) a z druhej skupiny najviac jedno',
  alternativne_mlcia: pribehy.filter(slepeMiesto('hlavny', 'alternativne')),
  hlavny_prud_mlci: pribehy.filter(slepeMiesto('alternativne', 'hlavny')),
};

// pozornosť médií: koľko z top príbehov týždňa každé médium malo
const TOP = 30;
const top = pribehy.slice(0, TOP);
const mediaVsetky = [...skupinaMedia.keys()];
const pozornost = mediaVsetky
  .map((m) => ({
    medium: m,
    nazov: nazovMedia.get(m),
    skupina: skupinaMedia.get(m),
    clankov: riadky.filter((r) => medium(r) === m).length,
    top_pokrytych: top.filter((p) => p.media.some((x) => x.medium === m)).length,
    prvy_v_pribehoch: pribehy.filter((p) => p.prvy.medium === m).length,
  }))
  .sort((a, b) => b.top_pokrytych - a.top_pokrytych || b.clankov - a.clankov);

const den = new Date(teraz).toISOString().slice(0, 10);
const vystup = {
  vytvorene_at: new Date(teraz).toISOString(),
  od: new Date(odMs).toISOString(),
  dni: DNI,
  algoritmus: `pokrytie-v1 nad ${POLITIKA_TEM.verzia}`,
  nespolahlivy_cas: [...nespolahlivyCas].sort(),
  skupiny: SKUPINY,
  clankov: riadky.length,
  medii: mediaVsetky.length,
  medii_podla_skupin: Object.fromEntries(Object.keys(SKUPINY).map((s) => [s, mediaVsetky.filter((m) => skupinaMedia.get(m) === s).length])),
  zhlukov: zhluky.length,
  pribehov: pribehy.length,
  top: TOP,
  pribehy,
  slepe,
  pozornost,
};
const cesta = join(dirname(DB_CESTA), 'pokrytie', `${den}.json`);
mkdirSync(dirname(cesta), { recursive: true });
writeFileSync(cesta, JSON.stringify(vystup, null, 1));

console.log(`${vystup.clankov} článkov, ${vystup.medii} médií (${JSON.stringify(vystup.medii_podla_skupin)}), ${vystup.zhlukov} zhlukov, ${vystup.pribehov} príbehov s 3+ médiami`);
console.log(`slepé miesta: alternatívne mlčia ${slepe.alternativne_mlcia.length}, hlavný prúd mlčí ${slepe.hlavny_prud_mlci.length}`);
console.log(cesta);
