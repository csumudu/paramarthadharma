'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSelection } from '@/state/selection';
import { serializeSelection } from '@/state/url';
import { NAV } from './nav';

export function BottomNav() {
  const pathname = usePathname();
  const qs = serializeSelection(useSelection((s) => s.selection));
  return (
    <nav
      aria-label="දර්ශන (ජංගම)"
      className="fixed inset-x-0 bottom-0 z-40 grid h-16 grid-cols-4 border-t border-line bg-surface md:hidden"
    >
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={`${n.href}${qs}`}
          aria-current={pathname === n.href ? 'page' : undefined}
          className="flex flex-col items-center justify-center text-[0.7rem] leading-tight aria-[current=page]:font-bold aria-[current=page]:text-fg text-muted"
        >
          <span aria-hidden className="text-lg">
            {n.icon}
          </span>
          {n.labelSi}
        </Link>
      ))}
    </nav>
  );
}
