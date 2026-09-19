import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { useUiStore } from '@/store/uiStore';

/* ------------------------------- field --------------------------------- */

export function Field({
  label,
  help,
  children,
  inline,
  badge,
}: {
  label?: string;
  help?: string;
  children: ReactNode;
  inline?: boolean;
  badge?: ReactNode;
}) {
  if (inline) {
    return (
      <div className="f-field">
        <div className="f-field-row">
          <label className="f-label">
            {label}
            {badge}
          </label>
          {children}
        </div>
        {help ? <p className="f-field-help">{help}</p> : null}
      </div>
    );
  }
  return (
    <div className="f-field">
      {label ? (
        <label className="f-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {label}
          {badge}
        </label>
      ) : null}
      {children}
      {help ? <p className="f-field-help">{help}</p> : null}
    </div>
  );
}

/* ------------------------------ switch --------------------------------- */

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
}) {
  return (
    <label className="f-switch" title={label}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="f-switch-track" />
      <span className="f-switch-thumb" />
    </label>
  );
}

/* --------------------------- number input ------------------------------ */

export function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  placeholder,
}: {
  value: number | '';
  onChange: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  placeholder?: string;
}) {
  return (
    <div className="f-num">
      <input
        className="f-input"
        type="number"
        value={value === '' ? '' : value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        onChange={(event) => {
          const raw = event.target.value;
          if (raw === '') return onChange(undefined);
          const next = Number(raw);
          if (Number.isNaN(next)) return;
          onChange(clamp(next, min, max));
        }}
      />
      {unit ? <span className="f-num-unit">{unit}</span> : null}
    </div>
  );
}

function clamp(value: number, min?: number, max?: number): number {
  if (min !== undefined && value < min) return min;
  if (max !== undefined && value > max) return max;
  return value;
}

/* --------------------------- segmented --------------------------------- */

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: ReactNode; title?: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="f-seg">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.title}
          data-active={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------- icon grid -------------------------------- */

export function OptionGrid<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T | undefined;
  options: { value: T; icon: ReactNode; title: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="f-align-grid">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          title={option.title}
          data-active={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.icon}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------ modal ---------------------------------- */

export function Modal({
  title,
  description,
  children,
  footer,
  onClose,
  wide,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div className="f-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={wide ? 'f-dialog f-dialog-lg' : 'f-dialog'} role="dialog" aria-modal="true">
        <header className="f-dialog-head">
          <div>
            <h2>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button className="f-btn f-btn-ghost f-btn-icon" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </header>
        <div className="f-dialog-body f-scroll">{children}</div>
        {footer ? <footer className="f-dialog-foot">{footer}</footer> : null}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  danger = true,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="f-btn f-btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className={danger ? 'f-btn f-btn-primary' : 'f-btn f-btn-primary'}
            style={danger ? { background: 'var(--f-danger)' } : undefined}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--f-text-2)' }}>{message}</p>
    </Modal>
  );
}

/* ------------------------------ toasts --------------------------------- */

export function Toasts() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);
  if (toasts.length === 0) return null;
  return createPortal(
    <div className="f-toasts">
      {toasts.map((toast) => (
        <div key={toast.id} className="f-toast" data-tone={toast.tone} onClick={() => dismiss(toast.id)}>
          {toast.tone === 'success' ? <Check size={15} /> : null}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>,
    document.body,
  );
}

/* --------------------------- inline rename ----------------------------- */

export function InlineInput({
  value,
  onCommit,
  placeholder,
  className = 'f-input',
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [draft, setDraft] = useState(value);
  const dirty = useRef(false);
  const id = useId();

  useEffect(() => {
    if (!dirty.current) setDraft(value);
  }, [value]);

  return (
    <input
      id={id}
      className={className}
      value={draft}
      placeholder={placeholder}
      onChange={(event) => {
        dirty.current = true;
        setDraft(event.target.value);
      }}
      onBlur={() => {
        dirty.current = false;
        if (draft !== value) onCommit(draft);
      }}
      onKeyDown={(event) => {
        if (event.key === 'Enter') (event.target as HTMLInputElement).blur();
        if (event.key === 'Escape') {
          dirty.current = false;
          setDraft(value);
          (event.target as HTMLInputElement).blur();
        }
      }}
    />
  );
}

/* ------------------------------ popover -------------------------------- */

export function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onOutside]);
  return ref;
}
