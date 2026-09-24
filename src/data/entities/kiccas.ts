import type { Kicca, KiccaId } from '../types';

export const KICCAS: Kicca[] = [
  { id: 'patisandhi', nameSi: 'පටිසන්ධි', vithiOrder: 1 },
  { id: 'bhavanga', nameSi: 'භවාංග', vithiOrder: 2 },
  { id: 'avajjana', nameSi: 'ආවජ්ජන', vithiOrder: 3 },
  { id: 'dassana', nameSi: 'දස්සන', vithiOrder: 4 },
  { id: 'savana', nameSi: 'සවන', vithiOrder: 4 },
  { id: 'ghayana', nameSi: 'ඝායන', vithiOrder: 4 },
  { id: 'sayana', nameSi: 'සායන', vithiOrder: 4 },
  { id: 'phusana', nameSi: 'ඵුසන', vithiOrder: 4 },
  { id: 'sampaticchana', nameSi: 'සම්පටිච්ඡන', vithiOrder: 5 },
  { id: 'santirana', nameSi: 'සන්තීරණ', vithiOrder: 6 },
  { id: 'votthapana', nameSi: 'වොට්ඨබ්බන', vithiOrder: 7 },
  { id: 'javana', nameSi: 'ජවන', vithiOrder: 8 },
  { id: 'tadarammana', nameSi: 'තදාරම්මණ', vithiOrder: 9 },
  { id: 'cuti', nameSi: 'චුති', vithiOrder: 10 },
];

export const kiccaById = new Map<KiccaId, Kicca>(KICCAS.map((k) => [k.id, k]));
