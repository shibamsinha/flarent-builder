import { useState } from 'react';
import { Pipette, X } from 'lucide-react';
import { useClickOutside } from '@/components/ui';
import { colorTokens } from '@/engine/theme';
import { useEditorStore } from '@/store/editorStore';

const PRESETS = [
  'transparent', '#ffffff', '#f5f5f7', '#d4d4d8', '#71717a', '#27272a', '#000000',
  '#ef4444', '#f97316', '#f4b740', '#22c55e', '#0ea5e9', '#6366f1', '#ec4899',
];

/**
 * Colour input that prefers theme tokens over raw values. Picking "Primary"
 * stores `var(--fl-color-primary)`, so a later theme change flows through.
 */
export function ColorControl({
  value,
  onChange,
  allowTokens = true,
  allowClear = false,
}: {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  allowTokens?: boolean;
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const theme = useEditorStore((s) => s.project?.theme);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const tokens = theme && allowTokens ? colorTokens(theme) : [];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div className="f-color">
        <button
          type="button"
          className="f-color-swatch"
          onClick={() => setOpen((o) => !o)}
          aria-label="Choose colour"
        >
          <span style={{ background: displayColor(value, theme?.colors as ColorMap) }} />
        </button>
        <input
          className="f-input"
          value={value ?? ''}
          placeholder="inherit"
          onChange={(event) => onChange(event.target.value || undefined)}
        />
        {allowClear && value ? (
          <button
            type="button"
            className="f-btn f-btn-ghost f-btn-icon"
            onClick={() => onChange(undefined)}
            aria-label="Clear colour"
          >
            <X size={14} />
          </button>
        ) : null}
      </div>

      {open ? (
        <div className="f-color-pop">
          {tokens.length > 0 ? (
            <>
              <p className="f-label">Theme colours</p>
              <div className="f-color-tokens" style={{ gridTemplateColumns: 'repeat(8, 1fr)' }}>
                {tokens.map((token) => (
                  <button
                    key={token.cssVar}
                    type="button"
                    className="f-color-token"
                    title={token.label}
                    data-active={value === token.reference}
                    style={{ background: token.value }}
                    onClick={() => {
                      onChange(token.reference);
                      setOpen(false);
                    }}
                  />
                ))}
              </div>
            </>
          ) : null}

          <p className="f-label">Presets</p>
          <div className="f-color-tokens">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                className="f-color-token"
                title={preset}
                data-active={value === preset}
                style={{
                  background: preset === 'transparent' ? 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 50%/8px 8px' : preset,
                }}
                onClick={() => {
                  onChange(preset);
                  setOpen(false);
                }}
              />
            ))}
          </div>

          <p className="f-label" style={{ marginTop: 10 }}>
            <Pipette size={11} style={{ verticalAlign: -1, marginRight: 4 }} />
            Custom
          </p>
          <input
            className="f-color-native"
            type="color"
            value={toHex(value, theme?.colors as ColorMap) ?? '#7217b2'}
            onChange={(event) => onChange(event.target.value)}
          />
        </div>
      ) : null}
    </div>
  );
}

type ColorMap = Record<string, string> | undefined;

function displayColor(value: string | undefined, colors?: ColorMap): string {
  if (!value) return 'transparent';
  const token = value.match(/var\(--fl-color-([a-z]+)\)/);
  if (token && colors) return colors[token[1]] ?? 'transparent';
  return value;
}

function toHex(value: string | undefined, colors?: ColorMap): string | undefined {
  const resolved = displayColor(value, colors);
  return /^#[0-9a-f]{6}$/i.test(resolved) ? resolved : undefined;
}
