import type { Band, Category } from '@/data';

/** Tile/badge background per citta category. Literal class names so Tailwind picks them up. */
export const CATEGORY_CLASSES: Record<Category, string> = {
  akusala: 'bg-akusala text-white',
  ahetuka: 'bg-ahetuka text-black',
  'kama-sobhana': 'bg-kama-sobhana text-white',
  rupa: 'bg-rupa text-white',
  arupa: 'bg-arupa text-white',
  lokuttara: 'bg-lokuttara text-black',
};

/** CSS variable suffix (`--color-<tone>`) for inline styles (React Flow nodes). */
export const CATEGORY_TONE: Record<Category, string> = {
  akusala: 'akusala',
  ahetuka: 'ahetuka',
  'kama-sobhana': 'kama-sobhana',
  rupa: 'rupa',
  arupa: 'arupa',
  lokuttara: 'lokuttara',
};

export const BAND_HEADER_CLASSES: Record<Band, string> = {
  annasamana: 'bg-band-annasamana text-white',
  akusala: 'bg-band-akusala text-white',
  sobhana: 'bg-band-sobhana text-black',
};

export type ChipTone = Band | 'neutral';
export type ChipState = 'selected' | 'niyata' | 'aniyata' | 'on' | 'off';

const SOLID: Record<ChipTone, string> = {
  annasamana: 'bg-band-annasamana border-band-annasamana text-white',
  akusala: 'bg-band-akusala border-band-akusala text-white',
  sobhana: 'bg-band-sobhana border-band-sobhana text-black',
  neutral: 'bg-fg border-fg text-bg',
};
const OUTLINE: Record<ChipTone, string> = {
  annasamana: 'border-band-annasamana bg-transparent',
  akusala: 'border-band-akusala bg-transparent',
  sobhana: 'border-band-sobhana bg-transparent',
  neutral: 'border-fg bg-transparent',
};

export function chipToneClass(tone: ChipTone, state: ChipState): string {
  switch (state) {
    case 'selected':
      return `${SOLID[tone]} ring-4 ring-fg ring-offset-2 ring-offset-bg`;
    case 'niyata':
    case 'on':
      return SOLID[tone];
    case 'aniyata':
      return OUTLINE[tone];
    default:
      return 'border-line text-muted bg-transparent';
  }
}
