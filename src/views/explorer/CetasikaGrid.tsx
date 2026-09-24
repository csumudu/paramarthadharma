'use client';

import { BAND_LABELS, CETASIKAS, type Band, type CittaProfile, type Selection } from '@/data';
import { Chip } from './Chip';
import { chipState } from './chipState';

const BANDS: Band[] = ['annasamana', 'akusala', 'sobhana'];

export function CetasikaGrid({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div className="grid gap-3 2xl:grid-cols-3">
      {BANDS.map((band) => (
        <div key={band} className="min-w-0">
          <h4 className="mb-1 text-sm font-bold">{BAND_LABELS[band]}</h4>
          <div className="flex flex-wrap gap-1.5">
            {CETASIKAS.filter((c) => c.band === band).map((c) => (
              <Chip
                key={c.id}
                kind="cetasika"
                id={c.id}
                label={c.nameSi}
                tone={band}
                state={chipState('cetasika', c.id, selection, profile)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
