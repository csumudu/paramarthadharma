'use client';

import { Background, Controls, ReactFlow, type Edge, type Node } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useMemo, useState } from 'react';
import { useMediaQuery } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { ALL_KINDS, buildGraph, focusFromSelection, type GraphNode, type RelKind } from './buildGraph';

const KIND_LABELS: Record<RelKind, string> = {
  cetasika: 'චෛතසික',
  kicca: 'කෘත්‍ය',
  psLink: 'පටිච්චසමුප්පාද',
  puggala: 'පුද්ගල',
  bhumi: 'භූමි',
};
const DARK_TEXT = new Set(['ahetuka', 'lokuttara', 'band-sobhana']);

function nodeStyle(n: GraphNode) {
  const color = n.tone === 'fg' ? 'var(--color-bg)' : DARK_TEXT.has(n.tone) ? '#111' : '#fff';
  return {
    background: `var(--color-${n.tone})`,
    color,
    border: n.kind === 'group' ? '2px dashed var(--color-fg)' : '1px solid var(--color-line)',
    fontSize: n.isFocus ? 18 : 13,
    fontWeight: n.isFocus ? 700 : 400,
  };
}

export function GraphView() {
  const selection = useSelection((s) => s.selection);
  const isPhone = useMediaQuery('(max-width: 767px)');
  const focus = focusFromSelection(selection);
  const focusKey = `${focus.kind}:${focus.id}`;

  return (
    // Keyed by focus + viewport so a focus change or breakpoint crossing remounts the inner
    // component with fresh defaults (via useState's initializer) instead of writing `kinds`/
    // `expanded` state from an effect — which react-hooks/set-state-in-effect flags. User
    // toggles (plain setState in click handlers below) still work between remounts. Follows
    // the same precedent as MatrixView's `key={viewport}` remount.
    <GraphInner key={`${focusKey}|${isPhone}`} focus={focus} focusKey={focusKey} isPhone={isPhone} />
  );
}

function GraphInner({ focus, focusKey, isPhone }: { focus: ReturnType<typeof focusFromSelection>; focusKey: string; isPhone: boolean }) {
  const select = useSelection((s) => s.select);
  const [kinds, setKinds] = useState<RelKind[]>(() => (isPhone ? ['cetasika', 'kicca'] : ALL_KINDS));
  const [expanded, setExpanded] = useState<string[]>([]);

  const graph = useMemo(
    () => buildGraph(focus, { kinds, cap: isPhone ? 30 : 60, expanded }),
    [focus, kinds, isPhone, expanded],
  );
  const byId = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);
  const nodes: Node[] = graph.nodes.map((n) => ({
    id: n.id,
    position: { x: n.x, y: n.y },
    data: { label: n.label },
    className: 'graph-node',
    style: nodeStyle(n),
    draggable: false,
    connectable: false,
  }));
  const edges: Edge[] = graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: e.dashed ? { strokeDasharray: '4 4' } : undefined,
  }));

  const refocus = (n: GraphNode | undefined) => {
    if (!n || n.isFocus || n.kind === 'group' || n.entityId === undefined) return;
    select(n.kind, n.entityId, false);
  };
  const toggleGroup = (key: string) =>
    setExpanded((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const toggleKind = (k: RelKind) =>
    setKinds((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : ALL_KINDS.filter((x) => x === k || prev.includes(x))));

  return (
    <div className="space-y-2">
      {focus.kind === 'citta' && (
        <div className="flex flex-wrap gap-1.5">
          {ALL_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={kinds.includes(k)}
              onClick={() => toggleKind(k)}
              className="min-h-11 rounded-full border-2 border-fg px-3 aria-pressed:bg-fg aria-pressed:text-bg"
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-muted">
        {isPhone ? 'තට්ටු කර' : 'ද්විත්ව-ක්ලික් කර'} කේන්ද්‍රය වෙනස් කරන්න · කණ්ඩායම් නෝඩ් මත ක්ලික් කර විහිදන්න
      </p>
      <div data-testid="graph" className="h-[calc(100dvh-15rem)] min-h-[360px] rounded-lg border border-line bg-surface">
        <ReactFlow
          key={`${focusKey}|${kinds.join()}|${expanded.join()}`}
          nodes={nodes}
          edges={edges}
          fitView
          minZoom={0.2}
          nodesDraggable={false}
          nodesConnectable={false}
          zoomOnDoubleClick={false}
          onNodeClick={(_, node) => {
            const n = byId.get(node.id);
            if (n?.kind === 'group' && n.groupKey) toggleGroup(n.groupKey);
            else if (isPhone) refocus(n);
          }}
          onNodeDoubleClick={(_, node) => refocus(byId.get(node.id))}
        >
          <Background />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>
    </div>
  );
}
