import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Loader, TriangleAlert } from 'lucide-react';
import { useCurrentPage, useEditorStore } from '@/store/editorStore';
import { EditorShell } from './EditorShell';

export function EditorRoute() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = useEditorStore((s) => s.project);
  const loadState = useEditorStore((s) => s.loadState);
  const loadError = useEditorStore((s) => s.loadError);
  const openProject = useEditorStore((s) => s.openProject);
  const closeProject = useEditorStore((s) => s.closeProject);
  const page = useCurrentPage();

  useEffect(() => {
    if (!projectId) return;
    void openProject(projectId);
    return () => closeProject();
  }, [projectId, openProject, closeProject]);

  // Never lose work to an accidental tab close.
  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (useEditorStore.getState().saveState === 'unsaved') {
        void useEditorStore.getState().saveNow();
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  if (loadState === 'error') {
    return (
      <div className="f-center">
        <div className="f-state">
          <TriangleAlert size={26} style={{ color: 'var(--f-danger)' }} />
          <h2>This website could not be opened</h2>
          <p>{loadError}</p>
          <Link className="f-btn f-btn-secondary" to="/dashboard">
            <ArrowLeft size={15} /> Back to my websites
          </Link>
        </div>
      </div>
    );
  }

  if (loadState !== 'ready' || !project || !page) {
    return (
      <div className="f-center">
        <div className="f-state">
          <Loader size={22} className="f-spin" style={{ color: 'var(--f-brand)' }} />
          <p>Opening your website…</p>
        </div>
      </div>
    );
  }

  return <EditorShell project={project} page={page} />;
}
