import type { Band, Category } from '@/data';

/** Tile/badge background per citta category. Literal class names so Tailwind picks them up. */
export const CATEGORY_CLASSES: Record<Category, string> = {
  akusala: 'bg-akusala text-white',
  ahetuka: 'bg-ahetuka text-black',
  'kama-sobhana': 'bg-kama-sobhana text-white',
  rupa: 'bg-rupa text-white',
  arupa: 'bg-arupa text-white',
  lokuttara: 'bg-lokuttara text-white',
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
  sobhana: 'bg-band-sobhana text-white',
};

export type ChipTone = Band | 'neutral';
export type ChipState = 'selected' | 'niyata' | 'aniyata' | 'on' | 'off';

const SOLID: Record<ChipTone, string> = {
  annasamana: 'bg-band-annasamana border-band-annasamana text-white',
  akusala: 'bg-band-akusala border-band-akusala text-white',
  sobhana: 'bg-band-sobhana border-band-sobhana text-white',
  neutral: 'bg-fg border-fg text-bg',
};
const OUTLINE: Record<ChipTone, string> = {
  annasamana: 'border-dashed border-band-annasamana bg-surface text-band-annasamana',
  akusala: 'border-dashed border-band-akusala bg-surface text-band-akusala',
  sobhana: 'border-dashed border-band-sobhana bg-surface text-band-sobhana',
  neutral: 'border-dashed border-fg bg-surface text-fg',
};

export function chipToneClass(tone: ChipTone, state: ChipState): string {
  switch (state) {
    case 'selected':
      return 'bg-accent border-accent text-surface ring-2 ring-accent ring-offset-2 ring-offset-bg';
    case 'niyata':
    case 'on':
      return SOLID[tone];
    case 'aniyata':
      return OUTLINE[tone];
    default:
      return 'border-line text-faint bg-transparent';
  }
}
