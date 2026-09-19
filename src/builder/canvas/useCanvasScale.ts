import { useEffect, useState } from 'react';
import type { MutableRefObject } from 'react';

const GUTTER = 48;

/**
 * Scale the page down when the device frame is wider than the space available.
 *
 * Squeezing the frame instead would silently change the layout being designed;
 * zooming keeps the real device width intact and simply shows less of it.
 */
export function useCanvasScale(
  containerRef: MutableRefObject<HTMLElement | null>,
  deviceWidth: number,
): number {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const measure = () => {
      const available = container.clientWidth - GUTTER;
      const next = available > 0 ? Math.min(1, available / deviceWidth) : 1;
      // Round to avoid a re-render storm from sub-pixel resize noise.
      setScale(Math.round(next * 1000) / 1000);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [containerRef, deviceWidth]);

  return scale;
}
