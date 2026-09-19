import { useCallback, useEffect, useState } from 'react';

export interface LocalRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Measure node elements relative to the overlay container.
 *
 * Selection chrome is drawn as an overlay rather than injected into the page,
 * so hovering a node never re-renders it. That keeps the canvas smooth on
 * pages with hundreds of elements.
 */
export function useOverlayRects(
  ids: (string | null | undefined)[],
  pageRoot: HTMLElement | null,
  overlayRoot: HTMLElement | null,
  version: unknown,
  /** Canvas zoom. Client rects come back zoomed; overlay boxes are laid out
   *  inside the zoomed frame, so measurements divide it back out. */
  scale = 1,
): Record<string, LocalRect | null> {
  const [rects, setRects] = useState<Record<string, LocalRect | null>>({});
  const key = ids.filter(Boolean).join('|');

  const measure = useCallback(() => {
    if (!pageRoot || !overlayRoot) return;
    const base = overlayRoot.getBoundingClientRect();
    const next: Record<string, LocalRect | null> = {};
    for (const id of ids) {
      if (!id) continue;
      const element = pageRoot.querySelector<HTMLElement>(`[data-fl-id="${CSS.escape(id)}"]`);
      if (!element) {
        next[id] = null;
        continue;
      }
      const rect = element.getBoundingClientRect();
      next[id] = {
        x: (rect.left - base.left) / scale,
        y: (rect.top - base.top) / scale,
        width: rect.width / scale,
        height: rect.height / scale,
      };
    }
    setRects((previous) => (shallowEqual(previous, next) ? previous : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, pageRoot, overlayRoot, scale]);

  useEffect(() => {
    const frame = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(frame);
  }, [measure, version]);

  useEffect(() => {
    if (!pageRoot) return;
    const onChange = () => measure();
    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);
    const observer = new ResizeObserver(onChange);
    observer.observe(pageRoot);
    return () => {
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
      observer.disconnect();
    };
  }, [measure, pageRoot]);

  return rects;
}

function shallowEqual(
  a: Record<string, LocalRect | null>,
  b: Record<string, LocalRect | null>,
): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const left = a[key];
    const right = b[key];
    if (left === right) continue;
    if (!left || !right) return false;
    if (
      left.x !== right.x ||
      left.y !== right.y ||
      left.width !== right.width ||
      left.height !== right.height
    ) {
      return false;
    }
  }
  return true;
}
