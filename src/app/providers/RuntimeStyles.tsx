import { useEffect } from 'react';
import { RUNTIME_CSS } from '@/engine/renderer/runtimeStyles';

const STYLE_ID = 'flarent-runtime-css';

/**
 * Injects the published site's stylesheet into the editor document so the
 * canvas renders with exactly the CSS the exported site will ship.
 */
export function RuntimeStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = RUNTIME_CSS;
    document.head.appendChild(style);
  }, []);
  return null;
}
