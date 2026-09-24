import {
  activeFilters,
  cittasMatching,
  labelOf,
  type CittaProfile,
  type EntityId,
  type FilterKind,
  type Selection,
} from '@/data';
import type { ChipState } from '@/components/colors';

export function chipState(
  kind: FilterKind,
  id: EntityId,
  selection: Selection,
  profile: CittaProfile | null,
): ChipState {
  if ((selection[kind] as EntityId[]).includes(id)) return 'selected';
  if (!profile) return 'off';
  switch (kind) {
    case 'cetasika':
      return profile.cetasikas.find((r) => r.cetasika === id)?.kind ?? 'off';
    case 'kicca':
      return profile.kiccas.some((r) => r.kicca === id) ? 'on' : 'off';
    case 'psLink':
      return profile.psLinks.some((r) => r.psLink === id) ? 'on' : 'off';
    case 'puggala':
      return profile.puggalas.some((r) => r.puggala === id) ? 'on' : 'off';
    case 'bhumi':
      return profile.bhumis.some((r) => r.bhumi === id) ? 'on' : 'off';
  }
}

export function matchCaption(selection: Selection): string | null {
  const matching = cittasMatching(selection);
  if (!matching) return null;
  const names = activeFilters(selection)
    .map((f) => labelOf(f.kind, f.id))
    .join(' + ');
  const suffix = matching.size === 0 ? ' — පොදු සිතක් නැත' : '';
  return `${names}: සිත් ${matching.size}${suffix}`;
}
