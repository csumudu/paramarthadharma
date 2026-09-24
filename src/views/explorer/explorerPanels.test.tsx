import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import { ExplorerView } from './ExplorerView';

const aside = () => screen.getByTestId('profile-aside');

describe('ExplorerView', () => {
  it('shows a hint before anything is selected', () => {
    render(<ExplorerView />);
    expect(within(aside()).getByText('සිතක් හෝ චෛතසිකයක් තෝරන්න')).toBeInTheDocument();
  });

  it('fills the profile when a citta is clicked', async () => {
    const user = userEvent.setup();
    render(<ExplorerView />);
    await user.click(within(screen.getByTestId('citta-map')).getByRole('button', { name: /^1\. / }));
    const panel = aside();
    expect(within(panel).getByText('19 / 52')).toBeInTheDocument();
    const lit = within(panel)
      .getAllByRole('button')
      .filter((b) => b.dataset.state === 'niyata' || b.dataset.state === 'aniyata');
    expect(lit).toHaveLength(19);
    expect(within(panel).getByRole('button', { name: 'ජවන' })).toHaveAttribute('data-state', 'on');
    expect(within(panel).getByRole('button', { name: 'වේදනා පච්චයා තණ්හා' })).toHaveAttribute('data-state', 'on');
  });

  it('reverses direction when a cetasika chip is clicked, and combines with shift', async () => {
    const user = userEvent.setup();
    render(<ExplorerView />);
    await user.click(within(aside()).getByRole('button', { name: 'පීති' }));
    expect(within(aside()).getByText('පීති: සිත් 35')).toBeInTheDocument();
    await user.keyboard('{Shift>}');
    await user.click(within(aside()).getByRole('button', { name: 'සෝතාපන්න' }));
    await user.keyboard('{/Shift}');
    expect(within(aside()).getByText('පීති + සෝතාපන්න: සිත් 15')).toBeInTheDocument();
    expect(useSelection.getState().selection.puggala).toEqual(['sotapanna']);
  });

  it('renders placeholders for empty PS slots', async () => {
    const user = userEvent.setup();
    render(<ExplorerView />);
    await user.click(within(screen.getByTestId('citta-map')).getByRole('button', { name: /^13\. / }));
    const chain = within(aside()).getByTestId('ps-chain');
    expect(within(chain).getAllByRole('listitem')).toHaveLength(11);
    expect(within(chain).getByText('තණ්හා පච්චයා උපාදාන')).toHaveAttribute('data-state', 'off');
  });
});
