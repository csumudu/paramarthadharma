import { hierarchy, treemap } from 'd3-hierarchy';
import { CITTAS, GROUPS, SPHERES, type Citta, type Group, type Sphere } from '@/data';

export interface Rect {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface TreemapLayout {
  spheres: (Rect & { sphere: Sphere })[];
  groups: (Rect & { group: Group })[];
  tiles: (Rect & { citta: Citta })[];
}

interface TNode {
  key: string;
  sphere?: Sphere;
  group?: Group;
  citta?: Citta;
  children?: TNode[];
}

export function layoutTreemap(width: number, height: number): TreemapLayout {
  const data: TNode = {
    key: 'root',
    children: SPHERES.map((sphere) => ({
      key: sphere,
      sphere,
      children: GROUPS.filter((g) => g.sphere === sphere).map((group) => ({
        key: group.id,
        group,
        children: CITTAS.filter((c) => c.group === group.id).map((citta) => ({ key: String(citta.id), citta })),
      })),
    })),
  };

  const root = hierarchy(data).sum((d) => (d.citta ? 1 : 0));
  const laid = treemap<TNode>()
    .size([width, height])
    .paddingOuter(2)
    .paddingInner(3)
    .paddingTop((n) => (n.depth === 1 ? 26 : n.depth === 2 ? 20 : 2))
    .round(true)(root);

  const out: TreemapLayout = { spheres: [], groups: [], tiles: [] };
  for (const n of laid.descendants()) {
    const r = { x0: n.x0, y0: n.y0, x1: n.x1, y1: n.y1 };
    if (n.data.sphere) out.spheres.push({ ...r, sphere: n.data.sphere });
    else if (n.data.group) out.groups.push({ ...r, group: n.data.group });
    else if (n.data.citta) out.tiles.push({ ...r, citta: n.data.citta });
  }
  return out;
}
