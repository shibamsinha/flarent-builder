import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ClipboardPaste, Copy, CornerDownRight, EyeOff, Files, Trash2 } from 'lucide-react';
import { nodePath } from '@/engine/commands/tree';
import { useCurrentPage, useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

export function CanvasContextMenu() {
  const menu = useUiStore((s) => s.contextMenu);
  const close = useUiStore((s) => s.closeContextMenu);
  const page = useCurrentPage();
  const store = useEditorStore();

  useEffect(() => {
    if (!menu) return;
    const onClose = () => close();
    window.addEventListener('mousedown', onClose);
    window.addEventListener('blur', onClose);
    return () => {
      window.removeEventListener('mousedown', onClose);
      window.removeEventListener('blur', onClose);
    };
  }, [menu, close]);

  if (!menu || !page) return null;

  const path = nodePath(page.nodes, menu.nodeId);
  const parent = path.length ? path[path.length - 1] : null;

  const run = (action: () => void) => () => {
    action();
    close();
  };

  return createPortal(
    <div
      className="f-menu"
      style={{ left: Math.min(menu.x, window.innerWidth - 210), top: Math.min(menu.y, window.innerHeight - 260) }}
      onMouseDown={(event) => event.stopPropagation()}
    >
      <button onClick={run(() => store.duplicateNode(menu.nodeId))}>
        <Files size={14} /> Duplicate <kbd>{MOD}D</kbd>
      </button>
      <button onClick={run(() => store.copyNode(menu.nodeId))}>
        <Copy size={14} /> Copy <kbd>{MOD}C</kbd>
      </button>
      <button disabled={!store.clipboard} onClick={run(() => store.pasteClipboard())}>
        <ClipboardPaste size={14} /> Paste inside <kbd>{MOD}V</kbd>
      </button>
      <hr className="f-divider" />
      <button disabled={!parent} onClick={run(() => store.select(parent?.id ?? null))}>
        <CornerDownRight size={14} /> Select parent
      </button>
      <button onClick={run(() => store.setNodeHidden(menu.nodeId, store.device, true))}>
        <EyeOff size={14} /> Hide on {store.device}
      </button>
      <hr className="f-divider" />
      <button data-danger="true" onClick={run(() => store.removeNode(menu.nodeId))}>
        <Trash2 size={14} /> Delete <kbd>Del</kbd>
      </button>
    </div>,
    document.body,
  );
}
