import type { BuilderNode } from '@/types/project';
import { nodeId } from '@/utils/id';
import type { ComponentCategory, ComponentDefinition } from './types';
import { CATEGORY_LABELS } from './types';

const registry = new Map<string, ComponentDefinition<never>>();

export function registerComponent<P extends Record<string, unknown>>(
  definition: ComponentDefinition<P>,
): void {
  if (registry.has(definition.type)) {
    // Re-registration is a developer error; keep the first definition so a
    // hot-reload never silently changes behaviour mid-session.
    if (import.meta.env?.DEV) {
      console.warn(`[flarent] component "${definition.type}" is already registered`);
    }
    registry.delete(definition.type);
  }
  registry.set(definition.type, definition as unknown as ComponentDefinition<never>);
}

export function registerComponents(definitions: ComponentDefinition<never>[]): void {
  for (const def of definitions) registerComponent(def as never);
}

export function getComponent(type: string): ComponentDefinition<never> | undefined {
  return registry.get(type);
}

export function requireComponent(type: string): ComponentDefinition<never> {
  const def = registry.get(type);
  if (!def) throw new Error(`Unknown component type: ${type}`);
  return def;
}

export function hasComponent(type: string): boolean {
  return registry.has(type);
}

export function listComponents(): ComponentDefinition<never>[] {
  return [...registry.values()];
}

export interface CategoryGroup {
  id: ComponentCategory;
  label: string;
  items: ComponentDefinition<never>[];
}

export function componentsByCategory(): CategoryGroup[] {
  const order: ComponentCategory[] = ['layout', 'basic', 'sections', 'business'];
  return order.map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
    items: listComponents().filter((c) => c.category === id && !c.internal),
  }));
}

/** Clear the registry. Test-only. */
export function resetRegistry(): void {
  registry.clear();
}

/**
 * Build a fresh node from its definition, including the default subtree.
 * Every node — including nested defaults — gets a unique id.
 */
export function createNode(
  type: string,
  overrides: Partial<Pick<BuilderNode, 'props' | 'styles' | 'children' | 'name'>> = {},
): BuilderNode {
  const def = requireComponent(type);
  const node: BuilderNode = {
    id: nodeId(),
    type,
    props: { ...(def.defaultProps as Record<string, unknown>), ...(overrides.props ?? {}) },
    styles: overrides.styles ?? structuredCloneSafe(def.defaultStyles),
  };
  if (overrides.name) node.name = overrides.name;
  if (def.children.kind !== 'none') {
    node.children = overrides.children ?? def.createChildren?.() ?? [];
  }
  return node;
}

function structuredCloneSafe<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

export { structuredCloneSafe };
