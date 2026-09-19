import type { CSSProperties, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { BuilderNode, DeviceId, Project, ResponsiveStyles } from '@/types/project';
import type { LinkValue } from '@/types/props';

export type ComponentCategory = 'layout' | 'basic' | 'sections' | 'business';

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  layout: 'Layout',
  basic: 'Basic',
  sections: 'Sections',
  business: 'Business',
};

/* ------------------------------------------------------------------ *
 * Inspector field schema. Drives the Content tab with no per-component
 * UI code. Adding a component never means editing the inspector.
 * ------------------------------------------------------------------ */

export type InspectorFieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'select'
  | 'toggle'
  | 'color'
  | 'image'
  | 'video'
  | 'link'
  | 'icon'
  | 'list'
  | 'embed';

export interface SelectOption {
  label: string;
  value: string;
}

export interface InspectorFieldBase {
  key: string;
  label: string;
  type: InspectorFieldType;
  help?: string;
  placeholder?: string;
  /** Only render this field when another prop matches (or is non-empty). */
  when?: { key: string; equals?: unknown[]; notEmpty?: boolean };
}

export interface TextField extends InspectorFieldBase {
  type: 'text' | 'textarea' | 'richtext' | 'embed';
  rows?: number;
}

export interface NumberField extends InspectorFieldBase {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export interface SelectField extends InspectorFieldBase {
  type: 'select';
  options: SelectOption[];
}

export interface ToggleField extends InspectorFieldBase {
  type: 'toggle';
}

export interface ColorField extends InspectorFieldBase {
  type: 'color';
}

export interface ImageField extends InspectorFieldBase {
  type: 'image' | 'video';
}

export interface LinkField extends InspectorFieldBase {
  type: 'link';
}

export interface IconField extends InspectorFieldBase {
  type: 'icon';
}

export interface ListField extends InspectorFieldBase {
  type: 'list';
  itemFields: InspectorField[];
  /** Prop key on the item used as the row label. */
  itemLabelKey: string;
  createItem: () => Record<string, unknown>;
  max?: number;
  addLabel?: string;
}

export type InspectorField =
  | TextField
  | NumberField
  | SelectField
  | ToggleField
  | ColorField
  | ImageField
  | LinkField
  | IconField
  | ListField;

/* ------------------------------------------------------------------ *
 * Rendering
 * ------------------------------------------------------------------ */

export type RenderMode = 'editor' | 'preview' | 'export';

/**
 * Services the renderer needs that differ per environment (editor vs export)
 * but never per component.
 */
export interface RenderEnv {
  mode: RenderMode;
  device: DeviceId;
  project: Project;
  /** Turn an `asset:` ref or plain URL into something an <img> can load. */
  resolveAssetUrl: (ref: string | undefined) => string | undefined;
  /** Turn a structured link into an href for the current environment. */
  resolveHref: (link: LinkValue | undefined) => string | undefined;
  /** Preview/editor page navigation. Export ignores this. */
  navigate?: (pageId: string) => void;
  /** Id of the page currently being rendered (for nav active state). */
  currentPageId?: string;
}

/**
 * Attributes every component must spread onto its root element. They carry the
 * resolved styles plus the editor's selection/drag wiring, which is why the
 * renderer never wraps components in extra DOM.
 */
export interface RootAttrs {
  className: string;
  style?: CSSProperties;
  [key: string]: unknown;
}

export interface RenderContext<P = Record<string, unknown>> {
  node: BuilderNode;
  props: P;
  attrs: RootAttrs;
  /** Already-rendered children (respecting editor drop zones). */
  children: ReactNode;
  childNodes: BuilderNode[];
  env: RenderEnv;
  /** True when the node currently has an empty children array. */
  isEmpty: boolean;
}

/* ------------------------------------------------------------------ *
 * Component definition
 * ------------------------------------------------------------------ */

export type ChildPolicy =
  | { kind: 'none' }
  | { kind: 'any'; deny?: string[] }
  | { kind: 'only'; allow: string[] };

export interface ComponentDefinition<P = Record<string, unknown>> {
  type: string;
  label: string;
  icon: LucideIcon;
  category: ComponentCategory;
  description?: string;
  /** Hidden from the components panel (e.g. `column`, only created by parents). */
  internal?: boolean;
  keywords?: string[];

  defaultProps: P;
  defaultStyles: ResponsiveStyles;

  children: ChildPolicy;
  /** Types this component may be dropped into. Empty means "anything that accepts it". */
  allowedParents?: string[];
  /** Subtree created when the component is first dropped on the canvas. */
  createChildren?: () => BuilderNode[];

  /** Content fields shown in the inspector. */
  inspector: InspectorField[];
  /** Style groups that make sense for this component. */
  styleGroups?: StyleGroupId[];
  /** Enables double-click inline editing of a string prop. */
  inlineText?: { propKey: string; rich: boolean };
  /** Node cannot be deleted/moved by the user (reserved for future use). */
  locked?: boolean;
  /**
   * Lets a component keep its subtree in sync with its own props, e.g. a
   * Columns block adding/removing column children when the count changes.
   * Declared here so the behaviour ships with the component instead of
   * leaking into the store.
   */
  syncChildren?: (node: BuilderNode, nextProps: P) => BuilderNode[] | undefined;

  render: (ctx: RenderContext<P>) => ReactNode;
}

export type StyleGroupId =
  | 'layout'
  | 'size'
  | 'spacing'
  | 'typography'
  | 'background'
  | 'border'
  | 'effects';

export const ALL_STYLE_GROUPS: StyleGroupId[] = [
  'layout',
  'size',
  'spacing',
  'typography',
  'background',
  'border',
  'effects',
];
