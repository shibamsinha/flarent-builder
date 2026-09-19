import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import type { CSSProperties, ElementType } from 'react';
import { sanitizeRichText } from '@/utils/sanitize';
import { useEditorRuntime } from './context';

/**
 * The static exporter renders this component through `renderToStaticMarkup`,
 * where layout effects never run. Falling back to `useEffect` off the client
 * keeps the export output warning-free without changing editor behaviour.
 */
const useSafeLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface EditableProps {
  nodeId: string;
  propKey: string;
  value: string;
  /** Plain-text fields (button labels) keep formatting shortcuts disabled. */
  rich?: boolean;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Root attributes from the render context, spread onto the element. */
  attrs?: Record<string, unknown>;
}

/**
 * Renders a text value, and becomes a contenteditable region while the editor
 * marks this node as being edited. The element is intentionally uncontrolled
 * during editing — React must not re-render the DOM the caret lives in.
 */
export function Editable({
  nodeId,
  propKey,
  value,
  rich = true,
  as,
  className,
  style,
  attrs,
}: EditableProps) {
  const runtime = useEditorRuntime();
  const isEditing = runtime?.editingNodeId === nodeId;
  const ref = useRef<HTMLElement | null>(null);
  const Tag = (as ?? 'span') as ElementType;

  /**
   * The edited content is mirrored here on every keystroke.
   *
   * Reading it back from the DOM when editing ends is not an option: React has
   * already restored the old markup by the time an effect cleanup runs, so the
   * edit would be silently discarded.
   */
  const draft = useRef<{ html: string; text: string } | null>(null);
  const committed = useRef(false);

  const commit = useCallback(() => {
    if (committed.current || !draft.current || !runtime) return;
    committed.current = true;
    const next = rich ? sanitizeRichText(draft.current.html) : draft.current.text;
    runtime.commitText(nodeId, propKey, next);
  }, [nodeId, propKey, rich, runtime]);

  useSafeLayoutEffect(() => {
    if (!isEditing || !ref.current) return;
    const el = ref.current;
    committed.current = false;
    draft.current = { html: rich ? sanitizeRichText(value) : escapeText(value), text: value };
    el.innerHTML = draft.current.html;
    el.focus();

    // Select the existing text: double-click then type should replace the
    // placeholder copy, which is what people expect of an editor.
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(el);
    selection?.removeAllRanges();
    selection?.addRange(range);
    // `value` is deliberately excluded: re-seeding the DOM mid-edit would
    // destroy the caret position.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing]);

  // Selecting another element unmounts the editable branch without a blur, so
  // the commit has to happen here too.
  useEffect(() => {
    if (!isEditing) return;
    return () => commit();
  }, [isEditing, commit]);

  if (isEditing) {
    return (
      <Tag
        {...attrs}
        ref={ref as never}
        className={className ?? (attrs?.className as string | undefined)}
        style={style ?? (attrs?.style as CSSProperties | undefined)}
        contentEditable
        suppressContentEditableWarning
        data-fl-editing="true"
        spellCheck
        onInput={(event: React.FormEvent<HTMLElement>) => {
          draft.current = {
            html: event.currentTarget.innerHTML,
            text: event.currentTarget.textContent ?? '',
          };
        }}
        onBlur={() => {
          commit();
          runtime?.endEdit();
        }}
        onKeyDown={(event: React.KeyboardEvent) => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            commit();
            runtime?.endEdit();
            return;
          }
          if (event.key === 'Enter' && (!rich || event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            commit();
            runtime?.endEdit();
            return;
          }
          if ((event.metaKey || event.ctrlKey) && rich) {
            const key = event.key.toLowerCase();
            if (key === 'b' || key === 'i' || key === 'u') {
              event.preventDefault();
              document.execCommand(key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'underline');
              const el = ref.current;
              if (el) draft.current = { html: el.innerHTML, text: el.textContent ?? '' };
            }
          }
        }}
        onPaste={(event: React.ClipboardEvent) => {
          // Never let styled markup from another app into the document.
          event.preventDefault();
          const text = event.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
          const el = ref.current;
          if (el) draft.current = { html: el.innerHTML, text: el.textContent ?? '' };
        }}
      />
    );
  }

  if (rich) {
    return (
      <Tag
        {...attrs}
        className={className ?? (attrs?.className as string | undefined)}
        style={style ?? (attrs?.style as CSSProperties | undefined)}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(value) }}
      />
    );
  }
  return (
    <Tag
      {...attrs}
      className={className ?? (attrs?.className as string | undefined)}
      style={style ?? (attrs?.style as CSSProperties | undefined)}
    >
      {value}
    </Tag>
  );
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
