import { describe, expect, it } from 'vitest';
import { range } from '../range';
import { BHUMI_RELS } from './bhumiRules';
import { KICCA_RELS } from './kiccaRules';
import { PUGGALA_RELS } from './puggalaRules';

const count = <T extends { citta: number }>(rels: T[], pred: (r: T) => boolean) => rels.filter(pred).length;

describe('KICCA_RELS', () => {
  it('has the textbook number of cittas per kicca', () => {
    const k = (id: string) => count(KICCA_RELS, (r) => r.kicca === id);
    expect(k('patisandhi')).toBe(19);
    expect(k('bhavanga')).toBe(19);
    expect(k('cuti')).toBe(19);
    expect(k('avajjana')).toBe(2);
    for (const sense of ['dassana', 'savana', 'ghayana', 'sayana', 'phusana']) expect(k(sense)).toBe(2);
    expect(k('sampaticchana')).toBe(2);
    expect(k('santirana')).toBe(3);
    expect(k('votthapana')).toBe(1);
    expect(k('javana')).toBe(55);
    expect(k('tadarammana')).toBe(11);
  });

  it('gives every citta at least one kicca', () => {
    for (const id of range(1, 89)) expect(count(KICCA_RELS, (r) => r.citta === id), `citta ${id}`).toBeGreaterThan(0);
  });

  it('gives upekkhā santīraṇa (19) its five functions', () => {
    expect(KICCA_RELS.filter((r) => r.citta === 19).map((r) => r.kicca).sort()).toEqual(
      ['bhavanga', 'cuti', 'patisandhi', 'santirana', 'tadarammana'],
    );
  });
});

describe('PUGGALA_RELS', () => {
  it('matches the chart header counts', () => {
    const p = (id: string) => count(PUGGALA_RELS, (r) => r.puggala === id);
    expect(p('duggati-ahetuka')).toBe(37);
    expect(p('sugati-ahetuka')).toBe(41);
    expect(p('dvihetuka')).toBe(41);
    expect(p('tihetuka')).toBe(54);
    expect(p('sotapanna')).toBe(50);
    expect(p('sakadagami')).toBe(50);
    expect(p('anagami')).toBe(48);
    expect(p('arahant')).toBe(44);
  });

  it('removes diṭṭhi and vicikicchā cittas from the sotāpanna and dosa from the anāgāmī', () => {
    const has = (puggala: string, citta: number) => PUGGALA_RELS.some((r) => r.puggala === puggala && r.citta === citta);
    expect(has('sotapanna', 1)).toBe(false);
    expect(has('sotapanna', 11)).toBe(false);
    expect(has('sotapanna', 3)).toBe(true);
    expect(has('anagami', 9)).toBe(false);
    expect(has('arahant', 30)).toBe(true);
    expect(has('tihetuka', 30)).toBe(false);
  });

  it('does not assign the momentary magga cittas to any puggala', () => {
    expect(PUGGALA_RELS.filter((r) => r.citta >= 82 && r.citta <= 85)).toEqual([]);
  });
});

describe('BHUMI_RELS', () => {
  it('matches the chart header counts 80 / 64 / 42', () => {
    const b = (id: string) => count(BHUMI_RELS, (r) => r.bhumi === id);
    expect(b('kama')).toBe(80);
    expect(b('rupa')).toBe(64);
    expect(b('arupa')).toBe(42);
  });

  it('keeps dosa out of the brahma worlds and sense consciousness out of arūpa', () => {
    const has = (bhumi: string, citta: number) => BHUMI_RELS.some((r) => r.bhumi === bhumi && r.citta === citta);
    expect(has('rupa', 9)).toBe(false);
    expect(has('rupa', 13)).toBe(true); // cakkhu viññāṇa arises in rūpa world
    expect(has('arupa', 13)).toBe(false);
    expect(has('arupa', 29)).toBe(true); // manodvārāvajjana
    expect(has('arupa', 82)).toBe(false); // sotāpatti magga
  });
});
