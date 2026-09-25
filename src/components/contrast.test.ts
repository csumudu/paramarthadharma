import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  ACCENT_FILL_CLASS,
  BAND_HEADER_CLASSES,
  CATEGORY_CLASSES,
  FILTER_BANNER_CLASS,
  TAG_PILL_CLASS,
  chipToneClass,
} from './colors';

/**
 * Guards WCAG contrast (≥ 4.5:1) for every fill/text pair `CATEGORY_CLASSES` and
 * `BAND_HEADER_CLASSES` produce, in both themes — parsed straight from the `--color-*` tokens in
 * globals.css, so a token edit that regresses contrast fails here instead of only on inspection.
 */

function hexToRgb(hex: string): [number, number, number] {
  return [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
}

function linear(channel: number): number {
  const c = channel / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const lA = relativeLuminance(hexA);
  const lB = relativeLuminance(hexB);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Pulls `--color-<name>: #hex;` declarations out of a `{ ... }` CSS block's body. */
function parseColorTokens(blockBody: string): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const m of blockBody.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)) {
    tokens[m[1]] = m[2].toLowerCase();
  }
  return tokens;
}

/**
 * Body of the top-level rule whose selector starts a line and is followed by `{` — so a mention of
 * the selector elsewhere (e.g. inside `@custom-variant dark (...)`) is not mistaken for the rule.
 */
function extractBlock(css: string, selector: string): string {
  const start = css.split('\n').findIndex((line) => line.startsWith(`${selector} {`));
  if (start === -1) throw new Error(`Rule not found in globals.css: ${selector} { ... }`);
  const rest = css.split('\n').slice(start).join('\n');
  return rest.slice(rest.indexOf('{') + 1, rest.indexOf('}'));
}

const css = readFileSync(join(__dirname, '../app/globals.css'), 'utf8');
const lightTokens = parseColorTokens(extractBlock(css, '@theme'));
const darkOverrides = parseColorTokens(extractBlock(css, '[data-theme="dark"]'));
const darkTokens = { ...lightTokens, ...darkOverrides };

/** `bg-x text-y` where y is a colour token or white/black. */
function textColour(token: string, tokens: Record<string, string>): string {
  if (token === 'white') return WHITE;
  if (token === 'black') return BLACK;
  const hex = tokens[token];
  if (!hex) throw new Error(`no token for --color-${token}`);
  return hex;
}

const WHITE = '#ffffff';
const BLACK = '#000000';

/** `"bg-akusala text-white"` -> { token: "akusala", text: "white" }. */
function parseFillTextPair(classString: string): { token: string; text: string } {
  const bgMatch = classString.match(/\bbg-([a-z0-9-]+)\b/);
  if (!bgMatch) throw new Error(`No bg-* class found in "${classString}"`);
  const textMatch = classString.match(/\btext-([a-z0-9-]+)\b/);
  if (!textMatch) throw new Error(`No text-* class found in "${classString}"`);
  return { token: bgMatch[1], text: textMatch[1] };
}

describe('fill/text contrast (WCAG ≥ 4.5:1)', () => {
  const cases = [
    ...Object.entries(CATEGORY_CLASSES).map(([name, cls]) => [`category:${name}`, cls] as const),
    ...Object.entries(BAND_HEADER_CLASSES).map(([name, cls]) => [`band:${name}`, cls] as const),
    ...(['annasamana', 'akusala', 'sobhana', 'neutral'] as const).flatMap((tone) =>
      (['selected', 'niyata'] as const).map((state) => [`chip:${tone}:${state}`, chipToneClass(tone, state)] as const),
    ),
    // D2: profile-header tag pills, the filter banner and vīthi step-card / count-ring accent fill.
    ['tagPill', TAG_PILL_CLASS] as const,
    ['filterBanner', FILTER_BANNER_CLASS] as const,
    ['accentFill', ACCENT_FILL_CLASS] as const,
  ];

  it('reads the real dark block, not the light tokens', () => {
    expect(darkOverrides.bg).toBeDefined();
    expect(darkOverrides.bg).not.toBe(lightTokens.bg);
  });

  it.each(cases)('%s meets 4.5:1 in the light theme', (_label, cls) => {
    const { token, text } = parseFillTextPair(cls);
    const fill = lightTokens[token];
    expect(fill, `no light token for --color-${token}`).toBeDefined();
    expect(contrastRatio(fill, textColour(text, lightTokens))).toBeGreaterThanOrEqual(4.5);
  });

  it.each(cases)('%s meets 4.5:1 in the dark theme', (_label, cls) => {
    const { token, text } = parseFillTextPair(cls);
    const fill = darkTokens[token];
    expect(fill, `no dark token for --color-${token}`).toBeDefined();
    expect(contrastRatio(fill, textColour(text, darkTokens))).toBeGreaterThanOrEqual(4.5);
  });
});
