import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { useUi } from '@/state/ui';
import { AppShell } from './AppShell';

// AppShell reads the selection from the URL on mount and writes it back on change.
afterEach(() => window.history.replaceState(null, '', '/'));

describe('AppShell', () => {
  it('shows the Sinhala title and the four views', () => {
    render(<AppShell>content</AppShell>);
    expect(screen.getByRole('heading', { name: 'චිත්ත දර්ශකය' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'දර්ශන' });
    expect(within(nav).getAllByRole('link').map((a) => a.textContent)).toEqual([
      'ගවේෂකය',
      'සම්පූර්ණ සටහන',
      'සම්බන්ධතා ජාලය',
      'ඉදිරිපත් කිරීම',
    ]);
  });

  it('hydrates the selection from the URL and carries it in nav links', async () => {
    window.history.replaceState(null, '', '/?ce=12');
    render(<AppShell>content</AppShell>);
    const nav = screen.getByRole('navigation', { name: 'දර්ශන' });
    expect(await within(nav).findByRole('link', { name: 'සම්පූර්ණ සටහන' })).toHaveAttribute('href', '/matrix?ce=12');
    expect(useSelection.getState().selection.cetasika).toEqual([12]);
  });

  it('selects an entity from search', async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);
    await user.type(screen.getAllByRole('combobox', { name: 'සොයන්න' })[0], 'පීති');
    await user.click(screen.getAllByRole('option')[0].querySelector('button')!);
    expect(useSelection.getState().selection.cetasika).toEqual([12]);
  });

  it('toggles the theme on <html>', async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);
    await user.click(screen.getAllByRole('button', { name: 'තේමාව මාරු කරන්න' })[0]);
    expect(useUi.getState().theme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('shows and dismisses the invalid-link notice', async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, '', '/?c=999');
    render(<AppShell>content</AppShell>);
    expect(await screen.findByRole('status')).toHaveTextContent('සබැඳියේ');
    await user.click(screen.getByRole('button', { name: 'දැනුම්දීම වසන්න' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
