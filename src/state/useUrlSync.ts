'use client';

import { useEffect, useRef } from 'react';
import { INVALID_LINK_NOTICE, useSelection } from './selection';
import { parseSelection, serializeSelection } from './url';

/**
 * Reads the selection from the URL once, then mirrors every change back with replaceState.
 *
 * React StrictMode (on by default in dev under the App Router) mounts effects twice:
 * setup -> cleanup -> setup. Both effects below must tolerate that replay:
 * - The read effect is idempotent: it re-parses the same, untouched URL and writes the
 *   same result to the store both times.
 * - The write effect must not fire before hydration has actually replaced the store's
 *   selection. We capture the pre-hydration selection object once on first render and
 *   skip writing for as long as the store still holds that exact object (by reference).
 *   A real user action (select/clear) always produces a new selection object, so it is
 *   never mistaken for the untouched pre-hydration state, and clearing still writes the
 *   bare URL.
 */
export function useUrlSync(): void {
  const initial = useRef(useSelection.getState().selection);
  const selection = useSelection((s) => s.selection);

  useEffect(() => {
    const { selection: parsed, invalid } = parseSelection(window.location.search);
    useSelection.setState({ selection: parsed, notice: invalid ? INVALID_LINK_NOTICE : null });
  }, []);

  useEffect(() => {
    if (selection === initial.current) return;
    const url = window.location.pathname + serializeSelection(selection);
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [selection]);
}
