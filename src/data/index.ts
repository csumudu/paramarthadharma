import { BHUMIS, bhumiById } from './entities/bhumis';
import { BAND_LABELS, CETASIKAS, SUBGROUP_LABELS, cetasikaById } from './entities/cetasikas';
import { CITTAS, JATI_LABELS, VEDANA_LABELS, cittaById } from './entities/cittas';
import { CATEGORY_LABELS, GROUPS, SPHERES, SPHERE_LABELS, groupById } from './entities/groups';
import { KICCAS, kiccaById } from './entities/kiccas';
import { PS_LINKS, STANDARD_CHAIN, psLabel, psLinkById } from './entities/psLinks';
import { PUGGALAS, puggalaById } from './entities/puggalas';
import { BHUMI_RELS } from './relations/bhumiRules';
import { CETASIKA_RELS } from './relations/cetasikaRules';
import { KICCA_RELS } from './relations/kiccaRules';
import { PS_RELS } from './relations/psRules';
import { PUGGALA_RELS } from './relations/puggalaRules';
import type {
  BhumiId,
  BhumiRel,
  CetasikaRel,
  KiccaId,
  KiccaRel,
  PsLinkId,
  PsRel,
  PuggalaId,
  PuggalaRel,
} from './types';

export * from './types';
export {
  BAND_LABELS,
  BHUMIS,
  BHUMI_RELS,
  CATEGORY_LABELS,
  CETASIKAS,
  CETASIKA_RELS,
  CITTAS,
  GROUPS,
  JATI_LABELS,
  KICCAS,
  KICCA_RELS,
  PS_LINKS,
  PS_RELS,
  PUGGALAS,
  PUGGALA_RELS,
  SPHERES,
  SPHERE_LABELS,
  STANDARD_CHAIN,
  SUBGROUP_LABELS,
  VEDANA_LABELS,
  bhumiById,
  cetasikaById,
  cittaById,
  groupById,
  kiccaById,
  psLabel,
  psLinkById,
  puggalaById,
};

export type FilterKind = 'cetasika' | 'kicca' | 'psLink' | 'puggala' | 'bhumi';
export type EntityKind = 'citta' | FilterKind;
export type EntityId = number | string;

export const FILTER_KINDS: FilterKind[] = ['cetasika', 'kicca', 'psLink', 'puggala', 'bhumi'];

export interface Selection {
  citta: number[];
  cetasika: number[];
  kicca: KiccaId[];
  psLink: PsLinkId[];
  puggala: PuggalaId[];
  bhumi: BhumiId[];
}

export const emptySelection = (): Selection => ({
  citta: [],
  cetasika: [],
  kicca: [],
  psLink: [],
  puggala: [],
  bhumi: [],
});

export interface CittaProfile {
  cetasikas: CetasikaRel[];
  kiccas: KiccaRel[];
  psLinks: PsRel[];
  puggalas: PuggalaRel[];
  bhumis: BhumiRel[];
}

const profiles = new Map<number, CittaProfile>(
  CITTAS.map((c) => [c.id, { cetasikas: [], kiccas: [], psLinks: [], puggalas: [], bhumis: [] }]),
);
const reverse: Record<FilterKind, Map<string, Set<number>>> = {
  cetasika: new Map(),
  kicca: new Map(),
  psLink: new Map(),
  puggala: new Map(),
  bhumi: new Map(),
};
const addReverse = (kind: FilterKind, id: EntityId, citta: number) => {
  const key = String(id);
  let set = reverse[kind].get(key);
  if (!set) reverse[kind].set(key, (set = new Set()));
  set.add(citta);
};

for (const r of CETASIKA_RELS) {
  profiles.get(r.citta)!.cetasikas.push(r);
  addReverse('cetasika', r.cetasika, r.citta);
}
for (const r of KICCA_RELS) {
  profiles.get(r.citta)!.kiccas.push(r);
  addReverse('kicca', r.kicca, r.citta);
}
for (const r of PS_RELS) {
  profiles.get(r.citta)!.psLinks.push(r);
  addReverse('psLink', r.psLink, r.citta);
}
for (const r of PUGGALA_RELS) {
  profiles.get(r.citta)!.puggalas.push(r);
  addReverse('puggala', r.puggala, r.citta);
}
for (const r of BHUMI_RELS) {
  profiles.get(r.citta)!.bhumis.push(r);
  addReverse('bhumi', r.bhumi, r.citta);
}

export function profileOf(cittaId: number): CittaProfile {
  const p = profiles.get(cittaId);
  if (!p) throw new Error(`Unknown citta ${cittaId}`);
  return p;
}

/** Read-only: returns the internal reverse-index Set for (kind, id). Do not mutate the result. */
export function cittasFor(kind: FilterKind, id: EntityId): Set<number> {
  return reverse[kind].get(String(id)) ?? new Set();
}

export function activeFilters(sel: Selection): { kind: FilterKind; id: EntityId }[] {
  return FILTER_KINDS.flatMap((kind) => (sel[kind] as EntityId[]).map((id) => ({ kind, id })));
}

export const hasFilters = (sel: Selection): boolean => FILTER_KINDS.some((k) => sel[k].length > 0);
export const hasAnySelection = (sel: Selection): boolean => sel.citta.length > 0 || hasFilters(sel);

export function cittasMatching(sel: Selection): Set<number> | null {
  const filters = activeFilters(sel);
  if (filters.length === 0) return null;
  const sets = filters.map(({ kind, id }) => cittasFor(kind, id));
  return sets
    .slice(1)
    .reduce<Set<number>>((acc, set) => new Set([...acc].filter((c) => set.has(c))), new Set(sets[0]));
}

export const KIND_LABELS: Record<EntityKind, string> = {
  citta: 'සිත',
  cetasika: 'චෛතසික',
  kicca: 'කෘත්‍ය',
  psLink: 'පටිච්චසමුප්පාද',
  puggala: 'පුද්ගල',
  bhumi: 'භූමි',
};

export function labelOf(kind: EntityKind, id: EntityId): string {
  switch (kind) {
    case 'citta': {
      const c = cittaById.get(Number(id));
      return c ? `${c.id}. ${c.short}` : String(id);
    }
    case 'cetasika':
      return cetasikaById.get(Number(id))?.nameSi ?? String(id);
    case 'kicca':
      return kiccaById.get(id as KiccaId)?.nameSi ?? String(id);
    case 'psLink': {
      const l = psLinkById.get(id as PsLinkId);
      return l ? psLabel(l) : String(id);
    }
    case 'puggala':
      return puggalaById.get(id as PuggalaId)?.nameSi ?? String(id);
    case 'bhumi':
      return bhumiById.get(id as BhumiId)?.nameSi ?? String(id);
  }
}

export function parseEntityId(kind: EntityKind, token: string): EntityId | null {
  const asInt = (m: Map<number, unknown>) => {
    if (!/^\d+$/.test(token)) return null;
    const n = Number(token);
    return m.has(n) ? n : null;
  };
  switch (kind) {
    case 'citta':
      return asInt(cittaById);
    case 'cetasika':
      return asInt(cetasikaById);
    case 'kicca':
      return kiccaById.has(token as KiccaId) ? token : null;
    case 'psLink':
      return psLinkById.has(token as PsLinkId) ? token : null;
    case 'puggala':
      return puggalaById.has(token as PuggalaId) ? token : null;
    case 'bhumi':
      return bhumiById.has(token as BhumiId) ? token : null;
  }
}

export interface SearchResult {
  kind: EntityKind;
  id: EntityId;
  label: string;
}

export function searchEntities(query: string, limit = 10): SearchResult[] {
  const q = query.normalize('NFC').trim();
  if (!q) return [];
  if (/^\d+$/.test(q)) {
    const c = cittaById.get(Number(q));
    return c ? [{ kind: 'citta', id: c.id, label: labelOf('citta', c.id) }] : [];
  }
  const out: SearchResult[] = [];
  const consider = (kind: EntityKind, id: EntityId, label: string, haystack: string[]) => {
    if (out.length < limit && haystack.some((h) => h.includes(q))) out.push({ kind, id, label });
  };
  for (const c of CETASIKAS) consider('cetasika', c.id, c.nameSi, [c.nameSi]);
  for (const k of KICCAS) consider('kicca', k.id, k.nameSi, [k.nameSi]);
  for (const l of PS_LINKS) consider('psLink', l.id, psLabel(l), [psLabel(l)]);
  for (const p of PUGGALAS) consider('puggala', p.id, p.nameSi, [p.nameSi]);
  for (const b of BHUMIS) consider('bhumi', b.id, b.nameSi, [b.nameSi]);
  for (const c of CITTAS) consider('citta', c.id, labelOf('citta', c.id), [c.nameSi, c.short]);
  return out;
}
