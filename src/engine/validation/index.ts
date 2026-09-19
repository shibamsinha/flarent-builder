import type { BuilderNode } from '@/types/project';
import { getComponent } from '@/engine/registry/registry';
import { isDescendant, locateNode } from '@/engine/commands/tree';

export const ROOT_PARENT = '__root__';

export interface DropCheck {
  allowed: boolean;
  reason?: string;
}

/** Can a node of `childType` live directly inside `parentType`? */
export function canContain(parentType: string | typeof ROOT_PARENT, childType: string): DropCheck {
  const childDef = getComponent(childType);
  if (!childDef) return { allowed: false, reason: `Unknown component "${childType}"` };

  if (parentType === ROOT_PARENT) {
    if (childDef.internal) {
      return { allowed: false, reason: `${childDef.label} can only be used inside its parent` };
    }
    if (childDef.allowedParents && !childDef.allowedParents.includes(ROOT_PARENT)) {
      return { allowed: false, reason: `${childDef.label} must be placed inside a container` };
    }
    return { allowed: true };
  }

  const parentDef = getComponent(parentType);
  if (!parentDef) return { allowed: false, reason: `Unknown container "${parentType}"` };

  if (parentDef.children.kind === 'none') {
    return { allowed: false, reason: `${parentDef.label} cannot contain other elements` };
  }
  if (parentDef.children.kind === 'only' && !parentDef.children.allow.includes(childType)) {
    return { allowed: false, reason: `${parentDef.label} only accepts specific elements` };
  }
  if (parentDef.children.kind === 'any' && parentDef.children.deny?.includes(childType)) {
    return { allowed: false, reason: `${childDef.label} cannot go inside ${parentDef.label}` };
  }
  if (childDef.allowedParents && !childDef.allowedParents.includes(parentType)) {
    return { allowed: false, reason: `${childDef.label} cannot go inside ${parentDef.label}` };
  }
  return { allowed: true };
}

/** True when the component can accept dropped children at all. */
export function isContainerType(type: string): boolean {
  const def = getComponent(type);
  return !!def && def.children.kind !== 'none';
}

/**
 * Full move validation: type compatibility plus the cycle check that stops a
 * node being dropped into its own subtree.
 */
export function canMoveNode(
  nodes: BuilderNode[],
  movingId: string,
  targetParentId: string | null,
): DropCheck {
  const location = locateNode(nodes, movingId);
  if (!location) return { allowed: false, reason: 'Element no longer exists' };

  if (targetParentId) {
    if (isDescendant(location.node, targetParentId)) {
      return { allowed: false, reason: 'An element cannot be moved inside itself' };
    }
    const parent = locateNode(nodes, targetParentId);
    if (!parent) return { allowed: false, reason: 'Target container no longer exists' };
    return canContain(parent.node.type, location.node.type);
  }
  return canContain(ROOT_PARENT, location.node.type);
}

/**
 * Walk up from `preferredParentId` until a container that accepts `childType`
 * is found. Used by paste and by keyboard insertion so an action never fails
 * silently.
 */
export function findValidParent(
  nodes: BuilderNode[],
  preferredParentId: string | null,
  childType: string,
): { parentId: string | null; index: number } | null {
  let cursor = preferredParentId;
  while (cursor) {
    const location = locateNode(nodes, cursor);
    if (!location) break;
    if (canContain(location.node.type, childType).allowed) {
      return { parentId: cursor, index: (location.node.children ?? []).length };
    }
    cursor = location.parent?.id ?? null;
    if (!cursor) break;
  }
  if (canContain(ROOT_PARENT, childType).allowed) {
    return { parentId: null, index: nodes.length };
  }
  return null;
}
