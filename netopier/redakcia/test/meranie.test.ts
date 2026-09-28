import { describe, expect, it } from 'vitest';
import { ALGORITMUS_MERANIA, meranie, type ZaznamNaMeranie } from '../src/meranie';
import { POLITIKA, lexikalneTokeny, poplasneSlova, tokeny, znakyTitulku } from '../src/text';

describe('text', () => {
  it('tokeny držia diakritiku a vyhadzujú jednoznakové', () => {
    expect(tokeny('Fico: „Vláda schválila rozpočet“ – 3 % z HDP')).toEqual(['fico', 'vláda', 'schválila', 'rozpočet', 'hdp']);
  });
  it('lexikálne tokeny bez stop slov a čísel', () => {
    expect(lexikalneTokeny('Vláda a parlament sa dohodli na 12 bodoch')).toEqual(['vláda', 'parlament', 'dohodli', 'bodoch']);
  });
  it('znaky titulku', () => {
    const z = znakyTitulku('Šokujúce varovanie SHMÚ: Slovensko čaká mrazivé ráno?');
    expect(z).toMatchObject({ otazka: true, dvojbodka: true, citacia: false, cislo: false, vykricnik: false, velke_slova: 1 });
    expect(z.poplasne).toEqual(expect.arrayContaining(['šokujúc', 'varovanie']));
    expect(znakyTitulku('Toto neuveríte: 5 tipov')).toMatchObject({ cislo: true, vata: expect.arrayContaining(['neuveríte', 'toto', 'tip']) });
    expect(znakyTitulku(null)).toMatchObject({ slov: 0, znakov: 0, otazka: false });
    expect(poplasneSlova('pokojný deň')).toEqual([]);
  });
});

const zaznamy: ZaznamNaMeranie[] = [
  { id: 1, zdroj_id: 'sme', autor: 'A. Autor', den: '2026-09-26', title: 'Fico: „Vláda schválila rozpočet“', summary: 'Vláda schválila rozpočet na rok 2027.' },
  { id: 2, zdroj_id: 'sme', autor: 'A. Autor', den: '2026-09-26', title: 'Prečo hrozí kolaps nemocníc?', summary: 'Nemocnice varujú pred kolapsom.' },
  { id: 3, zdroj_id: 'sme', autor: null, den: '2026-09-27', title: 'Parlament rokuje o rozpočte', summary: null },
  { id: 4, zdroj_id: 'dennikn', autor: 'B. Autorka', den: '2026-09-26', title: 'Rozpočet 2027: čo sa mení pre rodiny', summary: 'Rodiny dostanú viac.' },
];

describe('meranie', () => {
  it('riadky pre redakciu × deň, redakciu × celok a autora × celok, deterministicky', () => {
    const r = meranie(zaznamy, { topN: 5 });
    const r2 = meranie([...zaznamy].reverse(), { topN: 5 });
    expect(r).toEqual(r2);
    const get = (rozsah: string, kluc: string, den: string, metrika: string) => r.find((x) => x.rozsah === rozsah && x.kluc === kluc && x.den === den && x.metrika === metrika);
    expect(get('zdroj', 'sme', '2026-09-26', 'zaznamov')).toMatchObject({ hodnota: 2, detail: { ids: [1, 2] }, algoritmus: ALGORITMUS_MERANIA });
    expect(get('zdroj', 'sme', '*', 'zaznamov')?.hodnota).toBe(3);
    expect(get('zdroj', 'sme', '*', 'titulok_otazka_podiel')?.hodnota).toBeCloseTo(1 / 3, 3);
    expect(get('zdroj', 'sme', '*', 'titulok_citacia_podiel')?.hodnota).toBeCloseTo(1 / 3, 3);
    expect(get('zdroj', 'sme', '*', 'poplasne_podiel')).toMatchObject({ hodnota: 0.333, detail: { pocet: 1 } });
    expect(get('zdroj', 'dennikn', '*', 'titulok_cislo_podiel')?.hodnota).toBe(1);
    expect(get('autor', 'sme|A. Autor', '*', 'zaznamov')?.hodnota).toBe(2);
    expect(get('autor', 'sme|A. Autor', '2026-09-26', 'zaznamov')).toBeUndefined();
    const lex = get('zdroj', 'sme', '*', 'lexika_rozne_slova');
    expect((lex?.detail as { top: Array<[string, number]> }).top[0]).toEqual(['rozpočet', 2]);
    expect(ALGORITMUS_MERANIA).toContain(POLITIKA.verzia);
  });
  it('prázdny vstup → žiadne riadky', () => {
    expect(meranie([])).toEqual([]);
  });
});
