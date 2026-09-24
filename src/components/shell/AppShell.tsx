'use client';

import type { ReactNode } from 'react';
import { useApplyUi } from '@/state/ui';
import { useUrlSync } from '@/state/useUrlSync';
import { BottomNav } from './BottomNav';
import { Notice } from './Notice';
import { TopBar } from './TopBar';

export function AppShell({ children }: { children: ReactNode }) {
  useUrlSync();
  useApplyUi();
  return (
    <div className="min-h-dvh pb-20 md:pb-0">
      <TopBar />
      <Notice />
      <main className="mx-auto max-w-[1800px] px-4 py-4">{children}</main>
      <BottomNav />
    </div>
  );
}
