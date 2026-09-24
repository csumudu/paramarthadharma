import { describe, expect, it } from 'vitest';
import {
  activeFilters,
  cittasFor,
  cittasMatching,
  emptySelection,
  hasAnySelection,
  labelOf,
  parseEntityId,
  profileOf,
  searchEntities,
} from '@/data';

const sel = (patch: Partial<ReturnType<typeof emptySelection>>) => ({ ...emptySelection(), ...patch });

describe('profileOf', () => {
  it('returns every relation block for a citta', () => {
    const p = profileOf(1);
    expect(p.cetasikas).toHaveLength(19);
    expect(p.kiccas.map((k) => k.kicca)).toEqual(['javana']);
    expect(p.psLinks).toHaveLength(11);
    expect(p.puggalas.map((x) => x.puggala)).toEqual(['duggati-ahetuka', 'sugati-ahetuka', 'dvihetuka', 'tihetuka']);
    expect(p.bhumis.map((x) => x.bhumi)).toEqual(['kama', 'rupa', 'arupa']);
  });

  it('throws on an unknown citta', () => {
    expect(() => profileOf(999)).toThrow();
  });
});

describe('cittasFor / cittasMatching', () => {
  it('finds the 35 cittas with pīti', () => {
    expect(cittasFor('cetasika', 12).size).toBe(35);
  });

  it('returns null when nothing is filtered', () => {
    expect(cittasMatching(emptySelection())).toBeNull();
    expect(cittasMatching(sel({ citta: [1] }))).toBeNull();
  });

  it('intersects filters (pīti AND sotāpanna = 15)', () => {
    expect(cittasMatching(sel({ cetasika: [12], puggala: ['sotapanna'] }))!.size).toBe(15);
  });

  it('intersects kicca and puggala (javana AND arahant = 19)', () => {
    expect(cittasMatching(sel({ kicca: ['javana'], puggala: ['arahant'] }))!.size).toBe(19);
  });

  it('returns an empty set for an impossible combination (dosa AND pīti)', () => {
    expect(cittasMatching(sel({ cetasika: [21, 12] }))!.size).toBe(0);
  });

  it('accepts string ids for numeric kinds', () => {
    expect(cittasFor('cetasika', '12').size).toBe(35);
  });

  it('returns a fresh set that does not alias the index', () => {
    const matched = cittasMatching(sel({ cetasika: [12] }))!;
    matched.clear();
    expect(cittasFor('cetasika', 12).size).toBe(35);
  });
});

describe('selection helpers', () => {
  it('lists active filters in kind order', () => {
    expect(activeFilters(sel({ puggala: ['arahant'], cetasika: [12] }))).toEqual([
      { kind: 'cetasika', id: 12 },
      { kind: 'puggala', id: 'arahant' },
    ]);
  });

  it('detects any selection', () => {
    expect(hasAnySelection(emptySelection())).toBe(false);
    expect(hasAnySelection(sel({ citta: [3] }))).toBe(true);
  });
});

describe('labels and parsing', () => {
  it('labels every kind in Sinhala', () => {
    expect(labelOf('citta', 1)).toBe('1. ලෝභ 1');
    expect(labelOf('cetasika', 12)).toBe('පීති');
    expect(labelOf('kicca', 'javana')).toBe('ජවන');
    expect(labelOf('psLink', 'vedana-tanha')).toBe('වේදනා පච්චයා තණ්හා');
    expect(labelOf('puggala', 'sotapanna')).toBe('සෝතාපන්න');
    expect(labelOf('bhumi', 'kama')).toBe('කාම භූමි');
  });

  it('parses valid ids and rejects everything else', () => {
    expect(parseEntityId('citta', '89')).toBe(89);
    expect(parseEntityId('citta', '0')).toBeNull();
    expect(parseEntityId('citta', '')).toBeNull();
    expect(parseEntityId('citta', '1.5')).toBeNull();
    expect(parseEntityId('cetasika', '52')).toBe(52);
    expect(parseEntityId('cetasika', '53')).toBeNull();
    expect(parseEntityId('kicca', 'javana')).toBe('javana');
    expect(parseEntityId('kicca', 'JAVANA')).toBeNull();
    expect(parseEntityId('psLink', 'vedana-tanha')).toBe('vedana-tanha');
    expect(parseEntityId('puggala', 'arahant')).toBe('arahant');
    expect(parseEntityId('bhumi', 'moon')).toBeNull();
  });
});

describe('searchEntities', () => {
  it('finds a cetasika by Sinhala name', () => {
    expect(searchEntities('පීති')[0]).toEqual({ kind: 'cetasika', id: 12, label: 'පීති' });
  });

  it('finds a citta by exact number', () => {
    expect(searchEntities('31')).toEqual([{ kind: 'citta', id: 31, label: labelOf('citta', 31) }]);
  });

  it('returns nothing for blank input and respects the limit', () => {
    expect(searchEntities('   ')).toEqual([]);
    expect(searchEntities('සිත', 5)).toHaveLength(5);
  });
});
