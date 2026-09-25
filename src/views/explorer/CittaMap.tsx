'use client';

import { useMemo } from 'react';
import { CATEGORY_LABELS, CITTAS, SPHERE_LABELS, cittasMatching, type Category, type GroupId, type Sphere } from '@/data';
import { CATEGORY_CLASSES } from '@/components/colors';
import { useSelection } from '@/state/selection';
import { TileButton } from './TileButton';
import { tileState } from './tileState';

/** Short captions for group headers on the map ("<name> · <count>"); GROUPS carries the longer nameSi. */
const GROUP_SHORT: Record<GroupId, string> = {
  lobhamula: 'ලෝභමූල',
  dosamula: 'ද්වේෂමූල',
  mohamula: 'මෝහමූල',
  'akusala-vipaka': 'අකුසල විපාක',
  'ahetuka-kusala-vipaka': 'කුසල විපාක',
  'ahetuka-kiriya': 'ක්‍රියා',
  'kama-kusala': 'කුසල',
  'kama-vipaka': 'විපාක',
  'kama-kiriya': 'ක්‍රියා',
  'rupa-kusala': 'කුසල',
  'rupa-vipaka': 'විපාක',
  'rupa-kiriya': 'ක්‍රියා',
  'arupa-kusala': 'කුසල',
  'arupa-vipaka': 'විපාක',
  'arupa-kiriya': 'ක්‍රියා',
  magga: 'මාර්ග',
  phala: 'ඵල',
};

interface GroupCell {
  id: GroupId;
  /** Grid column count for this group's own tile grid (a layout choice, not data). */
  cols: number;
}
interface MapRow {
  labelSi: string | null;
  groups: GroupCell[];
}
interface SphereCard {
  sphere: Sphere;
  rows: MapRow[];
}

const LAYOUT: SphereCard[] = [
  {
    sphere: 'kamavacara',
    rows: [
      {
        labelSi: 'අකුසල',
        groups: [
          { id: 'lobhamula', cols: 4 },
          { id: 'dosamula', cols: 1 },
          { id: 'mohamula', cols: 1 },
        ],
      },
      {
        labelSi: 'අහේතුක',
        groups: [
          { id: 'akusala-vipaka', cols: 4 },
          { id: 'ahetuka-kusala-vipaka', cols: 4 },
          { id: 'ahetuka-kiriya', cols: 2 },
        ],
      },
      {
        labelSi: 'සෝභන',
        groups: [
          { id: 'kama-kusala', cols: 4 },
          { id: 'kama-vipaka', cols: 4 },
          { id: 'kama-kiriya', cols: 4 },
        ],
      },
    ],
  },
  {
    sphere: 'rupavacara',
    rows: [
      { labelSi: null, groups: [{ id: 'rupa-kusala', cols: 5 }] },
      { labelSi: null, groups: [{ id: 'rupa-vipaka', cols: 5 }] },
      { labelSi: null, groups: [{ id: 'rupa-kiriya', cols: 5 }] },
    ],
  },
  {
    sphere: 'arupavacara',
    rows: [
      { labelSi: null, groups: [{ id: 'arupa-kusala', cols: 4 }] },
      { labelSi: null, groups: [{ id: 'arupa-vipaka', cols: 4 }] },
      { labelSi: null, groups: [{ id: 'arupa-kiriya', cols: 4 }] },
    ],
  },
  {
    sphere: 'lokuttara',
    rows: [
      { labelSi: null, groups: [{ id: 'magga', cols: 4 }] },
      { labelSi: null, groups: [{ id: 'phala', cols: 4 }] },
    ],
  },
];

const LEGEND: Category[] = ['akusala', 'ahetuka', 'kama-sobhana', 'rupa', 'arupa', 'lokuttara'];

export function CittaMap() {
  const selection = useSelection((s) => s.selection);
  const matching = useMemo(() => cittasMatching(selection), [selection]);

  return (
    <div data-testid="citta-map" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[34px] leading-none font-extrabold">සිත් 89</h1>
          <p className="mt-1.5 text-[13px] text-muted">
            සිතක් තෝරන්න — එහි චෛතසික, කෘත්‍ය හා පටිච්චසමුප්පාදය දකුණු පසින්. චෛතසිකයක් ඔබා එය ඇති සිත් බලන්න.
          </p>
        </div>
        <ul className="flex max-w-[380px] flex-wrap justify-end gap-1.5">
          {LEGEND.map((cat) => (
            <li
              key={cat}
              className="flex h-[26px] items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 text-xs"
            >
              <span className={`h-2.5 w-2.5 rounded-[3px] ${CATEGORY_CLASSES[cat]}`} aria-hidden />
              {CATEGORY_LABELS[cat]}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-wrap gap-4">
        {LAYOUT.map((card) => {
          const cittaCount = CITTAS.filter((c) => c.sphere === card.sphere).length;
          return (
            <section
              key={card.sphere}
              className={
                card.sphere === 'kamavacara'
                  ? 'w-full min-w-0 rounded-2xl border border-line bg-surface p-4'
                  : 'min-w-0 flex-1 basis-64 rounded-2xl border border-line bg-surface p-4'
              }
            >
              <div className="mb-2.5 flex items-baseline gap-2.5">
                <h2 className="font-display text-[21px] font-extrabold">{SPHERE_LABELS[card.sphere]}</h2>
                <span className="text-xs text-muted">සිත් {cittaCount}</span>
              </div>
              <div className="flex flex-col gap-3">
                {card.rows.map((row, i) => (
                  <div key={i} className="flex flex-wrap items-start gap-4">
                    {row.labelSi && (
                      <div className="w-[58px] shrink-0 pt-5 text-xs font-semibold text-muted">{row.labelSi}</div>
                    )}
                    {row.groups.map((g) => {
                      const tiles = CITTAS.filter((c) => c.group === g.id).sort((a, b) => a.id - b.id);
                      return (
                        <div key={g.id} className="flex flex-col gap-1">
                          <span className="text-[11.5px] whitespace-nowrap text-muted">
                            {GROUP_SHORT[g.id]} · {tiles.length}
                          </span>
                          <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${g.cols}, 50px)` }}>
                            {tiles.map((c) => (
                              <TileButton key={c.id} citta={c} state={tileState(c.id, selection, matching)} />
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
