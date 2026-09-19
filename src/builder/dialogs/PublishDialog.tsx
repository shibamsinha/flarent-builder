import { useState } from 'react';
import { Check, CircleAlert, FileDown, Globe, Loader, Rocket } from 'lucide-react';
import { Modal } from '@/components/ui';
import { useEditorStore } from '@/store/editorStore';
import { formatBytes, getPublisher, type PublishResult } from '@/services/publishing';
import { countNodes } from '@/engine/commands/tree';

export function PublishDialog({ onClose }: { onClose: () => void }) {
  const project = useEditorStore((s) => s.project);
  const saveNow = useEditorStore((s) => s.saveNow);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<PublishResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!project) return null;

  const elementCount = project.pages.reduce((total, page) => total + countNodes(page.nodes), 0);

  async function publish() {
    setBusy(true);
    setError(null);
    try {
      await saveNow();
      setResult(await getPublisher().publish(project!));
    } catch (caught) {
      console.error(caught);
      setError(caught instanceof Error ? caught.message : 'The website could not be exported.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title="Publish website"
      description="Flarent builds your project into a complete static website you can host anywhere."
      onClose={onClose}
      footer={
        <>
          <button className="f-btn f-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="f-btn f-btn-primary" onClick={() => void publish()} disabled={busy}>
            {busy ? <Loader size={15} className="f-spin" /> : <FileDown size={15} />}
            {busy ? 'Building…' : 'Build & download'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <Stat label="Pages" value={String(project.pages.length)} />
        <Stat label="Elements" value={String(elementCount)} />
        <Stat label="Images" value={String(project.assets.length)} />
      </div>

      <div>
        <h3 style={{ fontSize: 13, marginBottom: 8 }}>What gets built</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 7, fontSize: 13, color: 'var(--f-text-2)' }}>
          {project.pages.map((page) => (
            <li key={page.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={13} style={{ color: 'var(--f-success)' }} />
              <code style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>
                {page.isHome ? 'index.html' : `${page.slug}/index.html`}
              </code>
              <span style={{ color: 'var(--f-muted)' }}>{page.name}</span>
            </li>
          ))}
          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={13} style={{ color: 'var(--f-success)' }} />
            <code style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>styles.css</code>
            <span style={{ color: 'var(--f-muted)' }}>theme, layout and responsive rules</span>
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Check size={13} style={{ color: 'var(--f-success)' }} />
            <code style={{ fontFamily: 'var(--f-mono)', fontSize: 12 }}>sitemap.xml, robots.txt</code>
            <span style={{ color: 'var(--f-muted)' }}>generated from your pages</span>
          </li>
        </ul>
      </div>

      {!project.settings.baseUrl || project.settings.baseUrl.includes('example.com') ? (
        <div className="f-inherit-note" style={{ background: '#fff8e8', color: 'var(--f-warn)' }}>
          <CircleAlert size={14} />
          Set your real site address in Site settings so canonical URLs and the sitemap are correct.
        </div>
      ) : null}

      {error ? (
        <div className="f-inherit-note" style={{ background: 'var(--f-danger-soft)', color: 'var(--f-danger)' }}>
          <CircleAlert size={14} />
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="f-inherit-note" style={{ background: '#eaf8f1', color: 'var(--f-success)' }}>
          <Rocket size={14} />
          {result.message} Unzip it and upload the contents to any static host.
        </div>
      ) : null}

      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
          padding: 12,
          borderRadius: 10,
          background: 'var(--f-panel-2)',
          border: '1px solid var(--f-border)',
        }}
      >
        <Globe size={16} style={{ color: 'var(--f-brand)', flex: 'none', marginTop: 2 }} />
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'var(--f-muted)' }}>
          The exported site is plain HTML and CSS. No editor code ships with it. Flarent Hosting with
          custom domains and one-click deploys will publish to the same build.
        </p>
      </div>
    </Modal>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: '12px 14px',
        borderRadius: 11,
        background: 'var(--f-brand-softer)',
        border: '1px solid var(--f-border)',
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: 'var(--f-muted)' }}>{label}</div>
    </div>
  );
}

export { formatBytes };
