'use client';

import { useUi } from '@/state/ui';

const BTN = 'min-h-11 min-w-11 rounded-md border border-line px-2 hover:bg-hover';

export function ThemeToggle() {
  const theme = useUi((s) => s.theme);
  const toggle = useUi((s) => s.toggleTheme);
  return (
    <button type="button" className={BTN} onClick={toggle} aria-label="තේමාව මාරු කරන්න" title="තේමාව මාරු කරන්න">
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  );
}

export function PresenterToggle() {
  const presenter = useUi((s) => s.presenter);
  const toggle = useUi((s) => s.togglePresenter);
  return (
    <button type="button" className={BTN} onClick={toggle} aria-pressed={presenter} aria-label="විශාල අකුරු">
      අ+
    </button>
  );
}
