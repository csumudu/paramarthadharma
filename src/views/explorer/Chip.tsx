'use client';

import { REVIEW_OUTLINE_CLASSES, chipToneClass, type ChipState, type ChipTone } from '@/components/colors';
import { useLongPress } from '@/components/useLongPress';
import type { EntityId, FilterKind } from '@/data';
import { useSelection } from '@/state/selection';

export function Chip({
  kind,
  id,
  label,
  state,
  tone,
  reviewNote,
  reviewStatus,
}: {
  kind: FilterKind;
  id: EntityId;
  label: string;
  state: ChipState;
  tone: ChipTone;
  reviewNote?: string;
  /** 'chart' = attested in a review chart but not the textbook chain; 'disputed' = reviewers disagree. */
  reviewStatus?: 'chart' | 'disputed';
}) {
  const select = useSelection((s) => s.select);
  const handlers = useLongPress({
    onClick: (e) => select(kind, id, e.shiftKey),
    onLongPress: () => select(kind, id, true),
  });
  return (
    <button
      type="button"
      {...handlers}
      data-state={state}
      aria-pressed={state === 'selected'}
      aria-label={label}
      title={reviewNote}
      className={`min-h-11 rounded-full border-2 px-3 py-1 text-sm leading-tight transition ${chipToneClass(tone, state)} ${reviewStatus ? REVIEW_OUTLINE_CLASSES[reviewStatus] : ''}`}
    >
      {label}
      {state === 'aniyata' && <span aria-hidden> ●</span>}
      {reviewNote && (
        <sup aria-hidden className="ml-0.5 font-bold">
          ?
        </sup>
      )}
    </button>
  );
}
