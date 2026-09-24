'use client';

import {
  PS_LINKS,
  STANDARD_CHAIN,
  psLabel,
  psLinkById,
  type CittaProfile,
  type PsRel,
  type Selection,
} from '@/data';
import { range } from '@/data/range';
import { Chip } from './Chip';
import { chipState } from './chipState';

export function PsChain({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  if (!profile) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {PS_LINKS.map((l) => (
          <Chip
            key={l.id}
            kind="psLink"
            id={l.id}
            label={psLabel(l)}
            tone="neutral"
            state={chipState('psLink', l.id, selection, null)}
          />
        ))}
      </div>
    );
  }

  const bySlot = new Map<number, PsRel[]>();
  for (const r of profile.psLinks) {
    const slot = psLinkById.get(r.psLink)!.slot;
    bySlot.set(slot, [...(bySlot.get(slot) ?? []), r]);
  }

  return (
    <ol data-testid="ps-chain" className="flex flex-col items-start gap-1">
      {range(1, 11).map((slot) => {
        const rels = bySlot.get(slot);
        if (!rels) {
          return (
            <li
              key={slot}
              data-state="off"
              className="rounded-full border-2 border-dashed border-line px-3 py-1 text-sm text-muted"
            >
              {psLabel(psLinkById.get(STANDARD_CHAIN[slot - 1])!)}
            </li>
          );
        }
        return (
          <li key={slot} className="flex flex-wrap gap-1">
            {rels.map((r) => (
              <Chip
                key={r.psLink}
                kind="psLink"
                id={r.psLink}
                label={psLabel(psLinkById.get(r.psLink)!)}
                tone="neutral"
                state={chipState('psLink', r.psLink, selection, profile)}
                reviewNote={r.status === 'rule' ? undefined : (r.note ?? r.status)}
              />
            ))}
          </li>
        );
      })}
    </ol>
  );
}
