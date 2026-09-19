import { MousePointerClick } from 'lucide-react';
import { getComponent } from '@/engine/registry/registry';
import type { StyleGroupId } from '@/engine/registry/types';
import { ALL_STYLE_GROUPS } from '@/engine/registry/types';
import { useEditorStore, useSelectedNode } from '@/store/editorStore';
import { useUiStore } from '@/store/uiStore';
import { InlineInput } from '@/components/ui';
import { isFieldVisible, PropField } from './controls';
import {
  BackgroundGroup, BorderGroup, EffectsGroup, LayoutGroup, ResponsiveGroup, SizeGroup, SpacingGroup,
  TypographyGroup,
} from './design';
import { useNodeStyles } from './useNodeStyles';

/**
 * The inspector is entirely schema-driven: content controls come from the
 * component's own `inspector` definition and style controls from the groups it
 * declares. Registering a component is all it takes to make it editable.
 */
export function Inspector() {
  const node = useSelectedNode();
  const tab = useUiStore((s) => s.inspectorTab);
  const setTab = useUiStore((s) => s.setInspectorTab);
  const setNodeProps = useEditorStore((s) => s.setNodeProps);
  const setNodeName = useEditorStore((s) => s.setNodeName);
  const styles = useNodeStyles(node);

  if (!node) return <EmptyInspector />;

  const definition = getComponent(node.type);
  if (!definition) {
    return (
      <div className="f-insp">
        <div className="f-empty">
          <strong>Unknown component</strong>
          <span>“{node.type}” is not available, so it cannot be edited here.</span>
        </div>
      </div>
    );
  }

  const Icon = definition.icon;
  const groups: StyleGroupId[] = definition.styleGroups ?? ALL_STYLE_GROUPS;
  const contentFields = definition.inspector.filter((field) => isFieldVisible(field, node.props));

  return (
    <div className="f-insp">
      <header className="f-insp-head">
        <div className="f-insp-title">
          <span className="f-comp-icon">
            <Icon size={13} />
          </span>
          <InlineInput
            className="f-input"
            value={node.name ?? definition.label}
            onCommit={(next) => setNodeName(node.id, next === definition.label ? '' : next)}
          />
        </div>
        <p className="f-insp-sub">
          {definition.description ?? definition.label} · {node.id}
        </p>
      </header>

      <div className="f-insp-tabs">
        <button data-active={tab === 'content'} onClick={() => setTab('content')}>
          Content
        </button>
        <button data-active={tab === 'design'} onClick={() => setTab('design')}>
          Design
        </button>
      </div>

      <div className="f-insp-body f-scroll">
        {tab === 'content' ? (
          contentFields.length === 0 ? (
            <div className="f-empty">
              <strong>Nothing to configure</strong>
              <span>
                {definition.label} is a container — select the elements inside it, or switch to the
                Design tab to style it.
              </span>
            </div>
          ) : (
            <div className="f-group-body" style={{ paddingTop: 14 }}>
              {contentFields.map((field) => (
                <PropField
                  key={field.key}
                  field={field}
                  value={node.props[field.key]}
                  props={node.props}
                  onChange={(next) =>
                    setNodeProps(node.id, { [field.key]: next }, `prop:${node.id}:${field.key}`)
                  }
                />
              ))}
            </div>
          )
        ) : (
          <>
            <ResponsiveGroup node={node} styles={styles} />
            {groups.includes('layout') ? <LayoutGroup styles={styles} /> : null}
            {groups.includes('size') ? <SizeGroup styles={styles} /> : null}
            {groups.includes('spacing') ? <SpacingGroup styles={styles} /> : null}
            {groups.includes('typography') ? <TypographyGroup styles={styles} /> : null}
            {groups.includes('background') ? <BackgroundGroup styles={styles} /> : null}
            {groups.includes('border') ? <BorderGroup styles={styles} /> : null}
            {groups.includes('effects') ? <EffectsGroup styles={styles} node={node} /> : null}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyInspector() {
  return (
    <div className="f-insp">
      <div className="f-empty" style={{ paddingTop: 70 }}>
        <MousePointerClick size={26} />
        <strong>Nothing selected</strong>
        <span style={{ maxWidth: 210, lineHeight: 1.55 }}>
          Click an element on the canvas to edit its content, or drag a new component in from the
          left.
        </span>
      </div>
    </div>
  );
}
