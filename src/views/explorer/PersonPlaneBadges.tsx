'use client';

import { chipToneClass, type ChipState } from '@/components/colors';
import { useLongPress } from '@/components/useLongPress';
import { BHUMIS, PUGGALAS, type CittaProfile, type EntityId, type Selection } from '@/data';
import { useSelection } from '@/state/selection';
import { chipState } from './chipState';

/**
 * Solid-ink / dashed-faint badge — a simpler two-tone variant than the shared `Chip` (which is tuned
 * for niyata/aniyata cetasika chips): on reuses the chip 'on'/'selected' ink fill, off is dashed.
 */
function Badge({
  kind,
  id,
  label,
  state,
}: {
  kind: 'puggala' | 'bhumi';
  id: EntityId;
  label: string;
  state: ChipState;
}) {
  const select = useSelection((s) => s.select);
  const handlers = useLongPress({
    onClick: (e) => select(kind, id, e.shiftKey),
    onLongPress: () => select(kind, id, true),
  });
  const cls = state === 'off' ? 'border-dashed border-line-strong text-faint bg-transparent' : chipToneClass('neutral', state);
  return (
    <button
      type="button"
      {...handlers}
      data-state={state}
      aria-pressed={state === 'selected'}
      aria-label={label}
      className={`min-h-11 rounded-full border-2 px-3 py-1 text-sm leading-tight transition ${cls}`}
    >
      {label}
    </button>
  );
}

export function PersonPlaneBadges({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PUGGALAS.map((p) => (
          <Badge
            key={p.id}
            kind="puggala"
            id={p.id}
            label={p.nameSi}
            state={chipState('puggala', p.id, selection, profile)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BHUMIS.map((b) => (
          <Badge
            key={b.id}
            kind="bhumi"
            id={b.id}
            label={b.nameSi}
            state={chipState('bhumi', b.id, selection, profile)}
          />
        ))}
      </div>
    </div>
  );
}
