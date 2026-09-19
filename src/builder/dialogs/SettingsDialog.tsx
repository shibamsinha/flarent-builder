import { Field, Modal, Switch } from '@/components/ui';
import { useEditorStore } from '@/store/editorStore';
import { ImageControl } from '@/builder/inspector/controls';

export function SettingsDialog({ onClose }: { onClose: () => void }) {
  const project = useEditorStore((s) => s.project);
  const setSettings = useEditorStore((s) => s.setSettings);
  if (!project) return null;

  const { settings } = project;

  return (
    <Modal
      title="Site settings"
      description="Applies to every page of the website."
      onClose={onClose}
      footer={
        <button className="f-btn f-btn-primary" onClick={onClose}>
          Done
        </button>
      }
    >
      <Field label="Site name" help="Used in page titles and the default footer.">
        <input
          className="f-input"
          value={settings.siteName}
          onChange={(event) => setSettings({ siteName: event.target.value })}
        />
      </Field>

      <Field label="Site description" help="The default meta description for pages that do not set one.">
        <textarea
          className="f-textarea"
          rows={2}
          value={settings.description}
          onChange={(event) => setSettings({ description: event.target.value })}
        />
      </Field>

      <div className="f-field-grid-2">
        <Field label="Language">
          <input
            className="f-input"
            value={settings.language}
            placeholder="en"
            onChange={(event) => setSettings({ language: event.target.value })}
          />
        </Field>
        <Field label="Site address" help="Used for canonical URLs and the sitemap.">
          <input
            className="f-input"
            value={settings.baseUrl}
            placeholder="https://example.com"
            onChange={(event) => setSettings({ baseUrl: event.target.value })}
          />
        </Field>
      </div>

      <hr className="f-divider" />

      <div className="f-field-grid-2">
        <Field label="Favicon" help="A square image, ideally 512×512.">
          <ImageControl
            value={settings.faviconAssetId ?? ''}
            onChange={(value) => setSettings({ faviconAssetId: stripRef(value) })}
          />
        </Field>
        <Field label="Social share image" help="Shown when a link to your site is posted.">
          <ImageControl
            value={settings.socialImageAssetId ?? ''}
            onChange={(value) => setSettings({ socialImageAssetId: stripRef(value) })}
          />
        </Field>
      </div>

      <hr className="f-divider" />

      <Field
        label="Form endpoint"
        help="Optional. An HTTPS URL that published contact forms POST to. Leave empty and submissions are stored in the visitor's browser instead."
      >
        <input
          className="f-input"
          value={settings.formEndpoint ?? ''}
          placeholder="https://forms.example.com/submit"
          onChange={(event) => setSettings({ formEndpoint: event.target.value })}
        />
      </Field>

      <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
        <Switch
          checked={settings.robotsAllow}
          onChange={(value) => setSettings({ robotsAllow: value })}
        />
        Allow search engines to index this site
      </label>
    </Modal>
  );
}

/** Settings store bare asset ids; the image control speaks in `asset:` refs. */
function stripRef(value: string): string | undefined {
  if (!value) return undefined;
  return value.startsWith('asset:') ? value.slice(6) : value;
}
