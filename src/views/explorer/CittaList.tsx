'use client';

import { useMemo } from 'react';
import { CITTAS, GROUPS, SPHERES, SPHERE_LABELS, cittasMatching } from '@/data';
import { useSelection } from '@/state/selection';
import { TileButton } from './TileButton';
import { tileState } from './tileState';

function ChevronIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="shrink-0 text-muted transition-transform group-open:rotate-180"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function CittaList() {
  const selection = useSelection((s) => s.selection);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  return (
    <div data-testid="citta-list" className="space-y-2.5">
      {SPHERES.map((sphere) => {
        const count = CITTAS.filter((c) => c.sphere === sphere).length;
        return (
          <details
            key={sphere}
            open
            className="group rounded-2xl border border-line bg-surface px-3.5 py-3"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
              <span className="flex items-baseline gap-1.5 font-display text-lg font-extrabold">
                <span>{SPHERE_LABELS[sphere]}</span>
                <span className="font-sans text-xs font-normal text-muted">· {count}</span>
              </span>
              <ChevronIcon />
            </summary>
            <div className="mt-2 space-y-3">
              {GROUPS.filter((g) => g.sphere === sphere).map((g) => {
                const cittas = CITTAS.filter((c) => c.group === g.id);
                return (
                  <section key={g.id}>
                    <h3 className="mb-1.5 text-xs text-muted">
                      {g.nameSi} · {cittas.length}
                    </h3>
                    <div className="grid grid-cols-6 gap-1.5">
                      {cittas.map((c) => (
                        <TileButton key={c.id} citta={c} state={tileState(c.id, selection, matching)} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
