import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { CittaList } from './CittaList';
import { CittaMap } from './CittaMap';

describe('CittaMap', () => {
  it('renders 89 tile buttons and selects one on click', async () => {
    const user = userEvent.setup();
    render(<CittaMap />);
    const map = screen.getByTestId('citta-map');
    const tiles = within(map).getAllByRole('button');
    expect(tiles).toHaveLength(89);
    await user.click(within(map).getByRole('button', { name: /^1\. / }));
    expect(useSelection.getState().selection.citta).toEqual([1]);
    expect(within(map).getByRole('button', { name: /^1\. / })).toHaveAttribute('data-state', 'selected');
    expect(within(map).getByRole('button', { name: /^2\. / })).toHaveAttribute('data-state', 'dim');
  });

  it('adds to the selection on shift-click', async () => {
    const user = userEvent.setup();
    render(<CittaMap />);
    const map = screen.getByTestId('citta-map');
    await user.click(within(map).getByRole('button', { name: /^1\. / }));
    await user.keyboard('{Shift>}');
    await user.click(within(map).getByRole('button', { name: /^9\. / }));
    await user.keyboard('{/Shift}');
    expect(useSelection.getState().selection.citta).toEqual([1, 9]);
  });

  it('never truncates Sinhala labels with an ellipsis', () => {
    render(<CittaMap />);
    for (const b of within(screen.getByTestId('citta-map')).getAllByRole('button')) {
      expect(b.className).not.toMatch(/\btruncate\b/);
    }
  });

  it('renders the four sphere headings and, inside the kāma card, the three row labels', () => {
    render(<CittaMap />);
    const map = screen.getByTestId('citta-map');
    for (const name of ['කාමාවචර', 'රූපාවචර', 'අරූපාවචර', 'ලෝකෝත්තර']) {
      expect(within(map).getByRole('heading', { level: 2, name })).toBeInTheDocument();
    }
    const kamaHeading = within(map).getByRole('heading', { level: 2, name: 'කාමාවචර' });
    const kamaCard = kamaHeading.closest('section');
    if (!kamaCard) throw new Error('kāma card section not found');
    for (const label of ['අකුසල', 'අහේතුක', 'සෝභන']) {
      expect(within(kamaCard as HTMLElement).getByText(label)).toBeInTheDocument();
    }
  });

  it('renders tiles in citta id order 1..89 in the DOM', () => {
    render(<CittaMap />);
    const map = screen.getByTestId('citta-map');
    const ids = within(map)
      .getAllByRole('button')
      .map((b) => Number(b.getAttribute('aria-label')!.split('.')[0]));
    expect(ids).toEqual(Array.from({ length: 89 }, (_, i) => i + 1));
  });
});

describe('CittaList (phone)', () => {
  it('renders all 89 tiles grouped under the four spheres', () => {
    render(<CittaList />);
    const list = screen.getByTestId('citta-list');
    expect(within(list).getAllByRole('button')).toHaveLength(89);
    for (const s of ['කාමාවචර', 'රූපාවචර', 'අරූපාවචර', 'ලෝකෝත්තර']) {
      expect(within(list).getByText(s)).toBeInTheDocument();
    }
  });
});
