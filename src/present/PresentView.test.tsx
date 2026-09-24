import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useSelection } from '@/state/selection';
import { PresentView } from './PresentView';

vi.mock('@/views/graph/GraphView', () => ({ GraphView: () => <div>graph</div> }));

const key = (k: string) => fireEvent.keyDown(window, { key: k });

describe('PresentView', () => {
  it('runs a scene with the keyboard', async () => {
    const user = userEvent.setup();
    render(<PresentView />);
    await user.click(screen.getByRole('button', { name: /අකුසල චෛතසික එකින් එක/ }));
    const presenter = within(screen.getByTestId('presenter'));
    expect(presenter.getByTestId('caption')).toHaveTextContent('මෝහ');
    expect(useSelection.getState().selection.cetasika).toEqual([14]);

    key('ArrowRight');
    expect(useSelection.getState().selection.cetasika).toEqual([15]);

    for (let i = 0; i < 20; i++) key('ArrowRight');
    expect(presenter.getByText('8 / 8')).toBeInTheDocument();

    key('f');
    expect(presenter.getByTestId('freeze-overlay')).toBeInTheDocument();

    key('Escape');
    expect(screen.getByRole('heading', { name: 'ඉදිරිපත් කිරීම් දර්ශන' })).toBeInTheDocument();
  });

  it('steps with a touch swipe', async () => {
    const user = userEvent.setup();
    render(<PresentView />);
    await user.click(screen.getByRole('button', { name: /අකුසල චෛතසික එකින් එක/ }));
    const stage = screen.getByTestId('presenter');
    fireEvent.pointerDown(stage, { pointerType: 'touch', clientX: 300 });
    fireEvent.pointerUp(stage, { pointerType: 'touch', clientX: 100 });
    expect(within(stage).getByText('2 / 8')).toBeInTheDocument();
  });
});
