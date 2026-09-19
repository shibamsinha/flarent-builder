import { useMemo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Search } from 'lucide-react';
import type { ComponentDefinition } from '@/engine/registry/types';
import { componentsByCategory } from '@/engine/registry/registry';
import { findValidParent } from '@/engine/validation';
import { useCurrentPage, useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';

export function ComponentsPanel() {
  const [query, setQuery] = useState('');
  const groups = useMemo(() => componentsByCategory(), []);
  const term = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              !term ||
              item.label.toLowerCase().includes(term) ||
              item.type.toLowerCase().includes(term) ||
              (item.keywords ?? []).some((keyword) => keyword.includes(term)),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [groups, term],
  );

  return (
    <>
      <div className="f-panel-head">
        <h2>Components</h2>
      </div>
      <div className="f-search">
        <Search size={13} />
        <input
          className="f-input"
          placeholder="Search components"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      <div className="f-panel-body f-scroll">
        {filtered.length === 0 ? (
          <div className="f-empty">
            <strong>No matches</strong>
            <span>Try a different word, like “hero” or “form”.</span>
          </div>
        ) : (
          filtered.map((group) => (
            <section key={group.id} className="f-cat">
              <h3 className="f-cat-title">{group.label}</h3>
              <div className="f-cat-grid">
                {group.items.map((item) => (
                  <PaletteItem key={item.type} definition={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}

function PaletteItem({ definition }: { definition: ComponentDefinition<never> }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `new:${definition.type}`,
    data: { kind: 'new', type: definition.type },
  });
  const Icon = definition.icon;
  const addComponent = useEditorStore((s) => s.addComponent);
  const selectedId = useEditorStore((s) => s.selectedId);
  const page = useCurrentPage();
  const toast = useUiStore((s) => s.toast);

  /** Clicking is a keyboard-friendly alternative to dragging. */
  function addAtBestPosition() {
    if (!page) return;
    const target = findValidParent(page.nodes, selectedId, definition.type);
    if (!target) {
      toast(`${definition.label} cannot be placed here.`, 'error');
      return;
    }
    const created = addComponent(definition.type, target.parentId, target.index);
    if (created) toast(`${definition.label} added.`, 'success');
  }

  return (
    <button
      ref={setNodeRef}
      type="button"
      className={isDragging ? 'f-comp f-comp-dragging' : 'f-comp'}
      title={definition.description ?? definition.label}
      onClick={addAtBestPosition}
      {...listeners}
      {...attributes}
    >
      <span className="f-comp-icon">
        <Icon size={16} />
      </span>
      <span>{definition.label}</span>
    </button>
  );
}
