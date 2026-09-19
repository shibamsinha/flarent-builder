import { describe, expect, it } from 'vitest';
import type { ResponsiveStyles } from '@/types/project';
import {
  hasOwnOverride, inheritanceChain, mergeBreakpointStyles, resolveStyles, styleOrigin,
} from './index';

const styles: ResponsiveStyles = {
  desktop: { fontSize: 48, color: 'red', paddingTop: 96 },
  mobile: { fontSize: 32 },
};

describe('breakpoint inheritance', () => {
  it('orders the chain widest first', () => {
    expect(inheritanceChain('desktop')).toEqual(['desktop']);
    expect(inheritanceChain('mobile')).toEqual(['desktop', 'tablet', 'mobile']);
  });

  it('inherits values that a narrower breakpoint does not override', () => {
    expect(resolveStyles(styles, 'tablet')).toEqual({
      fontSize: 48,
      color: 'red',
      paddingTop: 96,
    });
  });

  it('applies narrower overrides on top of inherited values', () => {
    expect(resolveStyles(styles, 'mobile')).toEqual({
      fontSize: 32,
      color: 'red',
      paddingTop: 96,
    });
  });

  it('reports where a value came from', () => {
    expect(styleOrigin(styles, 'mobile', 'fontSize').source).toBe('mobile');
    expect(styleOrigin(styles, 'mobile', 'color').source).toBe('desktop');
    expect(styleOrigin(styles, 'mobile', 'borderWidth').source).toBeNull();
  });

  it('distinguishes an own override from an inherited value', () => {
    expect(hasOwnOverride(styles, 'mobile', 'fontSize')).toBe(true);
    expect(hasOwnOverride(styles, 'mobile', 'color')).toBe(false);
  });

  it('never duplicates inherited values into another breakpoint', () => {
    const next = mergeBreakpointStyles(styles, 'tablet', { fontSize: 40 });
    expect(next.tablet).toEqual({ fontSize: 40 });
    expect(next.desktop).toEqual(styles.desktop);
  });

  it('removes a key when set to undefined, and drops empty layers', () => {
    const cleared = mergeBreakpointStyles(styles, 'mobile', { fontSize: undefined });
    expect(cleared.mobile).toBeUndefined();
    expect(resolveStyles(cleared, 'mobile').fontSize).toBe(48);
  });

  it('does not mutate the input', () => {
    mergeBreakpointStyles(styles, 'desktop', { fontSize: 10 });
    expect(styles.desktop?.fontSize).toBe(48);
  });
});
