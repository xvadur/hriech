// Paritný test: náš port musí dať to isté, čo pôvodný openclaw `scoring.js` + `status.js`
// (kópie v fixtures/openclaw, stiahnuté 28. 9. 2026 z openclaw.sk/js/). Vstup: 20 článkov
// (signálov) z api.openclaw.lu/api/signals/<den>, každá kombinácia smer/sila/relevancia/istota.
import { describe, expect, it } from 'vitest';
import clanky from './fixtures/openclaw/clanky-20.json';
import predictions from './fixtures/openclaw/predictions.json';
import serverScores from './fixtures/openclaw/scores.json';
import {
  STAV_OPENCLAW,
  STAV_Z_OPENCLAW,
  dokazyZoSignalov,
  odporucanie,
  odporucanyStav,
  povolenyPrechod,
  skoreZoSignalov,
  urciStav,
  vsetkySkoreZoSignalov,
  vypocitajSkore,
  type OpenclawDen,
  type StavZvodu,
} from '../src/skore';

type Original = {
  calculateRealizationScore: (id: string, reports: unknown[], now?: Date) => { score: number; confidence: string; evidenceCount: number; breakdown: Record<string, { count: number; weight: number }> | null; rawWeightedSum?: number; totalWeight?: number };
  getRecommendedStatus: (score: { score: number; confidence: string; evidenceCount: number }, current: string) => string;
  calculateAllScores: (predictions: unknown, reports: unknown[]) => Record<string, { score: number; confidence: string; evidenceCount: number }>;
};
type OriginalStatus = {
  determineStatus: (score: { score: number; confidence: string; evidenceCount: number }) => string;
  isValidTransition: (from: string, to: string) => boolean;
  getStatusRecommendation: (p: { status?: string }, s: { score: number; confidence: string; evidenceCount: number }) => { change: boolean; current: string; recommended?: string };
};

const TERAZ = new Date('2026-09-28T12:00:00Z');
const STAVY: StavZvodu[] = ['nepotvrdene', 'vznikajuce', 'potvrdene', 'vyvratene'];

/** 20 článkov ako 20 „dní“ v tvare signals/<den>.json (každý článok nesie svoj scan_date). */
const dni: OpenclawDen[] = clanky.clanky.map((c) => ({ date: c.den, signals: [c] }));
const predikcie = new Set(clanky.clanky.flatMap((c) => c.prediction_links.map((l) => l.prediction_id)));

async function original() {
  const scoring = (await import('./fixtures/openclaw/scoring.js')) as unknown as Original;
  const status = (await import('./fixtures/openclaw/status.js')) as unknown as OriginalStatus;
  return { scoring, status };
}

describe('parita s openclaw scoring.js (20 článkov)', () => {
  it('fixture má 20 článkov a pokrýva všetky smery, sily, relevancie a istoty', () => {
    expect(clanky.clanky).toHaveLength(20);
    const links = clanky.clanky.flatMap((c) => c.prediction_links);
    expect(new Set(links.map((l) => l.evidence_direction))).toEqual(new Set(['confirming', 'contradicting', 'neutral']));
    expect(new Set(links.map((l) => l.evidence_strength))).toEqual(new Set(['strong', 'moderate', 'weak']));
    expect(new Set(links.map((l) => l.relevance))).toEqual(new Set(['direct', 'supporting', 'tangential']));
    expect(new Set(clanky.clanky.map((c) => c.confidence))).toEqual(new Set(['high', 'medium', 'low']));
    expect(predikcie.size).toBeGreaterThanOrEqual(10);
  });

  it('skóre, istota, počet a rozklad sú 1:1 pre každú predikciu z 20 článkov', async () => {
    const { scoring } = await original();
    for (const id of [...predikcie].sort()) {
      const nase = skoreZoSignalov(id, dni, TERAZ);
      const ich = scoring.calculateRealizationScore(id, dni, TERAZ);
      expect(nase.skore, id).toBe(ich.score);
      expect(nase.istota, id).toBe(ich.confidence);
      expect(nase.pocet, id).toBe(ich.evidenceCount);
      expect(nase.raw_weighted_sum, id).toBeCloseTo(ich.rawWeightedSum ?? 0, 9);
      expect(nase.total_weight, id).toBeCloseTo(ich.totalWeight ?? 0, 9);
      for (const smer of ['confirming', 'contradicting', 'neutral'] as const) {
        expect(nase.rozklad?.[smer].pocet, `${id} ${smer}`).toBe(ich.breakdown?.[smer]?.count);
        expect(nase.rozklad?.[smer].vaha, `${id} ${smer}`).toBeCloseTo(ich.breakdown?.[smer]?.weight ?? 0, 9);
      }
    }
  });

  it('každý článok sám o sebe dáva to isté skóre (jeden dôkaz, s aj bez starnutia)', async () => {
    const { scoring } = await original();
    for (const clanok of clanky.clanky) {
      const den: OpenclawDen = { date: clanok.den, signals: [clanok] };
      for (const link of clanok.prediction_links) {
        for (const teraz of [TERAZ, new Date(`${clanok.den}T23:00:00Z`)]) {
          const nase = skoreZoSignalov(link.prediction_id, [den], teraz);
          const ich = scoring.calculateRealizationScore(link.prediction_id, [den], teraz);
          expect(nase.skore, `${clanok.signal_id} ${link.prediction_id}`).toBe(ich.score);
          expect(nase.istota).toBe(ich.confidence);
          expect(nase.pocet).toBe(1);
        }
      }
    }
  });

  it('odporúčaný stav a prechody sú 1:1 so status.js pre každý súčasný stav', async () => {
    const { scoring, status } = await original();
    for (const id of predikcie) {
      const nase = skoreZoSignalov(id, dni, TERAZ);
      const ich = scoring.calculateRealizationScore(id, dni, TERAZ);
      expect(STAV_OPENCLAW[urciStav(nase)]).toBe(status.determineStatus(ich));
      for (const stav of STAVY) {
        expect(STAV_OPENCLAW[odporucanyStav(nase, stav)], `${id} z ${stav}`).toBe(scoring.getRecommendedStatus(ich, STAV_OPENCLAW[stav]));
        const o = odporucanie(stav, nase);
        const s = status.getStatusRecommendation({ status: STAV_OPENCLAW[stav] }, ich);
        expect(o.zmena).toBe(s.change);
        if (s.recommended) expect(STAV_OPENCLAW[o.odporucany]).toBe(s.recommended);
        for (const cielovy of STAVY) expect(povolenyPrechod(stav, cielovy)).toBe(status.isValidTransition(STAV_OPENCLAW[stav], STAV_OPENCLAW[cielovy]));
      }
    }
  });

  it('calculateAllScores nad katalógom predikcií a 20 článkami sedí pre všetky predikcie', async () => {
    const { scoring } = await original();
    const ich = scoring.calculateAllScores(predictions, dni);
    const nase = vsetkySkoreZoSignalov(dni);
    for (const [id, s] of Object.entries(ich)) {
      if (s.evidenceCount === 0) {
        expect(nase[id]).toBeUndefined();
        continue;
      }
      expect(nase[id]?.skore, id).toBe(s.score);
      expect(nase[id]?.istota, id).toBe(s.confidence);
    }
  });

  it('syntetické hraničné prípady: prázdne, neznáme hodnoty, presne 30 dní, zaokrúhlenie záporných', async () => {
    const { scoring } = await original();
    expect(vypocitajSkore([])).toMatchObject({ skore: 0, istota: 'insufficient', pocet: 0, rozklad: null });
    const den = (scanDate: string, links: Array<Record<string, string>>, confidence = 'medium'): OpenclawDen => ({
      date: scanDate,
      signals: [{ signal_id: 's', scan_date: scanDate, confidence, prediction_links: links.map((l) => ({ prediction_id: 'X', relevance: 'direct', evidence_direction: 'confirming', evidence_strength: 'strong', ...l })) }],
    });
    const pripady: OpenclawDen[][] = [
      [den('2026-08-29', [{}])], // presne 30 dní pred TERAZ (12:00 vs polnoc → > 30 dní)
      [den('2026-08-29T12:00:00Z', [{}])], // presne 30,0 dňa → bez starnutia
      [den('2026-09-01', [{ evidence_strength: 'nezname', relevance: 'nezname' }], 'nezname')], // neznámy smer scoring.js nezvládne (padá), preto sa netestuje
      [den('2026-09-27', [{ evidence_direction: 'contradicting', evidence_strength: 'weak' }]), den('2026-09-26', [{ evidence_direction: 'contradicting', evidence_strength: 'weak', relevance: 'tangential' }])],
      [den('', [{}])], // bez dátumu → teraz
    ];
    for (const p of pripady) {
      const nase = skoreZoSignalov('X', p, TERAZ);
      const ich = scoring.calculateRealizationScore('X', p, TERAZ);
      expect(nase.skore).toBe(ich.score);
      expect(nase.istota).toBe(ich.confidence);
      expect(nase.total_weight).toBeCloseTo(ich.totalWeight ?? 0, 9);
    }
    expect(dokazyZoSignalov('X', [den('2026-09-01', [{}])])[0]?.datum).toBe('2026-09-01');
    expect(STAV_Z_OPENCLAW.confirmed).toBe('potvrdene');
  });

  it('dokumentované: server /api/scores openclaw NIE JE výsledok scoring.js (kontrola, nie definícia)', () => {
    // Server dáva iné čísla než klientsky scoring.js nad tými istými signálmi (overené 28. 9. 2026,
    // 220 dní signálov: 0 zo 43 predikcií zhodných). Web openclaw.sk zobrazuje tretie číslo,
    // `realization_score` z /api/prediction-scores. Parita preto platí iba pre scoring.js.
    expect(Object.keys(serverScores.scores).length).toBe(43);
    expect(serverScores.scores['SEC-05']).toMatchObject({ score: 57, confidence: 'medium', evidenceCount: 143 });
  });
});
