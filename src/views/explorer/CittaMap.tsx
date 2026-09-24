'use client';

import { useMemo } from 'react';
import { SPHERE_LABELS, cittasMatching } from '@/data';
import { useElementSize } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { layoutTreemap, type Rect } from './layoutTreemap';
import { TileButton } from './TileButton';
import { tileState } from './tileState';

const box = (r: Rect) => ({ left: r.x0, top: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0 });

export function CittaMap() {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const width = size.width || 1000;
  const height = Math.max(420, Math.round(width * 0.62));
  const layout = useMemo(() => layoutTreemap(width, height), [width, height]);
  const selection = useSelection((s) => s.selection);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  return (
    <div ref={ref} data-testid="citta-map" className="relative w-full overflow-hidden" style={{ height }}>
      {layout.spheres.map((s) => (
        <div key={s.sphere} className="absolute rounded-lg border border-line bg-surface" style={box(s)}>
          <span className="absolute left-2 top-0.5 font-display text-sm font-bold">{SPHERE_LABELS[s.sphere]}</span>
        </div>
      ))}
      {layout.groups.map((g) => (
        <div key={g.group.id} className="absolute" style={box(g)}>
          <span className="absolute inset-x-1 top-0 h-5 overflow-hidden text-[0.7rem] leading-5 text-muted">
            {g.group.nameSi}
          </span>
        </div>
      ))}
      {layout.tiles.map((t) => (
        <TileButton
          key={t.citta.id}
          citta={t.citta}
          state={tileState(t.citta.id, selection, matching)}
          className="absolute"
          style={box(t)}
        />
      ))}
    </div>
  );
}
