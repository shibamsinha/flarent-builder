/**
 * Flarent Builder's own identity, in one place.
 *
 * Every surface that shows the logo reads from here, so swapping the artwork
 * is a single change rather than an edit in five components that is easy to
 * leave half done.
 *
 * To use your own logo, drop the file at `public/brand/logo.png` and nothing
 * else needs to change. Until that file exists the app falls back to the
 * lettermark, so a missing logo never leaves a broken image on screen.
 */
export interface BrandConfig {
  /** Full product name, used beside the mark and in the document title. */
  name: string;
  /** Shorter form for tight spaces such as the editor top bar. */
  shortName: string;
  /** Served from `public/`, so this path is relative to the site root. */
  logoSrc: string;
  /**
   * Set to true when the artwork already contains the product name. The
   * wordmark then stands alone instead of being printed twice.
   */
  logoIncludesName: boolean;
  /** Drawn in the accent square when the logo file is unavailable. */
  fallbackInitial: string;
}

export const BRAND: BrandConfig = {
  name: 'Flarent Builder',
  shortName: 'Flarent',
  logoSrc: '/brand/logo.png',
  logoIncludesName: false,
  fallbackInitial: 'F',
};

/**
 * Point the browser tab icon at the brand logo, but only once it has loaded.
 *
 * Probing first means a missing or broken file leaves the existing favicon
 * alone rather than replacing it with nothing.
 */
export function applyBrandFavicon(): void {
  if (typeof document === 'undefined' || !BRAND.logoSrc) return;

  const probe = new Image();
  probe.onload = () => {
    const link =
      document.querySelector<HTMLLinkElement>('link[rel="icon"]') ??
      document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }));
    link.type = 'image/png';
    link.href = BRAND.logoSrc;
  };
  probe.src = BRAND.logoSrc;
}
