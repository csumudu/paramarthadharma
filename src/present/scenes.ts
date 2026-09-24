import { cittasFor, kiccaById, labelOf, type FilterKind, type EntityId, type KiccaId, type Selection } from '@/data';
import { range } from '@/data/range';

export interface SceneStep {
  view: 'explorer' | 'graph';
  select: Partial<Selection>;
  captionSi: string;
}

export interface Scene {
  id: string;
  titleSi: string;
  steps: SceneStep[];
}

const n = (kind: FilterKind, id: EntityId) => cittasFor(kind, id).size;
const ex = (select: Partial<Selection>, captionSi: string): SceneStep => ({ view: 'explorer', select, captionSi });
const cet = (id: number, note: string) => ex({ cetasika: [id] }, `${labelOf('cetasika', id)} — සිත් ${n('cetasika', id)} (${note})`);

const VITHI: KiccaId[] = [
  'patisandhi',
  'bhavanga',
  'avajjana',
  'dassana',
  'sampaticchana',
  'santirana',
  'votthapana',
  'javana',
  'tadarammana',
  'cuti',
];

export const SCENES: Scene[] = [
  {
    id: 'spheres',
    titleSi: 'සිත් 89 — භූමි අනුව',
    steps: [
      ex({}, 'චිත්ත 89ම'),
      ex({ citta: range(1, 54) }, 'කාමාවචර සිත් 54'),
      ex({ citta: range(55, 69) }, 'රූපාවචර සිත් 15'),
      ex({ citta: range(70, 81) }, 'අරූපාවචර සිත් 12'),
      ex({ citta: range(82, 89) }, 'ලෝකෝත්තර සිත් 8'),
    ],
  },
  {
    id: 'akusala',
    titleSi: 'අකුසල චෛතසික එකින් එක',
    steps: [
      cet(14, 'සියලු අකුසල සිත්'),
      cet(15, 'සියලු අකුසල සිත්'),
      cet(18, 'ලෝභමූල'),
      cet(19, 'දෘෂ්ටිගත සම්ප්‍රයුක්ත'),
      cet(20, 'දෘෂ්ටිගත විප්‍රයුක්ත — අනියත'),
      cet(21, 'ද්වේෂමූල'),
      cet(25, 'සසංස්කාරික — අනියත'),
      cet(27, 'එක් සිතක් පමණි'),
    ],
  },
  {
    id: 'vithi',
    titleSi: 'චිත්ත වීථිය',
    steps: VITHI.map((k) => ex({ kicca: [k] }, `${kiccaById.get(k)!.nameSi} — සිත් ${n('kicca', k)}`)),
  },
  {
    id: 'ariya',
    titleSi: 'ආර්‍ය පුද්ගලයන්ට ලැබෙන සිත්',
    steps: [
      ...(['tihetuka', 'sotapanna', 'anagami', 'arahant'] as const).map((p) =>
        ex({ puggala: [p] }, `${labelOf('puggala', p)} — සිත් ${n('puggala', p)}`),
      ),
      { view: 'graph', select: { puggala: ['arahant'] }, captionSi: 'අර්හත් — සම්බන්ධතා ජාලය' },
    ],
  },
  {
    id: 'ps',
    titleSi: 'එක් සිතක් තුළ පටිච්චසමුප්පාදය',
    steps: [
      ex({ citta: [1] }, 'ලෝභමූල (දෘෂ්ටිගත) — තණ්හා පච්චයා උපාදාන'),
      ex({ citta: [3] }, 'ලෝභමූල (දෘෂ්ටි විප්‍රයුක්ත) — තණ්හා පච්චයා අධිමොක්ඛ'),
      ex({ citta: [9] }, 'ද්වේෂමූල — වේදනා පච්චයා පටිඝ'),
      ex({ citta: [11] }, 'විචිකිච්ඡා — වේදනා පච්චයා විචිකිච්ඡා'),
      ex({ citta: [31] }, 'කුසල — වේදනා පච්චයා පසාද'),
      ex({ citta: [13] }, 'චක්ඛු විඤ්ඤාණය — වේදනා පච්චයා භව'),
    ],
  },
];
