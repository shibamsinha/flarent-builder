import { useCallback, useMemo } from 'react';
import type { MutableRefObject } from 'react';
import { MousePointerClick } from 'lucide-react';
import type { Page, Project } from '@/types/project';
import { getComponent } from '@/engine/registry/registry';
import { nodePath } from '@/engine/commands/tree';
import { PageRenderer } from '@/engine/renderer/PageRenderer';
import { EditorRuntimeContext, RenderEnvContext } from '@/engine/renderer/context';
import type { EditorRuntime } from '@/engine/renderer/context';
import type { RenderEnv } from '@/engine/registry/types';
import { themeToCssVars } from '@/engine/theme';
import { DEVICES, getDevice } from '@/engine/responsive';
import { useEditorStore, useSelectedNode } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';
import { CanvasOverlay } from './CanvasOverlay';
import { Breadcrumb } from './Breadcrumb';
import { useOverlayRects } from './useOverlayRects';
import type { DropIndicator } from './dropResolver';

interface CanvasProps {
  project: Project;
  page: Page;
  env: RenderEnv;
  pageRootRef: MutableRefObject<HTMLDivElement | null>;
  overlayRootRef: MutableRefObject<HTMLDivElement | null>;
  scrollRef: MutableRefObject<HTMLDivElement | null>;
  /** Canvas zoom, 1 when the device frame fits. */
  scale: number;
  dropIndicator: DropIndicator | null;
  dropLabel: string | null;
}

export function Canvas({
  project,
  page,
  env,
  pageRootRef,
  overlayRootRef,
  scrollRef,
  scale,
  dropIndicator,
  dropLabel,
}: CanvasProps) {
  const device = useEditorStore((s) => s.device);
  const selectedId = useEditorStore((s) => s.selectedId);
  const hoveredId = useEditorStore((s) => s.hoveredId);
  const editingNodeId = useEditorStore((s) => s.editingNodeId);
  const select = useEditorStore((s) => s.select);
  const hover = useEditorStore((s) => s.hover);
  const beginEdit = useEditorStore((s) => s.beginEdit);
  const endEdit = useEditorStore((s) => s.endEdit);
  const commitText = useEditorStore((s) => s.commitText);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const removeNode = useEditorStore((s) => s.removeNode);
  const openContextMenu = useUiStore((s) => s.openContextMenu);

  const selectedNode = useSelectedNode();
  const path = useMemo(
    () => (selectedId ? nodePath(page.nodes, selectedId) : []),
    [page.nodes, selectedId],
  );
  const parentId = path.length ? path[path.length - 1].id : null;

  const rects = useOverlayRects(
    [selectedId, hoveredId, parentId],
    pageRootRef.current,
    overlayRootRef.current,
    `${page.id}:${device}:${project.updatedAt}:${editingNodeId ?? ''}:${scale}`,
    scale,
  );

  const runtime = useMemo<EditorRuntime>(
    () => ({ editingNodeId, commitText, endEdit }),
    [editingNodeId, commitText, endEdit],
  );

  const nodeIdFromEvent = useCallback((target: EventTarget | null): string | null => {
    if (!(target instanceof Element)) return null;
    const owner = target.closest('[data-fl-id]');
    return owner?.getAttribute('data-fl-id') ?? null;
  }, []);

  const frameWidth = getDevice(device).canvasWidth;

  return (
    <div className="f-canvas-wrap">
      <Breadcrumb path={path} selected={selectedNode} onSelect={select} />

      <div
        className="f-canvas-scroll f-scroll"
        ref={scrollRef}
        onMouseDown={(event) => {
          // Clicking the grey area around the page clears the selection.
          if (event.target === event.currentTarget) select(null);
        }}
      >
        <div
          className="f-canvas-frame"
          style={{ width: frameWidth, zoom: scale }}
          ref={overlayRootRef}
        >
          <div
            ref={pageRootRef}
            className="fl-root f-canvas-page"
            style={themeToCssVars(project.theme) as React.CSSProperties}
            onClickCapture={(event) => {
              // Links and buttons must never navigate while editing.
              const interactive = (event.target as Element)?.closest?.('a,button');
              if (interactive) event.preventDefault();
            }}
            onMouseDown={(event) => {
              if (event.button !== 0) return;
              const id = nodeIdFromEvent(event.target);
              if (editingNodeId && id !== editingNodeId) endEdit();
              select(id);
            }}
            onDoubleClick={(event) => {
              const id = nodeIdFromEvent(event.target);
              if (!id) return;
              const node = findNodeType(page, id);
              if (node && getComponent(node)?.inlineText) {
                event.preventDefault();
                beginEdit(id);
              }
            }}
            onMouseOver={(event) => hover(nodeIdFromEvent(event.target))}
            onMouseLeave={() => hover(null)}
            onContextMenu={(event) => {
              const id = nodeIdFromEvent(event.target);
              if (!id) return;
              event.preventDefault();
              select(id);
              openContextMenu(event.clientX, event.clientY, id);
            }}
          >
            <RenderEnvContext.Provider value={env}>
              <EditorRuntimeContext.Provider value={runtime}>
                <PageRenderer page={page} emptyState={<EmptyPage />} />
              </EditorRuntimeContext.Provider>
            </RenderEnvContext.Provider>
          </div>

          <CanvasOverlay
            selectedId={selectedId}
            hoveredId={hoveredId}
            parentId={parentId}
            rects={rects}
            nodeType={selectedNode?.type}
            nodeName={selectedNode?.name}
            dropIndicator={dropIndicator}
            onDuplicate={() => selectedId && duplicateNode(selectedId)}
            onDelete={() => selectedId && removeNode(selectedId)}
          />
        </div>

        {dropLabel ? <div className="f-canvas-status">{dropLabel}</div> : null}
        {scale < 1 ? (
          <div className="f-canvas-zoom" title="The page is scaled to fit. The real width is unchanged">
            {Math.round(scale * 100)}%
          </div>
        ) : null}
      </div>
    </div>
  );
}

function findNodeType(page: Page, id: string): string | null {
  let found: string | null = null;
  const walk = (nodes: Page['nodes']) => {
    for (const node of nodes) {
      if (node.id === id) {
        found = node.type;
        return;
      }
      if (node.children) walk(node.children);
      if (found) return;
    }
  };
  walk(page.nodes);
  return found;
}

function EmptyPage() {
  return (
    <div className="f-canvas-empty">
      <div className="f-canvas-empty-mark">
        <MousePointerClick size={24} />
      </div>
      <h3>This page is empty</h3>
      <p>
        Drag a section from the left panel onto the canvas to get started. Try Hero, Features or
        Navbar.
      </p>
    </div>
  );
}

export { DEVICES };
