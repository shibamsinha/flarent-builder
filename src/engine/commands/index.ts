/**
 * Every mutation of a Project goes through a command.
 *
 * Commands are pure: `(project, payload) => project`. They never touch React,
 * storage or the DOM. That keeps undo/redo trivial, makes the operations
 * testable in isolation, and gives any future automation layer a single,
 * complete API surface to drive the editor with.
 */

import type {
  AssetMeta,
  BuilderNode,
  DeviceId,
  NavigationConfig,
  Page,
  PageSeo,
  Project,
  SiteSettings,
  ThemeConfig,
} from '@/types/project';
import type { StyleMap } from '@/types/styles';
import { mergeBreakpointStyles } from '@/engine/responsive';
import { pageId as makePageId } from '@/utils/id';
import {
  cloneSubtree,
  insertNodeInTree,
  locateNode,
  removeNodeFromTree,
  updateNodeInTree,
} from './tree';
import { slugify, uniqueSlug } from '@/utils/slug';
import { getComponent } from '@/engine/registry/registry';

function touch(project: Project): Project {
  return { ...project, updatedAt: Date.now() };
}

function withPage(project: Project, pageId: string, updater: (page: Page) => Page): Project {
  let changed = false;
  const pages = project.pages.map((page) => {
    if (page.id !== pageId) return page;
    const next = updater(page);
    if (next !== page) changed = true;
    return next;
  });
  // A command that changed nothing returns the same project, so callers never
  // record an empty step in the undo history.
  if (!changed) return project;
  return touch({ ...project, pages });
}

function withNodes(
  project: Project,
  pageId: string,
  updater: (nodes: BuilderNode[]) => BuilderNode[],
): Project {
  return withPage(project, pageId, (page) => {
    const nodes = updater(page.nodes);
    return nodes === page.nodes ? page : { ...page, nodes };
  });
}

/* ------------------------------- nodes -------------------------------- */

export interface AddNodePayload {
  pageId: string;
  node: BuilderNode;
  parentId: string | null;
  index: number;
}

export function addNode(project: Project, payload: AddNodePayload): Project {
  return withNodes(project, payload.pageId, (nodes) =>
    insertNodeInTree(nodes, payload.parentId, payload.index, payload.node),
  );
}

export function removeNode(project: Project, pageId: string, nodeId: string): Project {
  return withNodes(project, pageId, (nodes) => removeNodeFromTree(nodes, nodeId).nodes);
}

export interface MoveNodePayload {
  pageId: string;
  nodeId: string;
  parentId: string | null;
  index: number;
}

/**
 * Move a node to a new parent/index. The index is interpreted against the
 * target list *after* the node has been detached, which is what makes
 * same-parent reordering behave the way a user expects.
 */
export function moveNode(project: Project, payload: MoveNodePayload): Project {
  return withNodes(project, payload.pageId, (nodes) => {
    const before = locateNode(nodes, payload.nodeId);
    if (!before) return nodes;

    const sameParent = (before.parent?.id ?? null) === payload.parentId;
    let targetIndex = payload.index;
    if (sameParent && before.index < payload.index) targetIndex -= 1;

    const { nodes: detached, removed } = removeNodeFromTree(nodes, payload.nodeId);
    if (!removed) return nodes;
    return insertNodeInTree(detached, payload.parentId, targetIndex, removed);
  });
}

export function duplicateNode(
  project: Project,
  pageId: string,
  nodeId: string,
): { project: Project; newNodeId: string | null } {
  const page = project.pages.find((p) => p.id === pageId);
  if (!page) return { project, newNodeId: null };
  const location = locateNode(page.nodes, nodeId);
  if (!location) return { project, newNodeId: null };

  const copy = cloneSubtree(location.node);
  const next = addNode(project, {
    pageId,
    node: copy,
    parentId: location.parent?.id ?? null,
    index: location.index + 1,
  });
  return { project: next, newNodeId: copy.id };
}

export function updateNodeProps(
  project: Project,
  pageId: string,
  nodeId: string,
  patch: Record<string, unknown>,
): Project {
  return withNodes(project, pageId, (nodes) =>
    updateNodeInTree(nodes, nodeId, (node) => {
      const props = { ...node.props, ...patch };
      const next: BuilderNode = { ...node, props };
      // A component may declare that its children follow from its props.
      const sync = getComponent(node.type)?.syncChildren;
      if (sync) {
        const children = sync(next, props as never);
        if (children) next.children = children;
      }
      return next;
    }),
  );
}

export function updateNodeStyles(
  project: Project,
  pageId: string,
  nodeId: string,
  device: DeviceId,
  patch: StyleMap,
): Project {
  return withNodes(project, pageId, (nodes) =>
    updateNodeInTree(nodes, nodeId, (node) => ({
      ...node,
      styles: mergeBreakpointStyles(node.styles, device, patch),
    })),
  );
}

/** Drop every override a device declares for this node (back to inherited). */
export function clearDeviceStyles(
  project: Project,
  pageId: string,
  nodeId: string,
  device: DeviceId,
): Project {
  return withNodes(project, pageId, (nodes) =>
    updateNodeInTree(nodes, nodeId, (node) => {
      if (!node.styles?.[device]) return node;
      const styles = { ...node.styles };
      delete styles[device];
      return { ...node, styles };
    }),
  );
}

export function setNodeHidden(
  project: Project,
  pageId: string,
  nodeId: string,
  device: DeviceId,
  hidden: boolean,
): Project {
  return withNodes(project, pageId, (nodes) =>
    updateNodeInTree(nodes, nodeId, (node) => {
      const next = { ...(node.hidden ?? {}) };
      if (hidden) next[device] = true;
      else delete next[device];
      return { ...node, hidden: Object.keys(next).length ? next : undefined };
    }),
  );
}

export function setNodeName(
  project: Project,
  pageId: string,
  nodeId: string,
  name: string,
): Project {
  return withNodes(project, pageId, (nodes) =>
    updateNodeInTree(nodes, nodeId, (node) => ({ ...node, name: name.trim() || undefined })),
  );
}

export function setNodeLocked(
  project: Project,
  pageId: string,
  nodeId: string,
  locked: boolean,
): Project {
  return withNodes(project, pageId, (nodes) =>
    updateNodeInTree(nodes, nodeId, (node) => ({ ...node, locked: locked || undefined })),
  );
}

export function setNodeAnimation(
  project: Project,
  pageId: string,
  nodeId: string,
  animation: BuilderNode['animation'],
): Project {
  return withNodes(project, pageId, (nodes) =>
    updateNodeInTree(nodes, nodeId, (node) => ({
      ...node,
      animation: animation && animation.type !== 'none' ? animation : undefined,
    })),
  );
}

/* ------------------------------- pages -------------------------------- */

export function createPage(
  project: Project,
  input: { name: string; slug?: string; nodes?: BuilderNode[] },
): { project: Project; page: Page } {
  const taken = project.pages.map((p) => p.slug);
  const slug = uniqueSlug(slugify(input.slug || input.name) || 'page', taken);
  const page: Page = {
    id: makePageId(),
    name: input.name.trim() || 'Untitled page',
    slug,
    seo: { title: input.name.trim() || 'Untitled page' },
    nodes: input.nodes ?? [],
  };
  return { project: touch({ ...project, pages: [...project.pages, page] }), page };
}

export function updatePage(
  project: Project,
  pageId: string,
  patch: Partial<Pick<Page, 'name' | 'slug'>> & { seo?: Partial<PageSeo> },
): Project {
  return withPage(project, pageId, (page) => {
    const next: Page = { ...page };
    if (patch.name !== undefined) next.name = patch.name.trim() || page.name;
    if (patch.slug !== undefined && !page.isHome) {
      const taken = project.pages.filter((p) => p.id !== pageId).map((p) => p.slug);
      next.slug = uniqueSlug(slugify(patch.slug) || 'page', taken);
    }
    if (patch.seo) next.seo = { ...page.seo, ...patch.seo };
    return next;
  });
}

export function deletePage(project: Project, pageId: string): Project {
  if (project.pages.length <= 1) return project;
  const target = project.pages.find((p) => p.id === pageId);
  if (!target) return project;

  let pages = project.pages.filter((p) => p.id !== pageId);
  if (target.isHome) {
    pages = pages.map((p, i) => (i === 0 ? { ...p, isHome: true, slug: '' } : p));
  }
  const navigation: NavigationConfig = {
    items: project.navigation.items.filter((item) => item.pageId !== pageId),
  };
  return touch({ ...project, pages, navigation });
}

export function duplicatePage(
  project: Project,
  pageId: string,
): { project: Project; page: Page | null } {
  const source = project.pages.find((p) => p.id === pageId);
  if (!source) return { project, page: null };
  const taken = project.pages.map((p) => p.slug);
  const copy: Page = {
    id: makePageId(),
    name: `${source.name} copy`,
    slug: uniqueSlug(`${source.slug || 'home'}-copy`, taken),
    seo: { ...source.seo },
    nodes: source.nodes.map(cloneSubtree),
  };
  return { project: touch({ ...project, pages: [...project.pages, copy] }), page: copy };
}

export function setHomePage(project: Project, pageId: string): Project {
  const target = project.pages.find((p) => p.id === pageId);
  if (!target) return project;
  const taken: string[] = [];
  const pages = project.pages.map((page) => {
    if (page.id === pageId) return { ...page, isHome: true, slug: '' };
    if (!page.isHome) return page;
    // The previous home page needs a real slug again.
    const slug = uniqueSlug(slugify(page.name) || 'page', [
      ...taken,
      ...project.pages.filter((p) => p.id !== page.id).map((p) => p.slug),
    ]);
    taken.push(slug);
    return { ...page, isHome: false, slug };
  });
  return touch({ ...project, pages });
}

export function reorderPages(project: Project, from: number, to: number): Project {
  const pages = [...project.pages];
  if (from < 0 || from >= pages.length || to < 0 || to >= pages.length) return project;
  const [moved] = pages.splice(from, 1);
  pages.splice(to, 0, moved);
  return touch({ ...project, pages });
}

/* --------------------------- site-level state -------------------------- */

export function updateTheme(project: Project, patch: ThemePatch): Project {
  return touch({
    ...project,
    theme: {
      ...project.theme,
      ...patch,
      colors: { ...project.theme.colors, ...(patch.colors ?? {}) },
      typography: { ...project.theme.typography, ...(patch.typography ?? {}) },
      radius: { ...project.theme.radius, ...(patch.radius ?? {}) },
    } as ThemeConfig,
  });
}

export function updateSettings(project: Project, patch: Partial<SiteSettings>): Project {
  return touch({ ...project, settings: { ...project.settings, ...patch } });
}

export function updateNavigation(project: Project, navigation: NavigationConfig): Project {
  return touch({ ...project, navigation });
}

export function renameProject(project: Project, name: string): Project {
  return touch({ ...project, name: name.trim() || project.name });
}

export function addAsset(project: Project, asset: AssetMeta): Project {
  return touch({ ...project, assets: [asset, ...project.assets] });
}

export function removeAsset(project: Project, assetId: string): Project {
  return touch({ ...project, assets: project.assets.filter((a) => a.id !== assetId) });
}

export type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K] };

/** Theme edits arrive one token at a time, so every level is optional. */
export type ThemePatch = DeepPartial<ThemeConfig>;
