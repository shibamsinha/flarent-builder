import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import type { NavItem } from '@/types/project';
import { Field, Modal, Switch } from '@/components/ui';
import { useEditorStore } from '@/store/editorStore';
import { uid } from '@/utils/id';

/**
 * Navigation references pages by id, so renaming a page or changing its slug
 * never breaks a menu link, and deleting a page removes its entry.
 */
export function NavigationDialog({ onClose }: { onClose: () => void }) {
  const project = useEditorStore((s) => s.project);
  const setNavigation = useEditorStore((s) => s.setNavigation);
  if (!project) return null;

  const items = project.navigation.items;
  const update = (next: NavItem[]) => setNavigation({ items: next });

  const linkedPageIds = new Set(items.map((item) => item.pageId).filter(Boolean));
  const missingPages = project.pages.filter((page) => !linkedPageIds.has(page.id));

  const patch = (id: string, changes: Partial<NavItem>) =>
    update(items.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    update(next);
  };

  return (
    <Modal
      title="Site navigation"
      description="Every Navbar set to “Site navigation” uses this menu."
      onClose={onClose}
      footer={
        <button className="f-btn f-btn-primary" onClick={onClose}>
          Done
        </button>
      }
    >
      {items.length === 0 ? (
        <div className="f-empty">
          <strong>No menu items</strong>
          <span>Add your pages below to build the menu.</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item, index) => (
            <div key={item.id} className="f-list-item">
              <div className="f-list-body" style={{ borderTop: 'none' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <Field label="Label">
                    <input
                      className="f-input"
                      value={item.label}
                      onChange={(event) => patch(item.id, { label: event.target.value })}
                    />
                  </Field>
                  <span className="f-list-actions" style={{ paddingBottom: 6 }}>
                    <button onClick={() => move(index, -1)} disabled={index === 0} title="Move up">
                      <ChevronUp size={13} />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === items.length - 1}
                      title="Move down"
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button onClick={() => update(items.filter((i) => i.id !== item.id))} title="Remove">
                      <Trash2 size={13} />
                    </button>
                  </span>
                </div>

                <Field label="Links to">
                  <select
                    className="f-select"
                    value={item.pageId ?? '__url__'}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === '__url__') patch(item.id, { pageId: undefined, url: item.url ?? 'https://' });
                      else patch(item.id, { pageId: value, url: undefined });
                    }}
                  >
                    {project.pages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.name}
                      </option>
                    ))}
                    <option value="__url__">External URL…</option>
                  </select>
                </Field>

                {!item.pageId ? (
                  <Field label="URL">
                    <input
                      className="f-input"
                      value={item.url ?? ''}
                      placeholder="https://example.com"
                      onChange={(event) => patch(item.id, { url: event.target.value })}
                    />
                  </Field>
                ) : null}

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <Switch
                    checked={item.newTab ?? false}
                    onChange={(value) => patch(item.id, { newTab: value })}
                  />
                  Open in a new tab
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      <hr className="f-divider" />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {missingPages.map((page) => (
          <button
            key={page.id}
            className="f-btn f-btn-secondary f-btn-sm"
            onClick={() =>
              update([...items, { id: uid('nav'), label: page.name, pageId: page.id }])
            }
          >
            <Plus size={13} /> {page.name}
          </button>
        ))}
        <button
          className="f-btn f-btn-secondary f-btn-sm"
          onClick={() => update([...items, { id: uid('nav'), label: 'New link', url: 'https://' }])}
        >
          <Plus size={13} /> External link
        </button>
      </div>
    </Modal>
  );
}
