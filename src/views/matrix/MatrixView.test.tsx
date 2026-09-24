import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { MatrixView } from './MatrixView';

describe('MatrixView', () => {
  it('renders one body row per citta', () => {
    const { container } = render(<MatrixView />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(89);
  });

  it('outlines disputed cells in review mode', async () => {
    const user = userEvent.setup();
    const { container } = render(<MatrixView />);
    const cell = () => container.querySelector('tr[data-citta="82"] td[data-col="psLink:avijja-sankhara"]')!;
    expect(cell().className).not.toMatch(/outline-akusala/);
    // Scoped to the toolbar (2 buttons) instead of screen.getByRole, which would walk the
    // whole ~9k-cell table's accessibility tree — see task-11-report.md fix round 1.
    const toolbar = within(container.querySelector('[role="toolbar"]')!);
    await user.click(toolbar.getByRole('button', { name: 'සමාලෝචන ප්‍රකාරය' }));
    expect(cell()).toHaveAttribute('data-status', 'disputed');
    expect(cell().className).toMatch(/outline-akusala/);
  });

  it('collapses a block', async () => {
    const user = userEvent.setup();
    const { container } = render(<MatrixView />);
    expect(container.querySelectorAll('td[data-col^="psLink:"]').length).toBeGreaterThan(0);
    // Scoped to <thead> (~110 elements) instead of the whole table.
    const thead = within(container.querySelector('thead')!);
    await user.click(thead.getByRole('button', { name: /ඒකචිත්තක්ඛණික පටිච්චසමුප්පාදය/ }));
    expect(container.querySelectorAll('td[data-col^="psLink:"]')).toHaveLength(0);
  });

  it('selects from row and column headers', async () => {
    const user = userEvent.setup();
    const { container } = render(<MatrixView />);
    // Scoped to the single citta-1 row (~104 elements) instead of the whole table.
    const row1 = within(container.querySelector('tr[data-citta="1"]')!);
    await user.click(row1.getByRole('button', { name: /^1\. / }));
    expect(useSelection.getState().selection.citta).toEqual([1]);
    const thead = within(container.querySelector('thead')!);
    await user.click(thead.getByRole('button', { name: 'පීති' }));
    expect(useSelection.getState().selection).toMatchObject({ citta: [], cetasika: [12] });
  });
});
