import {
  FILTER_KINDS,
  SUBGROUP_LABELS,
  bhumiById,
  cetasikaById,
  cittaById,
  cittasFor,
  groupById,
  kiccaById,
  labelOf,
  profileOf,
  psLabel,
  psLinkById,
  puggalaById,
  type EntityId,
  type EntityKind,
  type FilterKind,
  type Selection,
} from '@/data';
import { CATEGORY_TONE } from '@/components/colors';

export type RelKind = FilterKind;
export const ALL_KINDS: RelKind[] = ['cetasika', 'kicca', 'psLink', 'puggala', 'bhumi'];

export interface Focus {
  kind: EntityKind;
  id: EntityId;
}

export interface GraphNode {
  id: string;
  kind: EntityKind | 'group';
  entityId?: EntityId;
  label: string;
  tone: string;
  x: number;
  y: number;
  groupKey?: string;
  count?: number;
  dashed: boolean;
  isFocus?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  dashed: boolean;
}

interface Item {
  kind: EntityKind;
  entityId: EntityId;
  label: string;
  tone: string;
  groupKey: string;
  groupLabel: string;
  dashed: boolean;
}

type Placed = Omit<GraphNode, 'x' | 'y'>;

function neighboursOfCitta(id: number, kinds: RelKind[]): Item[] {
  const p = profileOf(id);
  const out: Item[] = [];
  if (kinds.includes('cetasika'))
    for (const r of p.cetasikas) {
      const c = cetasikaById.get(r.cetasika)!;
      out.push({
        kind: 'cetasika',
        entityId: c.id,
        label: c.nameSi,
        tone: `band-${c.band}`,
        groupKey: `cetasika:${c.subgroup}`,
        groupLabel: SUBGROUP_LABELS[c.subgroup],
        dashed: r.kind === 'aniyata' || r.status !== 'rule',
      });
    }
  if (kinds.includes('kicca'))
    for (const r of p.kiccas)
      out.push({
        kind: 'kicca',
        entityId: r.kicca,
        label: kiccaById.get(r.kicca)!.nameSi,
        tone: 'muted',
        groupKey: 'kicca',
        groupLabel: 'කෘත්‍ය',
        dashed: r.status !== 'rule',
      });
  if (kinds.includes('psLink'))
    for (const r of p.psLinks)
      out.push({
        kind: 'psLink',
        entityId: r.psLink,
        label: psLabel(psLinkById.get(r.psLink)!),
        tone: 'muted',
        groupKey: 'psLink',
        groupLabel: 'පටිච්චසමුප්පාද',
        dashed: r.status !== 'rule',
      });
  if (kinds.includes('puggala'))
    for (const r of p.puggalas)
      out.push({
        kind: 'puggala',
        entityId: r.puggala,
        label: puggalaById.get(r.puggala)!.nameSi,
        tone: 'fg',
        groupKey: 'puggala',
        groupLabel: 'පුද්ගල',
        dashed: r.status !== 'rule',
      });
  if (kinds.includes('bhumi'))
    for (const r of p.bhumis)
      out.push({
        kind: 'bhumi',
        entityId: r.bhumi,
        label: bhumiById.get(r.bhumi)!.nameSi,
        tone: 'fg',
        groupKey: 'bhumi',
        groupLabel: 'භූමි',
        dashed: r.status !== 'rule',
      });
  return out;
}

function neighboursOfEntity(kind: FilterKind, id: EntityId): Item[] {
  return [...cittasFor(kind, id)]
    .sort((a, b) => a - b)
    .map((cid) => {
      const c = cittaById.get(cid)!;
      const g = groupById.get(c.group)!;
      return {
        kind: 'citta',
        entityId: cid,
        label: labelOf('citta', cid),
        tone: CATEGORY_TONE[g.category],
        groupKey: `group:${g.id}`,
        groupLabel: g.nameSi,
        dashed: false,
      };
    });
}

const toNode = (it: Item): Placed => ({
  id: `${it.kind}:${it.entityId}`,
  kind: it.kind,
  entityId: it.entityId,
  label: it.label,
  tone: it.tone,
  groupKey: it.groupKey,
  dashed: it.dashed,
});

function focusTone(focus: Focus): string {
  if (focus.kind === 'citta') {
    const c = cittaById.get(Number(focus.id));
    return c ? CATEGORY_TONE[groupById.get(c.group)!.category] : 'fg';
  }
  if (focus.kind === 'cetasika') {
    const c = cetasikaById.get(Number(focus.id));
    return c ? `band-${c.band}` : 'fg';
  }
  return 'fg';
}

function placeRing(items: Placed[]): GraphNode[] {
  const n = items.length;
  const radius = Math.max(240, (n * 70) / (2 * Math.PI));
  const stagger = n > 24;
  return items.map((it, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    const r = stagger && i % 2 === 1 ? radius + 90 : radius;
    return { ...it, x: Math.round(r * Math.cos(angle)), y: Math.round(r * Math.sin(angle)) };
  });
}

export function buildGraph(
  focus: Focus,
  opts: { kinds: RelKind[]; cap: number; expanded: string[] },
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const items =
    focus.kind === 'citta' ? neighboursOfCitta(Number(focus.id), opts.kinds) : neighboursOfEntity(focus.kind, focus.id);

  let ringItems: Placed[];
  if (items.length <= opts.cap) {
    ringItems = items.map(toNode);
  } else {
    const groups = new Map<string, Item[]>();
    for (const it of items) groups.set(it.groupKey, [...(groups.get(it.groupKey) ?? []), it]);
    ringItems = [...groups].flatMap(([key, members]): Placed[] =>
      opts.expanded.includes(key)
        ? members.map(toNode)
        : [
            {
              id: `grp:${key}`,
              kind: 'group',
              label: `${members[0].groupLabel} ${members.length}`,
              tone: members[0].tone,
              groupKey: key,
              count: members.length,
              dashed: false,
            },
          ],
    );
  }

  const focusNode: GraphNode = {
    id: 'focus',
    kind: focus.kind,
    entityId: focus.id,
    label: labelOf(focus.kind, focus.id),
    tone: focusTone(focus),
    x: 0,
    y: 0,
    dashed: false,
    isFocus: true,
  };
  const ring = placeRing(ringItems);
  return {
    nodes: [focusNode, ...ring],
    edges: ring.map((n) => ({ id: `e:${n.id}`, source: 'focus', target: n.id, dashed: n.dashed })),
  };
}

export function focusFromSelection(sel: Selection): Focus {
  if (sel.citta.length > 0) return { kind: 'citta', id: sel.citta[0] };
  for (const kind of FILTER_KINDS) {
    const first = (sel[kind] as EntityId[])[0];
    if (first !== undefined) return { kind, id: first };
  }
  return { kind: 'citta', id: 1 };
}
