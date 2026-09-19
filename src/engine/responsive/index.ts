import type { DeviceId, ResponsiveStyles } from '@/types/project';
import type { StyleKey, StyleMap } from '@/types/styles';

export interface DeviceDefinition {
  id: DeviceId;
  label: string;
  /** Canvas width used when simulating this device. */
  canvasWidth: number;
  /** `max-width` used when emitting CSS. `null` for the base breakpoint. */
  mediaMaxWidth: number | null;
}

export const DEVICES: DeviceDefinition[] = [
  { id: 'desktop', label: 'Desktop', canvasWidth: 1440, mediaMaxWidth: null },
  { id: 'tablet', label: 'Tablet', canvasWidth: 834, mediaMaxWidth: 1024 },
  { id: 'mobile', label: 'Mobile', canvasWidth: 390, mediaMaxWidth: 640 },
];

export const DEVICE_ORDER: DeviceId[] = ['desktop', 'tablet', 'mobile'];

export function getDevice(id: DeviceId): DeviceDefinition {
  return DEVICES.find((d) => d.id === id) ?? DEVICES[0];
}

/**
 * The chain of breakpoints a device inherits from, widest first.
 * mobile → [desktop, tablet, mobile]
 */
export function inheritanceChain(device: DeviceId): DeviceId[] {
  const index = DEVICE_ORDER.indexOf(device);
  return DEVICE_ORDER.slice(0, index + 1);
}

/**
 * Flatten responsive styles down to the effective style map for a device.
 * Narrower breakpoints override wider ones; nothing is duplicated in storage.
 */
export function resolveStyles(styles: ResponsiveStyles | undefined, device: DeviceId): StyleMap {
  if (!styles) return {};
  const out: StyleMap = {};
  for (const bp of inheritanceChain(device)) {
    const layer = styles[bp];
    if (!layer) continue;
    Object.assign(out, layer);
  }
  return out;
}

/**
 * Where a given style value comes from for a device: the device itself, an
 * inherited breakpoint, or nowhere. Drives the "overridden / inherited" badge
 * in the inspector.
 */
export function styleOrigin(
  styles: ResponsiveStyles | undefined,
  device: DeviceId,
  key: StyleKey,
): { source: DeviceId | null; value: StyleMap[StyleKey] } {
  if (!styles) return { source: null, value: undefined };
  const chain = inheritanceChain(device);
  for (let i = chain.length - 1; i >= 0; i -= 1) {
    const bp = chain[i];
    const value = styles[bp]?.[key];
    if (value !== undefined) return { source: bp, value };
  }
  return { source: null, value: undefined };
}

/** True when the device declares its own value for `key`. */
export function hasOwnOverride(
  styles: ResponsiveStyles | undefined,
  device: DeviceId,
  key: StyleKey,
): boolean {
  return styles?.[device]?.[key] !== undefined;
}

/** Merge a patch into one breakpoint layer, dropping keys set to `undefined`. */
export function mergeBreakpointStyles(
  styles: ResponsiveStyles | undefined,
  device: DeviceId,
  patch: StyleMap,
): ResponsiveStyles {
  const next: ResponsiveStyles = { ...(styles ?? {}) };
  const layer: StyleMap = { ...(next[device] ?? {}) };
  for (const [key, value] of Object.entries(patch) as [StyleKey, StyleMap[StyleKey]][]) {
    if (value === undefined) delete layer[key];
    else layer[key] = value;
  }
  if (Object.keys(layer).length === 0) delete next[device];
  else next[device] = layer;
  return next;
}
