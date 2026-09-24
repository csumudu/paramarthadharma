import { describe, expect, it } from 'vitest';
import { emptySelection, profileOf } from '@/data';
import { chipState, matchCaption } from './chipState';

describe('chipState', () => {
  const sel1 = { ...emptySelection(), citta: [1] };
  const p1 = profileOf(1);

  it('reflects niyata / aniyata / off for a citta profile', () => {
    expect(chipState('cetasika', 18, sel1, p1)).toBe('niyata');
    expect(chipState('cetasika', 20, { ...emptySelection(), citta: [3] }, profileOf(3))).toBe('aniyata');
    expect(chipState('cetasika', 21, sel1, p1)).toBe('off');
  });

  it('marks present kiccas, PS links, puggalas and bhūmis as on', () => {
    expect(chipState('kicca', 'javana', sel1, p1)).toBe('on');
    expect(chipState('kicca', 'patisandhi', sel1, p1)).toBe('off');
    expect(chipState('psLink', 'vedana-tanha', sel1, p1)).toBe('on');
    expect(chipState('puggala', 'arahant', sel1, p1)).toBe('off');
    expect(chipState('bhumi', 'kama', sel1, p1)).toBe('on');
  });

  it('marks selected filters as selected even without a profile', () => {
    expect(chipState('cetasika', 12, { ...emptySelection(), cetasika: [12] }, null)).toBe('selected');
    expect(chipState('cetasika', 13, { ...emptySelection(), cetasika: [12] }, null)).toBe('off');
  });
});

describe('matchCaption', () => {
  it('is null without filters', () => {
    expect(matchCaption(emptySelection())).toBeNull();
  });

  it('names the filters and counts the cittas', () => {
    expect(matchCaption({ ...emptySelection(), cetasika: [12] })).toBe('පීති: සිත් 35');
    expect(matchCaption({ ...emptySelection(), cetasika: [12], puggala: ['sotapanna'] })).toBe(
      'පීති + සෝතාපන්න: සිත් 15',
    );
  });

  it('explains an empty combination (Review Focus #3)', () => {
    expect(matchCaption({ ...emptySelection(), cetasika: [21, 12] })).toBe('දෝස + පීති: සිත් 0 — පොදු සිතක් නැත');
  });
});
