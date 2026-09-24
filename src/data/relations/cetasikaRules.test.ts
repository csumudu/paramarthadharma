import { describe, expect, it } from 'vitest';
import { range } from '../range';
import { CETASIKA_RELS } from './cetasikaRules';

/** Textbook maximum cetasika count for citta 1..89 (index = id - 1). */
const EXPECTED_PER_CITTA = [
  19, 21, 19, 21, 18, 20, 18, 20, 20, 22, 15, 15, // 1–12 akusala
  7, 7, 7, 7, 7, 10, 10, // 13–19 akusala vipāka
  7, 7, 7, 7, 7, 10, 11, 10, // 20–27 ahetuka kusala vipāka
  10, 11, 12, // 28–30 ahetuka kiriya
  38, 38, 37, 37, 37, 37, 36, 36, // 31–38 mahā kusala
  33, 33, 32, 32, 32, 32, 31, 31, // 39–46 mahā vipāka
  35, 35, 34, 34, 34, 34, 33, 33, // 47–54 mahā kiriya
  35, 34, 33, 32, 30, // 55–59 rūpa kusala
  35, 34, 33, 32, 30, // 60–64 rūpa vipāka
  35, 34, 33, 32, 30, // 65–69 rūpa kiriya
  ...Array(12).fill(30), // 70–81 arūpa
  ...Array(8).fill(36), // 82–89 lokuttara
];

/** Number of cittas each cetasika 1..52 occurs in (89 scheme). */
const EXPECTED_PER_CETASIKA: Record<number, number> = {
  1: 89, 2: 89, 3: 89, 4: 89, 5: 89, 6: 89, 7: 89,
  8: 55, 9: 58, 10: 78, 11: 73, 12: 35, 13: 69,
  14: 12, 15: 12, 16: 12, 17: 12,
  18: 8, 19: 4, 20: 4,
  21: 2, 22: 2, 23: 2, 24: 2,
  25: 5, 26: 5, 27: 1,
  ...Object.fromEntries(range(28, 46).map((id) => [id, 59])),
  47: 16, 48: 16, 49: 16,
  50: 28, 51: 28,
  52: 47,
};

const cetasikasOf = (citta: number) => CETASIKA_RELS.filter((r) => r.citta === citta);
const kindOf = (citta: number, cetasika: number) =>
  CETASIKA_RELS.find((r) => r.citta === citta && r.cetasika === cetasika)?.kind;

describe('CETASIKA_RELS', () => {
  it('matches the textbook count for every citta', () => {
    const actual = range(1, 89).map((id) => cetasikasOf(id).length);
    expect(actual).toEqual(EXPECTED_PER_CITTA);
  });

  it('matches the textbook count for every cetasika', () => {
    for (const [id, expected] of Object.entries(EXPECTED_PER_CETASIKA)) {
      expect(CETASIKA_RELS.filter((r) => r.cetasika === Number(id)).length, `cetasika ${id}`).toBe(expected);
    }
  });

  it('gives citta 1 exactly the 19 textbook cetasikas', () => {
    expect(cetasikasOf(1).map((r) => r.cetasika)).toEqual([...range(1, 19)]);
  });

  it('has the 7 universals in all 89 cittas', () => {
    for (const citta of range(1, 89)) {
      for (const u of range(1, 7)) expect(kindOf(citta, u), `citta ${citta}`).toBe('niyata');
    }
  });

  it('marks the occasional cetasikas as aniyata', () => {
    expect(kindOf(3, 20)).toBe('aniyata'); // māna
    expect(kindOf(9, 22)).toBe('aniyata'); // issā
    expect(kindOf(2, 25)).toBe('aniyata'); // thīna
    expect(kindOf(31, 47)).toBe('aniyata'); // virati in kāma kusala
    expect(kindOf(82, 47)).toBe('niyata'); // virati in magga
    expect(kindOf(55, 50)).toBe('aniyata'); // karuṇā
    expect(kindOf(82, 8)).toBe('aniyata'); // vitakka in magga (89 scheme: any jhāna)
    expect(kindOf(89, 12)).toBe('aniyata'); // pīti in phala
    expect(kindOf(55, 8)).toBe('niyata'); // vitakka in rūpa first jhāna stays niyata
  });

  it('never puts akusala cetasikas in sobhana cittas', () => {
    expect(CETASIKA_RELS.filter((r) => r.citta >= 31 && r.cetasika >= 14 && r.cetasika <= 27)).toEqual([]);
  });

  it('has no duplicate pairs and only rule status', () => {
    const keys = CETASIKA_RELS.map((r) => `${r.citta}:${r.cetasika}`);
    expect(new Set(keys).size).toBe(keys.length);
    expect(CETASIKA_RELS.every((r) => r.status === 'rule')).toBe(true);
  });
});
