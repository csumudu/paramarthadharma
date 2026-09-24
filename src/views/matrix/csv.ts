import { CITTAS } from '@/data';
import { buildBlocks, cellFor, type MatrixBlock } from './columns';

const quote = (s: string) => `"${s.replaceAll('"', '""')}"`;

export function toCsv(blocks: MatrixBlock[] = buildBlocks()): string {
  const cols = blocks.flatMap((b) => b.columns);
  const header = ['අංකය', 'සිත', ...cols.map((c) => c.labelSi)].map(quote).join(',');
  const rows = CITTAS.map((citta) =>
    [
      String(citta.id),
      citta.nameSi,
      ...cols.map((c) => {
        const cell = cellFor(citta.id, c);
        if (!cell) return '';
        if (cell.status === 'rule') return cell.mark;
        return `${cell.mark} [${cell.status}${cell.note ? `: ${cell.note}` : ''}]`;
      }),
    ]
      .map(quote)
      .join(','),
  );
  return `﻿${[header, ...rows].join('\r\n')}`;
}
