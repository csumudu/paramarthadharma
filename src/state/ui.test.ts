import { afterEach, describe, expect, it, vi } from 'vitest';
import { useUi } from './ui';

afterEach(() => {
  vi.restoreAllMocks();
  useUi.setState({ theme: 'light', presenter: false });
});

describe('useUi', () => {
  it('toggles theme and presenter and persists them', () => {
    useUi.getState().toggleTheme();
    useUi.getState().togglePresenter();
    expect(useUi.getState()).toMatchObject({ theme: 'dark', presenter: true });
    expect(localStorage.getItem('citta.theme')).toBe('dark');
    expect(localStorage.getItem('citta.presenter')).toBe('on');
  });

  it('hydrates from storage', () => {
    localStorage.setItem('citta.theme', 'dark');
    localStorage.setItem('citta.presenter', 'on');
    useUi.getState().hydrate();
    expect(useUi.getState()).toMatchObject({ theme: 'dark', presenter: true });
    localStorage.clear();
  });

  it('defaults to light even when the OS prefers dark', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query) => ({ matches: query.includes('dark'), media: query }) as MediaQueryList,
    );
    useUi.setState({ theme: 'dark' });
    useUi.getState().hydrate();
    expect(useUi.getState().theme).toBe('light');
  });

  it('keeps working when storage throws (Review Focus #5)', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => useUi.getState().hydrate()).not.toThrow();
    expect(() => useUi.getState().toggleTheme()).not.toThrow();
    expect(useUi.getState().theme).toBe('dark');
  });
});
