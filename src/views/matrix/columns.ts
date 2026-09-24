import {
  BAND_LABELS,
  BHUMIS,
  CETASIKAS,
  KICCAS,
  PS_LINKS,
  PUGGALAS,
  profileOf,
  psLabel,
  type Band,
  type EntityId,
  type FilterKind,
  type Status,
} from '@/data';
import { BAND_HEADER_CLASSES } from '@/components/colors';

export interface MatrixColumn {
  key: string;
  kind: FilterKind;
  id: EntityId;
  labelSi: string;
}

export interface MatrixBlock {
  id: string;
  titleSi: string;
  headerClass: string;
  columns: MatrixColumn[];
}

const column = (kind: FilterKind, id: EntityId, labelSi: string): MatrixColumn => ({
  key: `${kind}:${id}`,
  kind,
  id,
  labelSi,
});

const BANDS: Band[] = ['annasamana', 'akusala', 'sobhana'];

export function buildBlocks(): MatrixBlock[] {
  return [
    {
      id: 'kicca',
      titleSi: 'චිත්ත කෘත්‍ය',
      headerClass: 'bg-line',
      columns: [...KICCAS].sort((a, b) => a.vithiOrder - b.vithiOrder).map((k) => column('kicca', k.id, k.nameSi)),
    },
    ...BANDS.map((band) => ({
      id: `cetasika-${band}`,
      titleSi: `${BAND_LABELS[band]} චෛතසික`,
      headerClass: BAND_HEADER_CLASSES[band],
      columns: CETASIKAS.filter((c) => c.band === band).map((c) => column('cetasika', c.id, c.nameSi)),
    })),
    {
      id: 'ps',
      titleSi: 'ඒකචිත්තක්ඛණික පටිච්චසමුප්පාදය',
      headerClass: 'bg-line',
      columns: PS_LINKS.map((l) => column('psLink', l.id, psLabel(l))),
    },
    {
      id: 'puggala',
      titleSi: 'පුද්ගලයන්ට ලැබෙන සිත්',
      headerClass: 'bg-line',
      columns: PUGGALAS.map((p) => column('puggala', p.id, p.nameSi)),
    },
    {
      id: 'bhumi',
      titleSi: 'භූමි වලට ලැබෙන සිත්',
      headerClass: 'bg-line',
      columns: BHUMIS.map((b) => column('bhumi', b.id, b.nameSi)),
    },
  ];
}

export interface Cell {
  mark: '✓' | '●';
  status: Status;
  note?: string;
}

const present = (r: { status: Status; note?: string } | undefined, mark: Cell['mark'] = '✓'): Cell | null =>
  r ? { mark, status: r.status, ...(r.note ? { note: r.note } : {}) } : null;

export function cellFor(cittaId: number, col: MatrixColumn): Cell | null {
  const p = profileOf(cittaId);
  switch (col.kind) {
    case 'cetasika': {
      const r = p.cetasikas.find((x) => x.cetasika === col.id);
      return present(r, r?.kind === 'aniyata' ? '●' : '✓');
    }
    case 'kicca':
      return present(p.kiccas.find((x) => x.kicca === col.id));
    case 'psLink':
      return present(p.psLinks.find((x) => x.psLink === col.id));
    case 'puggala':
      return present(p.puggalas.find((x) => x.puggala === col.id));
    case 'bhumi':
      return present(p.bhumis.find((x) => x.bhumi === col.id));
  }
}
