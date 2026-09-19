import { useCallback, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import type { Page } from '@/types/project';
import { getComponent } from '@/engine/registry/registry';
import { useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';
import { resolveDrop, type DropPlan } from '@/builder/canvas/dropResolver';

export interface ActiveDrag {
  kind: 'new' | 'move';
  type: string;
  nodeId?: string;
}

/**
 * Drag-and-drop wiring for the canvas.
 *
 * dnd-kit provides the sensors, lifecycle and drag preview; where a component
 * actually lands is resolved against the project tree and live DOM geometry,
 * which is what makes insertion indicators exact and invalid drops impossible.
 */
export function useCanvasDnd(
  page: Page | null,
  pageRootRef: MutableRefObject<HTMLDivElement | null>,
  overlayRootRef: MutableRefObject<HTMLDivElement | null>,
  scaleRef: MutableRefObject<number>,
) {
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [plan, setPlan] = useState<DropPlan | null>(null);
  const planRef = useRef<DropPlan | null>(null);
  const frameRef = useRef<number | null>(null);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<ActiveDrag | null>(null);

  const compute = useCallback(() => {
    frameRef.current = null;
    const drag = dragRef.current;
    const pointer = pointerRef.current;
    const pageRoot = pageRootRef.current;
    const overlayRoot = overlayRootRef.current;
    if (!drag || !pointer || !pageRoot || !overlayRoot || !page) return;

    const frameRect = overlayRoot.getBoundingClientRect();
    const outside =
      pointer.x < frameRect.left - 60 ||
      pointer.x > frameRect.right + 60 ||
      pointer.y < frameRect.top - 60 ||
      pointer.y > frameRect.bottom + 60;

    if (outside) {
      planRef.current = null;
      setPlan(null);
      return;
    }

    const next = resolveDrop({
      nodes: page.nodes,
      dragType: drag.type,
      movingId: drag.nodeId ?? null,
      pointer,
      pageRoot,
      overlayRoot,
      scale: scaleRef.current,
      typeLabel: (type) => getComponent(type)?.label ?? type,
    });
    planRef.current = next;
    setPlan(next);
  }, [page, pageRootRef, overlayRootRef, scaleRef]);

  const onPointerMove = useCallback(
    (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
      if (frameRef.current === null) frameRef.current = requestAnimationFrame(compute);
    },
    [compute],
  );

  const stopTracking = useCallback(() => {
    window.removeEventListener('pointermove', onPointerMove);
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    dragRef.current = null;
    pointerRef.current = null;
    planRef.current = null;
    setActiveDrag(null);
    setPlan(null);
  }, [onPointerMove]);

  const onDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as
        | { kind: 'new'; type: string }
        | { kind: 'move'; nodeId: string }
        | undefined;
      if (!data) return;

      let drag: ActiveDrag | null = null;
      if (data.kind === 'new') drag = { kind: 'new', type: data.type };
      if (data.kind === 'move' && page) {
        const type = findType(page, data.nodeId);
        if (type) drag = { kind: 'move', type, nodeId: data.nodeId };
      }
      if (!drag) return;

      dragRef.current = drag;
      setActiveDrag(drag);
      // dnd-kit reports deltas; the resolver needs absolute pointer coordinates.
      const activator = event.activatorEvent as PointerEvent | undefined;
      if (activator && 'clientX' in activator) {
        pointerRef.current = { x: activator.clientX, y: activator.clientY };
      }
      window.addEventListener('pointermove', onPointerMove);
    },
    [onPointerMove, page],
  );

  const onDragEnd = useCallback(
    (_event: DragEndEvent) => {
      const drag = dragRef.current;
      const finalPlan = planRef.current;
      const store = useEditorStore.getState();
      const ui = useUiStore.getState();

      if (drag && finalPlan?.valid) {
        if (drag.kind === 'new') {
          const created = store.addComponent(drag.type, finalPlan.parentId, finalPlan.index);
          if (!created) ui.toast('That element cannot go there.', 'error');
        } else if (drag.nodeId) {
          const moved = store.moveNode(drag.nodeId, finalPlan.parentId, finalPlan.index);
          if (!moved) ui.toast('That element cannot go there.', 'error');
        }
      } else if (drag && finalPlan && !finalPlan.valid) {
        ui.toast(finalPlan.reason ?? 'That element cannot go there.', 'error');
      }
      stopTracking();
    },
    [stopTracking],
  );

  return {
    activeDrag,
    dropIndicator: plan?.indicator ?? null,
    dropLabel: activeDrag ? (plan?.label ?? 'Move onto the page') : null,
    onDragStart,
    onDragEnd,
    onDragCancel: stopTracking,
  };
}

function findType(page: Page, nodeId: string): string | null {
  let found: string | null = null;
  const walk = (nodes: Page['nodes']) => {
    for (const node of nodes) {
      if (node.id === nodeId) {
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
