// Meranie médií ako korpusová práca (register C1, C2, C5 titulky, poplašné a vata):
// deterministické agregáty nad titulkami a súhrnmi záznamov z RSS. Výstup je
// dlhý formát pre tabuľku `meranie` (rozsah, kľúč, deň, metrika, hodnota, detail).
// Každá hodnota je vysvetliteľná z detailu; politika (zoznamy slov) je verzovaná.

import { POLITIKA, lexikalneTokeny, pripocitaj, topSlova, znakyTitulku } from './text';

export interface ZaznamNaMeranie {
  id: number;
  /** id redakcie (zdroj_id), nie kanála: Denník N + Minúta = jedna redakcia */
  zdroj_id: string;
  autor: string | null;
  /** deň publikácie v Bratislave (YYYY-MM-DD); bez dátumu → deň zberu */
  den: string;
  title: string | null;
  summary: string | null;
}

export type RozsahMerania = 'zdroj' | 'autor';

export interface RiadokMerania {
  rozsah: RozsahMerania;
  /** zdroj: zdroj_id; autor: `${zdroj_id}|${autor}` */
  kluc: string;
  /** YYYY-MM-DD alebo '*' za celé okno */
  den: string;
  metrika: string;
  hodnota: number;
  /** JSON s dôkazom (počty, slová, id záznamov) */
  detail: Record<string, unknown> | null;
  algoritmus: string;
}

export const ALGORITMUS_MERANIA = `meranie-v1/politika-${POLITIKA.verzia}`;

interface Agregat {
  ids: number[];
  slov: number;
  znakov: number;
  otazka: number;
  dvojbodka: number;
  citacia: number;
  cislo: number;
  vykricnik: number;
  velke: number;
  poplasne: number;
  poplasneSlova: Map<string, number>;
  vata: number;
  vataSlova: Map<string, number>;
  lexika: Map<string, number>;
  lexikaTitulkov: Map<string, number>;
}

function novyAgregat(): Agregat {
  return {
    ids: [], slov: 0, znakov: 0, otazka: 0, dvojbodka: 0, citacia: 0, cislo: 0, vykricnik: 0, velke: 0,
    poplasne: 0, poplasneSlova: new Map(), vata: 0, vataSlova: new Map(), lexika: new Map(), lexikaTitulkov: new Map(),
  };
}

function pridaj(agg: Agregat, z: ZaznamNaMeranie): void {
  agg.ids.push(z.id);
  const t = znakyTitulku(z.title);
  agg.slov += t.slov;
  agg.znakov += t.znakov;
  if (t.otazka) agg.otazka++;
  if (t.dvojbodka) agg.dvojbodka++;
  if (t.citacia) agg.citacia++;
  if (t.cislo) agg.cislo++;
  if (t.vykricnik) agg.vykricnik++;
  agg.velke += t.velke_slova;
  if (t.poplasne.length) agg.poplasne++;
  pripocitaj(agg.poplasneSlova, t.poplasne);
  if (t.vata.length) agg.vata++;
  pripocitaj(agg.vataSlova, t.vata);
  const tit = lexikalneTokeny(z.title);
  pripocitaj(agg.lexikaTitulkov, tit);
  pripocitaj(agg.lexika, tit);
  pripocitaj(agg.lexika, lexikalneTokeny(z.summary));
}

function zaokruhli(x: number): number {
  return Math.round(x * 1000) / 1000;
}

function riadky(rozsah: RozsahMerania, kluc: string, den: string, agg: Agregat, topN: number): RiadokMerania[] {
  const n = agg.ids.length;
  if (n === 0) return [];
  const r = (metrika: string, hodnota: number, detail: Record<string, unknown> | null = null): RiadokMerania => ({
    rozsah, kluc, den, metrika, hodnota, detail, algoritmus: ALGORITMUS_MERANIA,
  });
  const ids = agg.ids.length > 200 ? { pocet: agg.ids.length, prvych: agg.ids.slice(0, 50) } : { ids: agg.ids };
  return [
    r('zaznamov', n, ids),
    r('titulok_slov_priemer', zaokruhli(agg.slov / n)),
    r('titulok_znakov_priemer', zaokruhli(agg.znakov / n)),
    r('titulok_otazka_podiel', zaokruhli(agg.otazka / n), { pocet: agg.otazka }),
    r('titulok_dvojbodka_podiel', zaokruhli(agg.dvojbodka / n), { pocet: agg.dvojbodka }),
    r('titulok_citacia_podiel', zaokruhli(agg.citacia / n), { pocet: agg.citacia }),
    r('titulok_cislo_podiel', zaokruhli(agg.cislo / n), { pocet: agg.cislo }),
    r('titulok_vykricnik_podiel', zaokruhli(agg.vykricnik / n), { pocet: agg.vykricnik }),
    r('titulok_velke_slova_priemer', zaokruhli(agg.velke / n)),
    r('poplasne_podiel', zaokruhli(agg.poplasne / n), { pocet: agg.poplasne, slova: topSlova(agg.poplasneSlova, topN) }),
    r('vata_podiel', zaokruhli(agg.vata / n), { pocet: agg.vata, slova: topSlova(agg.vataSlova, topN) }),
    r('lexika_rozne_slova', agg.lexika.size, { top: topSlova(agg.lexika, topN) }),
    r('lexika_titulkov', agg.lexikaTitulkov.size, { top: topSlova(agg.lexikaTitulkov, topN) }),
  ];
}

export interface MoznostiMerania {
  /** koľko slov ide do detailu lexiky */
  topN?: number;
  /** autori sa merajú iba za celé okno ('*'), nie po dňoch */
  autori?: boolean;
}

/** Meranie nad záznamami: redakcia × deň, redakcia × '*', autor × '*'. Poradie výstupu je deterministické. */
export function meranie(zaznamy: readonly ZaznamNaMeranie[], moznosti: MoznostiMerania = {}): RiadokMerania[] {
  const topN = moznosti.topN ?? 30;
  const zdrojDen = new Map<string, Agregat>();
  const zdrojCelok = new Map<string, Agregat>();
  const autori = new Map<string, Agregat>();
  const sorted = [...zaznamy].sort((a, b) => a.id - b.id);
  for (const z of sorted) {
    const kd = `${z.zdroj_id}\u0000${z.den}`;
    if (!zdrojDen.has(kd)) zdrojDen.set(kd, novyAgregat());
    pridaj(zdrojDen.get(kd)!, z);
    if (!zdrojCelok.has(z.zdroj_id)) zdrojCelok.set(z.zdroj_id, novyAgregat());
    pridaj(zdrojCelok.get(z.zdroj_id)!, z);
    if (moznosti.autori !== false && z.autor && z.autor.trim()) {
      const ka = `${z.zdroj_id}|${z.autor.trim()}`;
      if (!autori.has(ka)) autori.set(ka, novyAgregat());
      pridaj(autori.get(ka)!, z);
    }
  }
  const out: RiadokMerania[] = [];
  for (const [k, agg] of [...zdrojDen.entries()].sort()) {
    const [zdroj, den] = k.split('\u0000') as [string, string];
    out.push(...riadky('zdroj', zdroj, den, agg, topN));
  }
  for (const [zdroj, agg] of [...zdrojCelok.entries()].sort()) out.push(...riadky('zdroj', zdroj, '*', agg, topN));
  for (const [autor, agg] of [...autori.entries()].sort()) out.push(...riadky('autor', autor, '*', agg, topN));
  return out;
}
