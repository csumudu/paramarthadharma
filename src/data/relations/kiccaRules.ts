/** Citta ↔ kicca (function), Abhidhammattha Saṅgaha ch. 3. */
import { range } from '../range';
import type { KiccaId, KiccaRel } from '../types';

const PATISANDHI_CITTAS = [19, 27, ...range(39, 46), ...range(60, 64), ...range(74, 77)];

const KICCA_CITTAS: Record<KiccaId, number[]> = {
  patisandhi: PATISANDHI_CITTAS,
  bhavanga: PATISANDHI_CITTAS,
  cuti: PATISANDHI_CITTAS,
  avajjana: [28, 29],
  dassana: [13, 20],
  savana: [14, 21],
  ghayana: [15, 22],
  sayana: [16, 23],
  phusana: [17, 24],
  sampaticchana: [18, 25],
  santirana: [19, 26, 27],
  votthapana: [29],
  javana: [
    ...range(1, 12), // akusala
    30, // hasituppāda
    ...range(31, 38), // mahā kusala
    ...range(47, 54), // mahā kiriya
    ...range(55, 59), // rūpa kusala
    ...range(65, 69), // rūpa kiriya
    ...range(70, 73), // arūpa kusala
    ...range(78, 81), // arūpa kiriya
    ...range(82, 89), // magga + phala
  ],
  tadarammana: [19, 26, 27, ...range(39, 46)],
};

export const KICCA_RELS: KiccaRel[] = (Object.entries(KICCA_CITTAS) as [KiccaId, number[]][])
  .flatMap(([kicca, cittas]) => cittas.map((citta) => ({ citta, kicca, status: 'rule' as const })))
  .sort((a, b) => a.citta - b.citta);
