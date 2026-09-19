import type { CSSProperties, MouseEvent } from 'react';
import type { RenderEnv, StyleGroupId } from '@/engine/registry/types';
import type { LinkValue } from '@/types/props';
import { uid } from '@/utils/id';
import { getIcon } from './icons';

/* ----------------------------- links ---------------------------------- */

export interface AnchorAttrs {
  href?: string;
  target?: string;
  rel?: string;
  onClick?: (event: MouseEvent) => void;
}

/**
 * Build anchor attributes for the current environment. Internal page links
 * navigate in-app during preview and become real paths on export.
 */
export function anchorAttrs(env: RenderEnv, link: LinkValue | undefined): AnchorAttrs {
  const href = env.resolveHref(link);
  if (!href) return {};
  const attrs: AnchorAttrs = { href };
  if (link?.newTab) {
    attrs.target = '_blank';
    attrs.rel = 'noopener noreferrer';
  }
  if (env.mode === 'preview' && link?.kind === 'page' && link.pageId && env.navigate) {
    const pageId = link.pageId;
    attrs.onClick = (event: MouseEvent) => {
      if (link.newTab) return;
      event.preventDefault();
      env.navigate?.(pageId);
    };
  }
  if (env.mode === 'editor') {
    attrs.onClick = (event: MouseEvent) => event.preventDefault();
  }
  return attrs;
}

/* ----------------------------- icons ---------------------------------- */

export function IconGlyph({
  name,
  size = 24,
  color,
  strokeWidth = 2,
  style,
}: {
  name?: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
}) {
  const Glyph = getIcon(name);
  return (
    <Glyph size={size} color={color} strokeWidth={strokeWidth} style={style} aria-hidden="true" />
  );
}

/* --------------------------- style presets ----------------------------- */

export const STYLE_GROUPS: Record<string, StyleGroupId[]> = {
  full: ['layout', 'size', 'spacing', 'typography', 'background', 'border', 'effects'],
  box: ['layout', 'size', 'spacing', 'background', 'border', 'effects'],
  text: ['size', 'spacing', 'typography', 'effects'],
  media: ['size', 'spacing', 'border', 'effects'],
  minimal: ['size', 'spacing', 'effects'],
};

/* ------------------------- prop value helpers -------------------------- */

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function list<T extends { id: string }>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function link(value: unknown): LinkValue {
  if (value && typeof value === 'object' && 'kind' in (value as object)) return value as LinkValue;
  return { kind: 'none' };
}

export function itemId(): string {
  return uid('i');
}

/** A neutral inline SVG placeholder so image slots never render broken. */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect width='800' height='600' fill='%23ece7f4'/%3E%3Cpath d='M300 380l70-90 55 70 40-45 65 85z' fill='%23bcaed4'/%3E%3Ccircle cx='330' cy='250' r='32' fill='%23bcaed4'/%3E%3C/svg%3E";
