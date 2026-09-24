'use client';

import { useMemo } from 'react';
import { CITTAS, GROUPS, SPHERES, SPHERE_LABELS, cittasMatching } from '@/data';
import { useSelection } from '@/state/selection';
import { TileButton } from './TileButton';
import { tileState } from './tileState';

export function CittaList() {
  const selection = useSelection((s) => s.selection);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  return (
    <div data-testid="citta-list" className="space-y-2">
      {SPHERES.map((sphere) => (
        <details key={sphere} open className="rounded-lg border border-line bg-surface">
          <summary className="flex min-h-11 cursor-pointer items-center px-3 font-display text-lg font-bold">
            {SPHERE_LABELS[sphere]}
          </summary>
          <div className="space-y-3 px-3 pb-3">
            {GROUPS.filter((g) => g.sphere === sphere).map((g) => {
              const cittas = CITTAS.filter((c) => c.group === g.id);
              return (
                <section key={g.id}>
                  <h3 className="mb-1 text-sm text-muted">
                    {g.nameSi} ({cittas.length})
                  </h3>
                  <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
                    {cittas.map((c) => (
                      <TileButton key={c.id} citta={c} state={tileState(c.id, selection, matching)} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </details>
      ))}
    </div>
  );
}
