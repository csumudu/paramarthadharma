'use client';

import { useUi } from '@/state/ui';

const BTN =
  'flex min-h-11 min-w-11 items-center justify-center rounded-full border border-line-strong bg-surface px-2 text-fg-2 hover:bg-hover';

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </svg>
  );
}

export function ThemeToggle() {
  const theme = useUi((s) => s.theme);
  const toggle = useUi((s) => s.toggleTheme);
  return (
    <button type="button" className={BTN} onClick={toggle} aria-label="තේමාව මාරු කරන්න" title="තේමාව මාරු කරන්න">
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export function PresenterToggle() {
  const presenter = useUi((s) => s.presenter);
  const toggle = useUi((s) => s.togglePresenter);
  return (
    <button
      type="button"
      className={`${BTN} w-auto text-[15px] font-bold`}
      onClick={toggle}
      aria-pressed={presenter}
      aria-label="විශාල අකුරු"
    >
      අ+
    </button>
  );
}
