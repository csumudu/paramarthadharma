'use client';

import { BAND_HEADER_CLASSES } from '@/components/colors';
import { BAND_LABELS, CETASIKAS, type Band, type CittaProfile, type Selection } from '@/data';
import { Chip } from './Chip';
import { chipState } from './chipState';

const BANDS: Band[] = ['annasamana', 'akusala', 'sobhana'];

export function CetasikaGrid({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div className="grid gap-3 2xl:grid-cols-3">
      {BANDS.map((band) => {
        const bandCetasikas = CETASIKAS.filter((c) => c.band === band);
        const on = profile
          ? bandCetasikas.filter((c) => profile.cetasikas.some((r) => r.cetasika === c.id)).length
          : 0;
        return (
          <div key={band} className="min-w-0">
            <span
              className={`mb-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${BAND_HEADER_CLASSES[band]}`}
            >
              {BAND_LABELS[band]} · {on} / {bandCetasikas.length}
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {bandCetasikas.map((c) => (
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
        );
      })}
    </div>
  );
}
