'use client';

import { useSyncExternalStore } from 'react';

/**
 * `useSyncExternalStore` (not effect+setState) so the subscription itself drives updates:
 * eslint's `react-hooks/set-state-in-effect` flags a synchronous `setState` in an effect body,
 * and this pattern is also React's own recommendation for subscribing to an external source.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = (onChange: () => void) => {
    const mq = window.matchMedia(query);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  };
  const getSnapshot = () => window.matchMedia(query).matches;
  const getServerSnapshot = () => false;
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
