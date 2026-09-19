/**
 * Template artwork is generated as inline SVG data URIs.
 *
 * Templates therefore have no network dependency and no broken-image states:
 * every starting site looks finished offline, and the user replaces the art
 * with their own photography from the asset library.
 */

function encode(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.replace(/\s+/g, ' ').trim())}`;
}

export interface ArtOptions {
  from: string;
  to: string;
  tint?: string;
  width?: number;
  height?: number;
}

/** Soft layered blobs, used for hero and feature imagery. */
export function blobArt({ from, to, tint = '#ffffff', width = 1200, height = 900 }: ArtOptions): string {
  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <circle cx="${width * 0.24}" cy="${height * 0.28}" r="${height * 0.3}" fill="${tint}" opacity="0.13"/>
      <circle cx="${width * 0.78}" cy="${height * 0.72}" r="${height * 0.38}" fill="${tint}" opacity="0.1"/>
      <path d="M0 ${height * 0.78} Q ${width * 0.3} ${height * 0.58} ${width * 0.56} ${height * 0.74}
               T ${width} ${height * 0.66} L ${width} ${height} L 0 ${height} Z"
            fill="${tint}" opacity="0.14"/>
    </svg>`);
}

/** Geometric grid, used for service cards and galleries. */
export function tileArt({ from, to, tint = '#ffffff', width = 900, height = 700 }: ArtOptions): string {
  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <g fill="${tint}" opacity="0.16">
        <rect x="${width * 0.08}" y="${height * 0.14}" width="${width * 0.26}" height="${height * 0.26}" rx="24"/>
        <rect x="${width * 0.42}" y="${height * 0.3}" width="${width * 0.34}" height="${height * 0.34}" rx="30"/>
        <rect x="${width * 0.14}" y="${height * 0.56}" width="${width * 0.2}" height="${height * 0.2}" rx="18"/>
      </g>
      <circle cx="${width * 0.82}" cy="${height * 0.18}" r="${height * 0.09}" fill="${tint}" opacity="0.22"/>
    </svg>`);
}

/** Portrait-friendly diagonal bands, used for people/avatars and tall cards. */
export function bandArt({ from, to, tint = '#ffffff', width = 700, height = 900 }: ArtOptions): string {
  return encode(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)"/>
      <g fill="${tint}" opacity="0.15">
        <path d="M0 ${height * 0.62} L ${width} ${height * 0.34} L ${width} ${height * 0.52} L 0 ${height * 0.8} Z"/>
        <path d="M0 ${height * 0.86} L ${width} ${height * 0.6} L ${width} ${height * 0.72} L 0 ${height} Z"/>
      </g>
      <circle cx="${width * 0.5}" cy="${height * 0.3}" r="${width * 0.2}" fill="${tint}" opacity="0.2"/>
    </svg>`);
}
