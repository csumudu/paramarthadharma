import { describe, expect, it } from 'vitest';
import { emptySelection } from '@/data';
import { parseSelection, serializeSelection } from './url';

describe('serializeSelection', () => {
  it('returns an empty string for an empty selection', () => {
    expect(serializeSelection(emptySelection())).toBe('');
  });

  it('writes compact keys in a fixed order', () => {
    const sel = { ...emptySelection(), citta: [1], cetasika: [12, 14], kicca: ['javana' as const], bhumi: ['kama' as const] };
    expect(serializeSelection(sel)).toBe('?c=1&ce=12,14&k=javana&b=kama');
  });
});

describe('parseSelection', () => {
  it('round-trips', () => {
    const sel = {
      ...emptySelection(),
      citta: [1, 31],
      cetasika: [12],
      psLink: ['vedana-tanha' as const],
      puggala: ['sotapanna' as const],
    };
    expect(parseSelection(serializeSelection(sel))).toEqual({ selection: sel, invalid: false });
  });

  it('ignores unknown keys without flagging', () => {
    expect(parseSelection('?c=1&utm=x')).toEqual({ selection: { ...emptySelection(), citta: [1] }, invalid: false });
  });

  it('drops invalid ids and flags the link (Review Focus #2)', () => {
    expect(parseSelection('?c=999')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?c=0')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?c=')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?k=JAVANA')).toEqual({ selection: emptySelection(), invalid: true });
    expect(parseSelection('?c=1,abc&ce=12')).toEqual({
      selection: { ...emptySelection(), citta: [1], cetasika: [12] },
      invalid: true,
    });
  });

  it('dedupes repeated ids silently', () => {
    expect(parseSelection('?ce=1,1,1')).toEqual({ selection: { ...emptySelection(), cetasika: [1] }, invalid: false });
  });

  it('handles an empty search string', () => {
    expect(parseSelection('')).toEqual({ selection: emptySelection(), invalid: false });
  });
});
