import type { BuilderNode, ResponsiveStyles } from '@/types/project';
import { createNode } from './registry';

export function mergeResponsive(
  base: ResponsiveStyles | undefined,
  patch: ResponsiveStyles | undefined,
): ResponsiveStyles {
  const out: ResponsiveStyles = { ...(base ?? {}) };
  for (const [device, styles] of Object.entries(patch ?? {}) as [
    keyof ResponsiveStyles,
    ResponsiveStyles[keyof ResponsiveStyles],
  ][]) {
    out[device] = { ...(out[device] ?? {}), ...(styles ?? {}) };
  }
  return out;
}

/**
 * Build a node from the registry with style overrides merged on top of the
 * component defaults. Used by default subtrees and by every template, so a
 * template is nothing more than real components with real props.
 */
export function n(
  type: string,
  props?: Record<string, unknown>,
  styles?: ResponsiveStyles,
  children?: BuilderNode[],
): BuilderNode {
  const node = createNode(type, props ? { props } : {});
  if (styles) node.styles = mergeResponsive(node.styles, styles);
  if (children) node.children = children;
  return node;
}
