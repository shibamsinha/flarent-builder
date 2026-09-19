import { useState } from 'react';
import { Loader, Sparkles } from 'lucide-react';
import { Field, Modal } from '@/components/ui';
import { TEMPLATES } from '@/templates';

export function TemplatePicker({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (templateId: string, name: string) => Promise<void>;
}) {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const selected = TEMPLATES.find((t) => t.id === templateId);

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      await onCreate(templateId, name.trim() || selected?.name || 'My website');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      wide
      title="Create a website"
      description="Pick a starting point. Everything in a template is editable, because they are built from the same components you drag onto the canvas."
      onClose={onClose}
      footer={
        <>
          <button className="f-btn f-btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="f-btn f-btn-primary" onClick={submit} disabled={busy}>
            {busy ? <Loader size={15} className="f-spin" /> : <Sparkles size={15} />}
            {busy ? 'Building…' : 'Create website'}
          </button>
        </>
      }
    >
      <Field label="Website name">
        <input
          className="f-input"
          value={name}
          placeholder={selected?.name ?? 'My website'}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && void submit()}
          autoFocus
        />
      </Field>

      <div>
        <label className="f-label">Template</label>
        <div className="f-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {TEMPLATES.map((template) => (
            <button
              key={template.id}
              type="button"
              className="f-tpl"
              data-selected={template.id === templateId}
              onClick={() => setTemplateId(template.id)}
              onDoubleClick={() => void submit()}
            >
              <TemplateThumb from={template.accent[0]} to={template.accent[1]} />
              <div className="f-tpl-body">
                <h4>{template.name}</h4>
                <p>{template.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
}

/** A miniature of a real page layout, drawn from the template's own colours. */
export function TemplateThumb({ from, to }: { from: string; to: string }) {
  return (
    <div className="f-tpl-thumb" style={{ background: from }}>
      <span
        style={{
          position: 'absolute',
          inset: 0,
          width: '38%',
          marginLeft: 'auto',
          background: to,
          borderLeft: '2px solid #0a0a0a',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '12px 14px -20px',
          background: '#fff',
          border: '2px solid #0a0a0a',
          borderBottom: 'none',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 22, height: 5, background: from }} />
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <i key={i} style={{ display: 'block', width: 10, height: 3, background: '#0a0a0a', opacity: 0.3 }} />
            ))}
          </span>
        </div>
        <span style={{ height: 9, width: '68%', background: '#0a0a0a' }} />
        <span style={{ height: 4, width: '86%', background: '#0a0a0a', opacity: 0.22 }} />
        <span style={{ height: 4, width: '74%', background: '#0a0a0a', opacity: 0.22 }} />
        <div style={{ display: 'flex', gap: 5, marginTop: 3 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ flex: 1, height: 22, border: '1.5px solid #0a0a0a', background: i === 1 ? from : 'transparent' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
