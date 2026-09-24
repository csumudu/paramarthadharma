/**
 * Citta ↔ cetasika combinations derived from the sampayoga rules of the
 * Abhidhammattha Saṅgaha (ch. 2), 89-citta scheme.
 */
import { CITTAS } from '../entities/cittas';
import { range } from '../range';
import type { CetasikaRel, Citta } from '../types';

const DVIPANCA = new Set([...range(13, 17), ...range(20, 24)]);
const SAMPATICCHANA_OR_PANCADVARAVAJJANA = new Set([18, 25, 28]);
const SANTIRANA = new Set([19, 26, 27]);

const isKama = (c: Citta) => c.sphere === 'kamavacara';
const jhanaAtMost = (c: Citta, level: number) => c.jhana !== null && c.jhana <= level;

interface Rule {
  cetasikas: number[];
  applies: (c: Citta) => boolean;
  kind?: (c: Citta) => 'niyata' | 'aniyata';
}

const aniyata = () => 'aniyata' as const;

const RULES: Rule[] = [
  // අඤ්ඤසමාන
  { cetasikas: range(1, 7), applies: () => true },
  { cetasikas: [8], applies: (c) => (isKama(c) ? !DVIPANCA.has(c.id) : c.jhana === 1) },
  { cetasikas: [9], applies: (c) => (isKama(c) ? !DVIPANCA.has(c.id) : jhanaAtMost(c, 2)) },
  { cetasikas: [10], applies: (c) => !DVIPANCA.has(c.id) && c.sampayutta !== 'vicikiccha' },
  {
    cetasikas: [11],
    applies: (c) => !DVIPANCA.has(c.id) && !SAMPATICCHANA_OR_PANCADVARAVAJJANA.has(c.id) && !SANTIRANA.has(c.id),
  },
  { cetasikas: [12], applies: (c) => (isKama(c) ? c.vedana === 'somanassa' : jhanaAtMost(c, 3)) },
  { cetasikas: [13], applies: (c) => c.hetu !== 'ahetuka' && c.group !== 'mohamula' },
  // අකුසල
  { cetasikas: range(14, 17), applies: (c) => c.jati === 'akusala' },
  { cetasikas: [18], applies: (c) => c.group === 'lobhamula' },
  { cetasikas: [19], applies: (c) => c.sampayutta === 'ditthi' },
  { cetasikas: [20], applies: (c) => c.sampayutta === 'ditthi-vippayutta', kind: aniyata },
  { cetasikas: [21], applies: (c) => c.group === 'dosamula' },
  { cetasikas: [22, 23, 24], applies: (c) => c.group === 'dosamula', kind: aniyata },
  { cetasikas: [25, 26], applies: (c) => c.jati === 'akusala' && c.sankharika === 'sasankharika', kind: aniyata },
  { cetasikas: [27], applies: (c) => c.sampayutta === 'vicikiccha' },
  // සෝභන
  { cetasikas: range(28, 46), applies: (c) => c.id >= 31 },
  {
    cetasikas: [47, 48, 49],
    applies: (c) => c.group === 'kama-kusala' || c.sphere === 'lokuttara',
    kind: (c) => (c.sphere === 'lokuttara' ? 'niyata' : 'aniyata'),
  },
  {
    cetasikas: [50, 51],
    applies: (c) =>
      c.group === 'kama-kusala' || c.group === 'kama-kiriya' || (c.sphere === 'rupavacara' && jhanaAtMost(c, 4)),
    kind: aniyata,
  },
  { cetasikas: [52], applies: (c) => c.hetu === 'tihetuka' },
];

export const CETASIKA_RELS: CetasikaRel[] = CITTAS.flatMap((c) =>
  RULES.flatMap((rule) =>
    rule.applies(c)
      ? rule.cetasikas.map((cetasika) => ({
          citta: c.id,
          cetasika,
          kind: rule.kind?.(c) ?? ('niyata' as const),
          status: 'rule' as const,
        }))
      : [],
  ),
);
