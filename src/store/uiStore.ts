import { create } from 'zustand';
import { uid } from '@/utils/id';

export type LeftTab = 'components' | 'layers' | 'pages' | 'assets' | 'theme';
export type DialogId = 'settings' | 'seo' | 'navigation' | 'publish' | null;

export interface Toast {
  id: string;
  message: string;
  tone: 'info' | 'success' | 'error';
}

interface UiState {
  leftTab: LeftTab;
  inspectorTab: 'content' | 'design';
  dialog: DialogId;
  leftCollapsed: boolean;
  rightCollapsed: boolean;
  toasts: Toast[];
  contextMenu: { x: number; y: number; nodeId: string } | null;

  setLeftTab: (tab: LeftTab) => void;
  setInspectorTab: (tab: 'content' | 'design') => void;
  openDialog: (dialog: DialogId) => void;
  toggleLeft: () => void;
  toggleRight: () => void;
  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
  openContextMenu: (x: number, y: number, nodeId: string) => void;
  closeContextMenu: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  leftTab: 'components',
  inspectorTab: 'content',
  dialog: null,
  leftCollapsed: false,
  rightCollapsed: false,
  toasts: [],
  contextMenu: null,

  setLeftTab: (leftTab) => set({ leftTab, leftCollapsed: false }),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
  openDialog: (dialog) => set({ dialog }),
  toggleLeft: () => set((state) => ({ leftCollapsed: !state.leftCollapsed })),
  toggleRight: () => set((state) => ({ rightCollapsed: !state.rightCollapsed })),

  toast: (message, tone = 'info') => {
    const id = uid('t');
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    setTimeout(() => get().dismissToast(id), tone === 'error' ? 6000 : 3200);
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),

  openContextMenu: (x, y, nodeId) => set({ contextMenu: { x, y, nodeId } }),
  closeContextMenu: () => set({ contextMenu: null }),
}));
