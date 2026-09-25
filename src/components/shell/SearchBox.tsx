'use client';

import { useId, useMemo, useState } from 'react';
import { KIND_LABELS, searchEntities, type SearchResult } from '@/data';
import { useSelection } from '@/state/selection';

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  );
}

export function SearchBox() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const results = useMemo(() => searchEntities(query), [query]);
  const select = useSelection((s) => s.select);
  const listId = useId();

  const choose = (r: SearchResult) => {
    select(r.kind, r.id, false);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="chrome-optional relative">
      <div className="flex min-h-11 w-full items-center gap-2 rounded-full border border-line-strong bg-bg px-3.5 text-muted md:w-64">
        <SearchIcon />
        <input
          type="search"
          role="combobox"
          aria-label="සොයන්න"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          placeholder="සොයන්න… (උදා: පීති)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && results[0]) choose(results[0]);
            if (e.key === 'Escape') setOpen(false);
          }}
          className="min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-muted"
        />
      </div>
      {open && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-80 w-full min-w-64 overflow-auto rounded-md border border-line bg-surface shadow-lg"
        >
          {results.map((r) => (
            <li key={`${r.kind}:${r.id}`} role="option" aria-selected={false}>
              <button
                type="button"
                className="flex min-h-11 w-full items-center gap-2 px-3 text-left hover:bg-hover"
                onClick={() => choose(r)}
              >
                <span className="text-xs text-muted">{KIND_LABELS[r.kind]}</span>
                {r.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
