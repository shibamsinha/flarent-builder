import { describe, expect, it } from 'vitest';
import { DEFAULT_THEME } from '@/engine/schema/defaults';
import { RUNTIME_CSS } from '@/engine/renderer/runtimeStyles';
import { familyName, googleFontsHref, readableOn, themeToCssText, themeToCssVars } from './index';

describe('theme tokens', () => {
  it('emits every colour, font and radius as a custom property', () => {
    const vars = themeToCssVars(DEFAULT_THEME);
    expect(vars['--fl-color-primary']).toBe('#7217b2');
    expect(vars['--fl-font-heading']).toContain('Plus Jakarta Sans');
    expect(vars['--fl-radius-md']).toBe('14px');
    expect(vars['--fl-container']).toBe('1180px');
  });

  it('wraps the variables in a selector block', () => {
    const css = themeToCssText(DEFAULT_THEME);
    expect(css.startsWith(':root {')).toBe(true);
    expect(css).toContain('--fl-color-surface');
  });

  it('links only the Google fonts the theme actually uses', () => {
    const href = googleFontsHref(DEFAULT_THEME);
    expect(href).toContain('Plus+Jakarta+Sans');
    expect(href).toContain('Inter');
    expect(href).not.toContain('Playfair');
  });

  it('extracts the family name from a stack', () => {
    expect(familyName('"Plus Jakarta Sans", sans-serif')).toBe('Plus Jakarta Sans');
  });
});

describe('readableOn', () => {
  it('uses dark text on light brand colours', () => {
    // A lime primary with white text is the classic unreadable-button bug.
    expect(readableOn('#c8ff4d')).toBe('#14101a');
    expect(readableOn('#ffffff')).toBe('#14101a');
    expect(readableOn('#f6c344')).toBe('#14101a');
  });

  it('uses light text on dark brand colours', () => {
    expect(readableOn('#7217b2')).toBe('#ffffff');
    expect(readableOn('#000000')).toBe('#ffffff');
    expect(readableOn('#b4552d')).toBe('#ffffff');
  });

  it('handles shorthand hex and falls back safely', () => {
    expect(readableOn('#fff')).toBe('#14101a');
    expect(readableOn('var(--something)')).toBe('#ffffff');
    expect(readableOn('')).toBe('#ffffff');
  });

  it('is exposed to components as a custom property', () => {
    const vars = themeToCssVars({
      ...DEFAULT_THEME,
      colors: { ...DEFAULT_THEME.colors, primary: '#c8ff4d' },
    });
    expect(vars['--fl-on-primary']).toBe('#14101a');
  });
});

describe('runtime stylesheet cascade', () => {
  /**
   * Element resets must not out-specify the per-node rules the exporter emits,
   * or a style the user set in the inspector would be dropped on the published
   * site while still showing correctly on the canvas.
   */
  it('keeps element resets at zero added specificity', () => {
    const resets = ['a', 'p', 'ul, ol', 'button', 'img, video, iframe'];
    for (const selector of resets) {
      expect(RUNTIME_CSS).toContain(`.fl-root :where(${selector})`);
    }
    // No bare descendant element resets anywhere in the reset block.
    expect(RUNTIME_CSS).not.toMatch(/^\.fl-root (a|p|button|img) \{/m);
  });

  it('never hardcodes white on a brand background', () => {
    expect(RUNTIME_CSS).toContain('.fl-btn-primary { background: var(--fl-color-primary); color: var(--fl-on-primary);');
    expect(RUNTIME_CSS).toContain('color: var(--fl-on-primary);\n  background: var(--fl-color-primary)');
  });
});
