import type { Citta, GroupId, Jati, Sankharika, Vedana } from '../types';

type Draft = Omit<Citta, 'id'>;

const V: Record<Vedana, string> = {
  somanassa: 'සෝමනස්ස සහගත',
  upekkha: 'උපේක්ෂා සහගත',
  domanassa: 'දෝමනස්ස සහගත',
  sukha: 'සුඛ සහගත',
  dukkha: 'දුක්ඛ සහගත',
};
const SANKH: Record<Sankharika, string> = { asankharika: 'අසංස්කාරික', sasankharika: 'සසංස්කාරික' };
const SANKHARIKAS: Sankharika[] = ['asankharika', 'sasankharika'];
const plain = { sankharika: null, sampayutta: null, jhana: null } as const;

const drafts: Draft[] = [];

// 1–8 ලෝභමූල
let n = 0;
for (const vedana of ['somanassa', 'upekkha'] as const)
  for (const ditthi of [true, false])
    for (const sankharika of SANKHARIKAS) {
      n += 1;
      drafts.push({
        nameSi: `${V[vedana]} දෘෂ්ටිගත ${ditthi ? 'සම්ප්‍රයුක්ත' : 'විප්‍රයුක්ත'} ${SANKH[sankharika]} සිත`,
        short: `ලෝභ ${n}`,
        group: 'lobhamula',
        sphere: 'kamavacara',
        jati: 'akusala',
        vedana,
        hetu: 'dvihetuka',
        sankharika,
        sampayutta: ditthi ? 'ditthi' : 'ditthi-vippayutta',
        jhana: null,
      });
    }

// 9–10 ද්වේෂමූල
SANKHARIKAS.forEach((sankharika, i) =>
  drafts.push({
    nameSi: `${V.domanassa} ප්‍රතිඝ සම්ප්‍රයුක්ත ${SANKH[sankharika]} සිත`,
    short: `ද්වේෂ ${i + 1}`,
    group: 'dosamula',
    sphere: 'kamavacara',
    jati: 'akusala',
    vedana: 'domanassa',
    hetu: 'dvihetuka',
    sankharika,
    sampayutta: 'patigha',
    jhana: null,
  }),
);

// 11–12 මෝහමූල
drafts.push(
  {
    ...plain,
    nameSi: `${V.upekkha} විචිකිච්ඡා සම්ප්‍රයුක්ත සිත`,
    short: 'විචිකිච්ඡා',
    group: 'mohamula',
    sphere: 'kamavacara',
    jati: 'akusala',
    vedana: 'upekkha',
    hetu: 'ekahetuka',
    sampayutta: 'vicikiccha',
  },
  {
    ...plain,
    nameSi: `${V.upekkha} උද්ධච්ච සම්ප්‍රයුක්ත සිත`,
    short: 'උද්ධච්ච',
    group: 'mohamula',
    sphere: 'kamavacara',
    jati: 'akusala',
    vedana: 'upekkha',
    hetu: 'ekahetuka',
    sampayutta: 'uddhacca',
  },
);

// 13–27 අහේතුක විපාක
const ahetuka = (group: GroupId, vedana: Vedana, nameSi: string, short: string, jati: Jati = 'vipaka'): Draft => ({
  ...plain,
  nameSi: `${V[vedana]} ${nameSi}`,
  short,
  group,
  sphere: 'kamavacara',
  jati,
  vedana,
  hetu: 'ahetuka',
});
const SENSES: [string, string][] = [
  ['චක්ඛු විඤ්ඤාණය', 'චක්ඛු'],
  ['සෝත විඤ්ඤාණය', 'සෝත'],
  ['ඝාණ විඤ්ඤාණය', 'ඝාණ'],
  ['ජිව්හා විඤ්ඤාණය', 'ජිව්හා'],
];
for (const [name, short] of SENSES) drafts.push(ahetuka('akusala-vipaka', 'upekkha', name, short));
drafts.push(
  ahetuka('akusala-vipaka', 'dukkha', 'කාය විඤ්ඤාණය', 'කාය'),
  ahetuka('akusala-vipaka', 'upekkha', 'සම්පටිච්ඡනය', 'සම්පටිච්ඡන'),
  ahetuka('akusala-vipaka', 'upekkha', 'සන්තීරණය', 'සන්තීරණ'),
);
for (const [name, short] of SENSES) drafts.push(ahetuka('ahetuka-kusala-vipaka', 'upekkha', name, short));
drafts.push(
  ahetuka('ahetuka-kusala-vipaka', 'sukha', 'කාය විඤ්ඤාණය', 'කාය'),
  ahetuka('ahetuka-kusala-vipaka', 'upekkha', 'සම්පටිච්ඡනය', 'සම්පටිච්ඡන'),
  ahetuka('ahetuka-kusala-vipaka', 'somanassa', 'සන්තීරණය', 'සන්තීරණ (සෝ.)'),
  ahetuka('ahetuka-kusala-vipaka', 'upekkha', 'සන්තීරණය', 'සන්තීරණ (උ.)'),
);

// 28–30 අහේතුක ක්‍රියා
drafts.push(
  ahetuka('ahetuka-kiriya', 'upekkha', 'පඤ්චද්වාරාවජ්ජනය', 'පඤ්චද්වාරාවජ්ජන', 'kiriya'),
  ahetuka('ahetuka-kiriya', 'upekkha', 'මනෝද්වාරාවජ්ජනය', 'මනෝද්වාරාවජ්ජන', 'kiriya'),
  ahetuka('ahetuka-kiriya', 'somanassa', 'හසිතුප්පාදය', 'හසිතුප්පාද', 'kiriya'),
);

// 31–54 කාමාවචර සෝභන
const KAMA_SOBHANA: [GroupId, Jati, string, string][] = [
  ['kama-kusala', 'kusala', 'කුසල සිත', 'මහා කුසල'],
  ['kama-vipaka', 'vipaka', 'විපාක සිත', 'මහා විපාක'],
  ['kama-kiriya', 'kiriya', 'ක්‍රියා සිත', 'මහා ක්‍රියා'],
];
for (const [group, jati, suffix, shortPrefix] of KAMA_SOBHANA) {
  let k = 0;
  for (const vedana of ['somanassa', 'upekkha'] as const)
    for (const nana of [true, false])
      for (const sankharika of SANKHARIKAS) {
        k += 1;
        drafts.push({
          nameSi: `${V[vedana]} ඥාන ${nana ? 'සම්ප්‍රයුක්ත' : 'විප්‍රයුක්ත'} ${SANKH[sankharika]} ${suffix}`,
          short: `${shortPrefix} ${k}`,
          group,
          sphere: 'kamavacara',
          jati,
          vedana,
          hetu: nana ? 'tihetuka' : 'dvihetuka',
          sankharika,
          sampayutta: nana ? 'nana' : 'nana-vippayutta',
          jhana: null,
        });
      }
}

// 55–69 රූපාවචර
const JHANA_ORDINAL = ['ප්‍රථම', 'ද්විතීය', 'තෘතීය', 'චතුර්ථ', 'පඤ්චම'];
const JHANA_FACTORS = [
  'විතක්ක විචාර ප්‍රීති සුඛ ඒකාග්‍රතා සහිත',
  'විචාර ප්‍රීති සුඛ ඒකාග්‍රතා සහිත',
  'ප්‍රීති සුඛ ඒකාග්‍රතා සහිත',
  'සුඛ ඒකාග්‍රතා සහිත',
  'උපේක්ෂා ඒකාග්‍රතා සහිත',
];
const MAHAGGATA_JATI: [Jati, string][] = [
  ['kusala', 'කුසල සිත'],
  ['vipaka', 'විපාක සිත'],
  ['kiriya', 'ක්‍රියා සිත'],
];
for (const [jati, suffix] of MAHAGGATA_JATI)
  for (const j of [1, 2, 3, 4, 5] as const) {
    drafts.push({
      nameSi: `${JHANA_FACTORS[j - 1]} ${JHANA_ORDINAL[j - 1]} ධ්‍යාන ${suffix}`,
      short: `${JHANA_ORDINAL[j - 1]} ධ්‍යාන`,
      group: `rupa-${jati}` as GroupId,
      sphere: 'rupavacara',
      jati,
      vedana: j <= 4 ? 'somanassa' : 'upekkha',
      hetu: 'tihetuka',
      sankharika: null,
      sampayutta: 'nana',
      jhana: j,
    });
  }

// 70–81 අරූපාවචර
const ARUPA: [string, string][] = [
  ['ආකාසානඤ්චායතන', 'ආකාසානඤ්චා.'],
  ['විඤ්ඤාණඤ්චායතන', 'විඤ්ඤාණඤ්චා.'],
  ['ආකිඤ්චඤ්ඤායතන', 'ආකිඤ්චඤ්ඤා.'],
  ['නේවසඤ්ඤානාසඤ්ඤායතන', 'නේවසඤ්ඤා.'],
];
for (const [jati, suffix] of MAHAGGATA_JATI)
  for (const [name, short] of ARUPA)
    drafts.push({
      nameSi: `${name} ${suffix}`,
      short,
      group: `arupa-${jati}` as GroupId,
      sphere: 'arupavacara',
      jati,
      vedana: 'upekkha',
      hetu: 'tihetuka',
      sankharika: null,
      sampayutta: 'nana',
      jhana: 5,
    });

// 82–89 ලෝකෝත්තර (89 scheme: counted as first jhāna)
const ARIYA = ['සෝතාපත්ති', 'සකදාගාමී', 'අනාගාමී', 'අර්හත්'];
for (const [group, jati, word] of [
  ['magga', 'kusala', 'මාර්ග'],
  ['phala', 'vipaka', 'ඵල'],
] as const)
  for (const a of ARIYA)
    drafts.push({
      nameSi: `${a} ${word} සිත`,
      short: `${a} ${word}`,
      group,
      sphere: 'lokuttara',
      jati,
      vedana: 'somanassa',
      hetu: 'tihetuka',
      sankharika: null,
      sampayutta: 'nana',
      jhana: 1,
    });

export const CITTAS: Citta[] = drafts.map((d, i) => ({ id: i + 1, ...d }));
export const cittaById = new Map<number, Citta>(CITTAS.map((c) => [c.id, c]));

/** Sinhala labels for `Jati`, used in the profile header's tag pills (e.g. "ලෝභමූල සිත් · අකුසල"). */
export const JATI_LABELS: Record<Jati, string> = {
  akusala: 'අකුසල',
  kusala: 'කුසල',
  vipaka: 'විපාක',
  kiriya: 'ක්‍රියා',
};

/** Sinhala labels for `Vedana` (without the "සහගත" suffix baked into `nameSi`). */
export const VEDANA_LABELS: Record<Vedana, string> = {
  somanassa: 'සෝමනස්ස',
  domanassa: 'දෝමනස්ස',
  upekkha: 'උපේක්ෂා',
  sukha: 'සුඛ',
  dukkha: 'දුක්ඛ',
};
