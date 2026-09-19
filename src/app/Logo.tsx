import { useState } from 'react';
import { BRAND } from './brand';

interface LogoProps {
  /** Text beside the mark. Defaults to the full product name. */
  label?: string;
  /** Height of the mark in pixels. The image keeps its own aspect ratio. */
  size?: number;
  /** Hide the text and show the mark alone. */
  markOnly?: boolean;
}

/**
 * The Flarent Builder logo lockup.
 *
 * The only component that knows what the logo looks like. If the artwork is
 * missing or fails to load it falls back to the lettermark, so the header is
 * never left with a broken image.
 */
export function Logo({ label, size = 22, markOnly = false }: LogoProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const useImage = Boolean(BRAND.logoSrc) && !imageFailed;
  const text = label ?? BRAND.name;
  // A wordmark already carries the name, so printing it again would duplicate it.
  const showText = !markOnly && !(useImage && BRAND.logoIncludesName);

  return (
    <span className="f-logo">
      {useImage ? (
        <img
          className="f-logo-img"
          src={BRAND.logoSrc}
          alt={BRAND.logoIncludesName ? text : ''}
          aria-hidden={BRAND.logoIncludesName ? undefined : true}
          style={{ height: size }}
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="f-logo-mark" style={{ width: size, height: size }}>
          {BRAND.fallbackInitial}
        </span>
      )}
      {showText ? text : null}
    </span>
  );
}
