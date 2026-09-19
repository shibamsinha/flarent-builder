import { createContext, useContext } from 'react';
import type { RenderEnv } from '@/engine/registry/types';

export const RenderEnvContext = createContext<RenderEnv | null>(null);

export function useRenderEnv(): RenderEnv {
  const env = useContext(RenderEnvContext);
  if (!env) throw new Error('useRenderEnv must be used inside a RenderEnvContext provider');
  return env;
}

/**
 * Editor-only capabilities handed to the renderer. Preview and export leave
 * this null, which is what keeps a single renderer honest: components behave
 * identically, they simply have no editing affordances.
 */
export interface EditorRuntime {
  editingNodeId: string | null;
  commitText: (nodeId: string, propKey: string, value: string) => void;
  endEdit: () => void;
}

export const EditorRuntimeContext = createContext<EditorRuntime | null>(null);

export function useEditorRuntime(): EditorRuntime | null {
  return useContext(EditorRuntimeContext);
}
