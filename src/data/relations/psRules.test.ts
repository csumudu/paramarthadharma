import { describe, expect, it } from 'vitest';
import { STANDARD_CHAIN, psLinkById } from '../entities/psLinks';
import { range } from '../range';
import { PS_RELS } from './psRules';

const linksOf = (citta: number) => PS_RELS.filter((r) => r.citta === citta).map((r) => r.psLink);

describe('PS_RELS', () => {
  it('gives a lobha diṭṭhi citta the standard 11-link chain', () => {
    expect(linksOf(1)).toEqual(STANDARD_CHAIN);
  });

  it('varies the vedanā link by citta type', () => {
    expect(linksOf(3)).toContain('tanha-adhimokkha');
    expect(linksOf(9)).toEqual(expect.arrayContaining(['vedana-patigha', 'patigha-adhimokkha', 'adhimokkha-bhava']));
    expect(linksOf(11)).toEqual(expect.arrayContaining(['vedana-vicikiccha', 'vicikiccha-bhava']));
    expect(linksOf(12)).toEqual(expect.arrayContaining(['vedana-uddhacca', 'uddhacca-adhimokkha']));
    expect(linksOf(31)).toEqual(expect.arrayContaining(['vedana-pasada', 'pasada-adhimokkha']));
    expect(linksOf(13)).toEqual(expect.arrayContaining(['akusalamula-sankhara', 'vedana-bhava']));
    expect(linksOf(39)).toEqual(expect.arrayContaining(['kusalamula-sankhara', 'vedana-adhimokkha']));
  });

  it('gives kiriya cittas no root link', () => {
    for (const id of [28, 29, 30, 47, 65, 78]) {
      expect(linksOf(id).filter((l) => psLinkById.get(l)!.slot === 1), `citta ${id}`).toEqual([]);
    }
  });

  it('every citta has phassa → vedanā and bhava → jāti → jarāmaraṇa', () => {
    for (const id of range(1, 89)) {
      expect(linksOf(id), `citta ${id}`).toEqual(
        expect.arrayContaining(['phassa-vedana', 'bhava-jati', 'jati-jaramarana']),
      );
    }
  });

  it('has at most one link per slot, except slot 1 for kusala (avijjā + kusalamūla)', () => {
    for (const id of range(1, 89)) {
      const slots = linksOf(id).map((l) => psLinkById.get(l)!.slot).filter((s) => s !== 1);
      expect(new Set(slots).size, `citta ${id}`).toBe(slots.length);
    }
  });

  it('tags chart-only and disputed links for review', () => {
    const rel = (citta: number, link: string) => PS_RELS.find((r) => r.citta === citta && r.psLink === link);
    expect(rel(31, 'avijja-sankhara')?.status).toBe('chart');
    expect(rel(82, 'avijja-sankhara')?.status).toBe('disputed');
    expect(rel(1, 'avijja-sankhara')?.status).toBe('rule');
    expect(rel(82, 'avijja-sankhara')?.note).toBeTruthy();
  });

  it('is sorted by citta then slot', () => {
    const order = PS_RELS.map((r) => r.citta * 100 + psLinkById.get(r.psLink)!.slot);
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });
});
