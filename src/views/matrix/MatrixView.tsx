'use client';

import { useMemo, useState } from 'react';
import { CITTAS, cittasMatching, groupById, type EntityId, type EntityKind, type FilterKind, type Selection } from '@/data';
import { CATEGORY_CLASSES } from '@/components/colors';
import { useMediaQuery } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { buildBlocks, cellFor, type Cell, type MatrixBlock } from './columns';
import { toCsv } from './csv';

const BTN = 'min-h-11 rounded-md border border-line px-3 hover:bg-hover aria-pressed:bg-fg aria-pressed:text-bg';

type Viewport = 'phone' | 'tablet' | 'desktop';

/**
 * The set of blocks collapsed by default for a given viewport: phone collapses everything
 * but 'kicca', tablet collapses only 'ps', desktop collapses nothing.
 */
function defaultCollapsedFor(viewport: Viewport, blocks: MatrixBlock[]): Set<string> {
  if (viewport === 'phone') return new Set(blocks.filter((b) => b.id !== 'kicca').map((b) => b.id));
  if (viewport === 'tablet') return new Set(['ps']);
  return new Set();
}

export function MatrixView() {
  const blocks = useMemo(() => buildBlocks(), []);
  const cells = useMemo(
    () =>
      new Map(
        CITTAS.map((ct) => [ct.id, new Map(blocks.flatMap((b) => b.columns).map((c) => [c.key, cellFor(ct.id, c)]))]),
      ),
    [blocks],
  );
  const isPhone = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1279px)');
  const viewport: Viewport = isPhone ? 'phone' : isTablet ? 'tablet' : 'desktop';
  const [review, setReview] = useState(false);
  const selection = useSelection((s) => s.selection);
  const select = useSelection((s) => s.select);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  const download = () => {
    const url = URL.createObjectURL(new Blob([toCsv(blocks)], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'citta-data-review.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={BTN} aria-pressed={review} onClick={() => setReview((r) => !r)}>
          සමාලෝචන ප්‍රකාරය
        </button>
        <button type="button" className={BTN} onClick={download}>
          CSV බාගන්න
        </button>
        {review && <span className="text-sm text-muted">තිත් රාමුව = චාර්ටයෙන් පමණි · රතු රාමුව = විවාදාත්මක</span>}
      </div>
      {/*
        Keyed by viewport so a breakpoint change remounts the table with that viewport's
        default collapsed blocks (via useState's initializer) instead of writing state from
        an effect keyed on the media queries — which react-hooks/set-state-in-effect flags.
        User toggles (plain setState in the click handler below) still work between remounts.
      */}
      <MatrixTable
        key={viewport}
        blocks={blocks}
        cells={cells}
        defaultCollapsed={defaultCollapsedFor(viewport, blocks)}
        review={review}
        selection={selection}
        select={select}
        matching={matching}
      />
    </div>
  );
}

function MatrixTable({
  blocks,
  cells,
  defaultCollapsed,
  review,
  selection,
  select,
  matching,
}: {
  blocks: MatrixBlock[];
  cells: Map<number, Map<string, Cell | null>>;
  defaultCollapsed: Set<string>;
  review: boolean;
  selection: Selection;
  select: (kind: EntityKind, id: EntityId, additive?: boolean) => void;
  matching: Set<number> | null;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(() => new Set(defaultCollapsed));
  const [hoverCol, setHoverCol] = useState<string | null>(null);

  const toggleBlock = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const isSelected = (kind: FilterKind, id: EntityId) => (selection[kind] as EntityId[]).includes(id);

  return (
    <>
      {hoverCol && <style>{`[data-col="${hoverCol}"]{background:var(--color-hover)}`}</style>}
      <div
        data-testid="matrix-scroll"
        className="max-h-[calc(100dvh-11rem)] overflow-auto rounded-lg border border-line"
      >
        <table className="border-separate border-spacing-0 text-sm">
          <thead className="sticky top-0 z-20 bg-surface">
            <tr>
              <th rowSpan={2} className="sticky left-0 z-30 border-b border-line bg-surface px-2 text-left align-bottom">
                සිත
              </th>
              {blocks.map((b) => (
                <th
                  key={b.id}
                  colSpan={collapsed.has(b.id) ? 1 : b.columns.length}
                  className={`${b.headerClass} border-l border-line px-2 text-left`}
                >
                  <button
                    type="button"
                    className="min-h-11 whitespace-nowrap font-bold"
                    aria-expanded={!collapsed.has(b.id)}
                    onClick={() => toggleBlock(b.id)}
                  >
                    {collapsed.has(b.id) ? '▸' : '▾'} {b.titleSi}
                  </button>
                </th>
              ))}
            </tr>
            <tr>
              {blocks.flatMap((b) =>
                collapsed.has(b.id)
                  ? [
                      <th key={`${b.id}-collapsed`} className="border-b border-l border-line px-2">
                        …
                      </th>,
                    ]
                  : b.columns.map((c) => (
                      <th
                        key={c.key}
                        data-col={c.key}
                        onMouseEnter={() => setHoverCol(c.key)}
                        onMouseLeave={() => setHoverCol(null)}
                        className="h-40 border-b border-line px-0.5 align-bottom"
                      >
                        <button
                          type="button"
                          aria-label={c.labelSi}
                          aria-pressed={isSelected(c.kind, c.id)}
                          onClick={(e) => select(c.kind, c.id, e.shiftKey)}
                          className="rotate-180 whitespace-nowrap px-1 py-1 text-xs [writing-mode:vertical-rl] aria-pressed:font-bold aria-pressed:underline"
                        >
                          {c.labelSi}
                        </button>
                      </th>
                    )),
              )}
            </tr>
          </thead>
          <tbody>
            {CITTAS.map((ct) => {
              const on = selection.citta.includes(ct.id) || (matching?.has(ct.id) ?? false);
              const dim = matching !== null && !matching.has(ct.id);
              const category = groupById.get(ct.group)!.category;
              return (
                <tr
                  key={ct.id}
                  data-citta={ct.id}
                  data-state={on ? 'on' : dim ? 'dim' : 'normal'}
                  className={`[&:hover>td]:bg-hover ${dim ? 'opacity-40' : ''}`}
                >
                  <th
                    scope="row"
                    className={`sticky left-0 z-10 max-w-[15rem] border-b border-line bg-surface px-2 py-1 text-left font-normal ${on ? 'font-bold' : ''}`}
                  >
                    <button
                      type="button"
                      aria-label={`${ct.id}. ${ct.nameSi}`}
                      onClick={(e) => select('citta', ct.id, e.shiftKey)}
                      className="flex min-h-11 items-center gap-1 text-left"
                    >
                      <span
                        className={`inline-block min-w-7 rounded px-1 text-center text-xs ${CATEGORY_CLASSES[category]}`}
                      >
                        {ct.id}
                      </span>
                      {ct.short}
                    </button>
                  </th>
                  {blocks.flatMap((b) =>
                    collapsed.has(b.id)
                      ? [<td key={b.id} className="border-b border-l border-line" />]
                      : b.columns.map((c) => {
                          const cell = cells.get(ct.id)!.get(c.key) ?? null;
                          const outline =
                            review && cell && cell.status !== 'rule'
                              ? cell.status === 'disputed'
                                ? 'outline outline-2 -outline-offset-2 outline-akusala'
                                : 'outline outline-1 -outline-offset-2 outline-dashed outline-muted'
                              : '';
                          return (
                            <td
                              key={c.key}
                              data-col={c.key}
                              data-status={cell?.status}
                              title={cell?.note}
                              className={`border-b border-line text-center ${outline}`}
                            >
                              {cell?.mark ?? ''}
                            </td>
                          );
                        }),
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
