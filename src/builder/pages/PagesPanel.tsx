import { useState } from 'react';
import { Copy, Ellipsis, House, Plus, Search as SearchIcon, Trash2 } from 'lucide-react';
import type { Page } from '@/types/project';
import { ConfirmDialog, Field, Modal, useClickOutside } from '@/components/ui';
import { useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';

export function PagesPanel() {
  const project = useEditorStore((s) => s.project);
  const currentPageId = useEditorStore((s) => s.currentPageId);
  const setCurrentPage = useEditorStore((s) => s.setCurrentPage);
  const createPage = useEditorStore((s) => s.createPage);
  const openDialog = useUiStore((s) => s.openDialog);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [settingsFor, setSettingsFor] = useState<Page | null>(null);
  const [deleting, setDeleting] = useState<Page | null>(null);

  if (!project) return null;

  return (
    <>
      <div className="f-panel-head">
        <h2>Pages</h2>
        <button className="f-btn f-btn-ghost f-btn-sm" onClick={() => setCreating(true)}>
          <Plus size={14} /> New
        </button>
      </div>

      <div className="f-panel-body f-scroll" style={{ padding: '0 8px' }}>
        {project.pages.map((page) => (
          <div key={page.id} style={{ position: 'relative' }}>
            <div
              className="f-page"
              data-active={page.id === currentPageId}
              onClick={() => setCurrentPage(page.id)}
            >
              {page.isHome ? <House size={13} /> : <SearchIcon size={13} style={{ opacity: 0 }} />}
              <span className="f-page-name">
                <strong>{page.name}</strong>
                <em>/{page.slug}</em>
              </span>
              <button
                className="f-btn f-btn-ghost f-btn-icon"
                style={{ width: 24, height: 24 }}
                onClick={(event) => {
                  event.stopPropagation();
                  setMenuFor(menuFor === page.id ? null : page.id);
                }}
                aria-label={`Actions for ${page.name}`}
              >
                <Ellipsis size={14} />
              </button>
            </div>
            {menuFor === page.id ? (
              <PageMenu
                page={page}
                canDelete={project.pages.length > 1 && !page.isHome}
                onClose={() => setMenuFor(null)}
                onSettings={() => {
                  setMenuFor(null);
                  setSettingsFor(page);
                }}
                onDelete={() => {
                  setMenuFor(null);
                  setDeleting(page);
                }}
              />
            ) : null}
          </div>
        ))}

        <button
          className="f-btn f-btn-secondary f-btn-block f-btn-sm"
          style={{ margin: '10px 2px' }}
          onClick={() => openDialog('navigation')}
        >
          Edit site navigation
        </button>
      </div>

      {creating ? (
        <Modal
          title="New page"
          description="Pages get their own URL and appear in the navigation menu."
          onClose={() => setCreating(false)}
          footer={
            <>
              <button className="f-btn f-btn-secondary" onClick={() => setCreating(false)}>
                Cancel
              </button>
              <button
                className="f-btn f-btn-primary"
                onClick={() => {
                  createPage(newName || 'New page');
                  setNewName('');
                  setCreating(false);
                }}
              >
                Create page
              </button>
            </>
          }
        >
          <Field label="Page name" help="The URL is generated from the name and can be changed later.">
            <input
              className="f-input"
              autoFocus
              value={newName}
              placeholder="About"
              onChange={(event) => setNewName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  createPage(newName || 'New page');
                  setNewName('');
                  setCreating(false);
                }
              }}
            />
          </Field>
        </Modal>
      ) : null}

      {settingsFor ? <PageSettings page={settingsFor} onClose={() => setSettingsFor(null)} /> : null}

      {deleting ? (
        <ConfirmDialog
          title={`Delete “${deleting.name}”?`}
          message="The page and everything on it will be removed, and any navigation links to it will be cleared."
          confirmLabel="Delete page"
          onConfirm={() => useEditorStore.getState().deletePage(deleting.id)}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </>
  );
}

function PageMenu({
  page,
  canDelete,
  onClose,
  onSettings,
  onDelete,
}: {
  page: Page;
  canDelete: boolean;
  onClose: () => void;
  onSettings: () => void;
  onDelete: () => void;
}) {
  const ref = useClickOutside<HTMLDivElement>(onClose);
  const duplicatePage = useEditorStore((s) => s.duplicatePage);
  const setHomePage = useEditorStore((s) => s.setHomePage);

  return (
    <div ref={ref} className="f-menu" style={{ position: 'absolute', right: 8, top: 34, zIndex: 40 }}>
      <button onClick={onSettings}>Page settings &amp; SEO</button>
      <button
        onClick={() => {
          duplicatePage(page.id);
          onClose();
        }}
      >
        <Copy size={14} /> Duplicate
      </button>
      {!page.isHome ? (
        <button
          onClick={() => {
            setHomePage(page.id);
            onClose();
          }}
        >
          <House size={14} /> Set as home page
        </button>
      ) : null}
      <hr className="f-divider" />
      <button data-danger="true" disabled={!canDelete} onClick={onDelete}>
        <Trash2 size={14} /> Delete page
      </button>
    </div>
  );
}

function PageSettings({ page, onClose }: { page: Page; onClose: () => void }) {
  const updatePage = useEditorStore((s) => s.updatePage);
  const [name, setName] = useState(page.name);
  const [slug, setSlug] = useState(page.slug);
  const [seo, setSeo] = useState(page.seo);

  function save() {
    updatePage(page.id, { name, slug, seo });
    onClose();
  }

  return (
    <Modal
      title="Page settings"
      description={`Controls the URL and search-engine listing for “${page.name}”.`}
      onClose={onClose}
      footer={
        <>
          <button className="f-btn f-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="f-btn f-btn-primary" onClick={save}>
            Save changes
          </button>
        </>
      }
    >
      <Field label="Page name">
        <input className="f-input" value={name} onChange={(event) => setName(event.target.value)} />
      </Field>
      <Field
        label="URL"
        help={page.isHome ? 'The home page always lives at the root of the site.' : 'Letters, numbers and dashes only.'}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: 'var(--f-muted)', fontFamily: 'var(--f-mono)', fontSize: 12 }}>/</span>
          <input
            className="f-input"
            value={slug}
            disabled={page.isHome}
            onChange={(event) => setSlug(event.target.value)}
          />
        </div>
      </Field>
      <hr className="f-divider" />
      <Field label="Search engine title" help="Shown as the clickable headline in search results.">
        <input
          className="f-input"
          value={seo.title ?? ''}
          placeholder={page.name}
          onChange={(event) => setSeo({ ...seo, title: event.target.value })}
        />
      </Field>
      <Field label="Meta description" help="Aim for 140-160 characters.">
        <textarea
          className="f-textarea"
          rows={3}
          value={seo.description ?? ''}
          onChange={(event) => setSeo({ ...seo, description: event.target.value })}
        />
      </Field>
      <Field label="Open Graph title" help="Used when the page is shared on social media.">
        <input
          className="f-input"
          value={seo.ogTitle ?? ''}
          placeholder={seo.title ?? page.name}
          onChange={(event) => setSeo({ ...seo, ogTitle: event.target.value })}
        />
      </Field>
      <Field label="Open Graph description">
        <textarea
          className="f-textarea"
          rows={2}
          value={seo.ogDescription ?? ''}
          onChange={(event) => setSeo({ ...seo, ogDescription: event.target.value })}
        />
      </Field>
      <Field label="Canonical URL" help="Leave empty to generate it from the site address.">
        <input
          className="f-input"
          value={seo.canonical ?? ''}
          placeholder="https://example.com/about/"
          onChange={(event) => setSeo({ ...seo, canonical: event.target.value })}
        />
      </Field>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
        <input
          type="checkbox"
          checked={seo.noIndex ?? false}
          onChange={(event) => setSeo({ ...seo, noIndex: event.target.checked })}
        />
        Hide this page from search engines
      </label>
    </Modal>
  );
}
