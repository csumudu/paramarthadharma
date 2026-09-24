import type { PsLink, PsLinkId } from '../types';

const L = (id: PsLinkId, fromSi: string, toSi: string, slot: number): PsLink => ({ id, fromSi, toSi, slot });

export const PS_LINKS: PsLink[] = [
  L('avijja-sankhara', 'අවිජ්ජා', 'සංඛාර', 1),
  L('kusalamula-sankhara', 'කුසලමූල', 'සංඛාර', 1),
  L('akusalamula-sankhara', 'අකුසලමූල', 'සංඛාර', 1),
  L('sankhara-vinnana', 'සංඛාර', 'විඤ්ඤාණ', 2),
  L('vinnana-nama', 'විඤ්ඤාණ', 'නාම', 3),
  L('nama-chatthayatana', 'නාම', 'ඡට්ඨායතන', 4),
  L('chatthayatana-phassa', 'ඡට්ඨායතන', 'ඵස්ස', 5),
  L('phassa-vedana', 'ඵස්ස', 'වේදනා', 6),
  L('vedana-tanha', 'වේදනා', 'තණ්හා', 7),
  L('vedana-patigha', 'වේදනා', 'පටිඝ', 7),
  L('vedana-vicikiccha', 'වේදනා', 'විචිකිච්ඡා', 7),
  L('vedana-uddhacca', 'වේදනා', 'උද්ධච්ච', 7),
  L('vedana-pasada', 'වේදනා', 'පසාද', 7),
  L('vedana-adhimokkha', 'වේදනා', 'අධිමොක්ඛ', 7),
  L('vedana-bhava', 'වේදනා', 'භව', 7),
  L('tanha-upadana', 'තණ්හා', 'උපාදාන', 8),
  L('tanha-adhimokkha', 'තණ්හා', 'අධිමොක්ඛ', 8),
  L('patigha-adhimokkha', 'පටිඝ', 'අධිමොක්ඛ', 8),
  L('uddhacca-adhimokkha', 'උද්ධච්ච', 'අධිමොක්ඛ', 8),
  L('pasada-adhimokkha', 'පසාද', 'අධිමොක්ඛ', 8),
  L('vicikiccha-bhava', 'විචිකිච්ඡා', 'භව', 8),
  L('upadana-bhava', 'උපාදාන', 'භව', 9),
  L('adhimokkha-bhava', 'අධිමොක්ඛ', 'භව', 9),
  L('bhava-jati', 'භව', 'ජාති', 10),
  L('jati-jaramarana', 'ජාති', 'ජරාමරණ', 11),
];

export const psLinkById = new Map<PsLinkId, PsLink>(PS_LINKS.map((l) => [l.id, l]));

export const psLabel = (l: PsLink): string => `${l.fromSi} පච්චයා ${l.toSi}`;

/** The textbook 11-link chain; used as greyed placeholders for empty slots. */
export const STANDARD_CHAIN: PsLinkId[] = [
  'avijja-sankhara',
  'sankhara-vinnana',
  'vinnana-nama',
  'nama-chatthayatana',
  'chatthayatana-phassa',
  'phassa-vedana',
  'vedana-tanha',
  'tanha-upadana',
  'upadana-bhava',
  'bhava-jati',
  'jati-jaramarana',
];
