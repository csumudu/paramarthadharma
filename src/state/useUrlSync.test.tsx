import { act, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { INVALID_LINK_NOTICE, useSelection } from './selection';
import { useUrlSync } from './useUrlSync';

function Probe() {
  useUrlSync();
  return null;
}

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('useUrlSync', () => {
  it('hydrates the selection from the URL under StrictMode without wiping it', () => {
    window.history.replaceState(null, '', '/x?c=1&ce=12');

    render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    );

    expect(useSelection.getState().selection.citta).toEqual([1]);
    expect(useSelection.getState().selection.cetasika).toEqual([12]);
    expect(window.location.search).toBe('?c=1&ce=12');
  });

  it('flags an invalid link and clears the selection', () => {
    window.history.replaceState(null, '', '/x?c=999');

    render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    );

    expect(useSelection.getState().selection).toEqual({
      citta: [],
      cetasika: [],
      kicca: [],
      psLink: [],
      puggala: [],
      bhumi: [],
    });
    expect(useSelection.getState().notice).toBe(INVALID_LINK_NOTICE);
  });

  it('writes selection changes back to the URL, including clearing', () => {
    window.history.replaceState(null, '', '/x');

    render(
      <StrictMode>
        <Probe />
      </StrictMode>,
    );

    act(() => {
      useSelection.getState().select('cetasika', 12);
    });
    expect(window.location.search).toBe('?ce=12');

    act(() => {
      useSelection.getState().clear();
    });
    expect(window.location.search).toBe('');
  });
});
