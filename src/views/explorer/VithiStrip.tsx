'use client';

import { stepCardClass } from '@/components/colors';
import { useLongPress } from '@/components/useLongPress';
import { KICCAS, type CittaProfile, type Kicca, type Selection } from '@/data';
import { useSelection } from '@/state/selection';
import { Chip } from './Chip';
import { chipState } from './chipState';

const STEPS: Kicca[][] = [...new Set(KICCAS.map((k) => k.vithiOrder))]
  .sort((a, b) => a - b)
  .map((order) => KICCAS.filter((k) => k.vithiOrder === order));

/** Sub-line captions from the vīthi artboard — canonical Abhidhamma counts, not per-citta data. */
const SUB_LABEL: Record<string, string> = {
  dassana: 'දස්සනාදී',
  javana: '× 7',
  tadarammana: '× 2',
};

/** The five sense-door kiccas (step 4) share one card in the artboard, labelled as a group. */
const PANCA_VINNANA_LABEL = 'පඤ්ච විඤ්ඤාණ';

const CARD_CLASS = 'flex min-h-16 flex-col items-center justify-center gap-0.5 rounded-lg px-1.5 py-1.5 text-center leading-tight';

function SingleStepCard({
  index,
  kicca,
  selection,
  profile,
}: {
  index: number;
  kicca: Kicca;
  selection: Selection;
  profile: CittaProfile | null;
}) {
  const select = useSelection((s) => s.select);
  const state = chipState('kicca', kicca.id, selection, profile);
  const handlers = useLongPress({
    onClick: (e) => select('kicca', kicca.id, e.shiftKey),
    onLongPress: () => select('kicca', kicca.id, true),
  });
  return (
    <button
      type="button"
      {...handlers}
      data-state={state}
      aria-pressed={state === 'selected'}
      aria-label={kicca.nameSi}
      className={`${CARD_CLASS} ${stepCardClass(state)}`}
    >
      <span aria-hidden className="text-[10px] opacity-75">
        {index}
      </span>
      <span className="text-[12.5px] font-semibold">{kicca.nameSi}</span>
      <span aria-hidden className="text-[10.5px] opacity-80">
        {SUB_LABEL[kicca.id] ?? ' '}
      </span>
    </button>
  );
}

function PancaVinnanaCard({
  index,
  kiccas,
  selection,
  profile,
}: {
  index: number;
  kiccas: Kicca[];
  selection: Selection;
  profile: CittaProfile | null;
}) {
  const on = kiccas.some((k) => chipState('kicca', k.id, selection, profile) !== 'off');
  return (
    <div className={`${CARD_CLASS} ${stepCardClass(on ? 'on' : 'off')}`}>
      <span aria-hidden className="text-[10px] opacity-75">
        {index}
      </span>
      <span className="text-[12.5px] font-semibold">{PANCA_VINNANA_LABEL}</span>
      <div className="flex flex-wrap justify-center gap-1">
        {kiccas.map((k) => (
          <Chip
            key={k.id}
            kind="kicca"
            id={k.id}
            label={k.nameSi}
            tone="neutral"
            state={chipState('kicca', k.id, selection, profile)}
          />
        ))}
      </div>
    </div>
  );
}

export function VithiStrip({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  return (
    <div data-testid="vithi-strip" className="min-w-0 overflow-x-auto">
      <div className="grid min-w-[380px] grid-cols-5 gap-2">
        {STEPS.map((column, i) =>
          column.length > 1 ? (
            <PancaVinnanaCard key={column[0].vithiOrder} index={i + 1} kiccas={column} selection={selection} profile={profile} />
          ) : (
            <SingleStepCard key={column[0].id} index={i + 1} kicca={column[0]} selection={selection} profile={profile} />
          ),
        )}
      </div>
    </div>
  );
}
