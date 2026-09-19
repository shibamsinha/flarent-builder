import type { BuilderNode } from '@/types/project';
import { nodeId } from '@/utils/id';

/** Depth-first walk. Return `false` from `visit` to skip a subtree. */
export function walkTree(
  nodes: BuilderNode[],
  visit: (node: BuilderNode, parent: BuilderNode | null, index: number) => boolean | void,
  parent: BuilderNode | null = null,
): void {
  nodes.forEach((node, index) => {
    const descend = visit(node, parent, index);
    if (descend === false) return;
    if (node.children?.length) walkTree(node.children, visit, node);
  });
}

export function findNode(nodes: BuilderNode[], id: string): BuilderNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children?.length) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export interface NodeLocation {
  parent: BuilderNode | null;
  siblings: BuilderNode[];
  index: number;
  node: BuilderNode;
}

export function locateNode(nodes: BuilderNode[], id: string): NodeLocation | null {
  const search = (list: BuilderNode[], parent: BuilderNode | null): NodeLocation | null => {
    for (let index = 0; index < list.length; index += 1) {
      const node = list[index];
      if (node.id === id) return { parent, siblings: list, index, node };
      if (node.children?.length) {
        const found = search(node.children, node);
        if (found) return found;
      }
    }
    return null;
  };
  return search(nodes, null);
}

/** Ancestor chain from the root down to (but excluding) the node itself. */
export function nodePath(nodes: BuilderNode[], id: string): BuilderNode[] {
  const path: BuilderNode[] = [];
  const search = (list: BuilderNode[], trail: BuilderNode[]): boolean => {
    for (const node of list) {
      if (node.id === id) {
        path.push(...trail);
        return true;
      }
      if (node.children?.length && search(node.children, [...trail, node])) return true;
    }
    return false;
  };
  search(nodes, []);
  return path;
}

export function isDescendant(root: BuilderNode, candidateId: string): boolean {
  if (root.id === candidateId) return true;
  return (root.children ?? []).some((child) => isDescendant(child, candidateId));
}

/** Deep clone a subtree, assigning brand-new ids to every node. */
export function cloneSubtree(node: BuilderNode): BuilderNode {
  return {
    ...node,
    id: nodeId(),
    props: JSON.parse(JSON.stringify(node.props)) as Record<string, unknown>,
    styles: node.styles ? (JSON.parse(JSON.stringify(node.styles)) as BuilderNode['styles']) : undefined,
    hidden: node.hidden ? { ...node.hidden } : undefined,
    animation: node.animation ? { ...node.animation } : undefined,
    children: node.children ? node.children.map(cloneSubtree) : undefined,
  };
}

export function collectIds(nodes: BuilderNode[]): string[] {
  const ids: string[] = [];
  walkTree(nodes, (node) => {
    ids.push(node.id);
  });
  return ids;
}

/**
 * Structurally-shared tree update: returns a new array where only the
 * ancestors of `id` are recreated. Keeps React re-renders cheap.
 */
export function updateNodeInTree(
  nodes: BuilderNode[],
  id: string,
  updater: (node: BuilderNode) => BuilderNode,
): BuilderNode[] {
  let changed = false;
  const next = nodes.map((node) => {
    if (node.id === id) {
      changed = true;
      return updater(node);
    }
    if (node.children?.length) {
      const children = updateNodeInTree(node.children, id, updater);
      if (children !== node.children) {
        changed = true;
        return { ...node, children };
      }
    }
    return node;
  });
  return changed ? next : nodes;
}

export function removeNodeFromTree(
  nodes: BuilderNode[],
  id: string,
): { nodes: BuilderNode[]; removed: BuilderNode | null } {
  let removed: BuilderNode | null = null;
  const walk = (list: BuilderNode[]): BuilderNode[] => {
    const out: BuilderNode[] = [];
    let changed = false;
    for (const node of list) {
      if (node.id === id) {
        removed = node;
        changed = true;
        continue;
      }
      if (node.children?.length) {
        const children = walk(node.children);
        if (children !== node.children) {
          changed = true;
          out.push({ ...node, children });
          continue;
        }
      }
      out.push(node);
    }
    return changed ? out : list;
  };
  const next = walk(nodes);
  return { nodes: next, removed };
}

export function insertNodeInTree(
  nodes: BuilderNode[],
  parentId: string | null,
  index: number,
  node: BuilderNode,
): BuilderNode[] {
  if (parentId === null) {
    const next = [...nodes];
    next.splice(clamp(index, 0, next.length), 0, node);
    return next;
  }
  return updateNodeInTree(nodes, parentId, (parent) => {
    const children = [...(parent.children ?? [])];
    children.splice(clamp(index, 0, children.length), 0, node);
    return { ...parent, children };
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Total node count, used for performance diagnostics and the layers panel. */
export function countNodes(nodes: BuilderNode[]): number {
  let count = 0;
  walkTree(nodes, () => {
    count += 1;
  });
  return count;
}
