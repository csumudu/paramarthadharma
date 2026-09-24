import { describe, expect, it } from 'vitest';
import { range } from '../range';
import { BHUMIS } from './bhumis';
import { CETASIKAS } from './cetasikas';
import { CITTAS, cittaById } from './cittas';
import { GROUPS, groupById } from './groups';
import { KICCAS } from './kiccas';
import { PS_LINKS, STANDARD_CHAIN, psLabel, psLinkById } from './psLinks';
import { PUGGALAS } from './puggalas';

const allNames = (): string[] => [
  ...CITTAS.flatMap((c) => [c.nameSi, c.short]),
  ...CETASIKAS.map((c) => c.nameSi),
  ...KICCAS.map((k) => k.nameSi),
  ...PS_LINKS.map(psLabel),
  ...PUGGALAS.map((p) => p.nameSi),
  ...BHUMIS.map((b) => b.nameSi),
  ...GROUPS.map((g) => g.nameSi),
];

describe('cittas', () => {
  it('has 89 cittas with ids 1..89 in order', () => {
    expect(CITTAS.map((c) => c.id)).toEqual(range(1, 89));
  });

  it('has the expected group sizes', () => {
    const size = (g: string) => CITTAS.filter((c) => c.group === g).length;
    expect(size('lobhamula')).toBe(8);
    expect(size('dosamula')).toBe(2);
    expect(size('mohamula')).toBe(2);
    expect(size('akusala-vipaka')).toBe(7);
    expect(size('ahetuka-kusala-vipaka')).toBe(8);
    expect(size('ahetuka-kiriya')).toBe(3);
    for (const g of ['kama-kusala', 'kama-vipaka', 'kama-kiriya']) expect(size(g)).toBe(8);
    for (const g of ['rupa-kusala', 'rupa-vipaka', 'rupa-kiriya']) expect(size(g)).toBe(5);
    for (const g of ['arupa-kusala', 'arupa-vipaka', 'arupa-kiriya']) expect(size(g)).toBe(4);
    expect(size('magga')).toBe(4);
    expect(size('phala')).toBe(4);
  });

  it('places key cittas where the chart has them', () => {
    expect(cittaById.get(1)).toMatchObject({ short: 'ලෝභ 1', sampayutta: 'ditthi', sankharika: 'asankharika', vedana: 'somanassa' });
    expect(cittaById.get(4)).toMatchObject({ sampayutta: 'ditthi-vippayutta', sankharika: 'sasankharika' });
    expect(cittaById.get(10)).toMatchObject({ group: 'dosamula', sankharika: 'sasankharika', vedana: 'domanassa' });
    expect(cittaById.get(11)).toMatchObject({ sampayutta: 'vicikiccha', hetu: 'ekahetuka' });
    expect(cittaById.get(17)).toMatchObject({ vedana: 'dukkha', group: 'akusala-vipaka' });
    expect(cittaById.get(24)).toMatchObject({ vedana: 'sukha', group: 'ahetuka-kusala-vipaka' });
    expect(cittaById.get(26)).toMatchObject({ vedana: 'somanassa' });
    expect(cittaById.get(30)).toMatchObject({ group: 'ahetuka-kiriya', vedana: 'somanassa' });
    expect(cittaById.get(33)).toMatchObject({ group: 'kama-kusala', sampayutta: 'nana-vippayutta', hetu: 'dvihetuka' });
    expect(cittaById.get(55)).toMatchObject({ group: 'rupa-kusala', jhana: 1 });
    expect(cittaById.get(69)).toMatchObject({ group: 'rupa-kiriya', jhana: 5, vedana: 'upekkha' });
    expect(cittaById.get(70)).toMatchObject({ group: 'arupa-kusala', jhana: 5 });
    expect(cittaById.get(82)).toMatchObject({ group: 'magga', jati: 'kusala', jhana: 1 });
    expect(cittaById.get(89)).toMatchObject({ group: 'phala', jati: 'vipaka' });
  });

  it('references only known groups, and every group has a sphere matching its cittas', () => {
    for (const c of CITTAS) {
      const g = groupById.get(c.group);
      expect(g, `citta ${c.id}`).toBeDefined();
      expect(g!.sphere).toBe(c.sphere);
    }
    expect(GROUPS).toHaveLength(17);
  });
});

describe('cetasikas', () => {
  it('has 52 with ids 1..52 and 13/14/25 per band', () => {
    expect(CETASIKAS.map((c) => c.id)).toEqual(range(1, 52));
    const band = (b: string) => CETASIKAS.filter((c) => c.band === b).length;
    expect([band('annasamana'), band('akusala'), band('sobhana')]).toEqual([13, 14, 25]);
  });

  it('has the standard subgroup sizes', () => {
    const size = (s: string) => CETASIKAS.filter((c) => c.subgroup === s).length;
    expect(size('sabbacitta')).toBe(7);
    expect(size('pakinnaka')).toBe(6);
    expect(size('moha-catuka')).toBe(4);
    expect(size('lobha-tika')).toBe(3);
    expect(size('dosa-catuka')).toBe(4);
    expect(size('thina-duka')).toBe(2);
    expect(size('vicikiccha')).toBe(1);
    expect(size('sobhana-sadharana')).toBe(19);
    expect(size('virati')).toBe(3);
    expect(size('appamanna')).toBe(2);
    expect(size('panna')).toBe(1);
  });

  it('puts pīti at 12 and paññā at 52', () => {
    expect(CETASIKAS[11].nameSi).toBe('පීති');
    expect(CETASIKAS[51].nameSi).toBe('පඤ්ඤින්ද්‍රිය');
  });
});

describe('kiccas, PS links, puggalas, bhūmis', () => {
  it('has 14 kiccas, 5 of them sharing vīthi column 4', () => {
    expect(KICCAS).toHaveLength(14);
    expect(KICCAS.filter((k) => k.vithiOrder === 4)).toHaveLength(5);
  });

  it('has unique PS link ids with slots 1..11 and a valid standard chain', () => {
    expect(new Set(PS_LINKS.map((l) => l.id)).size).toBe(PS_LINKS.length);
    for (const l of PS_LINKS) {
      expect(l.slot).toBeGreaterThanOrEqual(1);
      expect(l.slot).toBeLessThanOrEqual(11);
    }
    expect(STANDARD_CHAIN).toHaveLength(11);
    STANDARD_CHAIN.forEach((id, i) => expect(psLinkById.get(id)!.slot).toBe(i + 1));
    expect(psLabel(psLinkById.get('vedana-tanha')!)).toBe('වේදනා පච්චයා තණ්හා');
  });

  it('has 8 puggalas and 3 bhūmis', () => {
    expect(PUGGALAS).toHaveLength(8);
    expect(BHUMIS).toHaveLength(3);
  });
});

describe('Sinhala text integrity', () => {
  it('every name is non-empty and NFC-normalised', () => {
    for (const n of allNames()) {
      expect(n.trim().length, n).toBeGreaterThan(0);
      expect(n, n).toBe(n.normalize('NFC'));
    }
  });

  it('no name has al-lakuna directly before ra/ya without ZWJ (broken rakāransaya/yansaya)', () => {
    for (const n of allNames()) {
      expect(n, n).not.toMatch(/්[රය]/);
    }
  });
});
