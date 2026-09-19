import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Check, CircleAlert, Cloud, Eye, Monitor, Redo2, Rocket, Settings, Smartphone, Tablet,
  Undo2,
} from 'lucide-react';
import type { DeviceId } from '@/types/project';
import { Segmented } from '@/components/ui';
import { useEditorStore } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';

const DEVICE_ICONS: Record<DeviceId, React.ReactNode> = {
  desktop: <Monitor size={14} />,
  tablet: <Tablet size={14} />,
  mobile: <Smartphone size={14} />,
};

export function TopBar() {
  const navigate = useNavigate();
  const project = useEditorStore((s) => s.project);
  const device = useEditorStore((s) => s.device);
  const setDevice = useEditorStore((s) => s.setDevice);
  const saveState = useEditorStore((s) => s.saveState);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const past = useEditorStore((s) => s.past.length);
  const future = useEditorStore((s) => s.future.length);
  const rename = useEditorStore((s) => s.renameProject);
  const saveNow = useEditorStore((s) => s.saveNow);
  const openDialog = useUiStore((s) => s.openDialog);

  if (!project) return null;

  return (
    <header className="f-topbar">
      <button
        className="f-btn f-btn-ghost f-btn-icon"
        title="Back to my websites"
        onClick={async () => {
          await saveNow();
          navigate('/');
        }}
      >
        <ArrowLeft size={16} />
      </button>

      <span className="f-logo">
        <span className="f-logo-mark">F</span>
        Flarent
      </span>

      <div className="f-project-name">
        <input
          value={project.name}
          onChange={(event) => rename(event.target.value)}
          aria-label="Website name"
        />
        <SaveIndicator state={saveState} />
      </div>

      <div className="f-topbar-group" style={{ marginLeft: 10 }}>
        <button
          className="f-btn f-btn-ghost f-btn-icon"
          onClick={undo}
          disabled={past === 0}
          title="Undo (Cmd/Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          className="f-btn f-btn-ghost f-btn-icon"
          onClick={redo}
          disabled={future === 0}
          title="Redo (Cmd/Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
      </div>

      <div className="f-topbar-center">
        <Segmented
          value={device}
          onChange={(next) => setDevice(next as DeviceId)}
          options={[
            { value: 'desktop', label: DEVICE_ICONS.desktop, title: 'Desktop' },
            { value: 'tablet', label: DEVICE_ICONS.tablet, title: 'Tablet' },
            { value: 'mobile', label: DEVICE_ICONS.mobile, title: 'Mobile' },
          ]}
        />
      </div>

      <div className="f-topbar-group f-topbar-right">
        <button
          className="f-btn f-btn-ghost f-btn-icon"
          title="Site settings"
          onClick={() => openDialog('settings')}
        >
          <Settings size={16} />
        </button>
        <button
          className="f-btn f-btn-secondary"
          onClick={async () => {
            await saveNow();
            window.open(`/preview/${project.id}`, '_blank', 'noopener');
          }}
        >
          <Eye size={15} />
          Preview
        </button>
        <button className="f-btn f-btn-gradient" onClick={() => openDialog('publish')}>
          <Rocket size={15} />
          Publish
        </button>
      </div>
    </header>
  );
}

function SaveIndicator({ state }: { state: 'saved' | 'saving' | 'unsaved' | 'error' }) {
  if (state === 'saving') {
    return (
      <span className="f-save" data-state="saving">
        <Cloud size={13} className="f-spin" />
        Saving…
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span className="f-save" data-state="error">
        <CircleAlert size={13} />
        Not saved
      </span>
    );
  }
  if (state === 'unsaved') {
    return (
      <span className="f-save" data-state="unsaved">
        <Cloud size={13} />
        Unsaved changes
      </span>
    );
  }
  return (
    <span className="f-save" data-state="saved">
      <Check size={13} />
      Saved
    </span>
  );
}
