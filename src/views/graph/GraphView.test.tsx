import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useSelection } from '@/state/selection';
import type { GraphNode } from './buildGraph';
import { GraphView, nodeStyle } from './GraphView';

const node = (overrides: Partial<GraphNode>): GraphNode => ({
  id: 'n',
  kind: 'cetasika',
  label: '',
  tone: 'fg',
  x: 0,
  y: 0,
  dashed: false,
  ...overrides,
});

describe('nodeStyle', () => {
  it('uses --color-bg text on light fills (fg, muted) for contrast', () => {
    expect(nodeStyle(node({ tone: 'fg' })).color).toBe('var(--color-bg)');
    expect(nodeStyle(node({ tone: 'muted' })).color).toBe('var(--color-bg)');
  });

  it('uses dark text on the other light-background tones', () => {
    expect(nodeStyle(node({ tone: 'ahetuka' })).color).toBe('#111');
  });

  it('uses white text on the remaining (dark-background) tones', () => {
    expect(nodeStyle(node({ tone: 'akusala' })).color).toBe('#fff');
  });
});

describe('GraphView', () => {
  it('renders the graph container and kind chips for a citta focus', () => {
    act(() => useSelection.getState().select('citta', 31, false));
    render(<GraphView />);
    expect(screen.getByTestId('graph')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'භූමි' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('scopes `kinds` to the viewport: a toggle survives a focus change', async () => {
    const user = userEvent.setup();
    act(() => useSelection.getState().select('citta', 31, false));
    render(<GraphView />);
    const bhumiChip = () => screen.getByRole('button', { name: 'භූමි' });
    await user.click(bhumiChip());
    expect(bhumiChip()).toHaveAttribute('aria-pressed', 'false');

    // Refocusing on a different citta remounts the inner (focus-keyed) component, but `kinds`
    // is owned by the outer (viewport-keyed) component, so the toggle must still be off.
    act(() => useSelection.getState().select('citta', 1, false));
    expect(bhumiChip()).toHaveAttribute('aria-pressed', 'false');
  });

  it('scopes `expanded` to the focus: a refocus collapses a previously expanded group', () => {
    act(() => useSelection.getState().select('citta', 31, false));
    const { container } = render(<GraphView />);
    const nodeCount = () => container.querySelectorAll('.graph-node').length;
    expect(nodeCount()).toBe(11); // focus + 6 cetasika subgroups + kicca + psLink + puggala + bhumi

    const group = container.querySelector('[data-id="grp:cetasika:pakinnaka"]') as HTMLElement;
    // fireEvent (a single synthetic 'click', not userEvent's full pointer/mouse sequence) avoids
    // triggering @xyflow/react's internal d3-zoom pane drag handler, which throws in jsdom.
    fireEvent.click(group);
    expect(nodeCount()).toBe(16); // the 6-member pakinnaka group expands to its individual members

    act(() => useSelection.getState().select('citta', 1, false));
    act(() => useSelection.getState().select('citta', 31, false));
    expect(nodeCount()).toBe(11); // back to citta 31, grouped again: `expanded` reset on refocus
  });
});
