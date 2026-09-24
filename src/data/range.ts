/** Inclusive integer range: range(1, 3) → [1, 2, 3]. */
export const range = (from: number, to: number): number[] =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);
