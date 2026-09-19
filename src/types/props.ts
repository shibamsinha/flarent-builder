/** Shared prop value shapes used across components. */

export type LinkKind = 'none' | 'page' | 'url' | 'anchor' | 'email' | 'phone';

export interface LinkValue {
  kind: LinkKind;
  /** Page id when kind === 'page'. */
  pageId?: string;
  /** Absolute URL when kind === 'url'. */
  url?: string;
  /** Element id when kind === 'anchor'. */
  anchor?: string;
  /** Address / number for email & phone. */
  value?: string;
  newTab?: boolean;
}

export const EMPTY_LINK: LinkValue = { kind: 'none' };

/** Reference to a managed asset (`asset:<id>`) or a plain external URL. */
export type ImageRef = string;

export const ASSET_PROTOCOL = 'asset:';

export function isAssetRef(ref: string | undefined): boolean {
  return typeof ref === 'string' && ref.startsWith(ASSET_PROTOCOL);
}

export function assetRefId(ref: string): string {
  return ref.slice(ASSET_PROTOCOL.length);
}

export function toAssetRef(id: string): string {
  return `${ASSET_PROTOCOL}${id}`;
}

export interface ListItem {
  id: string;
  [key: string]: unknown;
}
