import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Copy, Ellipsis, FolderOpen, Layers, Loader, Pencil, Plus, Trash2, TriangleAlert,
} from 'lucide-react';
import type { ProjectSummary } from '@/types/project';
import { ConfirmDialog, Modal, useClickOutside } from '@/components/ui';
import { useUiStore } from '@/store/uiStore';
import {
  createProjectFromTemplate, deleteProject, duplicateProject, formatRelativeTime, listProjects,
  renameProject,
} from '@/project/projectService';
import { getTemplate } from '@/templates';
import { TemplatePicker } from './TemplatePicker';

export function Dashboard() {
  const navigate = useNavigate();
  const toast = useUiStore((s) => s.toast);
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [picking, setPicking] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<ProjectSummary | null>(null);
  const [deleting, setDeleting] = useState<ProjectSummary | null>(null);

  const refresh = useCallback(async () => {
    try {
      setProjects(await listProjects());
    } catch (error) {
      console.error(error);
      toast('Your websites could not be loaded.', 'error');
      setProjects([]);
    }
  }, [toast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate(templateId: string, name: string) {
    const project = await createProjectFromTemplate(templateId, name);
    setPicking(false);
    navigate(`/edit/${project.id}`);
  }

  async function handleDuplicate(id: string) {
    setMenuFor(null);
    const copy = await duplicateProject(id);
    if (copy) {
      toast('Website duplicated.', 'success');
      await refresh();
    }
  }

  async function handleDelete(summary: ProjectSummary) {
    await deleteProject(summary.id);
    toast(`“${summary.name}” deleted.`, 'success');
    await refresh();
  }

  return (
    <div className="f-dash">
      <header className="f-dash-bar">
        <span className="f-logo">
          <span className="f-logo-mark">F</span>
          Flarent Builder
        </span>
        <span className="f-chip" style={{ marginLeft: 4 }}>
          V1
        </span>
      </header>

      <main className="f-dash-main">
        <div className="f-dash-hero">
          <div>
            <h1>My websites</h1>
            <p>Build, edit and publish professional websites — no code required.</p>
          </div>
          <button className="f-btn f-btn-gradient" onClick={() => setPicking(true)}>
            <Plus size={16} />
            Create website
          </button>
        </div>

        {projects === null ? (
          <div className="f-empty" style={{ padding: 80 }}>
            <Loader size={20} className="f-spin" />
            Loading your websites…
          </div>
        ) : projects.length === 0 ? (
          <EmptyState onCreate={() => setPicking(true)} />
        ) : (
          <div className="f-grid">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                menuOpen={menuFor === project.id}
                onToggleMenu={() => setMenuFor(menuFor === project.id ? null : project.id)}
                onCloseMenu={() => setMenuFor(null)}
                onOpen={() => navigate(`/edit/${project.id}`)}
                onRename={() => {
                  setMenuFor(null);
                  setRenaming(project);
                }}
                onDuplicate={() => void handleDuplicate(project.id)}
                onDelete={() => {
                  setMenuFor(null);
                  setDeleting(project);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {picking ? <TemplatePicker onClose={() => setPicking(false)} onCreate={handleCreate} /> : null}

      {renaming ? (
        <RenameDialog
          summary={renaming}
          onClose={() => setRenaming(null)}
          onSave={async (name) => {
            await renameProject(renaming.id, name);
            setRenaming(null);
            await refresh();
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title={`Delete “${deleting.name}”?`}
          message="This permanently removes the website, its pages and its uploaded images. This cannot be undone."
          confirmLabel="Delete website"
          onConfirm={() => void handleDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      ) : null}
    </div>
  );
}

function ProjectCard({
  project,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onOpen,
  onRename,
  onDuplicate,
  onDelete,
}: {
  project: ProjectSummary;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onOpen: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const template = project.templateId ? getTemplate(project.templateId) : undefined;
  const [from, to] = template?.accent ?? ['#7217b2', '#ac13eb'];
  const menuRef = useClickOutside<HTMLDivElement>(onCloseMenu);
  const damaged = project.pageCount === 0 && project.name === 'Damaged project';

  return (
    <article className="f-card">
      <button
        className="f-card-thumb"
        style={{ background: `linear-gradient(135deg, ${from}, ${to})`, border: 'none', width: '100%', cursor: 'pointer' }}
        onClick={onOpen}
        aria-label={`Open ${project.name}`}
      >
        <span className="f-card-thumb-inner">
          <span className="f-card-thumb-bar">
            <i />
            <i />
            <i />
          </span>
          <span className="f-card-thumb-lines">
            <i style={{ width: '62%', height: 8, background: '#2a2532', opacity: 0.8 }} />
            <i style={{ width: '88%' }} />
            <i style={{ width: '70%' }} />
            <i style={{ width: '46%', marginTop: 4, height: 12, borderRadius: 6, background: `${from}25` }} />
          </span>
        </span>
      </button>

      <button className="f-card-menu" onClick={onToggleMenu} aria-label="More actions">
        <Ellipsis size={15} />
      </button>

      {menuOpen ? (
        <div ref={menuRef} className="f-menu" style={{ position: 'absolute', top: 40, right: 10 }}>
          <button onClick={onOpen}>
            <FolderOpen size={14} /> Open
          </button>
          <button onClick={onRename}>
            <Pencil size={14} /> Rename
          </button>
          <button onClick={onDuplicate}>
            <Copy size={14} /> Duplicate
          </button>
          <hr className="f-divider" />
          <button data-danger="true" onClick={onDelete}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      ) : null}

      <div className="f-card-body">
        <h3>{project.name}</h3>
        <div className="f-card-meta">
          {damaged ? (
            <span style={{ color: 'var(--f-danger)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <TriangleAlert size={12} /> Damaged data
            </span>
          ) : (
            <>
              <span>{formatRelativeTime(project.updatedAt)}</span>
              <span>·</span>
              <span>
                {project.pageCount} page{project.pageCount === 1 ? '' : 's'}
              </span>
            </>
          )}
        </div>
        <div className="f-card-actions">
          <button className="f-btn f-btn-secondary f-btn-sm f-btn-block" onClick={onOpen}>
            Open
          </button>
        </div>
      </div>
    </article>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div
      className="f-empty"
      style={{
        padding: '72px 24px',
        background: 'var(--f-panel)',
        border: '1px dashed var(--f-border-strong)',
        borderRadius: 16,
      }}
    >
      <div className="f-canvas-empty-mark">
        <Layers size={24} />
      </div>
      <strong>No websites yet</strong>
      <p style={{ maxWidth: 340, lineHeight: 1.6 }}>
        Start from one of five ready-made templates, or from a blank page. You can change everything
        later.
      </p>
      <button className="f-btn f-btn-gradient" onClick={onCreate} style={{ marginTop: 6 }}>
        <Plus size={16} />
        Create your first website
      </button>
    </div>
  );
}

function RenameDialog({
  summary,
  onClose,
  onSave,
}: {
  summary: ProjectSummary;
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(summary.name);
  return (
    <Modal
      title="Rename website"
      onClose={onClose}
      footer={
        <>
          <button className="f-btn f-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="f-btn f-btn-primary" onClick={() => void onSave(name)}>
            Save
          </button>
        </>
      }
    >
      <label className="f-label">Website name</label>
      <input
        className="f-input"
        value={name}
        autoFocus
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => event.key === 'Enter' && void onSave(name)}
      />
    </Modal>
  );
}
