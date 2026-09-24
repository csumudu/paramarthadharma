/**
 * Vīthi cittas arising in each plane (chart column "භූමි වලට ලැබෙන සිත්": 80 / 64 / 42).
 */
import { range } from '../range';
import type { BhumiId, BhumiRel } from '../types';

const ALL = range(1, 89);
const without = (remove: number[]) => ALL.filter((x) => !remove.includes(x));

const MAHAGGATA_VIPAKA = [...range(60, 64), ...range(74, 77)];
const DOSA = [9, 10];
const NOSE_TONGUE_BODY = [15, 16, 17, 22, 23, 24];
const MAHA_VIPAKA = range(39, 46);

const BHUMI_CITTAS: Record<BhumiId, number[]> = {
  kama: without(MAHAGGATA_VIPAKA),
  rupa: without([...DOSA, ...NOSE_TONGUE_BODY, ...MAHA_VIPAKA, ...MAHAGGATA_VIPAKA]),
  arupa: without([
    ...range(55, 69), // all rūpāvacara
    ...DOSA,
    ...range(13, 28), // ahetuka except manodvārāvajjana (29)…
    30, // …and hasituppāda
    ...MAHA_VIPAKA,
    ...range(74, 77), // arūpa vipāka (vīthimutta)
    82, // sotāpatti magga
  ]),
};

export const BHUMI_RELS: BhumiRel[] = (Object.entries(BHUMI_CITTAS) as [BhumiId, number[]][])
  .flatMap(([bhumi, cittas]) => cittas.map((citta) => ({ citta, bhumi, status: 'rule' as const })))
  .sort((a, b) => a.citta - b.citta);
