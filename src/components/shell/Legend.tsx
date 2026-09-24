'use client';

import { useState } from 'react';
import { CATEGORY_LABELS, type Category } from '@/data';
import { CATEGORY_CLASSES } from '@/components/colors';

function LegendList() {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
        <li key={c} className="flex items-center gap-2">
          <span className={`inline-block h-4 w-4 rounded ${CATEGORY_CLASSES[c]}`} aria-hidden />
          {CATEGORY_LABELS[c]}
        </li>
      ))}
      <li>✓ නියත</li>
      <li>● අනියත</li>
    </ul>
  );
}

export function Legend({ inline = false }: { inline?: boolean }) {
  const [open, setOpen] = useState(false);
  if (inline) return <LegendList />;
  return (
    <div className="chrome-optional relative">
      <button
        type="button"
        className="min-h-11 rounded-md border border-line px-3 hover:bg-hover"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        වර්ණ
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 w-72 rounded-md border border-line bg-surface p-3 shadow-lg">
          <LegendList />
        </div>
      )}
    </div>
  );
}
