import { useEffect } from 'react';
import { useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

/**
 * Editor shortcuts. Everything routes through store actions, so a shortcut and
 * a menu item always perform exactly the same operation.
 */
export function useKeyboardShortcuts(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const store = useEditorStore.getState();
      const ui = useUiStore.getState();
      const mod = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (key === 'escape') {
        if (store.editingNodeId) store.endEdit();
        else if (ui.contextMenu) ui.closeContextMenu();
        else store.select(null);
        return;
      }

      if (isTypingTarget(event.target)) return;

      if (mod && key === 'z') {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (mod && key === 'y') {
        event.preventDefault();
        store.redo();
        return;
      }
      if (mod && key === 's') {
        event.preventDefault();
        void store.saveNow();
        ui.toast('Project saved.', 'success');
        return;
      }
      if (mod && key === 'c' && store.selectedId) {
        event.preventDefault();
        store.copyNode(store.selectedId);
        ui.toast('Copied.');
        return;
      }
      if (mod && key === 'v') {
        event.preventDefault();
        store.pasteClipboard();
        return;
      }
      if (mod && key === 'd' && store.selectedId) {
        event.preventDefault();
        store.duplicateNode(store.selectedId);
        return;
      }
      if ((key === 'delete' || key === 'backspace') && store.selectedId) {
        event.preventDefault();
        store.removeNode(store.selectedId);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
