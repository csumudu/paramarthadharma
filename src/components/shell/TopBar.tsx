'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSelection } from '@/state/selection';
import { serializeSelection } from '@/state/url';
import { Legend } from './Legend';
import { NAV } from './nav';
import { SearchBox } from './SearchBox';
import { PresenterToggle, ThemeToggle } from './Toggles';

export function TopBar() {
  const pathname = usePathname();
  const qs = serializeSelection(useSelection((s) => s.selection));
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <h1 className="font-display text-xl font-bold md:text-2xl">චිත්ත දර්ශකය</h1>
        <nav aria-label="දර්ශන" className="hidden flex-wrap gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={`${n.href}${qs}`}
              aria-current={pathname === n.href ? 'page' : undefined}
              className="flex min-h-11 items-center rounded-md px-3 hover:bg-hover aria-[current=page]:bg-fg aria-[current=page]:text-bg"
            >
              {n.labelSi}
            </Link>
          ))}
        </nav>
        <div className="ml-auto hidden items-center gap-2 md:flex">
          <SearchBox />
          <Legend />
          <ThemeToggle />
          <PresenterToggle />
        </div>
        <button
          type="button"
          className="ml-auto min-h-11 min-w-11 text-xl md:hidden"
          aria-label="මෙනුව"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          ☰
        </button>
      </div>
      {menuOpen && (
        <div className="space-y-3 border-t border-line px-4 py-3 md:hidden">
          <SearchBox />
          <div className="flex gap-2">
            <ThemeToggle />
            <PresenterToggle />
          </div>
          <Legend inline />
        </div>
      )}
    </header>
  );
}
