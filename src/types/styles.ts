/**
 * The subset of CSS Flarent Builder can express.
 *
 * Keeping this a closed union (rather than `Record<string, string>`) means the
 * inspector, the renderer and the static exporter always agree on what a style
 * value can be, and unknown keys cannot leak into exported CSS.
 */

export const STYLE_KEYS = [
  // Layout / box
  'display',
  'flexDirection',
  'flexWrap',
  'justifyContent',
  'alignItems',
  'alignSelf',
  'gap',
  'gridTemplateColumns',
  'gridAutoRows',
  'width',
  'height',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'marginLeft',
  'position',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'overflow',
  'flexGrow',
  'flexShrink',
  'aspectRatio',
  'objectFit',
  'objectPosition',
  // Typography
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'textTransform',
  'textDecoration',
  'color',
  // Background
  'backgroundColor',
  'backgroundImage',
  'backgroundSize',
  'backgroundPosition',
  'backgroundRepeat',
  // Border
  'borderStyle',
  'borderWidth',
  'borderColor',
  'borderRadius',
  // Effects
  'opacity',
  'boxShadow',
  'transform',
  'filter',
  'transition',
  'cursor',
] as const;

export type StyleKey = (typeof STYLE_KEYS)[number];

export type StyleValue = string | number;

export type StyleMap = Partial<Record<StyleKey, StyleValue>>;

const STYLE_KEY_SET = new Set<string>(STYLE_KEYS);

export function isStyleKey(key: string): key is StyleKey {
  return STYLE_KEY_SET.has(key);
}

/** Style keys whose numeric values are unitless. Everything else gets `px`. */
const UNITLESS = new Set<StyleKey>([
  'opacity',
  'zIndex',
  'fontWeight',
  'lineHeight',
  'flexGrow',
  'flexShrink',
  'aspectRatio',
]);

/** Normalise a stored value into a CSS value string. */
export function toCssValue(key: StyleKey, value: StyleValue): string {
  if (typeof value === 'number') {
    return UNITLESS.has(key) ? String(value) : `${value}px`;
  }
  return value;
}

const KEBAB = /[A-Z]/g;

export function toCssProperty(key: StyleKey): string {
  return key.replace(KEBAB, (m) => `-${m.toLowerCase()}`);
}

/** Convert a StyleMap into a CSS declaration block body (no braces). */
export function styleMapToCssText(styles: StyleMap, indent = '  '): string {
  const lines: string[] = [];
  for (const key of STYLE_KEYS) {
    const value = styles[key];
    if (value === undefined || value === '') continue;
    lines.push(`${indent}${toCssProperty(key)}: ${toCssValue(key, value)};`);
  }
  return lines.join('\n');
}

/** Convert a StyleMap into a React inline-style object. */
export function styleMapToReactStyle(styles: StyleMap): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of STYLE_KEYS) {
    const value = styles[key];
    if (value === undefined || value === '') continue;
    out[key] = toCssValue(key, value);
  }
  return out;
}
