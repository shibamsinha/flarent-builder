import {
  Blocks, Columns3, Frame, LayoutGrid, Minus, MoveVertical, PanelsTopLeft, StretchHorizontal,
} from 'lucide-react';
import type { BuilderNode } from '@/types/project';
import { createNode } from '@/engine/registry/registry';
import type { ComponentDefinition } from '@/engine/registry/types';
import { nodeId } from '@/utils/id';
import { num, str, STYLE_GROUPS } from './shared';

const sectionDef: ComponentDefinition<{ tag: string }> = {
  type: 'section',
  label: 'Section',
  icon: PanelsTopLeft,
  category: 'layout',
  description: 'Full-width band that holds a row of content.',
  keywords: ['band', 'row', 'block'],
  defaultProps: { tag: 'section' },
  defaultStyles: {
    desktop: {
      display: 'block',
      width: '100%',
      paddingTop: 96,
      paddingBottom: 96,
      paddingLeft: 24,
      paddingRight: 24,
      backgroundColor: 'transparent',
    },
    tablet: { paddingTop: 72, paddingBottom: 72 },
    mobile: { paddingTop: 56, paddingBottom: 56, paddingLeft: 20, paddingRight: 20 },
  },
  children: { kind: 'any', deny: ['column'] },
  allowedParents: ['__root__'],
  createChildren: () => [createNode('container')],
  inspector: [
    {
      key: 'tag',
      label: 'HTML tag',
      type: 'select',
      help: 'Affects the exported markup only.',
      options: [
        { label: 'section', value: 'section' },
        { label: 'div', value: 'div' },
        { label: 'header', value: 'header' },
        { label: 'main', value: 'main' },
        { label: 'footer', value: 'footer' },
      ],
    },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children, props, isEmpty, env }) => {
    const Tag = (['section', 'div', 'header', 'main', 'footer'].includes(props.tag)
      ? props.tag
      : 'section') as 'section';
    return (
      <Tag {...attrs}>
        {isEmpty ? <EmptySlot label="Section" mode={env.mode} /> : children}
      </Tag>
    );
  },
};

const containerDef: ComponentDefinition<Record<string, never>> = {
  type: 'container',
  label: 'Container',
  icon: Frame,
  category: 'layout',
  description: 'Centred column that keeps content at a readable width.',
  keywords: ['wrapper', 'width', 'center'],
  defaultProps: {},
  defaultStyles: {
    desktop: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      maxWidth: 'var(--fl-container)',
      marginLeft: 'auto',
      marginRight: 'auto',
      gap: 24,
    },
  },
  children: { kind: 'any', deny: ['column'] },
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children, isEmpty, env }) => (
    <div {...attrs}>{isEmpty ? <EmptySlot label="Container" mode={env.mode} /> : children}</div>
  ),
};

const flexDef: ComponentDefinition<Record<string, never>> = {
  type: 'flex',
  label: 'Flex',
  icon: StretchHorizontal,
  category: 'layout',
  description: 'Row or column of elements with alignment control.',
  keywords: ['row', 'stack', 'align'],
  defaultProps: {},
  defaultStyles: {
    desktop: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      width: '100%',
    },
    mobile: { flexDirection: 'column', alignItems: 'stretch' },
  },
  children: { kind: 'any', deny: ['column'] },
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children, isEmpty, env }) => (
    <div {...attrs}>{isEmpty ? <EmptySlot label="Flex" mode={env.mode} /> : children}</div>
  ),
};

const gridDef: ComponentDefinition<{ columns: number }> = {
  type: 'grid',
  label: 'Grid',
  icon: LayoutGrid,
  category: 'layout',
  description: 'Equal-width cells that wrap responsively.',
  keywords: ['cards', 'tiles', 'columns'],
  defaultProps: { columns: 3 },
  defaultStyles: {
    desktop: { display: 'grid', gap: 24, width: '100%' },
    tablet: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    mobile: { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  children: { kind: 'any', deny: ['column'] },
  inspector: [
    { key: 'columns', label: 'Columns', type: 'number', min: 1, max: 6, step: 1 },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children, props, isEmpty, env }) => {
    const columns = Math.min(Math.max(num(props.columns, 3), 1), 6);
    const style = {
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      ...attrs.style,
    };
    return (
      <div {...attrs} style={style}>
        {isEmpty ? <EmptySlot label="Grid" mode={env.mode} /> : children}
      </div>
    );
  },
};

const columnDef: ComponentDefinition<Record<string, never>> = {
  type: 'column',
  label: 'Column',
  icon: Blocks,
  category: 'layout',
  internal: true,
  defaultProps: {},
  defaultStyles: {
    desktop: { display: 'flex', flexDirection: 'column', gap: 16, minWidth: 0 },
  },
  children: { kind: 'any', deny: ['column'] },
  allowedParents: ['columns'],
  inspector: [],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children, isEmpty, env }) => (
    <div {...attrs}>{isEmpty ? <EmptySlot label="Column" mode={env.mode} /> : children}</div>
  ),
};

function makeColumn(): BuilderNode {
  return { id: nodeId(), type: 'column', props: {}, styles: columnDef.defaultStyles, children: [] };
}

const columnsDef: ComponentDefinition<{ count: number; ratio: string }> = {
  type: 'columns',
  label: 'Columns',
  icon: Columns3,
  category: 'layout',
  description: 'Side-by-side columns you can fill independently.',
  keywords: ['split', 'two column', 'layout'],
  defaultProps: { count: 2, ratio: 'equal' },
  defaultStyles: {
    desktop: { display: 'grid', gap: 32, width: '100%', alignItems: 'stretch' },
    mobile: { gridTemplateColumns: 'minmax(0, 1fr)' },
  },
  children: { kind: 'only', allow: ['column'] },
  createChildren: () => [makeColumn(), makeColumn()],
  syncChildren: (node, nextProps) => {
    const target = Math.min(Math.max(Math.round(nextProps.count ?? 2), 1), 4);
    const current = node.children ?? [];
    if (current.length === target) return undefined;
    if (current.length < target) {
      const added = Array.from({ length: target - current.length }, makeColumn);
      return [...current, ...added];
    }
    return current.slice(0, target);
  },
  inspector: [
    { key: 'count', label: 'Columns', type: 'number', min: 1, max: 4, step: 1 },
    {
      key: 'ratio',
      label: 'Width ratio',
      type: 'select',
      options: [
        { label: 'Equal', value: 'equal' },
        { label: 'Wide / narrow (2:1)', value: '2:1' },
        { label: 'Narrow / wide (1:2)', value: '1:2' },
        { label: 'Wide / narrow (3:2)', value: '3:2' },
      ],
    },
  ],
  styleGroups: STYLE_GROUPS.box,
  render: ({ attrs, children, props, childNodes }) => {
    const count = Math.max(childNodes.length, 1);
    const template = ratioTemplate(str(props.ratio, 'equal'), count);
    return (
      <div {...attrs} style={{ gridTemplateColumns: template, ...attrs.style }}>
        {children}
      </div>
    );
  },
};

function ratioTemplate(ratio: string, count: number): string {
  if (count === 2) {
    if (ratio === '2:1') return '2fr 1fr';
    if (ratio === '1:2') return '1fr 2fr';
    if (ratio === '3:2') return '3fr 2fr';
  }
  return `repeat(${count}, minmax(0, 1fr))`;
}

const spacerDef: ComponentDefinition<{ height: number }> = {
  type: 'spacer',
  label: 'Spacer',
  icon: MoveVertical,
  category: 'layout',
  description: 'Vertical breathing room.',
  keywords: ['gap', 'space', 'margin'],
  defaultProps: { height: 48 },
  defaultStyles: { desktop: { width: '100%' } },
  children: { kind: 'none' },
  inspector: [{ key: 'height', label: 'Height', type: 'number', min: 0, max: 400, unit: 'px' }],
  styleGroups: ['size'],
  render: ({ attrs, props }) => (
    <div {...attrs} style={{ height: `${num(props.height, 48)}px`, ...attrs.style }} aria-hidden />
  ),
};

const dividerDef: ComponentDefinition<{ thickness: number; color: string }> = {
  type: 'divider',
  label: 'Divider',
  icon: Minus,
  category: 'layout',
  description: 'Horizontal rule between blocks.',
  keywords: ['line', 'rule', 'separator'],
  defaultProps: { thickness: 1, color: 'var(--fl-color-border)' },
  defaultStyles: { desktop: { width: '100%', marginTop: 8, marginBottom: 8 } },
  children: { kind: 'none' },
  inspector: [
    { key: 'thickness', label: 'Thickness', type: 'number', min: 1, max: 20, unit: 'px' },
    { key: 'color', label: 'Colour', type: 'color' },
  ],
  styleGroups: ['size', 'spacing'],
  render: ({ attrs, props }) => (
    <hr
      {...attrs}
      style={{
        border: 'none',
        borderTop: `${num(props.thickness, 1)}px solid ${str(props.color, 'var(--fl-color-border)')}`,
        ...attrs.style,
      }}
    />
  ),
};

function EmptySlot({ label, mode }: { label: string; mode: string }) {
  if (mode !== 'editor') return null;
  return <div className="fl-empty-slot">Drop elements into this {label.toLowerCase()}</div>;
}

export const layoutComponents = [
  sectionDef, containerDef, flexDef, gridDef, columnsDef, columnDef, spacerDef, dividerDef,
] as unknown as ComponentDefinition<never>[];
