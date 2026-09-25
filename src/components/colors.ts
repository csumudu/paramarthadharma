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

/** Header tag pills (category / group·jāti / vedanā) on a citta profile — neutral surface-2 tone. */
export const TAG_PILL_CLASS = 'bg-surface-2 text-fg-2';

/** Accent-soft filter banner shown in the profile header while filters are active. */
export const FILTER_BANNER_CLASS = 'bg-accent-soft text-accent-ink';

/**
 * Accent fill + surface text — the vīthi step-card "on" look and the count-ring's accent stroke share
 * this pairing with the chip 'selected' state (same fill/text, already guarded by contrast.test.ts).
 */
export const ACCENT_FILL_CLASS = 'bg-accent text-surface';

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

/** Outline rings marking a review-flagged (non-canonical) PS link, per its status. */
export const REVIEW_OUTLINE_CLASSES: Record<'chart' | 'disputed', string> = {
  chart: 'outline outline-2 outline-dashed outline-muted outline-offset-1',
  disputed: 'outline outline-2 outline-akusala outline-offset-1',
};

/**
 * Vīthi step-card fill: 'on' (the citta performs this kicca) uses the accent fill (matching the
 * profile header's accent emphasis), not the generic ink chip look — per the vīthi-strip artboard.
 */
export function stepCardClass(state: ChipState): string {
  if (state === 'selected') return `${ACCENT_FILL_CLASS} ring-2 ring-accent ring-offset-2 ring-offset-bg`;
  if (state === 'off') return 'border border-dashed border-line bg-bg text-muted';
  return ACCENT_FILL_CLASS;
}
