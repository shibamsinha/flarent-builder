/** Small colour helpers used when a chosen brand colour has to drive artwork. */

function parseHex(color: string): [number, number, number] | null {
  const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color.trim());
  if (!match) return null;
  let hex = match[1];
  if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
  return [
    parseInt(hex.slice(0, 2), 16),
    parseInt(hex.slice(2, 4), 16),
    parseInt(hex.slice(4, 6), 16),
  ];
}

function toHex(rgb: [number, number, number]): string {
  return `#${rgb.map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('')}`;
}

/** Move a colour towards white. `amount` is 0 to 1. */
export function lighten(color: string, amount: number): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  return toHex(rgb.map((v) => v + (255 - v) * amount) as [number, number, number]);
}

/** Move a colour towards black. `amount` is 0 to 1. */
export function darken(color: string, amount: number): string {
  const rgb = parseHex(color);
  if (!rgb) return color;
  return toHex(rgb.map((v) => v * (1 - amount)) as [number, number, number]);
}
