import { describe, expect, it } from 'vitest';
import { cittasMatching, emptySelection } from '@/data';
import { tileState } from './tileState';

const state = (id: number, patch: Partial<ReturnType<typeof emptySelection>>) => {
  const sel = { ...emptySelection(), ...patch };
  return tileState(id, sel, cittasMatching(sel));
};

describe('tileState', () => {
  it('is normal with nothing selected', () => {
    expect(state(1, {})).toBe('normal');
  });

  it('marks picked cittas selected and dims the rest', () => {
    expect(state(1, { citta: [1] })).toBe('selected');
    expect(state(2, { citta: [1] })).toBe('dim');
  });

  it('marks filter matches and dims non-matches', () => {
    expect(state(1, { cetasika: [12] })).toBe('match');
    expect(state(5, { cetasika: [12] })).toBe('dim');
  });

  it('prefers selected over match', () => {
    expect(state(1, { citta: [1], cetasika: [12] })).toBe('selected');
  });

  it('dims everything when a combination has no matches (Review Focus #3)', () => {
    expect(state(1, { cetasika: [21, 12] })).toBe('dim');
    expect(state(9, { cetasika: [21, 12] })).toBe('dim');
  });
});
