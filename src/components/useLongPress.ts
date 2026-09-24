'use client';

import { useRef, type MouseEvent } from 'react';

/** Long-press (touch) acts like shift-click: adds to the selection instead of replacing it. */
export function useLongPress({
  onClick,
  onLongPress,
  ms = 500,
}: {
  onClick: (e: MouseEvent) => void;
  onLongPress: () => void;
  ms?: number;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fired = useRef(false);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  return {
    onPointerDown: () => {
      fired.current = false;
      cancel();
      timer.current = setTimeout(() => {
        fired.current = true;
        onLongPress();
      }, ms);
    },
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onClick: (e: MouseEvent) => {
      if (fired.current) {
        fired.current = false;
        return;
      }
      onClick(e);
    },
    onContextMenu: (e: MouseEvent) => {
      if (fired.current) e.preventDefault();
    },
  };
}
