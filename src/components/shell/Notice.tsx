'use client';

import { useSelection } from '@/state/selection';

export function Notice() {
  const notice = useSelection((s) => s.notice);
  const dismiss = useSelection((s) => s.dismissNotice);
  if (!notice) return null;
  return (
    <div role="status" className="mx-auto flex max-w-[1800px] items-center gap-3 bg-hover px-4 py-2 text-sm">
      <span className="flex-1">{notice}</span>
      <button type="button" onClick={dismiss} aria-label="දැනුම්දීම වසන්න" className="min-h-11 min-w-11">
        ×
      </button>
    </div>
  );
}
