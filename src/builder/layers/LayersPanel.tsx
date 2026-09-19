import { useState } from 'react';
import { ChevronRight, Eye, EyeOff, Lock, LockOpen, Trash2 } from 'lucide-react';
import type { BuilderNode } from '@/types/project';
import { getComponent } from '@/engine/registry/registry';
import { nodePath } from '@/engine/commands/tree';
import { useCurrentPage, useEditorStore } from '@/store/editorStore';

/** Tree view of the page. Mirrors the canvas exactly: same ids, same order. */
export function LayersPanel() {
  const page = useCurrentPage();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (!page) return null;

  return (
    <>
      <div className="f-panel-head">
        <h2>Layers</h2>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--f-muted)' }}>{page.name}</span>
      </div>
      <div className="f-panel-body f-scroll" style={{ padding: '0 8px 16px' }}>
        {page.nodes.length === 0 ? (
          <div className="f-empty">
            <strong>Nothing here yet</strong>
            <span>Drag a component onto the canvas and it will appear in this tree.</span>
          </div>
        ) : (
          page.nodes.map((node) => (
            <LayerRow
              key={node.id}
              node={node}
              depth={0}
              collapsed={collapsed}
              onToggle={(id) => setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))}
            />
          ))
        )}
      </div>
    </>
  );
}

function LayerRow({
  node,
  depth,
  collapsed,
  onToggle,
}: {
  node: BuilderNode;
  depth: number;
  collapsed: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const selectedId = useEditorStore((s) => s.selectedId);
  const hoveredId = useEditorStore((s) => s.hoveredId);
  const device = useEditorStore((s) => s.device);
  const select = useEditorStore((s) => s.select);
  const hover = useEditorStore((s) => s.hover);
  const setHidden = useEditorStore((s) => s.setNodeHidden);
  const setLocked = useEditorStore((s) => s.setNodeLocked);
  const removeNode = useEditorStore((s) => s.removeNode);
  const moveNode = useEditorStore((s) => s.moveNode);
  const page = useCurrentPage();
  const [dropSide, setDropSide] = useState<'before' | 'after' | 'into' | null>(null);

  const definition = getComponent(node.type);
  const Icon = definition?.icon;
  const children = node.children ?? [];
  const isCollapsed = collapsed[node.id];
  const hidden = node.hidden?.[device];

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const draggedId = event.dataTransfer.getData('text/flarent-node');
    setDropSide(null);
    if (!draggedId || draggedId === node.id || !page) return;

    if (dropSide === 'into') {
      moveNode(draggedId, node.id, children.length);
      return;
    }
    const path = nodePath(page.nodes, node.id);
    const parent = path.length ? path[path.length - 1] : null;
    const siblings = parent?.children ?? page.nodes;
    const index = siblings.findIndex((item) => item.id === node.id);
    moveNode(draggedId, parent?.id ?? null, dropSide === 'before' ? index : index + 1);
  }

  return (
    <div>
      <div
        className={[
          'f-layer',
          dropSide === 'into' ? 'f-layer-drop-into' : '',
          dropSide === 'before' || dropSide === 'after' ? 'f-layer-drop' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={{ paddingLeft: 6 + depth * 13 }}
        data-selected={selectedId === node.id}
        data-hover={hoveredId === node.id}
        onClick={() => select(node.id)}
        onMouseEnter={() => hover(node.id)}
        onMouseLeave={() => hover(null)}
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData('text/flarent-node', node.id);
          event.dataTransfer.effectAllowed = 'move';
        }}
        onDragOver={(event) => {
          event.preventDefault();
          const rect = event.currentTarget.getBoundingClientRect();
          const offset = event.clientY - rect.top;
          const canNest = definition?.children.kind !== 'none';
          if (canNest && offset > rect.height * 0.32 && offset < rect.height * 0.68) setDropSide('into');
          else setDropSide(offset < rect.height / 2 ? 'before' : 'after');
        }}
        onDragLeave={() => setDropSide(null)}
        onDrop={handleDrop}
      >
        {children.length > 0 ? (
          <button
            className="f-layer-toggle"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.id);
            }}
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            <ChevronRight
              size={12}
              style={{ transform: isCollapsed ? 'none' : 'rotate(90deg)', transition: 'transform .15s' }}
            />
          </button>
        ) : (
          <span style={{ width: 16, flex: 'none' }} />
        )}

        {Icon ? <Icon size={13} className="f-layer-icon" /> : null}
        <span className="f-layer-name">{node.name || definition?.label || node.type}</span>

        <span className="f-layer-actions">
          <button
            onClick={(event) => {
              event.stopPropagation();
              setLocked(node.id, !node.locked);
            }}
            title={node.locked ? 'Unlock' : 'Lock'}
          >
            {node.locked ? <Lock size={12} /> : <LockOpen size={12} />}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              setHidden(node.id, device, !hidden);
            }}
            title={hidden ? `Show on ${device}` : `Hide on ${device}`}
          >
            {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              removeNode(node.id);
            }}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </span>
      </div>

      {!isCollapsed
        ? children.map((child) => (
            <LayerRow
              key={child.id}
              node={child}
              depth={depth + 1}
              collapsed={collapsed}
              onToggle={onToggle}
            />
          ))
        : null}
    </div>
  );
}
