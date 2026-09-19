import { useCallback, useMemo } from 'react';
import type { BuilderNode } from '@/types/project';
import type { StyleKey, StyleMap, StyleValue } from '@/types/styles';
import { hasOwnOverride, resolveStyles, styleOrigin } from '@/engine/responsive';
import { useEditorStore } from '@/store/editorStore';

/**
 * Reading and writing styles for the breakpoint currently being edited.
 * Values fall back through the inheritance chain so the inspector always shows
 * what the user is actually looking at on the canvas.
 */
export function useNodeStyles(node: BuilderNode | null) {
  const device = useEditorStore((s) => s.device);
  const setNodeStyles = useEditorStore((s) => s.setNodeStyles);
  const clearDeviceStyles = useEditorStore((s) => s.clearDeviceStyles);

  const resolved = useMemo(() => resolveStyles(node?.styles, device), [node?.styles, device]);

  const get = useCallback((key: StyleKey): StyleValue | undefined => resolved[key], [resolved]);

  const getNumber = useCallback(
    (key: StyleKey): number | '' => {
      const value = resolved[key];
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const match = value.match(/^(-?\d+(?:\.\d+)?)/);
        if (match) return Number(match[1]);
      }
      return '';
    },
    [resolved],
  );

  const set = useCallback(
    (key: StyleKey, value: StyleValue | undefined, merge = true) => {
      if (!node) return;
      setNodeStyles(node.id, { [key]: value } as StyleMap, merge ? `style:${node.id}:${key}` : undefined);
    },
    [node, setNodeStyles],
  );

  const setMany = useCallback(
    (patch: StyleMap, mergeKey?: string) => {
      if (!node) return;
      setNodeStyles(node.id, patch, mergeKey);
    },
    [node, setNodeStyles],
  );

  const isOwn = useCallback(
    (key: StyleKey) => hasOwnOverride(node?.styles, device, key),
    [node?.styles, device],
  );

  const origin = useCallback(
    (key: StyleKey) => styleOrigin(node?.styles, device, key).source,
    [node?.styles, device],
  );

  const clearAll = useCallback(() => {
    if (node) clearDeviceStyles(node.id);
  }, [node, clearDeviceStyles]);

  return { device, resolved, get, getNumber, set, setMany, isOwn, origin, clearAll };
}

export type NodeStyles = ReturnType<typeof useNodeStyles>;
