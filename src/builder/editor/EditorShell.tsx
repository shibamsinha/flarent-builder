import { useEffect, useRef } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { Page, Project } from '@/types/project';
import { getComponent } from '@/engine/registry/registry';
import { getDevice } from '@/engine/responsive';
import { useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';
import { Canvas } from '@/builder/canvas/Canvas';
import { useCanvasScale } from '@/builder/canvas/useCanvasScale';
import { CanvasContextMenu } from '@/builder/canvas/ContextMenu';
import { Inspector } from '@/builder/inspector/Inspector';
import { LeftPanel } from '@/builder/panels/LeftPanel';
import { NavigationDialog } from '@/builder/dialogs/NavigationDialog';
import { PublishDialog } from '@/builder/dialogs/PublishDialog';
import { SettingsDialog } from '@/builder/dialogs/SettingsDialog';
import { TopBar } from './TopBar';
import { useCanvasDnd } from './useCanvasDnd';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useRenderEnv } from './useRenderEnv';

export function EditorShell({ project, page }: { project: Project; page: Page }) {
  const device = useEditorStore((s) => s.device);
  const assetUrls = useEditorStore((s) => s.assetUrls);
  const dialog = useUiStore((s) => s.dialog);
  const closeDialog = () => useUiStore.getState().openDialog(null);

  const pageRootRef = useRef<HTMLDivElement | null>(null);
  const overlayRootRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scale = useCanvasScale(scrollRef, getDevice(device).canvasWidth);
  // Drag resolution runs outside React's render cycle, so it reads the scale
  // from a ref rather than a captured value.
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  const env = useRenderEnv({
    project,
    device,
    mode: 'editor',
    currentPageId: page.id,
    assetUrls,
  });

  const dnd = useCanvasDnd(page, pageRootRef, overlayRootRef, scaleRef);
  useKeyboardShortcuts(true);

  // A short activation distance keeps clicks feeling like clicks.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  return (
    <DndContext
      sensors={sensors}
      onDragStart={dnd.onDragStart}
      onDragEnd={dnd.onDragEnd}
      onDragCancel={dnd.onDragCancel}
    >
      <div className="f-app">
        <TopBar />
        <div className="f-body">
          <LeftPanel />
          <Canvas
            project={project}
            page={page}
            env={env}
            pageRootRef={pageRootRef}
            overlayRootRef={overlayRootRef}
            scrollRef={scrollRef}
            scale={scale}
            dropIndicator={dnd.dropIndicator}
            dropLabel={dnd.dropLabel}
          />
          <aside className="f-side f-side-right">
            <Inspector />
          </aside>
        </div>
      </div>

      <CanvasContextMenu />

      {dialog === 'settings' ? <SettingsDialog onClose={closeDialog} /> : null}
      {dialog === 'navigation' ? <NavigationDialog onClose={closeDialog} /> : null}
      {dialog === 'publish' ? <PublishDialog onClose={closeDialog} /> : null}

      <DragOverlay dropAnimation={null}>
        {dnd.activeDrag ? <DragGhost type={dnd.activeDrag.type} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function DragGhost({ type }: { type: string }) {
  const definition = getComponent(type);
  if (!definition) return null;
  const Icon = definition.icon;
  return (
    <div className="f-drag-ghost">
      <span className="f-comp-icon">
        <Icon size={13} />
      </span>
      {definition.label}
    </div>
  );
}
