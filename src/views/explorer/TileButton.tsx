'use client';

import { motion } from 'motion/react';
import type { CSSProperties } from 'react';
import { groupById, type Citta } from '@/data';
import { CATEGORY_CLASSES } from '@/components/colors';
import { useLongPress } from '@/components/useLongPress';
import { useSelection } from '@/state/selection';
import type { TileState } from './tileState';

const STATE_CLASSES: Record<TileState, string> = {
  selected: 'z-10 ring-4 ring-fg ring-offset-2 ring-offset-bg',
  match: 'z-10 ring-2 ring-fg',
  dim: '',
  normal: '',
};

export function TileButton({
  citta,
  state,
  style,
  className = '',
}: {
  citta: Citta;
  state: TileState;
  style?: CSSProperties;
  className?: string;
}) {
  const select = useSelection((s) => s.select);
  const handlers = useLongPress({
    onClick: (e) => select('citta', citta.id, e.shiftKey),
    onLongPress: () => select('citta', citta.id, true),
  });
  const category = groupById.get(citta.group)!.category;

  return (
    <motion.button
      type="button"
      {...handlers}
      data-state={state}
      aria-pressed={state === 'selected'}
      aria-label={`${citta.id}. ${citta.nameSi}`}
      title={citta.nameSi}
      animate={{ opacity: state === 'dim' ? 0.22 : 1, scale: state === 'match' ? 1.04 : 1 }}
      transition={{ duration: 0.2 }}
      style={style}
      className={`flex min-h-11 flex-col items-center justify-center overflow-hidden rounded-md p-1 text-center leading-tight break-words ${CATEGORY_CLASSES[category]} ${STATE_CLASSES[state]} ${className}`}
    >
      <span className="text-xs font-bold opacity-80">{citta.id}</span>
      <span className="text-[0.78rem]">{citta.short}</span>
    </motion.button>
  );
}
