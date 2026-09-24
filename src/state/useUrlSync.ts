'use client';

import { useEffect, useRef } from 'react';
import { INVALID_LINK_NOTICE, useSelection } from './selection';
import { parseSelection, serializeSelection } from './url';

/** Reads the selection from the URL once, then mirrors every change back with replaceState. */
export function useUrlSync(): void {
  const selection = useSelection((s) => s.selection);
  const hydrated = useRef(false);

  // Write effect is declared first so that, on mount, it runs before hydration and is skipped.
  useEffect(() => {
    if (!hydrated.current) return;
    const url = window.location.pathname + serializeSelection(selection);
    if (url !== window.location.pathname + window.location.search) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [selection]);

  useEffect(() => {
    const { selection: parsed, invalid } = parseSelection(window.location.search);
    useSelection.setState({ selection: parsed, notice: invalid ? INVALID_LINK_NOTICE : null });
    hydrated.current = true;
  }, []);
}
