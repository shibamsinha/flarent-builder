import { useState } from 'react';
import {
  ChevronDown, ChevronUp, Copy, ImagePlus, Plus, Search, Trash2, X,
} from 'lucide-react';
import type { InspectorField, ListField } from '@/engine/registry/types';
import type { LinkValue, ListItem } from '@/types/props';
import { toAssetRef } from '@/types/props';
import { ICON_LIBRARY, ICON_NAMES } from '@/engine/registry/components/icons';
import { Field, Modal, Switch, useClickOutside } from '@/components/ui';
import { useEditorStore } from '@/store/editorStore';
import { AssetsPanel } from '@/builder/assets/AssetsPanel';
import { ColorControl } from './ColorControl';

/* ------------------------------ visibility ------------------------------ */

export function isFieldVisible(field: InspectorField, props: Record<string, unknown>): boolean {
  if (!field.when) return true;
  const value = props[field.when.key];
  if (field.when.notEmpty) return value !== undefined && value !== null && value !== '';
  return (field.when.equals ?? []).includes(value);
}

/* -------------------------------- link ---------------------------------- */

export function LinkControl({
  value,
  onChange,
}: {
  value: LinkValue;
  onChange: (value: LinkValue) => void;
}) {
  const pages = useEditorStore((s) => s.project?.pages ?? []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <select
        className="f-select"
        value={value.kind}
        onChange={(event) => onChange({ ...value, kind: event.target.value as LinkValue['kind'] })}
      >
        <option value="none">No link</option>
        <option value="page">Page on this site</option>
        <option value="url">External URL</option>
        <option value="anchor">Section on this page</option>
        <option value="email">Email address</option>
        <option value="phone">Phone number</option>
      </select>

      {value.kind === 'page' ? (
        <select
          className="f-select"
          value={value.pageId ?? ''}
          onChange={(event) => onChange({ ...value, pageId: event.target.value })}
        >
          <option value="">Choose a page…</option>
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.name}
            </option>
          ))}
        </select>
      ) : null}

      {value.kind === 'url' ? (
        <input
          className="f-input"
          placeholder="https://example.com"
          value={value.url ?? ''}
          onChange={(event) => onChange({ ...value, url: event.target.value })}
        />
      ) : null}

      {value.kind === 'anchor' ? (
        <input
          className="f-input"
          placeholder="section-id"
          value={value.anchor ?? ''}
          onChange={(event) => onChange({ ...value, anchor: event.target.value })}
        />
      ) : null}

      {value.kind === 'email' || value.kind === 'phone' ? (
        <input
          className="f-input"
          placeholder={value.kind === 'email' ? 'hello@example.com' : '+1 555 010 2030'}
          value={value.value ?? ''}
          onChange={(event) => onChange({ ...value, value: event.target.value })}
        />
      ) : null}

      {value.kind !== 'none' && value.kind !== 'anchor' ? (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--f-text-2)' }}>
          <Switch checked={value.newTab ?? false} onChange={(next) => onChange({ ...value, newTab: next })} />
          Open in a new tab
        </label>
      ) : null}
    </div>
  );
}

/* ------------------------------- image ---------------------------------- */

export function ImageControl({
  value,
  onChange,
  video,
}: {
  value: string;
  onChange: (value: string) => void;
  video?: boolean;
}) {
  const [picking, setPicking] = useState(false);
  const assetUrls = useEditorStore((s) => s.assetUrls);
  const preview = value.startsWith('asset:') ? assetUrls[value.slice(6)] : value;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <button
        type="button"
        className="f-asset"
        style={{ aspectRatio: '16/9', width: '100%' }}
        onClick={() => setPicking(true)}
      >
        {preview ? (
          video ? (
            <video src={preview} muted />
          ) : (
            <img src={preview} alt="" />
          )
        ) : (
          <span className="f-empty" style={{ padding: 12, fontSize: 11.5 }}>
            <ImagePlus size={18} />
            Choose {video ? 'a video' : 'an image'}
          </span>
        )}
      </button>

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          className="f-input"
          placeholder="…or paste a URL"
          value={value.startsWith('asset:') ? '' : value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button className="f-btn f-btn-ghost f-btn-icon" onClick={() => onChange('')} aria-label="Remove">
            <X size={14} />
          </button>
        ) : null}
      </div>

      {picking ? (
        <Modal title="Choose from your assets" onClose={() => setPicking(false)}>
          <div style={{ margin: '-18px' }}>
            <AssetsPanel
              onPick={(assetId) => {
                onChange(toAssetRef(assetId));
                setPicking(false);
              }}
            />
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

/* -------------------------------- icon ---------------------------------- */

export function IconControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));
  const Current = ICON_LIBRARY[value];
  const matches = ICON_NAMES.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="f-btn f-btn-secondary f-btn-block"
        style={{ justifyContent: 'flex-start' }}
        onClick={() => setOpen((o) => !o)}
      >
        {Current ? <Current size={15} /> : <Search size={15} />}
        {value || 'Choose an icon'}
        {value ? (
          <span
            role="button"
            tabIndex={0}
            style={{ marginLeft: 'auto', display: 'inline-flex' }}
            onClick={(event) => {
              event.stopPropagation();
              onChange('');
            }}
            onKeyDown={(event) => event.key === 'Enter' && onChange('')}
          >
            <X size={13} />
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="f-color-pop" style={{ width: 252 }}>
          <input
            className="f-input"
            placeholder="Search icons"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div className="f-icon-grid f-scroll">
            {matches.map((name) => {
              const Icon = ICON_LIBRARY[name];
              return (
                <button
                  key={name}
                  type="button"
                  title={name}
                  data-active={name === value}
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                >
                  <Icon size={16} />
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* -------------------------------- list ---------------------------------- */

export function ListControl({
  field,
  items,
  onChange,
  renderField,
}: {
  field: ListField;
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
  renderField: (
    field: InspectorField,
    value: unknown,
    onFieldChange: (next: unknown) => void,
    props: Record<string, unknown>,
  ) => React.ReactNode;
}) {
  const [openId, setOpenId] = useState<string | null>(items[0]?.id ?? null);

  const update = (id: string, patch: Record<string, unknown>) =>
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));

  const move = (index: number, delta: number) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      {items.map((item, index) => {
        const open = openId === item.id;
        const label = String(item[field.itemLabelKey] ?? `Item ${index + 1}`);
        return (
          <div key={item.id} className="f-list-item">
            <div className="f-list-head" onClick={() => setOpenId(open ? null : item.id)}>
              {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              <span>{label || `Item ${index + 1}`}</span>
              <span className="f-list-actions" onClick={(event) => event.stopPropagation()}>
                <button onClick={() => move(index, -1)} title="Move up" disabled={index === 0}>
                  <ChevronUp size={12} />
                </button>
                <button onClick={() => move(index, 1)} title="Move down" disabled={index === items.length - 1}>
                  <ChevronDown size={12} />
                </button>
                <button
                  onClick={() => {
                    const copy = { ...item, id: `${item.id}-${Math.random().toString(36).slice(2, 7)}` };
                    const next = [...items];
                    next.splice(index + 1, 0, copy);
                    onChange(next);
                  }}
                  title="Duplicate"
                >
                  <Copy size={12} />
                </button>
                <button onClick={() => onChange(items.filter((i) => i.id !== item.id))} title="Remove">
                  <Trash2 size={12} />
                </button>
              </span>
            </div>
            {open ? (
              <div className="f-list-body">
                {field.itemFields
                  .filter((sub) => isFieldVisible(sub, item))
                  .map((sub) => (
                    <div key={sub.key}>
                      {renderField(sub, item[sub.key], (next) => update(item.id, { [sub.key]: next }), item)}
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        );
      })}

      {!field.max || items.length < field.max ? (
        <button
          className="f-btn f-btn-secondary f-btn-sm f-btn-block"
          onClick={() => {
            const created = field.createItem() as ListItem;
            onChange([...items, created]);
            setOpenId(created.id);
          }}
        >
          <Plus size={13} /> {field.addLabel ?? 'Add item'}
        </button>
      ) : null}
    </div>
  );
}

/* ---------------------------- field dispatcher --------------------------- */

export function PropField({
  field,
  value,
  onChange,
  props,
}: {
  field: InspectorField;
  value: unknown;
  onChange: (next: unknown) => void;
  props: Record<string, unknown>;
}): React.ReactElement {
  const renderNested = (
    nested: InspectorField,
    nestedValue: unknown,
    nestedChange: (next: unknown) => void,
    nestedProps: Record<string, unknown>,
  ) => (
    <PropField field={nested} value={nestedValue} onChange={nestedChange} props={nestedProps} />
  );

  switch (field.type) {
    case 'textarea':
    case 'richtext':
      return (
        <Field label={field.label} help={field.help}>
          <textarea
            className="f-textarea"
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );

    case 'embed':
      return (
        <Field label={field.label} help={field.help}>
          <textarea
            className="f-textarea"
            rows={3}
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange(extractSrc(event.target.value))}
            style={{ fontFamily: 'var(--f-mono)', fontSize: 11.5 }}
          />
        </Field>
      );

    case 'number':
      return (
        <Field label={field.label} help={field.help} inline>
          <input
            className="f-input"
            type="number"
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            value={typeof value === 'number' ? value : ''}
            onChange={(event) => onChange(event.target.value === '' ? undefined : Number(event.target.value))}
          />
        </Field>
      );

    case 'select':
      return (
        <Field label={field.label} help={field.help} inline>
          <select
            className="f-select"
            value={String(value ?? '')}
            onChange={(event) => onChange(event.target.value)}
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      );

    case 'toggle':
      return (
        <Field label={field.label} help={field.help} inline>
          <Switch checked={value === true} onChange={onChange} />
        </Field>
      );

    case 'color':
      return (
        <Field label={field.label} help={field.help}>
          <ColorControl value={typeof value === 'string' ? value : undefined} onChange={(next) => onChange(next ?? '')} />
        </Field>
      );

    case 'image':
    case 'video':
      return (
        <Field label={field.label} help={field.help}>
          <ImageControl
            value={String(value ?? '')}
            onChange={onChange}
            video={field.type === 'video'}
          />
        </Field>
      );

    case 'link':
      return (
        <Field label={field.label} help={field.help}>
          <LinkControl
            value={(value as LinkValue) ?? { kind: 'none' }}
            onChange={(next) => onChange(next)}
          />
        </Field>
      );

    case 'icon':
      return (
        <Field label={field.label} help={field.help}>
          <IconControl value={String(value ?? '')} onChange={onChange} />
        </Field>
      );

    case 'list':
      return (
        <Field label={field.label} help={field.help}>
          <ListControl
            field={field}
            items={Array.isArray(value) ? (value as ListItem[]) : []}
            onChange={(next) => onChange(next)}
            renderField={renderNested}
          />
        </Field>
      );

    case 'text':
    default:
      return (
        <Field label={field.label} help={field.help}>
          <input
            className="f-input"
            placeholder={field.placeholder}
            value={String(value ?? '')}
            onChange={(event) => onChange(event.target.value)}
          />
        </Field>
      );
  }

  void props;
}

/** Accept a full `<iframe …>` snippet and keep only its src. */
function extractSrc(input: string): string {
  const match = input.match(/src=["']([^"']+)["']/i);
  return match ? match[1] : input.trim();
}
