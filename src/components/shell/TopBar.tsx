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

function DharmaWheelIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 36 36"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      className="shrink-0 text-accent"
    >
      <circle cx="18" cy="18" r="15" />
      <circle cx="18" cy="18" r="4" />
      <path d="M18 3v11M18 22v11M3 18h11M22 18h11M7.4 7.4l7.8 7.8M20.8 20.8l7.8 7.8M28.6 7.4l-7.8 7.8M15.2 20.8l-7.8 7.8" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const qs = serializeSelection(useSelection((s) => s.selection));
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2">
        <div className="flex items-center gap-3">
          <DharmaWheelIcon />
          <div className="flex flex-col leading-tight">
            <h1 className="font-display text-xl font-extrabold md:text-2xl">චිත්ත දර්ශකය</h1>
            <span className="hidden text-xs text-muted md:block">අභිධර්මයේ සිත් 89 හා සම්බන්ධතා</span>
          </div>
        </div>
        <nav aria-label="දර්ශන" className="hidden flex-wrap gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={`${n.href}${qs}`}
              aria-current={pathname === n.href ? 'page' : undefined}
              className="flex min-h-11 items-center rounded-full px-4 text-[15px] text-fg-2 hover:bg-hover aria-[current=page]:bg-fg aria-[current=page]:font-semibold aria-[current=page]:text-bg"
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
          className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line-strong text-fg-2 hover:bg-hover md:hidden"
          aria-label="මෙනුව"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <MenuIcon />
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
