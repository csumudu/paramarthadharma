import type { Bhumi, BhumiId } from '../types';

export const BHUMIS: Bhumi[] = [
  { id: 'kama', nameSi: 'කාම භූමි' },
  { id: 'rupa', nameSi: 'රූප භූමි' },
  { id: 'arupa', nameSi: 'අරූප භූමි' },
];

export const bhumiById = new Map<BhumiId, Bhumi>(BHUMIS.map((b) => [b.id, b]));
