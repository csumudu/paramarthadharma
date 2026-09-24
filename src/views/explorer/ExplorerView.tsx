'use client';

import { hasAnySelection } from '@/data';
import { useMediaQuery } from '@/components/hooks';
import { useSelection } from '@/state/selection';
import { BottomSheet } from './BottomSheet';
import { CittaList } from './CittaList';
import { CittaMap } from './CittaMap';
import { ProfilePanels } from './ProfilePanels';

export function ExplorerView({ presenting = false }: { presenting?: boolean }) {
  const selection = useSelection((s) => s.selection);
  const clear = useSelection((s) => s.clear);
  const isPhone = useMediaQuery('(max-width: 767px)');

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <section className="min-w-0" aria-label="සිත් 89">
        <div className="hidden md:block">
          <CittaMap />
        </div>
        <div className="md:hidden">
          <CittaList />
        </div>
      </section>
      <aside data-testid="profile-aside" className={presenting ? 'min-w-0' : 'hidden min-w-0 md:block'}>
        <ProfilePanels />
      </aside>
      {!presenting && isPhone && (
        <BottomSheet open={hasAnySelection(selection)} onClose={clear}>
          <ProfilePanels />
        </BottomSheet>
      )}
    </div>
  );
}
