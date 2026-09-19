import {
  AlignLeft, AlignVerticalSpaceAround, Bold, Italic, Move, StretchHorizontal, Underline,
} from 'lucide-react';
import type { StyleKey, StyleValue } from '@/types/styles';
import { Field, NumberInput, OptionGrid, Segmented, Switch } from '@/components/ui';
import { DEVICES } from '@/engine/responsive';
import { FONT_OPTIONS, familyName } from '@/engine/theme';
import { useEditorStore } from '@/store/editorStore';
import type { BuilderNode } from '@/types/project';
import { ColorControl } from './ColorControl';
import { StyleGroup } from './StyleGroup';
import type { NodeStyles } from './useNodeStyles';

/* ------------------------------ primitives ------------------------------ */

function OverrideDot({ styles, keyName }: { styles: NodeStyles; keyName: StyleKey }) {
  if (styles.device === 'desktop' || !styles.isOwn(keyName)) return null;
  return <span className="f-override" title={`Overridden on ${styles.device}`} />;
}

/** Free-form CSS length input: accepts `auto`, `100%`, `24px`, `24`. */
function Dimension({
  label,
  styles,
  keyName,
  placeholder,
}: {
  label: string;
  styles: NodeStyles;
  keyName: StyleKey;
  placeholder?: string;
}) {
  const value = styles.get(keyName);
  return (
    <Field label={label} inline badge={<OverrideDot styles={styles} keyName={keyName} />}>
      <input
        className="f-input"
        value={value === undefined ? '' : String(value)}
        placeholder={placeholder ?? 'auto'}
        onChange={(event) => {
          const raw = event.target.value.trim();
          if (raw === '') return styles.set(keyName, undefined, false);
          styles.set(keyName, /^-?\d+(\.\d+)?$/.test(raw) ? Number(raw) : raw);
        }}
      />
    </Field>
  );
}

function Num({
  label,
  styles,
  keyName,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  styles: NodeStyles;
  keyName: StyleKey;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <Field label={label} inline badge={<OverrideDot styles={styles} keyName={keyName} />}>
      <NumberInput
        value={styles.getNumber(keyName)}
        min={min}
        max={max}
        step={step}
        unit={unit}
        onChange={(next) => styles.set(keyName, next)}
      />
    </Field>
  );
}

function Choice({
  label,
  styles,
  keyName,
  options,
  fallback,
}: {
  label: string;
  styles: NodeStyles;
  keyName: StyleKey;
  options: { label: string; value: string }[];
  fallback?: string;
}) {
  return (
    <Field label={label} inline badge={<OverrideDot styles={styles} keyName={keyName} />}>
      <select
        className="f-select"
        value={String(styles.get(keyName) ?? fallback ?? '')}
        onChange={(event) =>
          styles.set(keyName, event.target.value === '' ? undefined : event.target.value, false)
        }
      >
        <option value="">Default</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/* -------------------------------- groups -------------------------------- */

export function LayoutGroup({ styles }: { styles: NodeStyles }) {
  const display = String(styles.get('display') ?? 'block');
  const isFlex = display === 'flex' || display === 'inline-flex';
  const isGrid = display === 'grid';

  return (
    <StyleGroup title="Layout" defaultOpen>
      <Choice
        label="Display"
        styles={styles}
        keyName="display"
        options={[
          { label: 'Block', value: 'block' },
          { label: 'Flex', value: 'flex' },
          { label: 'Inline flex', value: 'inline-flex' },
          { label: 'Grid', value: 'grid' },
          { label: 'Inline block', value: 'inline-block' },
          { label: 'Hidden', value: 'none' },
        ]}
      />

      {isFlex ? (
        <>
          <Field label="Direction" inline>
            <Segmented
              value={String(styles.get('flexDirection') ?? 'row')}
              onChange={(next) => styles.set('flexDirection', next, false)}
              options={[
                { value: 'row', label: <StretchHorizontal size={13} />, title: 'Row' },
                { value: 'column', label: <AlignVerticalSpaceAround size={13} />, title: 'Column' },
              ]}
            />
          </Field>
          <Choice
            label="Justify"
            styles={styles}
            keyName="justifyContent"
            options={[
              { label: 'Start', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'flex-end' },
              { label: 'Space between', value: 'space-between' },
              { label: 'Space around', value: 'space-around' },
            ]}
          />
          <Choice
            label="Align"
            styles={styles}
            keyName="alignItems"
            options={[
              { label: 'Start', value: 'flex-start' },
              { label: 'Center', value: 'center' },
              { label: 'End', value: 'flex-end' },
              { label: 'Stretch', value: 'stretch' },
              { label: 'Baseline', value: 'baseline' },
            ]}
          />
          <Choice
            label="Wrap"
            styles={styles}
            keyName="flexWrap"
            options={[
              { label: 'No wrap', value: 'nowrap' },
              { label: 'Wrap', value: 'wrap' },
            ]}
          />
        </>
      ) : null}

      {isGrid ? (
        <Dimension label="Columns" styles={styles} keyName="gridTemplateColumns" placeholder="repeat(3, 1fr)" />
      ) : null}

      {isFlex || isGrid ? <Num label="Gap" styles={styles} keyName="gap" min={0} max={200} unit="px" /> : null}

      <Choice
        label="Position"
        styles={styles}
        keyName="position"
        options={[
          { label: 'Static', value: 'static' },
          { label: 'Relative', value: 'relative' },
          { label: 'Absolute', value: 'absolute' },
          { label: 'Sticky', value: 'sticky' },
          { label: 'Fixed', value: 'fixed' },
        ]}
      />
      {styles.get('position') && styles.get('position') !== 'static' ? (
        <div className="f-field-grid-4">
          <Num label="Top" styles={styles} keyName="top" />
          <Num label="Right" styles={styles} keyName="right" />
          <Num label="Bottom" styles={styles} keyName="bottom" />
          <Num label="Left" styles={styles} keyName="left" />
        </div>
      ) : null}
    </StyleGroup>
  );
}

export function SizeGroup({ styles }: { styles: NodeStyles }) {
  return (
    <StyleGroup title="Size">
      <div className="f-field-grid-2">
        <Dimension label="Width" styles={styles} keyName="width" />
        <Dimension label="Height" styles={styles} keyName="height" />
      </div>
      <div className="f-field-grid-2">
        <Dimension label="Min W" styles={styles} keyName="minWidth" />
        <Dimension label="Max W" styles={styles} keyName="maxWidth" />
      </div>
      <div className="f-field-grid-2">
        <Dimension label="Min H" styles={styles} keyName="minHeight" />
        <Dimension label="Max H" styles={styles} keyName="maxHeight" />
      </div>
      <Choice
        label="Overflow"
        styles={styles}
        keyName="overflow"
        options={[
          { label: 'Visible', value: 'visible' },
          { label: 'Hidden', value: 'hidden' },
          { label: 'Auto', value: 'auto' },
          { label: 'Scroll', value: 'scroll' },
        ]}
      />
      <Dimension label="Ratio" styles={styles} keyName="aspectRatio" placeholder="16 / 9" />
    </StyleGroup>
  );
}

export function SpacingGroup({ styles }: { styles: NodeStyles }) {
  const pad: StyleKey[] = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'];
  const margin: StyleKey[] = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'];

  return (
    <StyleGroup title="Spacing" defaultOpen>
      <div>
        <label className="f-label">Padding</label>
        <div className="f-spacing-box">
          {pad.map((key) => (
            <NumberInput
              key={key}
              value={styles.getNumber(key)}
              min={0}
              onChange={(next) => styles.set(key, next)}
            />
          ))}
        </div>
        <div className="f-spacing-legend" style={{ marginTop: 4 }}>
          <span>Top</span>
          <span>Right</span>
          <span>Bottom</span>
          <span>Left</span>
        </div>
      </div>

      <div>
        <label className="f-label">Margin</label>
        <div className="f-spacing-box">
          {margin.map((key) => (
            <input
              key={key}
              className="f-input"
              style={{ textAlign: 'center' }}
              value={styles.get(key) === undefined ? '' : String(styles.get(key))}
              placeholder="0"
              onChange={(event) => {
                const raw = event.target.value.trim();
                if (raw === '') return styles.set(key, undefined, false);
                styles.set(key, /^-?\d+$/.test(raw) ? Number(raw) : raw);
              }}
            />
          ))}
        </div>
        <div className="f-spacing-legend" style={{ marginTop: 4 }}>
          <span>Top</span>
          <span>Right</span>
          <span>Bottom</span>
          <span>Left</span>
        </div>
      </div>
    </StyleGroup>
  );
}

export function TypographyGroup({ styles }: { styles: NodeStyles }) {
  const current = String(styles.get('fontFamily') ?? '');
  const textAlign = String(styles.get('textAlign') ?? '');

  return (
    <StyleGroup title="Typography" defaultOpen>
      <Field label="Font" inline>
        <select
          className="f-select"
          value={current.includes('var(') ? current : familyName(current)}
          onChange={(event) => styles.set('fontFamily', event.target.value || undefined, false)}
        >
          <option value="">Default</option>
          <option value="var(--fl-font-heading)">Theme heading</option>
          <option value="var(--fl-font-body)">Theme body</option>
          {FONT_OPTIONS.map((font) => (
            <option key={font} value={`${font}, sans-serif`}>
              {font}
            </option>
          ))}
        </select>
      </Field>
      <div className="f-field-grid-2">
        <Num label="Size" styles={styles} keyName="fontSize" min={8} max={200} unit="px" />
        <Num label="Weight" styles={styles} keyName="fontWeight" min={100} max={900} step={100} />
      </div>
      <div className="f-field-grid-2">
        <Num label="Line" styles={styles} keyName="lineHeight" min={0.8} max={3} step={0.05} />
        <Dimension label="Spacing" styles={styles} keyName="letterSpacing" placeholder="0" />
      </div>

      <Field label="Align" badge={<OverrideDot styles={styles} keyName="textAlign" />}>
        <OptionGrid
          value={textAlign}
          onChange={(next) => styles.set('textAlign', next, false)}
          options={[
            { value: 'left', icon: <AlignLeft size={13} />, title: 'Left' },
            { value: 'center', icon: <AlignLeft size={13} style={{ transform: 'scaleX(-1)' }} />, title: 'Center' },
            { value: 'right', icon: <AlignLeft size={13} style={{ transform: 'rotate(180deg)' }} />, title: 'Right' },
            { value: 'justify', icon: <Move size={13} />, title: 'Justify' },
          ]}
        />
      </Field>

      <Field label="Style">
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className="f-btn f-btn-secondary f-btn-sm"
            data-active={styles.get('fontWeight') === 700}
            onClick={() => styles.set('fontWeight', styles.get('fontWeight') === 700 ? undefined : 700, false)}
            title="Bold"
          >
            <Bold size={13} />
          </button>
          <button
            className="f-btn f-btn-secondary f-btn-sm"
            onClick={() =>
              styles.set('fontStyle', styles.get('fontStyle') === 'italic' ? undefined : 'italic', false)
            }
            title="Italic"
          >
            <Italic size={13} />
          </button>
          <button
            className="f-btn f-btn-secondary f-btn-sm"
            onClick={() =>
              styles.set(
                'textDecoration',
                styles.get('textDecoration') === 'underline' ? undefined : 'underline',
                false,
              )
            }
            title="Underline"
          >
            <Underline size={13} />
          </button>
        </div>
      </Field>

      <Choice
        label="Transform"
        styles={styles}
        keyName="textTransform"
        options={[
          { label: 'None', value: 'none' },
          { label: 'UPPERCASE', value: 'uppercase' },
          { label: 'lowercase', value: 'lowercase' },
          { label: 'Capitalize', value: 'capitalize' },
        ]}
      />

      <Field label="Colour" badge={<OverrideDot styles={styles} keyName="color" />}>
        <ColorControl
          value={styles.get('color') as string | undefined}
          onChange={(next) => styles.set('color', next, false)}
          allowClear
        />
      </Field>
    </StyleGroup>
  );
}

export function BackgroundGroup({ styles }: { styles: NodeStyles }) {
  const image = String(styles.get('backgroundImage') ?? '');
  return (
    <StyleGroup title="Background">
      <Field label="Colour" badge={<OverrideDot styles={styles} keyName="backgroundColor" />}>
        <ColorControl
          value={styles.get('backgroundColor') as string | undefined}
          onChange={(next) => styles.set('backgroundColor', next, false)}
          allowClear
        />
      </Field>
      <Field
        label="Image or gradient"
        help="A CSS value, for example: linear-gradient(120deg, #7217b2, #ac13eb) or url(…)"
      >
        <textarea
          className="f-textarea"
          rows={2}
          style={{ fontFamily: 'var(--f-mono)', fontSize: 11.5 }}
          value={image}
          placeholder="none"
          onChange={(event) => styles.set('backgroundImage', event.target.value || undefined, false)}
        />
      </Field>
      {image ? (
        <>
          <Choice
            label="Size"
            styles={styles}
            keyName="backgroundSize"
            options={[
              { label: 'Cover', value: 'cover' },
              { label: 'Contain', value: 'contain' },
              { label: 'Auto', value: 'auto' },
            ]}
          />
          <Choice
            label="Position"
            styles={styles}
            keyName="backgroundPosition"
            options={[
              { label: 'Center', value: 'center' },
              { label: 'Top', value: 'top' },
              { label: 'Bottom', value: 'bottom' },
              { label: 'Left', value: 'left' },
              { label: 'Right', value: 'right' },
            ]}
          />
        </>
      ) : null}
    </StyleGroup>
  );
}

export function BorderGroup({ styles }: { styles: NodeStyles }) {
  return (
    <StyleGroup title="Border">
      <Choice
        label="Style"
        styles={styles}
        keyName="borderStyle"
        options={[
          { label: 'None', value: 'none' },
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' },
        ]}
      />
      <Num label="Width" styles={styles} keyName="borderWidth" min={0} max={40} unit="px" />
      <Field label="Colour" badge={<OverrideDot styles={styles} keyName="borderColor" />}>
        <ColorControl
          value={styles.get('borderColor') as string | undefined}
          onChange={(next) => styles.set('borderColor', next, false)}
          allowClear
        />
      </Field>
      <Dimension label="Radius" styles={styles} keyName="borderRadius" placeholder="0" />
      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
        {[
          ['None', 0],
          ['Small', 'var(--fl-radius-sm)'],
          ['Medium', 'var(--fl-radius-md)'],
          ['Large', 'var(--fl-radius-lg)'],
          ['Pill', 'var(--fl-radius-pill)'],
        ].map(([label, value]) => (
          <button
            key={label as string}
            className="f-btn f-btn-secondary f-btn-sm"
            onClick={() => styles.set('borderRadius', value as StyleValue, false)}
          >
            {label}
          </button>
        ))}
      </div>
    </StyleGroup>
  );
}

const SHADOWS: [string, string][] = [
  ['None', 'none'],
  ['Subtle', '0 1px 3px rgba(0,0,0,.08)'],
  ['Soft', '0 8px 24px -12px rgba(0,0,0,.25)'],
  ['Lifted', '0 20px 48px -24px rgba(0,0,0,.35)'],
  ['Deep', '0 32px 70px -30px rgba(0,0,0,.45)'],
];

export function EffectsGroup({ styles, node }: { styles: NodeStyles; node: BuilderNode }) {
  const setNodeAnimation = useEditorStore((s) => s.setNodeAnimation);
  const animation = node.animation ?? { type: 'none' as const, duration: 600, delay: 0 };

  return (
    <StyleGroup title="Effects">
      <Num label="Opacity" styles={styles} keyName="opacity" min={0} max={1} step={0.05} />
      <Field label="Shadow">
        <select
          className="f-select"
          value={String(styles.get('boxShadow') ?? '')}
          onChange={(event) => styles.set('boxShadow', event.target.value || undefined, false)}
        >
          <option value="">Default</option>
          {SHADOWS.map(([label, value]) => (
            <option key={label} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <Dimension label="Transform" styles={styles} keyName="transform" placeholder="none" />

      <hr className="f-divider" />

      <Field label="Animation" help="Plays when the published page loads.">
        <select
          className="f-select"
          value={animation.type}
          onChange={(event) =>
            setNodeAnimation(node.id, {
              ...animation,
              type: event.target.value as NonNullable<BuilderNode['animation']>['type'],
            })
          }
        >
          <option value="none">None</option>
          <option value="fade">Fade in</option>
          <option value="fade-up">Fade up</option>
          <option value="fade-down">Fade down</option>
          <option value="zoom-in">Zoom in</option>
          <option value="slide-left">Slide from right</option>
          <option value="slide-right">Slide from left</option>
        </select>
      </Field>
      {animation.type !== 'none' ? (
        <div className="f-field-grid-2">
          <Field label="Duration" inline>
            <NumberInput
              value={animation.duration}
              min={100}
              max={3000}
              step={50}
              unit="ms"
              onChange={(next) => setNodeAnimation(node.id, { ...animation, duration: next ?? 600 })}
            />
          </Field>
          <Field label="Delay" inline>
            <NumberInput
              value={animation.delay}
              min={0}
              max={3000}
              step={50}
              unit="ms"
              onChange={(next) => setNodeAnimation(node.id, { ...animation, delay: next ?? 0 })}
            />
          </Field>
        </div>
      ) : null}
    </StyleGroup>
  );
}

export function ResponsiveGroup({ node, styles }: { node: BuilderNode; styles: NodeStyles }) {
  const setNodeHidden = useEditorStore((s) => s.setNodeHidden);
  const device = useEditorStore((s) => s.device);
  const hasOverrides = !!node.styles?.[device];

  return (
    <StyleGroup
      title="Responsive"
      defaultOpen
      badge={hasOverrides && device !== 'desktop' ? <span className="f-chip">{device}</span> : null}
    >
      {device !== 'desktop' ? (
        <div className="f-inherit-note">
          Editing {device}. Values you change here apply to {device} and narrower only — everything else
          is inherited.
        </div>
      ) : (
        <div className="f-inherit-note">
          Editing desktop. These values are the base that tablet and mobile inherit from.
        </div>
      )}

      <Field label="Visible on">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {DEVICES.map((entry) => (
            <label
              key={entry.id}
              style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--f-text-2)' }}
            >
              <Switch
                checked={!node.hidden?.[entry.id]}
                onChange={(visible) => setNodeHidden(node.id, entry.id, !visible)}
              />
              {entry.label}
            </label>
          ))}
        </div>
      </Field>

      {device !== 'desktop' && hasOverrides ? (
        <button className="f-btn f-btn-secondary f-btn-sm f-btn-block" onClick={styles.clearAll}>
          Reset {device} overrides
        </button>
      ) : null}
    </StyleGroup>
  );
}
