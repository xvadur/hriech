import { describe, expect, it } from 'vitest';
import { denVBratislave, normalizujDatum } from '../src/normalize';

describe('normalizujDatum (5 formátov z archívu)', () => {
  it('ISO s posunom (crz)', () => {
    expect(normalizujDatum('2013-09-30T14:34:09+02:00')).toEqual({ utc: '2013-09-30T12:34:09.000Z', format: 'iso_posun' });
  });
  it('ISO UTC (kataster) a s milisekundami (rss)', () => {
    expect(normalizujDatum('2026-06-30T16:00:00Z')).toEqual({ utc: '2026-06-30T16:00:00.000Z', format: 'iso_utc' });
    expect(normalizujDatum('2026-09-26T17:40:03.000Z')).toEqual({ utc: '2026-09-26T17:40:03.000Z', format: 'iso_utc' });
  });
  it('iba dátum (statistika) = polnoc v Bratislave, v lete aj v zime', () => {
    expect(normalizujDatum('2025-12-19')).toEqual({ utc: '2025-12-18T23:00:00.000Z', format: 'iba_datum' });
    expect(normalizujDatum('2026-07-01')).toEqual({ utc: '2026-06-30T22:00:00.000Z', format: 'iba_datum' });
  });
  it('miestny čas bez zóny (crz export)', () => {
    expect(normalizujDatum('2013-09-30 14:34:09')).toEqual({ utc: '2013-09-30T12:34:09.000Z', format: 'miestny' });
    expect(normalizujDatum('2026-01-15T08:00')).toEqual({ utc: '2026-01-15T07:00:00.000Z', format: 'miestny' });
  });
  it('RFC 2822 cez Date.parse, nič a nezmysly → null', () => {
    expect(normalizujDatum('Mon, 26 Sep 2026 17:40:03 +0200')).toEqual({ utc: '2026-09-26T15:40:03.000Z', format: 'ine' });
    expect(normalizujDatum(null)).toEqual({ utc: null, format: 'ziadny' });
    expect(normalizujDatum('')).toEqual({ utc: null, format: 'ziadny' });
    expect(normalizujDatum('0000-00-00 00:00:00')).toEqual({ utc: null, format: 'ziadny' });
    expect(normalizujDatum('včera')).toEqual({ utc: null, format: 'ine' });
  });
  it('deň v Bratislave z UTC', () => {
    expect(denVBratislave('2026-09-26T22:30:00.000Z')).toBe('2026-09-27');
    expect(denVBratislave('2026-01-10T23:30:00.000Z')).toBe('2026-01-11');
  });
});
