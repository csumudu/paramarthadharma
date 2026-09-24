'use client';

import { BHUMIS, PUGGALAS, type CittaProfile, type Selection } from '@/data';
import { Chip } from './Chip';
import { chipState } from './chipState';

export function PersonPlaneBadges({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {PUGGALAS.map((p) => (
          <Chip
            key={p.id}
            kind="puggala"
            id={p.id}
            label={p.nameSi}
            tone="neutral"
            state={chipState('puggala', p.id, selection, profile)}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BHUMIS.map((b) => (
          <Chip
            key={b.id}
            kind="bhumi"
            id={b.id}
            label={b.nameSi}
            tone="neutral"
            state={chipState('bhumi', b.id, selection, profile)}
          />
        ))}
      </div>
    </div>
  );
}
