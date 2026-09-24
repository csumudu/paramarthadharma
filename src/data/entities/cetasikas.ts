import type { Band, Cetasika, CetasikaSubgroup } from '../types';

const NAMES = [
  'ඵස්ස', 'වේදනා', 'සඤ්ඤා', 'චේතනා', 'ඒකග්ගතා', 'ජීවිතින්ද්‍රිය', 'මනසිකාර',
  'විතක්ක', 'විචාර', 'අධිමොක්ඛ', 'විරිය', 'පීති', 'ඡන්ද',
  'මෝහ', 'අහිරික', 'අනොත්තප්ප', 'උද්ධච්ච',
  'ලෝභ', 'දිට්ඨි', 'මාන',
  'දෝස', 'ඉස්සා', 'මච්ඡරිය', 'කුක්කුච්ච',
  'ථීන', 'මිද්ධ',
  'විචිකිච්ඡා',
  'සද්ධා', 'සති', 'හිරි', 'ඔත්තප්ප', 'අලෝභ', 'අදෝස', 'තත්‍රමජ්ඣත්තතා',
  'කායපස්සද්ධි', 'චිත්තපස්සද්ධි', 'කායලහුතා', 'චිත්තලහුතා', 'කායමුදුතා', 'චිත්තමුදුතා',
  'කායකම්මඤ්ඤතා', 'චිත්තකම්මඤ්ඤතා', 'කායපාගුඤ්ඤතා', 'චිත්තපාගුඤ්ඤතා', 'කායුජ්ජුකතා', 'චිත්තුජ්ජුකතා',
  'සම්මාවාචා', 'සම්මාකම්මන්ත', 'සම්මාආජීව',
  'කරුණා', 'මුදිතා',
  'පඤ්ඤින්ද්‍රිය',
];

const SUBGROUP_RANGES: [CetasikaSubgroup, number, number][] = [
  ['sabbacitta', 1, 7],
  ['pakinnaka', 8, 13],
  ['moha-catuka', 14, 17],
  ['lobha-tika', 18, 20],
  ['dosa-catuka', 21, 24],
  ['thina-duka', 25, 26],
  ['vicikiccha', 27, 27],
  ['sobhana-sadharana', 28, 46],
  ['virati', 47, 49],
  ['appamanna', 50, 51],
  ['panna', 52, 52],
];

export const BAND_LABELS: Record<Band, string> = {
  annasamana: 'අඤ්ඤසමාන',
  akusala: 'අකුසල',
  sobhana: 'සෝභන',
};

export const SUBGROUP_LABELS: Record<CetasikaSubgroup, string> = {
  sabbacitta: 'සබ්බචිත්ත සාධාරණ',
  pakinnaka: 'පකිණ්ණක',
  'moha-catuka': 'මෝහ චතුෂ්කය',
  'lobha-tika': 'ලෝභ ත්‍රිකය',
  'dosa-catuka': 'ද්වේෂ චතුෂ්කය',
  'thina-duka': 'ථීන ද්වය',
  vicikiccha: 'විචිකිච්ඡා',
  'sobhana-sadharana': 'සෝභන සාධාරණ',
  virati: 'විරති',
  appamanna: 'අප්පමඤ්ඤා',
  panna: 'පඤ්ඤා',
};

export const CETASIKAS: Cetasika[] = NAMES.map((nameSi, i) => {
  const id = i + 1;
  const [subgroup] = SUBGROUP_RANGES.find(([, from, to]) => id >= from && id <= to)!;
  const band: Band = id <= 13 ? 'annasamana' : id <= 27 ? 'akusala' : 'sobhana';
  return { id, nameSi, band, subgroup };
});

export const cetasikaById = new Map<number, Cetasika>(CETASIKAS.map((c) => [c.id, c]));
