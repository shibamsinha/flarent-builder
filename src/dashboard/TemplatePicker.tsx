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
      description="Pick a starting point. Everything in a template is editable — they are built from the same components you drag onto the canvas."
      onClose={onClose}
      footer={
        <>
          <button className="f-btn f-btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="f-btn f-btn-gradient" onClick={submit} disabled={busy}>
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
    <div className="f-tpl-thumb" style={{ background: `linear-gradient(130deg, ${from}, ${to})` }}>
      <div
        style={{
          position: 'absolute',
          inset: '12px 14px -20px',
          background: '#fff',
          borderRadius: '6px 6px 0 0',
          boxShadow: '0 14px 28px -14px rgba(0,0,0,.5)',
          padding: 8,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 22, height: 5, borderRadius: 3, background: from, opacity: 0.85 }} />
          <span style={{ marginLeft: 'auto', display: 'flex', gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <i key={i} style={{ display: 'block', width: 10, height: 3, borderRadius: 2, background: '#e6e2ed' }} />
            ))}
          </span>
        </div>
        <span style={{ height: 9, width: '68%', borderRadius: 3, background: '#2a2532', opacity: 0.85 }} />
        <span style={{ height: 4, width: '86%', borderRadius: 3, background: '#ddd8e4' }} />
        <span style={{ height: 4, width: '74%', borderRadius: 3, background: '#ddd8e4' }} />
        <div style={{ display: 'flex', gap: 5, marginTop: 3 }}>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ flex: 1, height: 22, borderRadius: 4, background: i === 1 ? `${from}22` : '#f1eef6' }} />
          ))}
        </div>
      </div>
    </div>
  );
}
