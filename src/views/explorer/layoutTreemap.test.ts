import { describe, expect, it } from 'vitest';
import { layoutTreemap, type Rect } from './layoutTreemap';

const overlap = (a: Rect, b: Rect) =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

describe('layoutTreemap', () => {
  const layout = layoutTreemap(1000, 620);

  it('lays out 89 tiles, 17 groups and 4 spheres', () => {
    expect(layout.tiles).toHaveLength(89);
    expect(layout.groups).toHaveLength(17);
    expect(layout.spheres).toHaveLength(4);
  });

  it('keeps every tile inside the canvas with positive size', () => {
    for (const t of layout.tiles) {
      expect(t.x0).toBeGreaterThanOrEqual(0);
      expect(t.y0).toBeGreaterThanOrEqual(0);
      expect(t.x1).toBeLessThanOrEqual(1000);
      expect(t.y1).toBeLessThanOrEqual(620);
      expect(t.x1 - t.x0).toBeGreaterThan(0);
      expect(t.y1 - t.y0).toBeGreaterThan(0);
    }
  });

  it('never overlaps two tiles', () => {
    for (let i = 0; i < layout.tiles.length; i++)
      for (let j = i + 1; j < layout.tiles.length; j++)
        expect(overlap(layout.tiles[i], layout.tiles[j]), `${i} vs ${j}`).toBe(0);
  });
});
