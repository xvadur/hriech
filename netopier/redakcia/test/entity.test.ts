import { describe, expect, it } from 'vitest';
import { druhZNazvu, entityZoZaznamu, normalizujIco } from '../src/entity';

describe('entity z registrov', () => {
  it('IČO sa normalizuje na 8 číslic', () => {
    expect(normalizujIco('156752')).toBe('00156752');
    expect(normalizujIco('00 156 752')).toBe('00156752');
    expect(normalizujIco('2020480198')).toBeNull();
    expect(normalizujIco('')).toBeNull();
    expect(normalizujIco('00000000')).toBeNull();
    expect(normalizujIco(null)).toBeNull();
  });

  it('druh z názvu', () => {
    expect(druhZNazvu('ITALZVER, s.r.o.')).toBe('firma');
    expect(druhZNazvu('Lesopoľnohospodársky majetok Ulič, š. p.')).toBe('firma');
    expect(druhZNazvu('Obec Svätoplukovo')).toBe('obec');
    expect(druhZNazvu('Ministerstvo školstva SR')).toBe('statny_organ');
    expect(druhZNazvu('Ján Novák')).toBe('neznamy');
  });

  it('CRZ: strana_a a strana_b podľa IČO, bez IČO sa strana vynechá', () => {
    const vazby = entityZoZaznamu('crz', {
      objednavatel: 'ITALZVER, s.r.o.', objednavatel_ico: '46566023',
      dodavatel: 'Lesopoľnohospodársky majetok Ulič, š. p.', dodavatel_ico: '00492531',
    });
    expect(vazby).toEqual([
      { entita: { id: 'ico:46566023', druh: 'firma', nazov: 'ITALZVER, s.r.o.', ico: '46566023' }, rola: 'strana_a' },
      { entita: { id: 'ico:00492531', druh: 'firma', nazov: 'Lesopoľnohospodársky majetok Ulič, š. p.', ico: '00492531' }, rola: 'strana_b' },
    ]);
    expect(entityZoZaznamu('crz', { objednavatel: 'Ján Novák', objednavatel_ico: null, dodavatel_ico: '00492531', dodavatel: 'X' })).toHaveLength(1);
  });

  it('TED: obstarávateľ z prvého platného id, víťazi bez duplicity obstarávateľa', () => {
    const vazby = entityZoZaznamu('ted', {
      obstaravatel: 'VODOHOSPODÁRSKA VÝSTAVBA, ŠTÁTNY PODNIK', obstaravatel_id: ['00156752', '2020480198'],
      vitaz: ['Firma A', 'Firma B'], vitaz_id: ['12345678', '00156752'],
    });
    expect(vazby.map((v) => [v.entita.id, v.rola, v.entita.nazov])).toEqual([
      ['ico:00156752', 'obstaravatel', 'VODOHOSPODÁRSKA VÝSTAVBA, ŠTÁTNY PODNIK'],
      ['ico:12345678', 'vitaz', 'Firma A'],
    ]);
    expect(vazby[0]?.entita.druh).toBe('firma'); // štátny podnik je právna forma firmy
    expect(druhZNazvu('Úrad vlády Slovenskej republiky')).toBe('statny_organ');
  });

  it('iné zdroje nedávajú entity', () => {
    expect(entityZoZaznamu('rss', { feed_id: 'sme' })).toEqual([]);
  });
});
