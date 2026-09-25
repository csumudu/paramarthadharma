'use client';

import type { ReactNode } from 'react';
import {
  CATEGORY_LABELS,
  JATI_LABELS,
  VEDANA_LABELS,
  cittaById,
  groupById,
  profileOf,
  type Citta,
  type CittaProfile,
  type Selection,
} from '@/data';
import { CATEGORY_CLASSES, FILTER_BANNER_CLASS, TAG_PILL_CLASS } from '@/components/colors';
import { useSelection } from '@/state/selection';
import { CetasikaGrid } from './CetasikaGrid';
import { matchCaption } from './chipState';
import { PersonPlaneBadges } from './PersonPlaneBadges';
import { PsChain } from './PsChain';
import { VithiStrip } from './VithiStrip';

function Panel({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-2xl border border-line bg-surface p-4">
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-display text-[19px] font-extrabold">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

/** "■ නියත   □ අනියත" — states legend for the cetasika chips, shown in that panel's header. */
function ChipLegend() {
  return (
    <span className="text-xs text-muted">
      <span aria-hidden className="text-fg">
        ■
      </span>{' '}
      නියත&nbsp;&nbsp;
      <span aria-hidden className="text-fg">
        □
      </span>{' '}
      අනියත
    </span>
  );
}

function FilterBanner({ caption }: { caption: string }) {
  const clearFilters = useSelection((s) => s.clearFilters);
  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-xl px-3.5 py-2.5 ${FILTER_BANNER_CLASS}`}>
      <span className="font-display text-lg font-extrabold">{caption}</span>
      <div className="grow" />
      <button
        type="button"
        onClick={clearFilters}
        className="min-h-11 rounded-full border border-current px-3.5 text-sm font-medium"
      >
        ඉවත් කරන්න
      </button>
    </div>
  );
}

function CittaHeader({ citta, profile }: { citta: Citta; profile: CittaProfile }) {
  const category = groupById.get(citta.group)!.category;
  const group = groupById.get(citta.group)!;
  const count = profile.cetasikas.length;
  const circumference = 2 * Math.PI * 30;
  const dash = (count / 52) * circumference;
  const tags = [
    CATEGORY_LABELS[category],
    `${group.nameSi} · ${JATI_LABELS[citta.jati]}`,
    `${VEDANA_LABELS[citta.vedana]} සහගත`,
  ];
  return (
    <div className="flex items-start gap-4">
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl font-display text-3xl font-extrabold ${CATEGORY_CLASSES[category]}`}
      >
        {citta.id}
      </div>
      <div className="min-w-0 grow">
        <div className="mb-1.5 flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span key={tag} className={`rounded-full px-2.5 py-0.5 text-xs ${TAG_PILL_CLASS}`}>
              {tag}
            </span>
          ))}
        </div>
        <h2 className="font-display text-2xl font-bold leading-snug">
          {citta.id}. {citta.nameSi}
        </h2>
      </div>
      <div className="relative h-[72px] w-[72px] shrink-0">
        <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true" className="-rotate-90">
          <circle cx="36" cy="36" r="30" fill="none" strokeWidth="7" className="stroke-line-strong" />
          <circle
            cx="36"
            cy="36"
            r="30"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash.toFixed(1)} ${circumference.toFixed(1)}`}
            className="stroke-accent"
          />
        </svg>
        {/* Decorative: two differently-sized lines, duplicated by the sr-only span below so the
            combined "n / 52" text stays queryable as a single node (RTL's getByText only concatenates
            an element's own direct text-node children, not text split across nested elements). */}
        <div aria-hidden className="absolute inset-0 flex flex-col items-center justify-center leading-none">
          <span className="font-display text-xl font-extrabold">{count}</span>
          <span className="text-[10px] text-muted">/ 52</span>
        </div>
        <span className="sr-only">{count} / 52</span>
      </div>
    </div>
  );
}

function ProfileHeader({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  const caption = matchCaption(selection);
  let main: ReactNode = null;
  if (profile && selection.citta.length === 1) {
    main = <CittaHeader citta={cittaById.get(selection.citta[0])!} profile={profile} />;
  } else if (selection.citta.length > 1) {
    main = <h2 className="font-display text-2xl font-bold">තෝරාගත් සිත් {selection.citta.length}</h2>;
  } else if (!caption) {
    main = <p className="text-muted">සිතක් හෝ චෛතසිකයක් තෝරන්න</p>;
  }
  return (
    <div className="flex min-w-0 flex-col gap-3 md:col-span-2 xl:col-span-1">
      {caption && <FilterBanner caption={caption} />}
      {main}
    </div>
  );
}

export function ProfilePanels() {
  const selection = useSelection((s) => s.selection);
  const profile = selection.citta.length === 1 ? profileOf(selection.citta[0]) : null;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      <ProfileHeader selection={selection} profile={profile} />
      <Panel title="චෛතසික" right={<ChipLegend />}>
        <CetasikaGrid selection={selection} profile={profile} />
      </Panel>
      <Panel title="චිත්ත වීථිය — කෘත්‍ය">
        <VithiStrip selection={selection} profile={profile} />
      </Panel>
      <Panel title="පටිච්චසමුප්පාදය">
        <PsChain selection={selection} profile={profile} />
      </Panel>
      <Panel title="පුද්ගල / භූමි — වීථි සිත්">
        <PersonPlaneBadges selection={selection} profile={profile} />
      </Panel>
    </div>
  );
}
