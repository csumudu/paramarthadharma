'use client';

import { Fragment } from 'react';
import { KICCAS, type CittaProfile, type Kicca, type Selection } from '@/data';
import { Chip } from './Chip';
import { chipState } from './chipState';

const COLUMNS: Kicca[][] = [...new Set(KICCAS.map((k) => k.vithiOrder))]
  .sort((a, b) => a - b)
  .map((order) => KICCAS.filter((k) => k.vithiOrder === order));

export function VithiStrip({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div data-testid="vithi-strip" className="flex snap-x gap-2 overflow-x-auto pb-2">
      {COLUMNS.map((column, i) => (
        <Fragment key={column[0].vithiOrder}>
          {i > 0 && (
            <span aria-hidden className="self-center text-muted">
              →
            </span>
          )}
          <div className="flex shrink-0 snap-start flex-col justify-center gap-1">
            {column.map((k) => (
              <Chip
                key={k.id}
                kind="kicca"
                id={k.id}
                label={k.nameSi}
                tone="neutral"
                state={chipState('kicca', k.id, selection, profile)}
              />
            ))}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
