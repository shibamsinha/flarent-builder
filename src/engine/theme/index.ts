import type { ThemeConfig } from '@/types/project';

/**
 * Theme tokens are emitted as CSS custom properties so a token change
 * propagates everywhere at once — canvas, preview and exported site — without
 * touching a single node.
 *
 * Style values reference them as `var(--fl-color-primary)`.
 */
export const THEME_VAR_PREFIX = '--fl-';

export interface ThemeToken {
  /** e.g. `--fl-color-primary` */
  cssVar: string;
  /** e.g. `var(--fl-color-primary)` — what gets stored in a StyleMap. */
  reference: string;
  label: string;
  group: 'color' | 'font' | 'radius' | 'layout';
}

export function colorTokens(theme: ThemeConfig): (ThemeToken & { value: string })[] {
  return (Object.keys(theme.colors) as (keyof ThemeConfig['colors'])[]).map((key) => ({
    cssVar: `${THEME_VAR_PREFIX}color-${key}`,
    reference: `var(${THEME_VAR_PREFIX}color-${key})`,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    group: 'color' as const,
    value: theme.colors[key],
  }));
}

/**
 * Pick black or white text for a background colour.
 *
 * Buttons and badges cannot hardcode white: a theme with a light primary (a
 * lime, a yellow) would render unreadable text. Deriving the foreground from
 * the token keeps every palette legible without the user thinking about it.
 */
export function readableOn(color: string): string {
  const rgb = parseHex(color);
  if (!rgb) return '#ffffff';
  // WCAG relative luminance.
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance =
    0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  // Contrast against white vs against near-black; pick the better one.
  const onWhite = 1.05 / (luminance + 0.05);
  const onBlack = (luminance + 0.05) / 0.05;
  return onBlack >= onWhite ? '#14101a' : '#ffffff';
}

function parseHex(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

export function themeToCssVars(theme: ThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors)) {
    vars[`${THEME_VAR_PREFIX}color-${key}`] = value;
  }
  // Foreground colours that stay legible on the brand tokens.
  for (const key of ['primary', 'secondary', 'accent'] as const) {
    vars[`${THEME_VAR_PREFIX}on-${key}`] = readableOn(theme.colors[key]);
  }
  vars[`${THEME_VAR_PREFIX}font-heading`] = theme.typography.headingFont;
  vars[`${THEME_VAR_PREFIX}font-body`] = theme.typography.bodyFont;
  vars[`${THEME_VAR_PREFIX}font-size-base`] = `${theme.typography.baseSize}px`;
  for (const [key, value] of Object.entries(theme.radius)) {
    vars[`${THEME_VAR_PREFIX}radius-${key}`] = `${value}px`;
  }
  vars[`${THEME_VAR_PREFIX}container`] = `${theme.containerWidth}px`;
  return vars;
}

export function themeToCssText(theme: ThemeConfig, selector = ':root'): string {
  const vars = themeToCssVars(theme);
  const body = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
  return `${selector} {\n${body}\n}`;
}

/** Fonts referenced by the theme that need a webfont link in exported HTML. */
export const GOOGLE_FONTS: Record<string, string> = {
  Inter: 'Inter:wght@400;500;600;700;800',
  Manrope: 'Manrope:wght@400;500;600;700;800',
  'Plus Jakarta Sans': 'Plus+Jakarta+Sans:wght@400;500;600;700;800',
  Poppins: 'Poppins:wght@400;500;600;700;800',
  'DM Sans': 'DM+Sans:wght@400;500;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
  Lora: 'Lora:wght@400;500;600;700',
  'Space Grotesk': 'Space+Grotesk:wght@400;500;600;700',
  Outfit: 'Outfit:wght@400;500;600;700;800',
  'Libre Baskerville': 'Libre+Baskerville:wght@400;700',
};

export const FONT_OPTIONS = Object.keys(GOOGLE_FONTS);

/** Extract the family name from a CSS font stack like `Inter, sans-serif`. */
export function familyName(stack: string): string {
  return (stack.split(',')[0] ?? '').replace(/["']/g, '').trim();
}

export function googleFontsHref(theme: ThemeConfig): string | null {
  const families = new Set<string>();
  for (const stack of [theme.typography.headingFont, theme.typography.bodyFont]) {
    const spec = GOOGLE_FONTS[familyName(stack)];
    if (spec) families.add(spec);
  }
  if (families.size === 0) return null;
  const query = [...families].map((f) => `family=${f}`).join('&');
  return `https://fonts.googleapis.com/css2?${query}&display=swap`;
}
