import { Field } from '@/components/ui';
import { FONT_OPTIONS, familyName } from '@/engine/theme';
import { useEditorStore } from '@/store/editorStore';
import { ColorControl } from '@/builder/inspector/ColorControl';

const COLOR_LABELS: Record<string, string> = {
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  background: 'Background',
  surface: 'Surface',
  text: 'Text',
  muted: 'Muted text',
  border: 'Borders',
};

/**
 * Theme tokens are the fastest way to restyle a whole site: every component
 * that references a token updates the moment it changes.
 */
export function ThemePanel() {
  const theme = useEditorStore((s) => s.project?.theme);
  const setTheme = useEditorStore((s) => s.setTheme);
  if (!theme) return null;

  return (
    <>
      <div className="f-panel-head">
        <h2>Theme</h2>
      </div>
      <div className="f-panel-body f-scroll" style={{ padding: '4px 14px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <section>
          <h3 className="f-cat-title" style={{ padding: '0 0 8px' }}>
            Colours
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {Object.entries(theme.colors).map(([key, value]) => (
              <Field key={key} label={COLOR_LABELS[key] ?? key} inline>
                <ColorControl
                  value={value}
                  allowTokens={false}
                  onChange={(next) =>
                    setTheme({ colors: { [key]: next } as never }, `theme-color-${key}`)
                  }
                />
              </Field>
            ))}
          </div>
        </section>

        <hr className="f-divider" />

        <section style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <h3 className="f-cat-title" style={{ padding: 0 }}>
            Typography
          </h3>
          <Field label="Heading font">
            <select
              className="f-select"
              value={familyName(theme.typography.headingFont)}
              onChange={(event) =>
                setTheme({ typography: { headingFont: `${event.target.value}, sans-serif` } })
              }
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Body font">
            <select
              className="f-select"
              value={familyName(theme.typography.bodyFont)}
              onChange={(event) =>
                setTheme({ typography: { bodyFont: `${event.target.value}, sans-serif` } })
              }
            >
              {FONT_OPTIONS.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>
          </Field>
        </section>

        <hr className="f-divider" />

        <section style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <h3 className="f-cat-title" style={{ padding: 0 }}>
            Shape &amp; width
          </h3>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Field key={size} label={`Radius ${size}`} inline>
              <input
                className="f-input"
                type="number"
                min={0}
                max={60}
                value={theme.radius[size]}
                onChange={(event) =>
                  setTheme({ radius: { [size]: Number(event.target.value) } as never }, `theme-radius-${size}`)
                }
              />
            </Field>
          ))}
          <Field label="Content width" inline help="Maximum width of centred containers.">
            <input
              className="f-input"
              type="number"
              min={640}
              max={1600}
              step={20}
              value={theme.containerWidth}
              onChange={(event) => setTheme({ containerWidth: Number(event.target.value) }, 'theme-width')}
            />
          </Field>
        </section>
      </div>
    </>
  );
}
