import type { Selection } from '@/data';

export type TileState = 'selected' | 'match' | 'dim' | 'normal';

export function tileState(cittaId: number, selection: Selection, matching: Set<number> | null): TileState {
  const picked = selection.citta.includes(cittaId);
  if (matching) {
    if (picked) return 'selected';
    return matching.has(cittaId) ? 'match' : 'dim';
  }
  if (selection.citta.length > 0) return picked ? 'selected' : 'dim';
  return 'normal';
}
