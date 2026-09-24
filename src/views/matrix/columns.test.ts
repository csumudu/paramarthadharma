import { describe, expect, it } from 'vitest';
import { buildBlocks, cellFor, type MatrixColumn } from './columns';
import { toCsv } from './csv';

const col = (key: string): MatrixColumn =>
  buildBlocks()
    .flatMap((b) => b.columns)
    .find((c) => c.key === key)!;

describe('buildBlocks', () => {
  it('has 102 columns in 7 blocks', () => {
    const blocks = buildBlocks();
    expect(blocks.map((b) => b.id)).toEqual([
      'kicca',
      'cetasika-annasamana',
      'cetasika-akusala',
      'cetasika-sobhana',
      'ps',
      'puggala',
      'bhumi',
    ]);
    expect(blocks.flatMap((b) => b.columns)).toHaveLength(14 + 52 + 25 + 8 + 3);
  });

  it('orders kicca columns by vīthi order', () => {
    expect(buildBlocks()[0].columns[0].key).toBe('kicca:patisandhi');
    expect(buildBlocks()[0].columns.at(-1)!.key).toBe('kicca:cuti');
  });
});

describe('cellFor', () => {
  it('marks niyata ✓, aniyata ●, absent null', () => {
    expect(cellFor(1, col('cetasika:18'))).toEqual({ mark: '✓', status: 'rule' });
    expect(cellFor(3, col('cetasika:20'))?.mark).toBe('●');
    expect(cellFor(1, col('cetasika:21'))).toBeNull();
    expect(cellFor(19, col('kicca:tadarammana'))?.mark).toBe('✓');
  });

  it('carries review status and note', () => {
    const cell = cellFor(82, col('psLink:avijja-sankhara'));
    expect(cell?.status).toBe('disputed');
    expect(cell?.note).toBeTruthy();
  });
});

describe('toCsv', () => {
  const csv = toCsv();
  const lines = csv.split('\r\n');

  it('starts with a BOM and has a header plus 89 rows', () => {
    expect(csv.startsWith('﻿')).toBe(true);
    expect(lines).toHaveLength(90);
    expect(lines[0]).toContain('"පීති"');
  });

  it('annotates non-rule cells', () => {
    expect(lines[82]).toMatch(/\[disputed: /);
    expect(lines[31]).toMatch(/\[chart: /);
  });
});
