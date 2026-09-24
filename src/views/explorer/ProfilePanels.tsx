'use client';

import type { ReactNode } from 'react';
import { cittaById, profileOf, type CittaProfile, type Selection } from '@/data';
import { useSelection } from '@/state/selection';
import { CetasikaGrid } from './CetasikaGrid';
import { matchCaption } from './chipState';
import { PersonPlaneBadges } from './PersonPlaneBadges';
import { PsChain } from './PsChain';
import { VithiStrip } from './VithiStrip';

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-line bg-surface p-3">
      <h3 className="mb-2 font-display text-lg font-bold">{title}</h3>
      {children}
    </section>
  );
}

function Header({ selection, profile }: { selection: Selection; profile: CittaProfile | null }) {
  const caption = matchCaption(selection);
  let body: ReactNode;
  if (profile && selection.citta.length === 1) {
    const c = cittaById.get(selection.citta[0])!;
    body = (
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-display text-2xl font-bold">
          {c.id}. {c.nameSi}
        </h2>
        <span className="rounded-full bg-fg px-3 py-0.5 text-bg">{profile.cetasikas.length} / 52</span>
      </div>
    );
  } else if (caption) {
    body = <h2 className="font-display text-2xl font-bold">{caption}</h2>;
  } else if (selection.citta.length > 1) {
    body = <h2 className="font-display text-2xl font-bold">තෝරාගත් සිත් {selection.citta.length}</h2>;
  } else {
    body = <p className="text-muted">සිතක් හෝ චෛතසිකයක් තෝරන්න</p>;
  }
  return <div className="min-w-0 md:col-span-2 xl:col-span-1">{body}</div>;
}

export function ProfilePanels() {
  const selection = useSelection((s) => s.selection);
  const profile = selection.citta.length === 1 ? profileOf(selection.citta[0]) : null;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
      <Header selection={selection} profile={profile} />
      <Panel title="චෛතසික">
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
