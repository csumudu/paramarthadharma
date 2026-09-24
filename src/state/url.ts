import { emptySelection, parseEntityId, type EntityId, type EntityKind, type Selection } from '@/data';

const KEYS: [EntityKind, string][] = [
  ['citta', 'c'],
  ['cetasika', 'ce'],
  ['kicca', 'k'],
  ['psLink', 'ps'],
  ['puggala', 'p'],
  ['bhumi', 'b'],
];

export function serializeSelection(sel: Selection): string {
  const parts = KEYS.filter(([kind]) => sel[kind].length > 0).map(
    ([kind, key]) => `${key}=${(sel[kind] as EntityId[]).map((v) => encodeURIComponent(String(v))).join(',')}`,
  );
  return parts.length ? `?${parts.join('&')}` : '';
}

export function parseSelection(search: string): { selection: Selection; invalid: boolean } {
  const params = new URLSearchParams(search);
  const selection = emptySelection();
  let invalid = false;
  for (const [kind, key] of KEYS) {
    const raw = params.get(key);
    if (raw === null) continue;
    const tokens = raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    if (tokens.length === 0) {
      invalid = true;
      continue;
    }
    const seen = new Set<string>();
    for (const token of tokens) {
      const id = parseEntityId(kind, token);
      if (id === null) {
        invalid = true;
        continue;
      }
      if (seen.has(String(id))) continue;
      seen.add(String(id));
      (selection[kind] as EntityId[]).push(id);
    }
  }
  return { selection, invalid };
}
