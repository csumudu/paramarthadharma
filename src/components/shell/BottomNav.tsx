'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelection } from '@/state/selection';
import { serializeSelection } from '@/state/url';
import { NAV } from './nav';

function GridIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function TableIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M3 5h18M3 12h18M3 19h18M9 3v18" />
    </svg>
  );
}

function GraphIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <circle cx="4" cy="6" r="2" />
      <circle cx="20" cy="6" r="2" />
      <circle cx="12" cy="21" r="2" />
      <path d="M6 7l4 3M18 7l-4 3M12 15v4" />
    </svg>
  );
}

function ScreenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

const ICONS = [GridIcon, TableIcon, GraphIcon, ScreenIcon];

export function BottomNav() {
  const pathname = usePathname();
  const qs = serializeSelection(useSelection((s) => s.selection));
  return (
    <nav
      aria-label="දර්ශන (ජංගම)"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-line bg-surface md:hidden"
    >
      {NAV.map((n, i) => {
        const Icon = ICONS[i];
        return (
          <Link
            key={n.href}
            href={`${n.href}${qs}`}
            aria-current={pathname === n.href ? 'page' : undefined}
            className="flex flex-col items-center justify-center gap-0.5 text-[0.7rem] leading-tight text-muted aria-[current=page]:font-bold aria-[current=page]:text-accent"
          >
            <span aria-hidden>
              <Icon />
            </span>
            {n.labelSi}
          </Link>
        );
      })}
    </nav>
  );
}
