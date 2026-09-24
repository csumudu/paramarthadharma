import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useLongPress } from './useLongPress';

function Probe({ onClick, onLongPress }: { onClick: () => void; onLongPress: () => void }) {
  const handlers = useLongPress({ onClick, onLongPress });
  return (
    <button type="button" {...handlers}>
      x
    </button>
  );
}

afterEach(() => vi.useRealTimers());

describe('useLongPress', () => {
  it('fires onClick for a short press', () => {
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    render(<Probe onClick={onClick} onLongPress={onLongPress} />);
    const b = screen.getByRole('button');
    fireEvent.pointerDown(b);
    fireEvent.pointerUp(b);
    fireEvent.click(b);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('fires onLongPress after 500ms and swallows the following click', () => {
    vi.useFakeTimers();
    const onClick = vi.fn();
    const onLongPress = vi.fn();
    render(<Probe onClick={onClick} onLongPress={onLongPress} />);
    const b = screen.getByRole('button');
    fireEvent.pointerDown(b);
    vi.advanceTimersByTime(600);
    fireEvent.pointerUp(b);
    fireEvent.click(b);
    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(onClick).not.toHaveBeenCalled();
  });
});
