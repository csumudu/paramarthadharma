/**
 * Vīthi cittas available to each puggala (chart column "පුද්ගලයන්ට ලැබෙන සිත්").
 * The four magga cittas are momentary and, as on the chart, are not counted.
 */
import { range } from '../range';
import type { PuggalaId, PuggalaRel } from '../types';

const AKUSALA = range(1, 12);
const AHETUKA_NO_HASITUPPADA = range(13, 29);
const MAHA_KUSALA = range(31, 38);
const MAHA_VIPAKA_NANA_VIPPAYUTTA = [41, 42, 45, 46];
const MAHA_VIPAKA = range(39, 46);
const MAHAGGATA_KUSALA = [...range(55, 59), ...range(70, 73)];
const without = (xs: number[], remove: number[]) => xs.filter((x) => !remove.includes(x));

const DUGGATI = [...AKUSALA, ...AHETUKA_NO_HASITUPPADA, ...MAHA_KUSALA];
const SUGATI = [...DUGGATI, ...MAHA_VIPAKA_NANA_VIPPAYUTTA];
const TIHETUKA = [...AKUSALA, ...AHETUKA_NO_HASITUPPADA, ...MAHA_KUSALA, ...MAHA_VIPAKA, ...MAHAGGATA_KUSALA];
const SEKHA_BASE = without(TIHETUKA, [1, 2, 5, 6, 11]); // diṭṭhi + vicikicchā removed

const PUGGALA_CITTAS: Record<PuggalaId, number[]> = {
  'duggati-ahetuka': DUGGATI,
  'sugati-ahetuka': SUGATI,
  dvihetuka: SUGATI,
  tihetuka: TIHETUKA,
  sotapanna: [...SEKHA_BASE, 86],
  sakadagami: [...SEKHA_BASE, 87],
  anagami: [...without(SEKHA_BASE, [9, 10]), 88],
  arahant: [...range(13, 30), ...MAHA_VIPAKA, ...range(47, 54), ...range(65, 69), ...range(78, 81), 89],
};

export const PUGGALA_RELS: PuggalaRel[] = (Object.entries(PUGGALA_CITTAS) as [PuggalaId, number[]][])
  .flatMap(([puggala, cittas]) => cittas.map((citta) => ({ citta, puggala, status: 'rule' as const })))
  .sort((a, b) => a.citta - b.citta);
