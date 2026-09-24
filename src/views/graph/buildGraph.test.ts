import { describe, expect, it } from 'vitest';
import { emptySelection } from '@/data';
import { ALL_KINDS, buildGraph, focusFromSelection } from './buildGraph';

describe('buildGraph', () => {
  it('shows every neighbour of citta 31 when under the cap', () => {
    const g = buildGraph({ kind: 'citta', id: 31 }, { kinds: ALL_KINDS, cap: 100, expanded: [] });
    expect(g.nodes).toHaveLength(62); // focus + 38 cetasika + 1 kicca + 12 PS + 7 puggala + 3 bhūmi
    expect(g.edges).toHaveLength(61);
    expect(g.nodes[0]).toMatchObject({ id: 'focus', isFocus: true, x: 0, y: 0, label: '31. මහා කුසල 1' });
  });

  it('groups neighbours above the cap and expands a chosen group', () => {
    const grouped = buildGraph({ kind: 'citta', id: 31 }, { kinds: ALL_KINDS, cap: 60, expanded: [] });
    expect(grouped.nodes).toHaveLength(11); // focus + 6 cetasika subgroups + kicca + PS + puggala + bhūmi
    expect(grouped.nodes.find((n) => n.id === 'grp:cetasika:pakinnaka')).toMatchObject({ kind: 'group', count: 6 });
    const expanded = buildGraph(
      { kind: 'citta', id: 31 },
      { kinds: ALL_KINDS, cap: 60, expanded: ['cetasika:pakinnaka'] },
    );
    expect(expanded.nodes).toHaveLength(16);
  });

  it('filters by relation kind', () => {
    const g = buildGraph({ kind: 'citta', id: 1 }, { kinds: ['kicca', 'bhumi'], cap: 60, expanded: [] });
    expect(g.nodes.map((n) => n.id)).toEqual(['focus', 'kicca:javana', 'bhumi:kama', 'bhumi:rupa', 'bhumi:arupa']);
  });

  it('shows the cittas around a cetasika, grouped under a small cap', () => {
    expect(buildGraph({ kind: 'cetasika', id: 12 }, { kinds: ALL_KINDS, cap: 60, expanded: [] }).nodes).toHaveLength(36);
    const phone = buildGraph({ kind: 'cetasika', id: 12 }, { kinds: ALL_KINDS, cap: 30, expanded: [] });
    expect(phone.nodes).toHaveLength(12);
    expect(phone.nodes.find((n) => n.id === 'grp:group:lobhamula')?.label).toBe('ලෝභමූල සිත් 4');
  });

  it('groups the 89 cittas of a universal cetasika into 17 groups', () => {
    expect(buildGraph({ kind: 'cetasika', id: 1 }, { kinds: ALL_KINDS, cap: 60, expanded: [] }).nodes).toHaveLength(18);
  });

  it('dashes edges to aniyata cetasikas', () => {
    const g = buildGraph({ kind: 'citta', id: 3 }, { kinds: ['cetasika'], cap: 60, expanded: [] });
    expect(g.edges.find((e) => e.target === 'cetasika:20')?.dashed).toBe(true);
    expect(g.edges.find((e) => e.target === 'cetasika:18')?.dashed).toBe(false);
  });

  it('places ring nodes around the origin without duplicates', () => {
    const g = buildGraph({ kind: 'citta', id: 31 }, { kinds: ALL_KINDS, cap: 100, expanded: [] });
    expect(new Set(g.nodes.map((n) => n.id)).size).toBe(g.nodes.length);
    for (const n of g.nodes.slice(1)) expect(Math.hypot(n.x, n.y)).toBeGreaterThan(200);
  });
});

describe('focusFromSelection', () => {
  it('prefers the first citta, then the first filter, then citta 1', () => {
    expect(focusFromSelection({ ...emptySelection(), citta: [5], cetasika: [12] })).toEqual({ kind: 'citta', id: 5 });
    expect(focusFromSelection({ ...emptySelection(), puggala: ['arahant'] })).toEqual({ kind: 'puggala', id: 'arahant' });
    expect(focusFromSelection(emptySelection())).toEqual({ kind: 'citta', id: 1 });
  });
});
