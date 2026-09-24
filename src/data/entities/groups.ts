import type { Category, Group, GroupId, Sphere } from '../types';

export const SPHERES: Sphere[] = ['kamavacara', 'rupavacara', 'arupavacara', 'lokuttara'];

export const SPHERE_LABELS: Record<Sphere, string> = {
  kamavacara: 'කාමාවචර',
  rupavacara: 'රූපාවචර',
  arupavacara: 'අරූපාවචර',
  lokuttara: 'ලෝකෝත්තර',
};

export const CATEGORY_LABELS: Record<Category, string> = {
  akusala: 'අකුසල',
  ahetuka: 'අහේතුක',
  'kama-sobhana': 'කාමාවචර සෝභන',
  rupa: 'රූපාවචර',
  arupa: 'අරූපාවචර',
  lokuttara: 'ලෝකෝත්තර',
};

export const GROUPS: Group[] = [
  { id: 'lobhamula', nameSi: 'ලෝභමූල සිත්', sphere: 'kamavacara', category: 'akusala' },
  { id: 'dosamula', nameSi: 'ද්වේෂමූල සිත්', sphere: 'kamavacara', category: 'akusala' },
  { id: 'mohamula', nameSi: 'මෝහමූල සිත්', sphere: 'kamavacara', category: 'akusala' },
  { id: 'akusala-vipaka', nameSi: 'අකුසල විපාක සිත්', sphere: 'kamavacara', category: 'ahetuka' },
  { id: 'ahetuka-kusala-vipaka', nameSi: 'අහේතුක කුසල විපාක සිත්', sphere: 'kamavacara', category: 'ahetuka' },
  { id: 'ahetuka-kiriya', nameSi: 'අහේතුක ක්‍රියා සිත්', sphere: 'kamavacara', category: 'ahetuka' },
  { id: 'kama-kusala', nameSi: 'කාමාවචර කුසල සිත්', sphere: 'kamavacara', category: 'kama-sobhana' },
  { id: 'kama-vipaka', nameSi: 'කාමාවචර විපාක සිත්', sphere: 'kamavacara', category: 'kama-sobhana' },
  { id: 'kama-kiriya', nameSi: 'කාමාවචර ක්‍රියා සිත්', sphere: 'kamavacara', category: 'kama-sobhana' },
  { id: 'rupa-kusala', nameSi: 'රූපාවචර කුසල සිත්', sphere: 'rupavacara', category: 'rupa' },
  { id: 'rupa-vipaka', nameSi: 'රූපාවචර විපාක සිත්', sphere: 'rupavacara', category: 'rupa' },
  { id: 'rupa-kiriya', nameSi: 'රූපාවචර ක්‍රියා සිත්', sphere: 'rupavacara', category: 'rupa' },
  { id: 'arupa-kusala', nameSi: 'අරූපාවචර කුසල සිත්', sphere: 'arupavacara', category: 'arupa' },
  { id: 'arupa-vipaka', nameSi: 'අරූපාවචර විපාක සිත්', sphere: 'arupavacara', category: 'arupa' },
  { id: 'arupa-kiriya', nameSi: 'අරූපාවචර ක්‍රියා සිත්', sphere: 'arupavacara', category: 'arupa' },
  { id: 'magga', nameSi: 'ලෝකෝත්තර මාර්ග සිත්', sphere: 'lokuttara', category: 'lokuttara' },
  { id: 'phala', nameSi: 'ලෝකෝත්තර ඵල සිත්', sphere: 'lokuttara', category: 'lokuttara' },
];

export const groupById = new Map<GroupId, Group>(GROUPS.map((g) => [g.id, g]));
