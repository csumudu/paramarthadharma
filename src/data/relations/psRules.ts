/**
 * Ekacittakkhaṇika paṭiccasamuppāda per citta.
 * Source: Vibhaṅga, Paṭiccasamuppādavibhaṅga, Abhidhammabhājanīya; cross-checked
 * against the chart. Non-rule rows must be reviewed by the user (Task 15).
 */
import { CITTAS } from '../entities/cittas';
import { psLinkById } from '../entities/psLinks';
import { range } from '../range';
import type { Citta, PsLinkId, PsRel, Status } from '../types';

const DVIPANCA = new Set([...range(13, 17), ...range(20, 24)]);
const MIDDLE: PsLinkId[] = [
  'sankhara-vinnana',
  'vinnana-nama',
  'nama-chatthayatana',
  'chatthayatana-phassa',
  'phassa-vedana',
];
const END: PsLinkId[] = ['bhava-jati', 'jati-jaramarana'];

type Draft = { psLink: PsLinkId; status: Status; note?: string };
const rule = (...ids: PsLinkId[]): Draft[] => ids.map((psLink) => ({ psLink, status: 'rule' }));

function rootLinks(c: Citta): Draft[] {
  if (c.jati === 'akusala') return rule('avijja-sankhara');
  if (c.jati === 'kiriya') return [];
  if (c.group === 'akusala-vipaka') return rule('akusalamula-sankhara');
  if (c.jati === 'vipaka') return rule('kusalamula-sankhara');
  // kusala
  if (c.group === 'magga') {
    return [
      { psLink: 'avijja-sankhara', status: 'disputed', note: 'චාර්ටයේ "?????" ලෙස සලකුණු කර ඇත' },
      ...rule('kusalamula-sankhara'),
    ];
  }
  return [
    { psLink: 'avijja-sankhara', status: 'chart', note: 'චාර්ටයේ කුසල සිත් සඳහා "අවි.සං." සලකුණු කර ඇත' },
    ...rule('kusalamula-sankhara'),
  ];
}

function vedanaOnward(c: Citta): Draft[] {
  switch (c.sampayutta) {
    case 'ditthi':
      return rule('vedana-tanha', 'tanha-upadana', 'upadana-bhava');
    case 'ditthi-vippayutta':
      return rule('vedana-tanha', 'tanha-adhimokkha', 'adhimokkha-bhava');
    case 'patigha':
      return rule('vedana-patigha', 'patigha-adhimokkha', 'adhimokkha-bhava');
    case 'vicikiccha':
      return rule('vedana-vicikiccha', 'vicikiccha-bhava');
    case 'uddhacca':
      return rule('vedana-uddhacca', 'uddhacca-adhimokkha', 'adhimokkha-bhava');
    default:
      if (c.jati === 'kusala') return rule('vedana-pasada', 'pasada-adhimokkha', 'adhimokkha-bhava');
      return DVIPANCA.has(c.id) ? rule('vedana-bhava') : rule('vedana-adhimokkha', 'adhimokkha-bhava');
  }
}

const slotOf = (id: PsLinkId) => psLinkById.get(id)!.slot;

export const PS_RELS: PsRel[] = CITTAS.flatMap((c) =>
  [...rootLinks(c), ...rule(...MIDDLE), ...vedanaOnward(c), ...rule(...END)]
    .sort((a, b) => slotOf(a.psLink) - slotOf(b.psLink))
    .map((d) => ({ citta: c.id, ...d })),
);
