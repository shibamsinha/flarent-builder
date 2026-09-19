/** Short, collision-resistant ids. Stable across environments (no crypto dep required). */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function uid(prefix = ''): string {
  let out = '';
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(10);
    cryptoObj.getRandomValues(bytes);
    for (const b of bytes) out += ALPHABET[b % ALPHABET.length];
  } else {
    for (let i = 0; i < 10; i += 1) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return prefix ? `${prefix}_${out}` : out;
}

export const nodeId = () => uid('n');
export const pageId = () => uid('p');
export const projectId = () => uid('prj');
export const assetId = () => uid('a');
