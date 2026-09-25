import { create } from 'zustand';
import { emptySelection, type EntityId, type EntityKind, type Selection } from '@/data';

export const INVALID_LINK_NOTICE = 'සබැඳියේ හඳුනා නොගත් කොටස් ඉවත් කරන ලදී.';

const KINDS: EntityKind[] = ['citta', 'cetasika', 'kicca', 'psLink', 'puggala', 'bhumi'];

export function applySelect(sel: Selection, kind: EntityKind, id: EntityId, additive: boolean): Selection {
  const list = sel[kind] as EntityId[];
  if (additive) {
    const next = list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
    return { ...sel, [kind]: next } as Selection;
  }
  const onlyThis = list.length === 1 && list[0] === id && KINDS.every((k) => k === kind || sel[k].length === 0);
  if (onlyThis) return emptySelection();
  return { ...emptySelection(), [kind]: [id] } as Selection;
}

interface SelectionStore {
  selection: Selection;
  notice: string | null;
  select: (kind: EntityKind, id: EntityId, additive?: boolean) => void;
  set: (selection: Selection) => void;
  clear: () => void;
  /** Empties every filter kind (cetasika/kicca/psLink/puggala/bhumi) but keeps the citta selection. */
  clearFilters: () => void;
  dismissNotice: () => void;
}

export const useSelection = create<SelectionStore>((set) => ({
  selection: emptySelection(),
  notice: null,
  select: (kind, id, additive = false) => set((s) => ({ selection: applySelect(s.selection, kind, id, additive) })),
  set: (selection) => set({ selection }),
  clear: () => set({ selection: emptySelection() }),
  clearFilters: () =>
    set((s) => ({
      selection: { ...s.selection, cetasika: [], kicca: [], psLink: [], puggala: [], bhumi: [] },
    })),
  dismissNotice: () => set({ notice: null }),
}));
