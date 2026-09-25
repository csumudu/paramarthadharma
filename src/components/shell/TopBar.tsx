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

const WHEEL_TIPS =
  'M29.34 11.67L32 4L34.66 11.67ZM44.49 15.75L51.8 12.2L48.25 19.51ZM52.33 29.34L60 32L52.33 34.66ZM48.25 44.49L51.8 51.8L44.49 48.25ZM34.66 52.33L32 60L29.34 52.33ZM19.51 48.25L12.2 51.8L15.75 44.49ZM11.67 34.66L4 32L11.67 29.34ZM15.75 19.51L12.2 12.2L19.51 15.75Z';
const WHEEL_SPOKES =
  'M32 25L29.52 19.75L32 13.5L34.48 19.75ZM36.95 27.05L38.91 21.58L45.08 18.92L42.42 25.09ZM39 32L44.25 29.52L50.5 32L44.25 34.48ZM36.95 36.95L42.42 38.91L45.08 45.08L38.91 42.42ZM32 39L34.48 44.25L32 50.5L29.52 44.25ZM27.05 36.95L25.09 42.42L18.92 45.08L21.58 38.91ZM25 32L19.75 34.48L13.5 32L19.75 29.52ZM27.05 27.05L21.58 25.09L18.92 18.92L25.09 21.58Z';

/** Dharma-wheel mark; same geometry as src/app/icon.svg, coloured from theme tokens. */
function DharmaWheelIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
      <rect width="64" height="64" rx="14" fill="var(--color-accent)" />
      <g fill="var(--color-surface)">
        <path d={WHEEL_TIPS} />
        <path d={WHEEL_SPOKES} />
        <circle cx="32" cy="32" r="6.5" />
      </g>
      <circle cx="32" cy="32" r="19" fill="none" stroke="var(--color-surface)" strokeWidth="4" />
      <circle cx="32" cy="32" r="3" fill="var(--color-accent)" />
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
