'use client';

import { useEffect } from 'react';
import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(`citta.${key}`);
  } catch {
    return null;
  }
};
const safeSet = (key: string, value: string) => {
  try {
    localStorage.setItem(`citta.${key}`, value);
  } catch {
    // storage blocked: keep the in-memory value for this session
  }
};

interface UiState {
  theme: Theme;
  presenter: boolean;
  hydrate: () => void;
  toggleTheme: () => void;
  togglePresenter: () => void;
}

export const useUi = create<UiState>((set, get) => ({
  theme: 'light',
  presenter: false,
  hydrate: () => {
    const stored = safeGet('theme');
    // Light is the default; dark only when the user chose it with the toggle.
    const theme: Theme = stored === 'dark' ? 'dark' : 'light';
    set({ theme, presenter: safeGet('presenter') === 'on' });
  },
  toggleTheme: () => {
    const theme: Theme = get().theme === 'dark' ? 'light' : 'dark';
    safeSet('theme', theme);
    set({ theme });
  },
  togglePresenter: () => {
    const presenter = !get().presenter;
    safeSet('presenter', presenter ? 'on' : 'off');
    set({ presenter });
  },
}));

/** Hydrates preferences once and mirrors them onto <html data-theme data-presenter>. */
export function useApplyUi(): void {
  const theme = useUi((s) => s.theme);
  const presenter = useUi((s) => s.presenter);
  useEffect(() => {
    useUi.getState().hydrate();
  }, []);
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.theme = theme;
    if (presenter) el.dataset.presenter = 'on';
    else delete el.dataset.presenter;
  }, [theme, presenter]);
}
