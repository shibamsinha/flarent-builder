import { useDraggable } from '@dnd-kit/core';
import { Copy, GripVertical, Trash2 } from 'lucide-react';
import { getComponent } from '@/engine/registry/registry';
import type { LocalRect } from './useOverlayRects';
import type { DropIndicator } from './dropResolver';

interface OverlayProps {
  selectedId: string | null;
  hoveredId: string | null;
  parentId: string | null;
  rects: Record<string, LocalRect | null>;
  nodeType: string | undefined;
  nodeName: string | undefined;
  dropIndicator: DropIndicator | null;
  onDuplicate: () => void;
  onDelete: () => void;
}

/** Selection chrome, drawn above the page so the page DOM stays untouched. */
export function CanvasOverlay({
  selectedId,
  hoveredId,
  parentId,
  rects,
  nodeType,
  nodeName,
  dropIndicator,
  onDuplicate,
  onDelete,
}: OverlayProps) {
  const selectedRect = selectedId ? rects[selectedId] : null;
  const hoveredRect = hoveredId && hoveredId !== selectedId ? rects[hoveredId] : null;
  const parentRect = parentId && parentId !== selectedId ? rects[parentId] : null;
  const label = nodeName || (nodeType ? getComponent(nodeType)?.label ?? nodeType : '');

  return (
    <div className="f-overlay">
      {parentRect ? (
        <div
          className="f-outline f-outline-parent"
          style={{ left: parentRect.x, top: parentRect.y, width: parentRect.width, height: parentRect.height }}
        />
      ) : null}

      {hoveredRect ? (
        <div
          className="f-outline f-outline-hover"
          style={{ left: hoveredRect.x, top: hoveredRect.y, width: hoveredRect.width, height: hoveredRect.height }}
        />
      ) : null}

      {selectedRect && selectedId ? (
        <>
          <div
            className="f-outline"
            style={{ left: selectedRect.x, top: selectedRect.y, width: selectedRect.width, height: selectedRect.height }}
          />
          <SelectionBadge nodeId={selectedId} label={label} rect={selectedRect} />
          <div
            className="f-badge-actions"
            style={{
              left: Math.max(0, selectedRect.x + selectedRect.width - 56),
              top: Math.max(0, selectedRect.y - 27),
            }}
          >
            <button onClick={onDuplicate} title="Duplicate (Cmd/Ctrl+D)">
              <Copy size={13} />
            </button>
            <button onClick={onDelete} title="Delete (Del)">
              <Trash2 size={13} />
            </button>
          </div>
        </>
      ) : null}

      {dropIndicator ? <DropMarker indicator={dropIndicator} /> : null}
    </div>
  );
}

function SelectionBadge({
  nodeId,
  label,
  rect,
}: {
  nodeId: string;
  label: string;
  rect: LocalRect;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `move:${nodeId}`,
    data: { kind: 'move', nodeId },
  });

  return (
    <div
      ref={setNodeRef}
      className="f-badge"
      style={{
        left: rect.x,
        top: Math.max(0, rect.y - 21),
        opacity: isDragging ? 0.4 : 1,
      }}
      {...listeners}
      {...attributes}
      title="Drag to move"
    >
      <GripVertical size={11} />
      {label}
    </div>
  );
}

function DropMarker({ indicator }: { indicator: DropIndicator }) {
  const className =
    indicator.kind === 'line'
      ? 'f-drop-line'
      : indicator.kind === 'box'
        ? 'f-drop-box'
        : 'f-drop-invalid';
  return (
    <div
      className={className}
      style={{
        left: indicator.x,
        top: indicator.y,
        width: Math.max(indicator.width, indicator.kind === 'line' ? 3 : 0),
        height: Math.max(indicator.height, indicator.kind === 'line' ? 3 : 0),
      }}
    />
  );
}
