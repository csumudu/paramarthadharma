import { describe, expect, it } from 'vitest';
import { emptySelection } from '@/data';
import { applySelect, useSelection } from './selection';

describe('applySelect', () => {
  it('replaces the selection on a plain click', () => {
    const start = { ...emptySelection(), cetasika: [12], puggala: ['arahant' as const] };
    expect(applySelect(start, 'citta', 3, false)).toEqual({ ...emptySelection(), citta: [3] });
  });

  it('clears when clicking the only selected item again', () => {
    const start = { ...emptySelection(), citta: [3] };
    expect(applySelect(start, 'citta', 3, false)).toEqual(emptySelection());
  });

  it('does not clear when other items are also selected', () => {
    const start = { ...emptySelection(), citta: [3], cetasika: [12] };
    expect(applySelect(start, 'citta', 3, false)).toEqual({ ...emptySelection(), citta: [3] });
  });

  it('toggles within a kind on an additive click and keeps other kinds', () => {
    const start = { ...emptySelection(), cetasika: [12] };
    const added = applySelect(start, 'puggala', 'sotapanna', true);
    expect(added).toEqual({ ...emptySelection(), cetasika: [12], puggala: ['sotapanna'] });
    expect(applySelect(added, 'cetasika', 12, true)).toEqual({ ...emptySelection(), puggala: ['sotapanna'] });
  });
});

describe('useSelection store', () => {
  it('selects, clears and dismisses the notice', () => {
    useSelection.getState().select('cetasika', 12);
    expect(useSelection.getState().selection.cetasika).toEqual([12]);
    useSelection.getState().clear();
    expect(useSelection.getState().selection).toEqual(emptySelection());
    useSelection.setState({ notice: 'x' });
    useSelection.getState().dismissNotice();
    expect(useSelection.getState().notice).toBeNull();
  });
});
